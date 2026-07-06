import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db/d1'
import { getPostById, updatePost } from '@/lib/db/posts'
import { revalidatePath } from 'next/cache'

type RouteContext = { params: Promise<{ id: string }> }

async function verifyAuth(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  const apiKey = authHeader.slice(7)
  const expectedKey = process.env.AGENT_API_KEY
  if (!expectedKey) return false
  if (apiKey.length !== expectedKey.length) return false
  let mismatch = 0
  for (let i = 0; i < apiKey.length; i++) {
    mismatch |= apiKey.charCodeAt(i) ^ expectedKey.charCodeAt(i)
  }
  return mismatch === 0
}

// POST /api/post/:id/publish — toggle publish status
export async function POST(request: NextRequest, context: RouteContext) {
  if (!(await verifyAuth(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const db = await getDb()
  const post = await getPostById(db, id)

  if (!post) {
    return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
  }

  const body = (await request.json().catch(() => ({}))) as { published?: boolean }
  const newPublished = body.published !== undefined ? (body.published ? 1 : 0) : (post.published ? 0 : 1)

  await updatePost(db, id, { published: newPublished })

  revalidatePath('/post')
  revalidatePath(`/post/${post.slug}`)

  return NextResponse.json({
    success: true,
    data: { id, published: newPublished },
    message: newPublished ? 'Post published' : 'Post unpublished',
  })
}
