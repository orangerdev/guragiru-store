'use client'

import { apiService } from '@/services/api'
import { whatsappService } from '@/services/whatsapp'
import type { Product } from '@/types'
import { getOptimizedGoogleDriveUrl, isGoogleDriveUrl } from '@/utils/googleDrive'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function ShopPage() {
  const LIMIT = 10
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const isFetchingRef = useRef(false)
  const requestedPagesRef = useRef<Set<number>>(new Set())
  const [isCompact, setIsCompact] = useState(false)
  const rafRef = useRef<number | null>(null)

  const loadPage = useCallback(async (p: number, replace = false) => {
    if (isFetchingRef.current) return
    if (requestedPagesRef.current.has(p)) return
    isFetchingRef.current = true
    setLoading(true)
    setError(null)
    try {
  const next = await apiService.getProducts({ limit: LIMIT, page: p, order_by: 'datetime', order: 'desc' })
  setProducts(prev => (replace ? next : [...prev, ...next]))
  // Because the API route filters out non-image items, a page can return fewer
  // than LIMIT while more pages still exist. Continue until an empty page.
  setHasMore(next.length > 0)
      requestedPagesRef.current.add(p)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load products'
      setError(msg)
    } finally {
      isFetchingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // initial load
    loadPage(1, true)
  }, [loadPage])

  // Compact header on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        const compact = window.scrollY > 16
        setIsCompact(prev => (prev !== compact ? compact : prev))
      })
    }
    // set initial state in case user reloads mid-scroll
    setIsCompact(window.scrollY > 16)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMore && !isFetchingRef.current) {
        setPage(prev => {
          const nextPage = prev + 1
          loadPage(nextPage)
          return nextPage
        })
      }
    }, { root: null, rootMargin: '200px', threshold: 0 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadPage])

  return (
    <main className="mobile-shell bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        {/* Expanded header (default) */}
        {!isCompact && (
          <div className="mx-auto max-w-md px-4 py-5 flex flex-col items-center justify-center transition-all">
            <div className="relative w-[120px] h-[120px] overflow-hidden rounded-full border border-white/20 shadow-lg">
              <Image src="/assets/img/logo.webp" alt="Gura Giru" fill className="object-cover" sizes="120px" priority />
            </div>
            <a
              href="https://www.instagram.com/guragirujastip/"
              target="_blank"
              rel="noreferrer"
              className="mt-3 text-white/80 text-sm hover:text-white underline-offset-4 hover:underline"
            >
              @guragirujastip
            </a>
          </div>
        )}

        {/* Compact header when scrolled */}
        {isCompact && (
          <div className="mx-auto max-w-md px-4 py-2 flex items-center justify-start gap-3 transition-all">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border border-white/20">
              <Image src="/assets/img/logo.webp" alt="Gura Giru" fill className="object-cover" sizes="40px" priority />
            </div>
            <a
              href="https://www.instagram.com/guragirujastip/"
              target="_blank"
              rel="noreferrer"
              className="text-base font-medium text-white hover:opacity-90"
            >
              guragiru jastip
            </a>
          </div>
        )}
      </header>

      {/* Store description */}
      <section className="mx-auto max-w-md px-4 py-3">
        <p className="text-white/70 text-sm leading-relaxed">
          Temukan produk pilihan kami. Klik tombol WhatsApp pada setiap produk untuk langsung chat dan pesan.
        </p>
      </section>

      {/* States */}
      {loading && products.length === 0 && (
        <section className="mx-auto max-w-md px-2 pb-16">
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <ShimmerCard key={i} />
            ))}
          </div>
        </section>
      )}
      {error && (
        <div className="mx-auto max-w-md px-4 py-8 text-center text-red-400">{error}</div>
      )}

      {/* Products grid - mobile only (2 columns) */}
      {!error && (
        <section className="mx-auto max-w-md px-2 pb-16">
          <div className="grid grid-cols-2 gap-2">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
            {loading && products.length > 0 && (
              <>
                <ShimmerCard />
                <ShimmerCard />
              </>
            )}
          </div>
          <div ref={sentinelRef} className="h-10" />
          {!hasMore && products.length > 0 && (
            <div className="py-6 text-center text-white/30 text-xs">You’ve reached the end</div>
          )}
        </section>
      )}
    </main>
  )
}

function ProductCard({ product }: { product: Product }) {
  const src = product.asset_link
    ? getOptimizedGoogleDriveUrl(product.asset_link, product.asset_type)
    : undefined

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-white/5 fade-in">
      <div className="relative aspect-[3/4] w-full bg-white/5">
        {src ? (
          <Image
            src={src}
            alt={product.product_name}
            fill
            className="object-cover"
            sizes="(max-width: 420px) 50vw, 200px"
            unoptimized={isGoogleDriveUrl(src)}
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs">
            No image
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.product_name}
        </h3>

        <button
          type="button"
          className="w-full whatsapp-button flex items-center justify-center gap-2 text-sm py-2"
          onClick={() => whatsappService.sendToWhatsApp(product)}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
          </svg>
          WhatsApp
        </button>
      </div>
    </article>
  )
}

function ShimmerCard() {
  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-white/5 animate-pulse">
      <div className="relative aspect-[3/4] w-full bg-white/10" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-white/10 rounded w-4/5" />
        <div className="h-9 bg-whatsapp-primary/20 rounded" />
      </div>
    </article>
  )
}
