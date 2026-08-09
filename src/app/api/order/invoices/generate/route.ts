import { getSession } from '@/lib/auth/session'
import { getDb, getR2 } from '@/lib/db/d1'
import {
  getEventById,
  getCustomerById,
  getItemsByCustomer,
  createOrderWithItems,
  getConfig,
} from '@/lib/db/orders'
import { generateInvoiceId } from '@/lib/services/invoice-id'
import { renderInvoicePng } from '@/lib/services/invoice-renderer'
import { uploadInvoiceToR2 } from '@/lib/services/r2-upload'
import { normalizePhoneNumber } from '@/lib/utils/phone'
import { createDokuPayment } from '@/lib/services/doku-client'
import { sendWebhook } from '@/lib/services/webhook'
import type { InvoiceData } from '@/lib/services/invoice-template'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || !['administrator', 'data_input'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as {
      event_id: number
      customer_id: number
      phone: string
      discount?: number
      shipping?: number
      selected_item_ids: number[]
    }

    const { event_id, customer_id, phone, discount = 0, shipping = 0, selected_item_ids } = body

    if (!event_id || !customer_id || !phone || !selected_item_ids?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = await getDb()

    // Fetch related data
    const [event, customer, allItems] = await Promise.all([
      getEventById(db, event_id),
      getCustomerById(db, customer_id),
      getItemsByCustomer(db, customer_id),
    ])

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

    // Filter to selected items only
    const selectedItems = allItems.filter((item) => selected_item_ids.includes(item.id))
    if (selectedItems.length === 0) {
      return NextResponse.json({ error: 'No valid items selected' }, { status: 400 })
    }

    // Calculate totals
    const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const total = subtotal - discount + shipping
    const normalizedPhone = normalizePhoneNumber(phone)

    // Generate invoice ID
    const invoiceId = await generateInvoiceId(db)

    // Prepare invoice data
    const now = new Date()
    const dateStr = now.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const companyName = (await getConfig(db, 'company_name')) || 'GuraGiru'
    const companyAddress = (await getConfig(db, 'company_address')) || undefined

    const invoiceData: InvoiceData = {
      invoiceId,
      date: dateStr,
      customerName: customer.name,
      phone: normalizedPhone,
      eventName: event.name,
      items: selectedItems.map((item) => ({
        name: item.item_name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })),
      subtotal,
      discount,
      shipping,
      total,
      companyName,
      companyAddress,
    }

    // Render invoice PNG
    let invoiceFileKey: string | undefined
    let fileName: string | undefined
    try {
      const pngData = await renderInvoicePng(invoiceData)
      const r2 = await getR2()
      const upload = await uploadInvoiceToR2(r2, invoiceId, customer.name, pngData)
      invoiceFileKey = upload.key
      fileName = upload.fileName
    } catch (err) {
      console.error('Invoice rendering failed (continuing without image):', err)
    }

    // DOKU payment (optional, based on config)
    let paymentUrl: string | undefined
    try {
      const dokuClientId = await getConfig(db, 'doku_client_id')
      const dokuSecretKey = await getConfig(db, 'doku_secret_key')
      if (dokuClientId && dokuSecretKey) {
        paymentUrl = await createDokuPayment({
          clientId: dokuClientId,
          secretKey: dokuSecretKey,
          invoiceId,
          amount: total,
          customerName: customer.name,
          customerEmail: '',
        })
        invoiceData.paymentUrl = paymentUrl
      }
    } catch (err) {
      console.error('DOKU payment creation failed:', err)
    }

    // Create order + items in D1
    const order = await createOrderWithItems(
      db,
      {
        invoice_id: invoiceId,
        event_name: event.name,
        customer_name: customer.name,
        phone: normalizedPhone,
        subtotal,
        discount,
        shipping,
        total,
        payment_url: paymentUrl,
        invoice_file: invoiceFileKey,
      },
      selectedItems.map((item) => ({
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      }))
    )

    // Send webhook (fire-and-forget)
    try {
      const webhookUrl = await getConfig(db, 'webhook_url')
      if (webhookUrl) {
        const formattedItems = selectedItems
          .map((item) => `- ${item.item_name} x ${item.quantity}, Rp ${item.price.toLocaleString('id-ID')}`)
          .join('\n')

        sendWebhook(webhookUrl, {
          file_url: invoiceFileKey ? `/api/order/invoice-image/${invoiceId}` : '',
          customer_name: customer.name,
          phone_number: normalizedPhone,
          total_amount: `Rp ${total.toLocaleString('id-ID')}`,
          invoice_id: invoiceId,
          mime_type: 'image/png',
          file_name: fileName || `${invoiceId}.png`,
          items: formattedItems,
          payment_url: paymentUrl || '',
        }).catch((err) => console.error('Webhook failed:', err))
      }
    } catch (err) {
      console.error('Webhook setup failed:', err)
    }

    return NextResponse.json({
      invoice_id: invoiceId,
      order_id: order?.id,
      payment_url: paymentUrl,
    })
  } catch (error) {
    console.error('Invoice generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}
