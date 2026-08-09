import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db/d1'
import { getEventById, getCustomersByEvent } from '@/lib/db/orders'
import Link from 'next/link'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const session = await getSession()
  if (!session || !['admin', 'administrator', 'data_input'].includes(session.role)) {
    redirect('/admin/login')
  }

  const { eventId } = await params
  const db = await getDb()
  const event = await getEventById(db, Number(eventId))
  if (!event) redirect('/order/events')

  const customers = await getCustomersByEvent(db, event.id)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/order/events" className="text-gray-400 hover:text-white transition-colors">
          &larr;
        </Link>
        <div>
          <h1 className="text-xl font-bold">{event.name}</h1>
          <p className="text-xs text-gray-500">
            {new Date(event.created_at).toLocaleDateString('id-ID')}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-400">Customers ({customers.length})</h2>
        <Link
          href={`/order/events/${event.id}/customers/new`}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded transition-colors"
        >
          + Add Customer
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">Belum ada customer. Tambahkan customer baru.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((customer) => (
            <Link
              key={customer.id}
              href={`/order/events/${event.id}/customers/${customer.id}`}
              className="block bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors"
            >
              <h3 className="font-medium text-white">{customer.name}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(customer.created_at).toLocaleDateString('id-ID')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
