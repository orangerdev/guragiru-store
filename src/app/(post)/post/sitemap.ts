import type { MetadataRoute } from 'next'
import { getDb } from '@/lib/db/d1'
import { getAllPublishedSlugs } from '@/lib/db/posts'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://guragiru.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDb()
  const posts = await getAllPublishedSlugs(db)

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/post`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE_URL}/post/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticPages, ...postEntries]
}
