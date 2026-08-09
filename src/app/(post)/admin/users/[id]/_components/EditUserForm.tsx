'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import type { Admin } from '@/lib/db/types'

type UserData = Omit<Admin, 'password_hash'>

export default function EditUserForm({ user, isSelf }: { user: UserData; isSelf: boolean }) {
  const router = useRouter()
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'data_input'>(
    ['admin', 'administrator'].includes(user.role) ? 'admin' : 'data_input'
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const body: Record<string, string> = { email, role }
      if (password) body.password = password

      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setError(data.error || 'Failed to update user')
        return
      }

      router.push('/admin/users')
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-400 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">New Password</label>
        <input
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank to keep current password"
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-600"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'data_input')}
          disabled={isSelf}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
        >
          <option value="admin">admin — full access (blog + order + users)</option>
          <option value="data_input">data_input — order only (limited)</option>
        </select>
        {isSelf && (
          <p className="text-xs text-gray-500 mt-1">You cannot change your own role.</p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <Link
          href="/admin/users"
          className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded border border-gray-700 hover:border-gray-500 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
