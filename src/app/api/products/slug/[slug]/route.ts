export const runtime = 'nodejs'
import http from '@/services/http'
import type { Product } from '@/types'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params
  const baseUrl = "https://guragiru-db-sync.orangerdigiart.workers.dev/"

  try {
    if (!baseUrl || baseUrl.includes('your-worker-domain')) {
      console.error('API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL in wrangler.toml [vars].')
      return NextResponse.json(
        { error: 'API base URL not configured' },
        { status: 500 }
      )
    }

    const apiUrl = `${baseUrl}/api/db/products/slug/${slug}`

    // Use axios with cache + request timeout
    console.log('Fetching product by slug:', apiUrl)
    const axRes = await http.get(apiUrl, {
      headers: { 
        'Content-Type': 'application/json',
        // Authorization token from environment (same as products endpoint)
        // The external API expects this header based on API_DOCUMENTATION.md
      },
      timeout: 15000,
    })

    if (axRes.status < 200 || axRes.status >= 300) {
      throw new Error(`HTTP error! status: ${axRes.status}`)
    }

    // Expected response format from API_DOCUMENTATION.md
    type ProductBySlugApiResponse = {
      message?: string
      active_table?: string
      data?: Product
      error?: string
      slug?: string
    }

    const responseData = axRes.data as ProductBySlugApiResponse

    // Check if product was found
    if (responseData.error || !responseData.data) {
      return NextResponse.json(
        { 
          error: 'Product not found',
          slug 
        },
        { status: 404 }
      )
    }

    // Transform Google Drive URLs before sending to client
    const product = transformGoogleDriveUrls(responseData.data)

    // Filter out non-image products (consistent with products list endpoint)
    if (product.asset_type !== 'image' || !product.asset_link) {
      return NextResponse.json(
        { 
          error: 'Product not found',
          slug 
        },
        { status: 404 }
      )
    }

    console.log(`Product found: ${product.product_name}`)

    return NextResponse.json({
      product,
      active_table: responseData.active_table || 'products_a'
    })

  } catch (error) {
    console.error('Error fetching product by slug:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    
    // Check if it's a 404 response from upstream
    if (message.includes('404') || message.includes('not found')) {
      return NextResponse.json(
        { error: 'Product not found', slug },
        { status: 404 }
      )
    }

    // Surface abort/timeout to caller
    const isAbort = message.includes('aborted') || message.includes('signal')
    return NextResponse.json(
      { 
        error: 'Failed to fetch product',
        message,
        slug
      },
      { status: isAbort ? 504 : 500 }
    )
  }
}

/**
 * Transform Google Drive URLs to optimized image URLs
 */
function transformGoogleDriveUrls(product: Product): Product {
  if (!product.asset_link) {
    return product
  }

  let transformedUrl = product.asset_link

  // Check if it's a Google Drive URL that needs transformation
  if (product.asset_link.includes('drive.google.com')) {
    // Extract file ID from various Google Drive URL formats
    const fileIdMatch = product.asset_link.match(/[?&]id=([^&]+)/) ||
                       product.asset_link.match(/\/d\/([a-zA-Z0-9-_]+)/)

    if (fileIdMatch) {
      const fileId = fileIdMatch[1]
      // Convert to optimized Google Drive image URL
      transformedUrl = `https://lh3.googleusercontent.com/d/${fileId}=w1200`
    }
  }

  return {
    ...product,
    asset_link: transformedUrl
  }
}
