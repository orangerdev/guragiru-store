import type { Product } from '@/types'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-worker-domain.workers.dev'
    const apiUrl = `${baseUrl}/api/db/products`

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Server-side fetch, no CORS issues
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const responseData = await response.json()
    
    console.log('API Response:', responseData)
    
    // Transform products to handle Google Drive URLs
    let products: Product[] = []
    
    // The response format has 'data' property for products
    if (responseData.data && Array.isArray(responseData.data)) {
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
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
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