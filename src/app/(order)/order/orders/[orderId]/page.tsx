import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db/d1'
import { getOrderById, getOrderItems } from '@/lib/db/orders'
import Link from 'next/link'

function formatCurrency(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID')
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const session = await getSession()
  if (!session || !['admin', 'administrator', 'data_input'].includes(session.role)) {
    redirect('/admin/login')
  }

  const { orderId } = await params
  const db = await getDb()
  const order = await getOrderById(db, Number(orderId))
  if (!order) redirect('/order/orders')

  const items = await getOrderItems(db, order.id)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/order/orders" className="text-gray-400 hover:text-white transition-colors">
          &larr;
        </Link>
        <div>
          <h1 className="text-xl font-bold">{order.invoice_id}</h1>
          <p className="text-xs text-gray-500">
            {new Date(order.created_at).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Order Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-2">
          <h2 className="text-sm font-medium text-gray-400 mb-3">Info Order</h2>
          <InfoRow label="Customer" value={order.customer_name} />
          <InfoRow label="Event" value={order.event_name} />
          <InfoRow label="Phone" value={order.phone} />
          {order.payment_url && (
            <InfoRow
              label="Payment"
              value={
                <a
                  href={order.payment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 break-all"
                >
                  Link Pembayaran
                </a>
              }
            />
          )}
        </div>

        {/* Totals */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-2">
          <h2 className="text-sm font-medium text-gray-400 mb-3">Ringkasan</h2>
          <InfoRow label="Subtotal" value={formatCurrency(order.subtotal)} />
          {order.discount > 0 && (
            <InfoRow label="Diskon" value={`-${formatCurrency(order.discount)}`} />
          )}
          {order.shipping > 0 && (
            <InfoRow label="Ongkir" value={formatCurrency(order.shipping)} />
          )}
          <div className="border-t border-gray-800 pt-2 mt-2">
            <InfoRow
              label="Total"
              value={<span className="text-lg font-bold">{formatCurrency(order.total)}</span>}
            />
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <h2 className="text-sm font-medium text-gray-400 px-4 py-3 border-b border-gray-800">
          Items ({items.length})
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left px-4 py-2">Item</th>
              <th className="text-right px-4 py-2">Qty</th>
              <th className="text-right px-4 py-2">Harga</th>
              <th className="text-right px-4 py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-800/50">
                <td className="px-4 py-2 text-white">{item.item_name}</td>
                <td className="px-4 py-2 text-right text-gray-300">{item.quantity}</td>
                <td className="px-4 py-2 text-right text-gray-300">{formatCurrency(item.unit_price)}</td>
                <td className="px-4 py-2 text-right text-white">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Image Preview */}
      {order.invoice_file && (
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-400 mb-3">Invoice Image</h2>
          <img
            src={`/api/order/invoice-image/${order.invoice_id}`}
            alt={`Invoice ${order.invoice_id}`}
            className="max-w-md rounded border border-gray-700"
          />
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  )
}
