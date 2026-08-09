import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db/d1'
import { getEvents } from '@/lib/db/orders'
import { archiveEventAction } from '../actions'
import Link from 'next/link'

export default async function EventsPage() {
  const session = await getSession()
  if (!session || !['administrator', 'data_input'].includes(session.role)) {
    redirect('/order/login')
  }

  const db = await getDb()
  const events = await getEvents(db)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Events</h1>
        <Link
          href="/order/events/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition-colors"
        >
          + New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">Belum ada event. Buat event baru untuk mulai.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between"
            >
              <Link
                href={`/order/events/${event.id}`}
                className="flex-1 hover:text-blue-400 transition-colors"
              >
                <h3 className="font-medium text-white">{event.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(event.created_at).toLocaleDateString('id-ID')}
                </p>
              </Link>
              {session.role === 'administrator' && (
                <form action={archiveEventAction}>
                  <input type="hidden" name="id" value={event.id} />
                  <button
                    type="submit"
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors ml-4"
                  >
                    Archive
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
