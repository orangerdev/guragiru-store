'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteUserButton({ userId, userEmail }: { userId: string; userEmail: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete user "${userEmail}"? This action cannot be undone.`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        alert(data.error || 'Delete failed')
        return
      }
      router.refresh()
    } catch {
      alert('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
    >
      {loading ? '...' : 'Delete'}
    </button>
  )
}
