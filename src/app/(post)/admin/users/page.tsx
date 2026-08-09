import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db/d1'
import type { Admin } from '@/lib/db/types'
import Link from 'next/link'
import DeleteUserButton from './_components/DeleteUserButton'

export default async function AdminUsersPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')
  if (!['admin', 'administrator'].includes(session.role)) redirect('/admin/dashboard')

  const db = await getDb()
  const result = await db
    .prepare('SELECT id, email, role, created_at FROM admins ORDER BY created_at ASC')
    .all<Omit<Admin, 'password_hash'>>()
  const users = result.results

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Users</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard"
            className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded border border-gray-700 hover:border-gray-500 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/users/new"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors"
          >
            + New User
          </Link>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No users found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">{user.email}</span>
                  {user.id === session.sub && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">you</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <RoleBadge role={user.role} />
                  <span className="text-xs text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Link
                  href={`/admin/users/${user.id}`}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                >
                  Edit
                </Link>
                {user.id !== session.sub && (
                  <DeleteUserButton userId={user.id} userEmail={user.email} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = ['admin', 'administrator'].includes(role)
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded ${
        isAdmin ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-500/10 text-gray-400'
      }`}
    >
      {role}
    </span>
  )
}
