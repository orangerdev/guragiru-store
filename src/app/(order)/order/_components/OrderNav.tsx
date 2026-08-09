'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { AdminPayload } from '@/lib/auth/verify-admin'

const navItems = [
  { href: '/order/dashboard', label: 'Dashboard' },
  { href: '/order/events', label: 'Events' },
  { href: '/order/invoices', label: 'Buat Invoice' },
  { href: '/order/orders', label: 'Orders' },
]

const adminOnlyItems = [
  { href: '/order/config', label: 'Config' },
]

export default function OrderNav({ session }: { session: AdminPayload }) {
  const pathname = usePathname()

  const allItems = ['admin', 'administrator'].includes(session.role)
    ? [...navItems, ...adminOnlyItems]
    : navItems

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1">
            <Link href="/order/dashboard" className="text-sm font-bold text-white mr-4">
              GuraGiru Order
            </Link>
            <div className="flex items-center gap-1">
              {allItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    pathname?.startsWith(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {session.email} ({session.role})
            </span>
            {['admin', 'administrator'].includes(session.role) && (
              <Link href="/admin/dashboard" className="text-xs text-gray-500 hover:text-white transition-colors">
                Admin
              </Link>
            )}
            <form action="/api/order/auth/logout" method="POST">
              <button
                type="submit"
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}
