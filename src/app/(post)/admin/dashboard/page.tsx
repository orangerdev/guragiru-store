import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getDashboardStats } from '../actions'
import { getDb } from '@/lib/db/d1'
import { getEventCount, getCustomerCount, getOrderCount } from '@/lib/db/orders'

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')
  if (!['admin', 'administrator'].includes(session.role)) redirect('/order/dashboard')

  const [blogStats, db] = await Promise.all([
    getDashboardStats(),
    getDb(),
  ])

  const [eventCount, customerCount, orderCount] = await Promise.all([
    getEventCount(db),
    getCustomerCount(db),
    getOrderCount(db),
  ])

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

      {/* Blog Stats */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Blog</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <StatCard title="Total Posts" value={String(blogStats.total)} />
        <StatCard title="Published" value={String(blogStats.published)} />
        <StatCard title="Drafts" value={String(blogStats.drafts)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <ModuleLink href="/admin/posts" title="Posts" desc="Create and manage blog posts" />
        <ModuleLink href="/admin/media" title="Media" desc="Upload and manage images" />
      </div>

      {/* Order Stats */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Orders</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <StatCard title="Active Events" value={String(eventCount)} />
        <StatCard title="Total Customers" value={String(customerCount)} />
        <StatCard title="Total Orders" value={String(orderCount)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <ModuleLink href="/order/events" title="Events" desc="Kelola event dan customer" />
        <ModuleLink href="/order/invoices" title="Invoices" desc="Generate invoice baru" />
        <ModuleLink href="/order/orders" title="Orders" desc="Lihat semua order" />
        <ModuleLink href="/order/config" title="Config" desc="Pengaturan sistem order" />
      </div>

      {/* Admin */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Admin</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ModuleLink href="/admin/users" title="Users" desc="Manage admin accounts and roles" />
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  )
}

function ModuleLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors"
    >
      <h3 className="font-medium text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{desc}</p>
    </Link>
  )
}
