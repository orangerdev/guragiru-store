import { getCloudflareContext } from '@opennextjs/cloudflare'

declare global {
  interface CloudflareEnv {
    DB: D1Database
    INVOICE_BUCKET: R2Bucket
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

/**
 * Get the R2 bucket binding for invoice image storage.
 */
export async function getR2(): Promise<R2Bucket> {
  const { env } = await getCloudflareContext({ async: true })
  if (!env.INVOICE_BUCKET) {
    throw new Error('R2 bucket binding "INVOICE_BUCKET" not found. Check wrangler.toml.')
  }
  return env.INVOICE_BUCKET
}
