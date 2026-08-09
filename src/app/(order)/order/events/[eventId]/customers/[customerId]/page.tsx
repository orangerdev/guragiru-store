import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db/d1'
import { getEventById, getCustomerById, getItemsByCustomer } from '@/lib/db/orders'
import { createItemAction, deleteItemAction } from '../../../../actions'
import Link from 'next/link'

function formatCurrency(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID')
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ eventId: string; customerId: string }>
}) {
  const session = await getSession()
  if (!session || !['admin', 'administrator', 'data_input'].includes(session.role)) {
    redirect('/admin/login')
  }

  const { eventId, customerId } = await params
  const db = await getDb()
  const event = await getEventById(db, Number(eventId))
  if (!event) redirect('/order/events')

  const customer = await getCustomerById(db, Number(customerId))
  if (!customer) redirect(`/order/events/${eventId}`)

  const items = await getItemsByCustomer(db, customer.id)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/order/events/${event.id}`}
          className="text-gray-400 hover:text-white transition-colors"
        >
          &larr;
        </Link>
        <div>
          <h1 className="text-xl font-bold">{customer.name}</h1>
          <p className="text-xs text-gray-500">Event: {event.name}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-400 mb-3">
          Items ({items.length}) — Total: {formatCurrency(totalPrice)}
        </h2>

        {items.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="text-left px-4 py-2">Item</th>
                  <th className="text-right px-4 py-2">Qty</th>
                  <th className="text-right px-4 py-2">Harga</th>
                  <th className="text-right px-4 py-2">Modal</th>
                  <th className="text-right px-4 py-2">Subtotal</th>
                  <th className="text-right px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-800/50">
                    <td className="px-4 py-2 text-white">{item.item_name}</td>
                    <td className="px-4 py-2 text-right text-gray-300">{item.quantity}</td>
                    <td className="px-4 py-2 text-right text-gray-300">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-2 text-right text-gray-500">{formatCurrency(item.cost_price)}</td>
                    <td className="px-4 py-2 text-right text-white">{formatCurrency(item.price * item.quantity)}</td>
                    <td className="px-4 py-2 text-right">
                      <form action={deleteItemAction} className="inline">
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="event_id" value={event.id} />
                        <input type="hidden" name="customer_id" value={customer.id} />
                        <button
                          type="submit"
                          className="text-gray-500 hover:text-red-400 transition-colors text-xs"
                        >
                          Hapus
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Item Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Tambah Item</h3>
        <form action={createItemAction} className="space-y-3">
          <input type="hidden" name="customer_id" value={customer.id} />
          <input type="hidden" name="event_id" value={event.id} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs text-gray-500 mb-1">Nama Item</label>
              <input
                name="item_name"
                type="text"
                required
                placeholder="e.g. Kaos XL"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Qty</label>
              <input
                name="quantity"
                type="number"
                required
                min="1"
                defaultValue="1"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Harga (Rp)</label>
              <input
                name="price"
                type="number"
                required
                min="0"
                placeholder="100000"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Modal (Rp)</label>
              <input
                name="cost_price"
                type="number"
                min="0"
                defaultValue="0"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded transition-colors"
          >
            Tambah
          </button>
        </form>
      </div>
    </div>
  )
}
