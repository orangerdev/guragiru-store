import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db/d1'
import { getEventById } from '@/lib/db/orders'
import { createCustomerAction } from '../../../../actions'
import Link from 'next/link'

export default async function NewCustomerPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const session = await getSession()
  if (!session || !['administrator', 'data_input'].includes(session.role)) {
    redirect('/order/login')
  }

  const { eventId } = await params
  const db = await getDb()
  const event = await getEventById(db, Number(eventId))
  if (!event) redirect('/order/events')

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
          <h1 className="text-xl font-bold">Add Customer</h1>
          <p className="text-xs text-gray-500">Event: {event.name}</p>
        </div>
      </div>

      <form action={createCustomerAction} className="max-w-md space-y-4">
        <input type="hidden" name="event_id" value={event.id} />
        <div>
          <label htmlFor="name" className="block text-sm text-gray-400 mb-1">
            Nama Customer
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. John Doe"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition-colors"
          >
            Tambah Customer
          </button>
          <Link
            href={`/order/events/${event.id}`}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  )
}
