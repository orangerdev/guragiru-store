import type { Product, ProductsResponse } from '@/types'

class ApiService {
  /**
   * Fetch all products from the internal API route (server-side)
   */
  async getProducts(params?: {
    limit?: number
    page?: number
    order_by?: 'id' | 'datetime' | 'product_name' | 'product_slug' | 'created_at' | 'updated_at'
    order?: 'asc' | 'desc'
  }): Promise<Product[]> {
    try {
      const qs = new URLSearchParams()
      if (params?.limit != null) qs.set('limit', String(params.limit))
      if (params?.page != null) qs.set('page', String(params.page))
      if (params?.order_by) qs.set('order_by', params.order_by)
      if (params?.order) qs.set('order', params.order)
      const url = qs.toString() ? `/api/products?${qs.toString()}` : '/api/products'

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data for real-time updates
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ProductsResponse = await response.json()
      return data.products || []
    } catch (error) {
      console.error('Error fetching products:', error)
      throw new Error('Failed to fetch products. Please try again later.')
    }
  }

  /**
   * Fetch a single product by slug from the internal API route
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const url = `/api/products/slug/${slug}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data
      })

      if (response.status === 404) {
        return null // Product not found
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: { product?: Product } = await response.json()
      return data.product || null
    } catch (error) {
      console.error('Error fetching product by slug:', error)
      throw error
    }
  }

  /**
   * Check API health (using external endpoint directly from server)
   */
  async checkHealth(): Promise<boolean> {
    try {
      // This can still use external API for health check
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-worker-domain.workers.dev'
      const response = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return response.ok
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const apiService = new ApiService()

// Export class for testing or custom instances
export { ApiService }
