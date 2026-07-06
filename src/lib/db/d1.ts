import { getCloudflareContext } from '@opennextjs/cloudflare'

declare global {
  interface CloudflareEnv {
    DB: D1Database
  }
}

/**
 * Get the D1 database binding from Cloudflare Workers context.
 */
export async function getDb(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true })
  if (!env.DB) {
    throw new Error('D1 database binding "DB" not found. Check wrangler.toml.')
  }
  return env.DB
}
