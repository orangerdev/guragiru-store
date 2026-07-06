import type { Media } from './types'

export async function getAllMedia(
  db: D1Database,
  limit = 50,
  offset = 0
): Promise<Media[]> {
  const result = await db
    .prepare('SELECT * FROM media ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .bind(limit, offset)
    .all<Media>()
  return result.results
}

export async function getMediaById(
  db: D1Database,
  id: string
): Promise<Media | null> {
  return db.prepare('SELECT * FROM media WHERE id = ?').bind(id).first<Media>()
}

export async function createMedia(
  db: D1Database,
  data: {
    cf_image_id: string
    alt_text: string
    width: number
    height: number
  }
): Promise<Media | null> {
  const id = generateId()
  const now = new Date().toISOString()
  await db
    .prepare(
      'INSERT INTO media (id, cf_image_id, alt_text, width, height, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .bind(id, data.cf_image_id, data.alt_text, data.width, data.height, now)
    .run()
  return getMediaById(db, id)
}

export async function deleteMedia(
  db: D1Database,
  id: string
): Promise<boolean> {
  const result = await db
    .prepare('DELETE FROM media WHERE id = ?')
    .bind(id)
    .run()
  return result.success
}

function generateId(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}
