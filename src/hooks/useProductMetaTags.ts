"use client"

import type { Product } from '@/types'
import { useEffect } from 'react'

/**
 * Hook untuk update Open Graph meta tags untuk product share
 */
export function useProductMetaTags(product: Product | undefined, isOpen: boolean) {
  useEffect(() => {
    if (!product || !isOpen) {
      // Reset to default meta tags
      updateMetaTag('og:title', 'Gura Giru - Shop')
      updateMetaTag('og:description', 'Temukan produk pilihan kami')
      updateMetaTag('og:image', `${window.location.origin}/assets/img/logo.webp`)
      updateMetaTag('og:url', `${window.location.origin}/shop`)
      updateMetaTag('twitter:card', 'summary_large_image')
      updateMetaTag('twitter:title', 'Gura Giru - Shop')
      updateMetaTag('twitter:description', 'Temukan produk pilihan kami')
      updateMetaTag('twitter:image', `${window.location.origin}/assets/img/logo.webp`)
      return
    }

    // Update meta tags dengan product info
    const title = `${product.product_name} - Gura Giru`
    const description = product.description || `Check out ${product.product_name}`
    const url = `${window.location.origin}/shop?product=${product.product_slug}`
    const image = product.asset_link || `${window.location.origin}/assets/img/logo.webp`

    // Open Graph tags
    updateMetaTag('og:title', title)
    updateMetaTag('og:description', description)
    updateMetaTag('og:image', image)
    updateMetaTag('og:url', url)
    updateMetaTag('og:type', 'product')

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', image)

  }, [product, isOpen])
}

function updateMetaTag(property: string, content: string) {
  // For og: tags
  let meta = document.querySelector(`meta[property="${property}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('property', property)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)

  // For twitter: tags
  meta = document.querySelector(`meta[name="${property}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', property)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}
