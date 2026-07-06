import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getPostsAction, deletePostAction, togglePublishAction } from '../actions'

export default async function AdminPostsPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const posts = await getPostsAction()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Posts</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard"
            className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded border border-gray-700 hover:border-gray-500 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/posts/new"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors"
          >
            New Post
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No posts yet.</p>
          <Link href="/admin/posts/new" className="text-blue-400 hover:underline text-sm mt-2 inline-block">
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-white truncate">{post.title}</h3>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      post.published
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  /{post.slug} &middot; {new Date(post.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <form action={togglePublishAction}>
                  <input type="hidden" name="id" value={post.id} />
                  <button
                    type="submit"
                    className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                  >
                    {post.published ? 'Unpublish' : 'Publish'}
                  </button>
                </form>
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                >
                  Edit
                </Link>
                <form action={deletePostAction}>
                  <input type="hidden" name="id" value={post.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
