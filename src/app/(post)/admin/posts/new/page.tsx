import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PostEditor } from '../_components/PostEditor'

export default async function NewPostPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">New Post</h1>
        <Link
          href="/admin/posts"
          className="text-sm text-gray-400 hover:text-white"
        >
          Back to Posts
        </Link>
      </div>
      <PostEditor />
    </div>
  )
}
