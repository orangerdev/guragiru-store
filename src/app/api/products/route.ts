export const runtime = 'nodejs'
import http from '@/services/http'
import type { Product } from '@/types'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    // Forward selected query params (limit, page, order_by, order)
    const urlObj = new URL(request.url)
    const sp = urlObj.searchParams
    const qs = new URLSearchParams()
    const limit = sp.get('limit')
    const page = sp.get('page')
    const order_by = sp.get('order_by')
    const order = sp.get('order')
    if (limit) qs.set('limit', limit)
    if (page) qs.set('page', page)
    if (order_by) qs.set('order_by', order_by)
    if (order) qs.set('order', order)

  try {
    if (!baseUrl || baseUrl.includes('your-worker-domain')) {
      console.error('API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL in wrangler.toml [vars].')
      return NextResponse.json(
        { error: 'API base URL not configured' },
        { status: 500 }
      )
    }

    const apiUrl = `${baseUrl}/api/db/products${qs.toString() ? `?${qs.toString()}` : ''}`

    // Use axios with cache (1 hour TTL) + request timeout (15s)
    console.log('Fetching upstream API (axios cached):', apiUrl)
    const axRes = await http.get(apiUrl, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    })

    if (axRes.status < 200 || axRes.status >= 300) {
      throw new Error(`HTTP error! status: ${axRes.status}`)
    }

    // Narrow the unknown JSON type into an expected shape from our worker API
    type ProductsApiResponse = {
      data?: Product[]
      active_table?: string
      // allow additional fields without failing the type
      [key: string]: unknown
    }

  const responseData = axRes.data as ProductsApiResponse
    
  console.log('Upstream responded. Keys:', Object.keys(responseData || {}))
    
    // Transform products to handle Google Drive URLs
    let products: Product[] = []
    
    // The response format has 'data' property for products
  if (Array.isArray(responseData.data)) {
      // Filter only products with image assets
      const imageProducts = responseData.data.filter((product: Product) => 
        product.asset_type === 'image' && product.asset_link
      )
      
      products = imageProducts.map((product: Product) => transformGoogleDriveUrls(product))
    }

    console.log(`Fetched ${products.length} products`)

    return NextResponse.json({
      products,
      count: products.length,
      active_table: responseData.active_table || 'products_a'
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    // Surface abort/timeout to caller for better debugging in UI/logs
    const isAbort = message.includes('aborted') || message.includes('signal')
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        message,
        apiUrl: `/api/db/products${qs.toString() ? `?${qs.toString()}` : ''}`
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