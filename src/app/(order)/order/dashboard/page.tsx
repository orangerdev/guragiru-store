import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db/d1'
import { getEventCount, getCustomerCount, getOrderCount } from '@/lib/db/orders'
import Link from 'next/link'

export default async function OrderDashboardPage() {
  const session = await getSession()
  if (!session || !['administrator', 'data_input'].includes(session.role)) {
    redirect('/order/login')
  }

  const db = await getDb()
  const [eventCount, customerCount, orderCount] = await Promise.all([
    getEventCount(db),
    getCustomerCount(db),
    getOrderCount(db),
  ])

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Active Events" value={String(eventCount)} />
        <StatCard title="Total Customers" value={String(customerCount)} />
        <StatCard title="Total Orders" value={String(orderCount)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickLink href="/order/events" title="Events" desc="Kelola event dan customer" />
        <QuickLink href="/order/invoices" title="Buat Invoice" desc="Generate invoice baru" />
        <QuickLink href="/order/orders" title="Orders" desc="Lihat semua order" />
        {session.role === 'administrator' && (
          <QuickLink href="/order/config" title="Config" desc="Pengaturan sistem" />
        )}
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

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
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
