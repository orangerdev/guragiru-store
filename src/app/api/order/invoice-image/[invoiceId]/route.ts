import { getSession } from '@/lib/auth/session'
import { getDb, getR2 } from '@/lib/db/d1'
import { getOrderByInvoiceId } from '@/lib/db/orders'
import { getInvoiceFromR2 } from '@/lib/services/r2-upload'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const session = await getSession()
  if (!session || !['administrator', 'data_input'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { invoiceId } = await params
  const db = await getDb()
  const order = await getOrderByInvoiceId(db, invoiceId)

  if (!order?.invoice_file) {
    return NextResponse.json({ error: 'Invoice image not found' }, { status: 404 })
  }

  const r2 = await getR2()
  const file = await getInvoiceFromR2(r2, order.invoice_file)

  if (!file) {
    return NextResponse.json({ error: 'File not found in storage' }, { status: 404 })
  }

  return new NextResponse(file.data, {
    headers: {
      'Content-Type': file.contentType,
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
