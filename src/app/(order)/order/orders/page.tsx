import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db/d1'
import { getOrders } from '@/lib/db/orders'
import Link from 'next/link'

function formatCurrency(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID')
}

export default async function OrdersPage() {
  const session = await getSession()
  if (!session || !['administrator', 'data_input'].includes(session.role)) {
    redirect('/order/login')
  }

  const db = await getDb()
  const orders = await getOrders(db)

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">Belum ada order.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left px-4 py-2">Invoice ID</th>
                <th className="text-left px-4 py-2">Customer</th>
                <th className="text-left px-4 py-2">Event</th>
                <th className="text-right px-4 py-2">Total</th>
                <th className="text-left px-4 py-2">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-2">
                    <Link
                      href={`/order/orders/${order.id}`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {order.invoice_id}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-white">{order.customer_name}</td>
                  <td className="px-4 py-2 text-gray-400">{order.event_name}</td>
                  <td className="px-4 py-2 text-right text-white">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
