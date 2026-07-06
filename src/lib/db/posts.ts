import type { Post } from './types'

export async function getPublishedPosts(
  db: D1Database,
  locale = 'id',
  limit = 20,
  offset = 0
): Promise<Post[]> {
  const result = await db
    .prepare(
      'SELECT * FROM posts WHERE published = 1 AND locale = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
    )
    .bind(locale, limit, offset)
    .all<Post>()
  return result.results
}

export async function getPostBySlug(
  db: D1Database,
  slug: string
): Promise<Post | null> {
  return db
    .prepare('SELECT * FROM posts WHERE slug = ? AND published = 1')
    .bind(slug)
    .first<Post>()
}

export async function getPostById(
  db: D1Database,
  id: string
): Promise<Post | null> {
  return db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first<Post>()
}

export async function getAllPosts(
  db: D1Database,
  limit = 50,
  offset = 0
): Promise<Post[]> {
  const result = await db
    .prepare('SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .bind(limit, offset)
    .all<Post>()
  return result.results
}

export async function getPostCount(db: D1Database): Promise<number> {
  const row = await db
    .prepare('SELECT COUNT(*) as count FROM posts')
    .first<{ count: number }>()
  return row?.count ?? 0
}

export async function getPublishedPostCount(db: D1Database): Promise<number> {
  const row = await db
    .prepare('SELECT COUNT(*) as count FROM posts WHERE published = 1')
    .first<{ count: number }>()
  return row?.count ?? 0
}

export async function createPost(
  db: D1Database,
  data: {
    title: string
    slug: string
    body: string
    excerpt?: string
    cover_image?: string
    published?: number
    locale?: string
  }
): Promise<Post | null> {
  const id = generateId()
  const now = new Date().toISOString()
  await db
    .prepare(
      `INSERT INTO posts (id, title, slug, body, excerpt, cover_image, published, locale, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      data.title,
      data.slug,
      data.body,
      data.excerpt ?? null,
      data.cover_image ?? null,
      data.published ?? 0,
      data.locale ?? 'id',
      now,
      now
    )
    .run()
  return getPostById(db, id)
}

export async function updatePost(
  db: D1Database,
  id: string,
  data: {
    title?: string
    slug?: string
    body?: string
    excerpt?: string | null
    cover_image?: string | null
    published?: number
    locale?: string
  }
): Promise<Post | null> {
  const existing = await getPostById(db, id)
  if (!existing) return null

  const now = new Date().toISOString()
  await db
    .prepare(
      `UPDATE posts SET
        title = ?, slug = ?, body = ?, excerpt = ?, cover_image = ?,
        published = ?, locale = ?, updated_at = ?
       WHERE id = ?`
    )
    .bind(
      data.title ?? existing.title,
      data.slug ?? existing.slug,
      data.body ?? existing.body,
      data.excerpt !== undefined ? data.excerpt : existing.excerpt,
      data.cover_image !== undefined ? data.cover_image : existing.cover_image,
      data.published ?? existing.published,
      data.locale ?? existing.locale,
      now,
      id
    )
    .run()
  return getPostById(db, id)
}

export async function deletePost(
  db: D1Database,
  id: string
): Promise<boolean> {
  const result = await db
    .prepare('DELETE FROM posts WHERE id = ?')
    .bind(id)
    .run()
  return result.success
}

export async function getAllPublishedSlugs(
  db: D1Database
): Promise<{ slug: string; updated_at: string }[]> {
  const result = await db
    .prepare('SELECT slug, updated_at FROM posts WHERE published = 1 ORDER BY created_at DESC')
    .all<{ slug: string; updated_at: string }>()
  return result.results
}

export async function isSlugTaken(
  db: D1Database,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const query = excludeId
    ? 'SELECT id FROM posts WHERE slug = ? AND id != ?'
    : 'SELECT id FROM posts WHERE slug = ?'
  const stmt = excludeId
    ? db.prepare(query).bind(slug, excludeId)
    : db.prepare(query).bind(slug)
  const row = await stmt.first()
  return row !== null
}

function generateId(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}
