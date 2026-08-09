import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import OrderNav from './_components/OrderNav'

export const metadata = {
  title: 'GuraGiru - Order Management',
}

export default async function OrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const isLoginPage =
    typeof window === 'undefined' // always true in RSC, route check done below

  // Allow login page without auth
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {session && ['administrator', 'data_input'].includes(session.role) ? (
        <div className="flex flex-col min-h-screen">
          <OrderNav session={session} />
          <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
            {children}
          </main>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
