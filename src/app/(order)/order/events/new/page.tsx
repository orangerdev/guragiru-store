import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { createEventAction } from '../../actions'
import Link from 'next/link'

export default async function NewEventPage() {
  const session = await getSession()
  if (!session || !['admin', 'administrator', 'data_input'].includes(session.role)) {
    redirect('/admin/login')
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/order/events" className="text-gray-400 hover:text-white transition-colors">
          &larr;
        </Link>
        <h1 className="text-xl font-bold">New Event</h1>
      </div>

      <form action={createEventAction} className="max-w-md space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm text-gray-400 mb-1">
            Nama Event
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. Bazaar Desember 2026"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition-colors"
          >
            Buat Event
          </button>
          <Link
            href="/order/events"
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  )
}
