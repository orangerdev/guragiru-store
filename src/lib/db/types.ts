export interface Post {
  id: string
  title: string
  slug: string
  body: string
  excerpt: string | null
  cover_image: string | null
  published: number
  locale: string
  created_at: string
  updated_at: string
}

export interface Admin {
  id: string
  email: string
  password_hash: string
  role: string
  created_at: string
}

export interface ApiKey {
  id: string
  key_hash: string
  name: string
  active: number
  created_at: string
}

export interface Media {
  id: string
  cf_image_id: string
  alt_text: string
  width: number
  height: number
  created_at: string
}

// Order Management types

export interface Event {
  id: number
  name: string
  created_at: string
  archived: number
}

export interface EventCustomer {
  id: number
  event_id: number
  name: string
  created_at: string
}

export interface EventItem {
  id: number
  customer_id: number
  item_name: string
  quantity: number
  price: number
  cost_price: number
  created_at: string
}

export interface InvoiceCounter {
  date: string
  counter: number
}

export interface Order {
  id: number
  invoice_id: string
  event_name: string
  customer_name: string
  phone: string
  subtotal: number
  discount: number
  shipping: number
  total: number
  payment_url: string | null
  invoice_file: string | null
  created_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface ConfigEntry {
  key: string
  value: string
}
