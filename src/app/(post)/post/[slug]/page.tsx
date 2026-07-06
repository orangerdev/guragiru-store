import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db/d1'
import { getPostBySlug } from '@/lib/db/posts'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo/json-ld'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://guragiru.com'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const db = await getDb()
  const post = await getPostBySlug(db, slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  const ogImageUrl = `${BASE_URL}/api/post/og?title=${encodeURIComponent(post.title)}&excerpt=${encodeURIComponent(post.excerpt ?? '')}`

  return {
    title: post.title,
    description: post.excerpt ?? `Baca artikel "${post.title}" di GuraGiru Blog`,
    alternates: {
      canonical: `${BASE_URL}/post/${slug}`,
      languages: {
        'id-ID': `/post/${slug}`,
      },
    },
    openGraph: {
      title: `${post.title} | GuraGiru`,
      description: post.excerpt ?? post.title,
      url: `${BASE_URL}/post/${slug}`,
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      siteName: 'GuraGiru',
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | GuraGiru`,
      description: post.excerpt ?? post.title,
      images: [ogImageUrl],
    },
  }
}

export const revalidate = 300

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params
  const db = await getDb()
  const post = await getPostBySlug(db, slug)

  if (!post) notFound()

  const jsonLd = articleJsonLd({
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    baseUrl: BASE_URL,
  })

  const breadcrumb = breadcrumbJsonLd({
    items: [
      { name: 'Home', url: '/' },
      { name: 'Blog', url: '/post' },
      { name: post.title, url: `/post/${slug}` },
    ],
    baseUrl: BASE_URL,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <nav className="mb-6">
          <Link href="/post" className="text-sm text-[#f1f1f1]/60 hover:text-[#f1f1f1] transition-colors">
            &larr; Blog
          </Link>
        </nav>

        <article>
          <header className="mb-8">
            <h1 className="text-2xl font-bold leading-tight text-[#f1f1f1]">{post.title}</h1>
            <time className="text-sm text-[#f1f1f1]/50 mt-3 block">
              {new Date(post.created_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </header>

          <div
            className="prose prose-invert prose-sm max-w-none
              prose-headings:text-[#f1f1f1] prose-p:text-[#f1f1f1]
              prose-a:text-blue-400 prose-strong:text-[#f1f1f1]
              prose-blockquote:border-white/20 prose-blockquote:text-[#f1f1f1]/70
              prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </article>
      </main>
    </>
  )
}
