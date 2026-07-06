import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  // Allow login page without auth
  // Auth check happens at the page level for /admin/login
  // All other admin pages require auth
  if (!session) {
    // We can't check the current path in layout easily,
    // so we handle this at page level instead
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {children}
    </div>
  )
}
