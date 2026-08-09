/**
 * Invoice template for Satori rendering.
 * Produces a React-like element tree that Satori converts to SVG.
 */

export interface InvoiceData {
  invoiceId: string
  date: string
  customerName: string
  phone: string
  eventName: string
  items: { name: string; quantity: number; price: number; subtotal: number }[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  paymentUrl?: string
  companyName?: string
  companyAddress?: string
}

function formatCurrency(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID')
}

type SatoriNode = {
  type: string
  props: Record<string, unknown> & { children?: (SatoriNode | string)[] }
}

function div(
  style: Record<string, unknown>,
  ...children: (SatoriNode | string)[]
): SatoriNode {
  return { type: 'div', props: { style, children } }
}

export function buildInvoiceMarkup(data: InvoiceData): SatoriNode {
  const companyName = data.companyName || 'GuraGiru'

  return div(
    {
      width: 800,
      height: 'auto',
      padding: 40,
      fontFamily: 'Inter',
      background: 'white',
      color: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
    },
    // Header
    div(
      {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
        borderBottom: '2px solid #2563eb',
        paddingBottom: 20,
      },
      div(
        { display: 'flex', flexDirection: 'column' },
        div({ fontSize: 28, fontWeight: 700, color: '#2563eb' }, companyName),
        ...(data.companyAddress
          ? [div({ fontSize: 11, color: '#666', marginTop: 4 }, data.companyAddress)]
          : []),
      ),
      div(
        { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
        div({ fontSize: 20, fontWeight: 700, color: '#333' }, 'INVOICE'),
        div({ fontSize: 13, color: '#666', marginTop: 4 }, data.invoiceId),
        div({ fontSize: 12, color: '#888', marginTop: 2 }, data.date),
      ),
    ),

    // Customer Info
    div(
      {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 24,
        padding: 16,
        background: '#f8fafc',
        borderRadius: 8,
      },
      div({ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }, 'BILL TO'),
      div({ fontSize: 15, fontWeight: 600, marginTop: 6 }, data.customerName),
      div({ fontSize: 13, color: '#666', marginTop: 2 }, data.phone),
      div({ fontSize: 12, color: '#888', marginTop: 2 }, `Event: ${data.eventName}`),
    ),

    // Table Header
    div(
      {
        display: 'flex',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: 8,
        marginBottom: 4,
        fontSize: 11,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
      div({ flex: 3 }, 'Item'),
      div({ flex: 1, textAlign: 'center' }, 'Qty'),
      div({ flex: 2, textAlign: 'right' }, 'Harga'),
      div({ flex: 2, textAlign: 'right' }, 'Subtotal'),
    ),

    // Items
    ...data.items.map((item) =>
      div(
        {
          display: 'flex',
          borderBottom: '1px solid #f1f5f9',
          padding: '10px 0',
          fontSize: 13,
        },
        div({ flex: 3, color: '#333' }, item.name),
        div({ flex: 1, textAlign: 'center', color: '#666' }, String(item.quantity)),
        div({ flex: 2, textAlign: 'right', color: '#666' }, formatCurrency(item.price)),
        div({ flex: 2, textAlign: 'right', fontWeight: 600 }, formatCurrency(item.subtotal)),
      ),
    ),

    // Totals
    div(
      {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginTop: 16,
        paddingTop: 16,
        borderTop: '1px solid #e2e8f0',
        gap: 6,
      },
      div(
        { display: 'flex', gap: 40, fontSize: 13 },
        div({ color: '#888', width: 100, textAlign: 'right' }, 'Subtotal'),
        div({ fontWeight: 500, width: 120, textAlign: 'right' }, formatCurrency(data.subtotal)),
      ),
      ...(data.discount > 0
        ? [
            div(
              { display: 'flex', gap: 40, fontSize: 13 },
              div({ color: '#888', width: 100, textAlign: 'right' }, 'Diskon'),
              div({ color: '#ef4444', width: 120, textAlign: 'right' }, `-${formatCurrency(data.discount)}`),
            ),
          ]
        : []),
      ...(data.shipping > 0
        ? [
            div(
              { display: 'flex', gap: 40, fontSize: 13 },
              div({ color: '#888', width: 100, textAlign: 'right' }, 'Ongkir'),
              div({ width: 120, textAlign: 'right' }, formatCurrency(data.shipping)),
            ),
          ]
        : []),
      div(
        {
          display: 'flex',
          gap: 40,
          fontSize: 16,
          fontWeight: 700,
          borderTop: '2px solid #2563eb',
          paddingTop: 8,
          marginTop: 4,
        },
        div({ color: '#333', width: 100, textAlign: 'right' }, 'TOTAL'),
        div({ color: '#2563eb', width: 120, textAlign: 'right' }, formatCurrency(data.total)),
      ),
    ),

    // Payment Info Footer
    ...(data.paymentUrl
      ? [
          div(
            {
              marginTop: 30,
              padding: 16,
              background: '#eff6ff',
              borderRadius: 8,
              border: '1px solid #bfdbfe',
              fontSize: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            },
            div({ fontWeight: 600, color: '#1e40af' }, 'Link Pembayaran:'),
            div({ color: '#2563eb', wordBreak: 'break-all' }, data.paymentUrl),
          ),
        ]
      : []),

    // Footer
    div(
      {
        marginTop: 30,
        paddingTop: 16,
        borderTop: '1px solid #e2e8f0',
        fontSize: 11,
        color: '#aaa',
        textAlign: 'center',
      },
      `Terima kasih atas pesanan Anda — ${companyName}`,
    ),
  )
}
