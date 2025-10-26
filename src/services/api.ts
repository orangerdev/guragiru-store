import type { Product, ProductsResponse } from '@/types'

class ApiService {
  /**
   * Fetch all products from the internal API route (server-side)
   */
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch('/api/products', {
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
