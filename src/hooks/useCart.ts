import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Product } from '@/types'

const STORAGE_KEY = 'shop_cart_items'

export function useCart() {
  const [items, setItems] = useState<Product[]>([])
  const [ready, setReady] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const parsed: Product[] = JSON.parse(raw)
        setItems(Array.isArray(parsed) ? parsed : [])
      }
    } catch {
      // ignore corrupted storage
      setItems([])
    } finally {
      setReady(true)
    }
  }, [])

  // Persist
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: items.length } }))
    } catch {
      // ignore write issues
    }
  }, [items, ready])

  const isInCart = useCallback(
    (id: number) => items.some((p) => p.id === id),
    [items]
  )

  const add = useCallback((product: Product) => {
    setItems((prev) => (prev.some((p) => p.id === product.id) ? prev : [...prev, product]))
  }, [])

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const toggle = useCallback((product: Product) => {
    setItems((prev) => (prev.some((p) => p.id === product.id) ? prev.filter((p) => p.id !== product.id) : [...prev, product]))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count = items.length

  return useMemo(
    () => ({ items, count, ready, isInCart, add, remove, toggle, clear }),
    [items, count, ready, isInCart, add, remove, toggle, clear]
  )
}
