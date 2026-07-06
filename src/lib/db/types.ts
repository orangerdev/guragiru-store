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
