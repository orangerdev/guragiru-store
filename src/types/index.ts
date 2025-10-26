// Product data structure based on API documentation
export interface Product {
  id: number
  datetime: string
  product_name: string
  product_slug: string
  description?: string
  asset_link?: string
  asset_type?: 'image' | 'video'
  created_at: string
  updated_at: string
}

// API Response structures
export interface ProductsResponse {
  products: Product[]
  count: number
  active_table: string
}

export interface SingleProductResponse {
  product: Product
}

// API Error response
export interface ApiError {
  error: string
  details?: string[]
  message?: string
}

// WhatsApp configuration
export interface WhatsAppConfig {
  phoneNumber: string
  defaultMessage: string
}

// Story state management
export interface StoryState {
  currentIndex: number
  isPlaying: boolean
  isPaused: boolean
  products: Product[]
  loading: boolean
  error?: string
}

// Message modal state
export interface MessageModalState {
  isOpen: boolean
  product?: Product
  userMessage: string
}