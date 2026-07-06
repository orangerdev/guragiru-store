import type { Metadata } from 'next'
import Link from 'next/link'
import { organizationJsonLd } from '@/lib/seo/json-ld'
import { getDb } from '@/lib/db/d1'
import { getPublishedPosts } from '@/lib/db/posts'
import type { Post } from '@/lib/db/types'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://guragiru.com'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Artikel dan informasi terbaru dari GuraGiru',
  alternates: {
    canonical: `${BASE_URL}/post`,
  },
  openGraph: {
    title: 'Blog | GuraGiru',
    description: 'Artikel dan informasi terbaru dari GuraGiru',
    url: `${BASE_URL}/post`,
    type: 'website',
    siteName: 'GuraGiru',
  },
  twitter: {
    card: 'summary',
    title: 'Blog | GuraGiru',
    description: 'Artikel dan informasi terbaru dari GuraGiru',
  },
}

export const revalidate = 300

export default async function PostListPage() {
  const db = await getDb()
  const posts = await getPublishedPosts(db, 'id', 50, 0)
  const orgJsonLd = organizationJsonLd({ baseUrl: BASE_URL })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-8">
          <Link href="/" className="text-sm text-[#f1f1f1]/60 hover:text-[#f1f1f1] transition-colors">
            &larr; Home
          </Link>
          <h1 className="text-2xl font-bold mt-4 text-[#f1f1f1]">Blog</h1>
          <p className="text-[#f1f1f1]/70 mt-2 text-sm">Artikel dan informasi terbaru dari GuraGiru</p>
        </header>

        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Belum ada artikel.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}

function PostCard({ post }: { post: Post }) {
  return (
    <article className="border-b border-white/10 pb-6">
      <Link href={`/post/${post.slug}`} className="group block">
        <h2 className="text-lg font-semibold text-[#f1f1f1] group-hover:text-blue-400 transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-[#f1f1f1]/70 mt-2 line-clamp-2">{post.excerpt}</p>
        )}
        <time className="text-xs text-[#f1f1f1]/40 mt-2 block">
          {new Date(post.created_at).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </Link>
    </article>
  )
}
