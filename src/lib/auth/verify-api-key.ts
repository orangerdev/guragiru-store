export async function verifyApiKey(
  db: D1Database,
  apiKey: string
): Promise<{ valid: boolean; name: string | null }> {
  const keyHash = await hashApiKey(apiKey)

  const row = await db
    .prepare('SELECT name FROM api_keys WHERE key_hash = ? AND active = 1')
    .bind(keyHash)
    .first<{ name: string }>()

  if (!row) {
    return { valid: false, name: null }
  }

  return { valid: true, name: row.name }
}

export async function hashApiKey(key: string): Promise<string> {
  const encoded = new TextEncoder().encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray = new Uint8Array(hashBuffer)
  return Array.from(hashArray, (b) => b.toString(16).padStart(2, '0')).join('')
}
