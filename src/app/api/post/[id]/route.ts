import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db/d1'
import { getPostById, updatePost, deletePost, isSlugTaken } from '@/lib/db/posts'
import { slugify } from '@/lib/utils/slugify'
import { sanitizeHtml } from '@/lib/utils/sanitize'
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

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

// GET /api/post/:id
export async function GET(request: NextRequest, context: RouteContext) {
  if (!(await verifyAuth(request))) return jsonError('Unauthorized', 401)
  const { id } = await context.params
  const db = await getDb()
  const post = await getPostById(db, id)
  if (!post) return jsonError('Post not found', 404)
  return NextResponse.json({ success: true, data: post })
}

// PUT /api/post/:id
export async function PUT(request: NextRequest, context: RouteContext) {
  if (!(await verifyAuth(request))) return jsonError('Unauthorized', 401)
  const { id } = await context.params
  const db = await getDb()
  const existing = await getPostById(db, id)
  if (!existing) return jsonError('Post not found', 404)

  const body = (await request.json()) as {
    title?: string
    slug?: string
    body?: string
    excerpt?: string | null
    cover_image?: string | null
    locale?: string
    published?: boolean
  }

  if (body.title && body.title.length > 200) {
    return jsonError('title must be 200 characters or less', 400)
  }

  const newSlug = body.slug ? slugify(body.slug) : body.title ? slugify(body.title) : existing.slug

  if (newSlug !== existing.slug && (await isSlugTaken(db, newSlug, id))) {
    return jsonError(`slug "${newSlug}" already exists`, 409)
  }

  const updated = await updatePost(db, id, {
    title: body.title,
    slug: newSlug !== existing.slug ? newSlug : undefined,
    body: body.body ? sanitizeHtml(body.body) : undefined,
    excerpt: body.excerpt !== undefined ? body.excerpt : undefined,
    cover_image: body.cover_image !== undefined ? body.cover_image : undefined,
    published: body.published !== undefined ? (body.published ? 1 : 0) : undefined,
    locale: body.locale,
  })

  revalidatePath('/post')
  revalidatePath(`/post/${updated?.slug}`)
  if (existing.slug !== updated?.slug) {
    revalidatePath(`/post/${existing.slug}`)
  }

  return NextResponse.json({ success: true, data: updated, message: 'Post updated' })
}

// DELETE /api/post/:id
export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!(await verifyAuth(request))) return jsonError('Unauthorized', 401)
  const { id } = await context.params
  const db = await getDb()
  const post = await getPostById(db, id)
  if (!post) return jsonError('Post not found', 404)

  await deletePost(db, id)

  revalidatePath('/post')
  revalidatePath(`/post/${post.slug}`)

  return NextResponse.json({ success: true, message: 'Post deleted' })
}
