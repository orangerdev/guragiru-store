import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getDashboardStats } from '../actions'

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const stats = await getDashboardStats()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{session.email}</span>
          <form action="/api/post/auth/logout" method="POST">
            <button type="submit" className="text-xs text-gray-500 hover:text-white transition-colors">
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <DashboardCard title="Total Posts" value={String(stats.total)} />
        <DashboardCard title="Published" value={String(stats.published)} />
        <DashboardCard title="Drafts" value={String(stats.drafts)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/posts"
          className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors"
        >
          <h3 className="font-medium text-white mb-1">Posts</h3>
          <p className="text-sm text-gray-400">Create and manage blog posts</p>
        </Link>
        <Link
          href="/admin/media"
          className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors"
        >
          <h3 className="font-medium text-white mb-1">Media</h3>
          <p className="text-sm text-gray-400">Upload and manage images</p>
        </Link>
      </div>
    </div>
  )
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  )
}
