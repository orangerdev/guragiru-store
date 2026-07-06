import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getPostAction } from '../../actions'
import { PostEditor } from '../_components/PostEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const post = await getPostAction(id)

  if (!post) {
    redirect('/admin/posts')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Edit Post</h1>
        <Link
          href="/admin/posts"
          className="text-sm text-gray-400 hover:text-white"
        >
          Back to Posts
        </Link>
      </div>
      <PostEditor post={post} />
    </div>
  )
}
