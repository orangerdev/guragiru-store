import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db/d1'
import { getPublishedPosts, getAllPosts, createPost, isSlugTaken } from '@/lib/db/posts'
import { slugify } from '@/lib/utils/slugify'
import { sanitizeHtml } from '@/lib/utils/sanitize'
import { revalidatePath } from 'next/cache'

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

// GET /api/post — list posts
export async function GET(request: NextRequest) {
  if (!(await verifyAuth(request))) return jsonError('Unauthorized', 401)

  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10), 100)
  const offset = parseInt(url.searchParams.get('offset') ?? '0', 10)
  const published = url.searchParams.get('published')
  const locale = url.searchParams.get('locale') ?? 'id'

  const db = await getDb()

  let posts
  if (published === '1') {
    posts = await getPublishedPosts(db, locale, limit, offset)
  } else {
    posts = await getAllPosts(db, limit, offset)
  }

  return NextResponse.json({
    success: true,
    data: posts,
    total: posts.length,
  })
}

// POST /api/post — create post
export async function POST(request: NextRequest) {
  if (!(await verifyAuth(request))) return jsonError('Unauthorized', 401)

  const body = (await request.json()) as {
    title?: string
    slug?: string
    body?: string
    excerpt?: string
    cover_image?: string
    locale?: string
    published?: boolean
  }

  if (!body.title || typeof body.title !== 'string') {
    return jsonError('title is required', 400)
  }
  if (body.title.length > 200) {
    return jsonError('title must be 200 characters or less', 400)
  }
  if (!body.body || typeof body.body !== 'string') {
    return jsonError('body is required', 400)
  }

  const slug = body.slug ? slugify(body.slug) : slugify(body.title)
  const db = await getDb()

  if (await isSlugTaken(db, slug)) {
    return jsonError(`slug "${slug}" already exists`, 409)
  }

  const sanitizedBody = sanitizeHtml(body.body)

  const post = await createPost(db, {
    title: body.title,
    slug,
    body: sanitizedBody,
    excerpt: body.excerpt,
    cover_image: body.cover_image,
    published: body.published ? 1 : 0,
    locale: body.locale ?? 'id',
  })

  if (post?.published) {
    revalidatePath('/post')
    revalidatePath(`/post/${slug}`)
  }

  return NextResponse.json(
    { success: true, data: post, message: 'Post created' },
    { status: 201 }
  )
}
