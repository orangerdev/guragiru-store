import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db/d1'
import type { Admin } from '@/lib/db/types'
import EditUserForm from './_components/EditUserForm'
import Link from 'next/link'

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/admin/login')
  if (!['admin', 'administrator'].includes(session.role)) redirect('/admin/dashboard')

  const { id } = await params
  const db = await getDb()
  const user = await db
    .prepare('SELECT id, email, role, created_at FROM admins WHERE id = ?')
    .bind(id)
    .first<Omit<Admin, 'password_hash'>>()

  if (!user) redirect('/admin/users')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/users" className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Users
        </Link>
        <h1 className="text-xl font-bold text-white">Edit User</h1>
      </div>

      <div className="max-w-sm">
        <EditUserForm user={user} isSelf={session.sub === user.id} />
      </div>
    </div>
  )
}
