export function articleJsonLd({
  title,
  excerpt,
  slug,
  createdAt,
  updatedAt,
  baseUrl,
}: {
  title: string
  excerpt: string | null
  slug: string
  createdAt: string
  updatedAt: string
  baseUrl: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt ?? title,
    url: `${baseUrl}/post/${slug}`,
    datePublished: createdAt,
    dateModified: updatedAt,
    author: {
      '@type': 'Organization',
      name: 'GuraGiru',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'GuraGiru',
      url: baseUrl,
    },
  }
}

export function breadcrumbJsonLd({
  items,
  baseUrl,
}: {
  items: { name: string; url: string }[]
  baseUrl: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}

export function organizationJsonLd({ baseUrl }: { baseUrl: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GuraGiru',
    url: baseUrl,
    sameAs: ['https://www.instagram.com/guragirujastip/'],
  }
}
