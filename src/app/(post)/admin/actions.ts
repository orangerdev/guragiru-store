'use server'

import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db/d1'
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  isSlugTaken,
  getPostCount,
  getPublishedPostCount,
} from '@/lib/db/posts'
import { slugify } from '@/lib/utils/slugify'
import { sanitizeHtml } from '@/lib/utils/sanitize'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

function assertSameOrigin(headersList: Headers): void {
  const origin = headersList.get('origin')
  const host = headersList.get('host')
  if (!origin || !host) throw new Error('Missing origin headers')
  const originHost = new URL(origin).host
  if (originHost !== host) {
    throw new Error(`CSRF: origin mismatch ${originHost} !== ${host}`)
  }
}

async function requireAdmin() {
  const session = await getSession()
  if (!session) redirect('/admin/login')
  return session
}

export async function createPostAction(formData: FormData) {
  const headersList = await headers()
  assertSameOrigin(headersList)
  await requireAdmin()

  const title = formData.get('title') as string
  const body = formData.get('body') as string
  const excerpt = (formData.get('excerpt') as string) || null
  const locale = (formData.get('locale') as string) || 'id'
  const published = formData.get('published') === 'on' ? 1 : 0

  if (!title || !body) {
    throw new Error('Title and body are required')
  }

  if (title.length > 200) {
    throw new Error('Title must be 200 characters or less')
  }

  const slug = slugify(title)
  const sanitizedBody = sanitizeHtml(body)

  const db = await getDb()

  // Check slug uniqueness
  if (await isSlugTaken(db, slug)) {
    throw new Error(`Slug "${slug}" already exists`)
  }

  const post = await createPost(db, {
    title,
    slug,
    body: sanitizedBody,
    excerpt: excerpt ?? undefined,
    published,
    locale,
  })

  if (published && post) {
    revalidatePath('/post')
    revalidatePath(`/post/${slug}`)
  }

  redirect('/admin/posts')
}

export async function updatePostAction(formData: FormData) {
  const headersList = await headers()
  assertSameOrigin(headersList)
  await requireAdmin()

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const body = formData.get('body') as string
  const excerpt = (formData.get('excerpt') as string) || null
  const locale = (formData.get('locale') as string) || 'id'
  const published = formData.get('published') === 'on' ? 1 : 0

  if (!id || !title || !body) {
    throw new Error('ID, title, and body are required')
  }

  const db = await getDb()
  const existing = await getPostById(db, id)
  if (!existing) throw new Error('Post not found')

  const slug = slugify(title)
  const sanitizedBody = sanitizeHtml(body)

  // Check slug uniqueness (exclude current post)
  if (slug !== existing.slug && (await isSlugTaken(db, slug, id))) {
    throw new Error(`Slug "${slug}" already exists`)
  }

  await updatePost(db, id, {
    title,
    slug,
    body: sanitizedBody,
    excerpt,
    published,
    locale,
  })

  revalidatePath('/post')
  revalidatePath(`/post/${slug}`)
  if (existing.slug !== slug) {
    revalidatePath(`/post/${existing.slug}`)
  }

  redirect('/admin/posts')
}

export async function deletePostAction(formData: FormData) {
  const headersList = await headers()
  assertSameOrigin(headersList)
  await requireAdmin()

  const id = formData.get('id') as string
  if (!id) throw new Error('ID is required')

  const db = await getDb()
  const post = await getPostById(db, id)
  await deletePost(db, id)

  if (post) {
    revalidatePath('/post')
    revalidatePath(`/post/${post.slug}`)
  }

  redirect('/admin/posts')
}

export async function togglePublishAction(formData: FormData) {
  const headersList = await headers()
  assertSameOrigin(headersList)
  await requireAdmin()

  const id = formData.get('id') as string
  if (!id) throw new Error('ID is required')

  const db = await getDb()
  const post = await getPostById(db, id)
  if (!post) throw new Error('Post not found')

  const newPublished = post.published ? 0 : 1
  await updatePost(db, id, { published: newPublished })

  revalidatePath('/post')
  revalidatePath(`/post/${post.slug}`)
  revalidatePath('/admin/posts')
}

export async function getPostsAction() {
  await requireAdmin()
  const db = await getDb()
  return getAllPosts(db)
}

export async function getPostAction(id: string) {
  await requireAdmin()
  const db = await getDb()
  return getPostById(db, id)
}

export async function getDashboardStats() {
  await requireAdmin()
  const db = await getDb()
  const [total, published] = await Promise.all([
    getPostCount(db),
    getPublishedPostCount(db),
  ])
  return { total, published, drafts: total - published }
}
