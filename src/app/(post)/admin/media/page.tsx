import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminMediaPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Media Library</h1>
        <Link
          href="/admin/dashboard"
          className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded border border-gray-700 hover:border-gray-500 transition-colors"
        >
          Dashboard
        </Link>
      </div>

      <div className="text-center py-12 text-gray-500">
        <p>Media library will be available after Cloudflare Images setup.</p>
        <p className="text-xs text-gray-600 mt-2">Configure CF_IMAGES_ACCOUNT_ID in environment.</p>
      </div>
    </div>
  )
}
