'use client'

import FloatingCartButton from '@/components/FloatingCartButton'
import LoadingScreen from '@/components/LoadingScreen'
import ProductModal from '@/components/ProductModal'
import ShareButton from '@/components/ShareButton'
import Toast from '@/components/Toast'
import { useCart } from '@/hooks/useCart'
import { useProductMetaTags } from '@/hooks/useProductMetaTags'
import { apiService } from '@/services/api'
import { whatsappService } from '@/services/whatsapp'
import type { Product } from '@/types'
import { getOptimizedGoogleDriveUrl, isGoogleDriveUrl } from '@/utils/googleDrive'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'

function ShopContent() {
  const LIMIT = 10
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const isFetchingRef = useRef(false)
  const requestedPagesRef = useRef<Set<number>>(new Set())
  const [isCompact, setIsCompact] = useState(false)
  // Toggle between 1 and 2 columns (default: 2 cols)
  const [twoCols, setTwoCols] = useState(true)
  const rafRef = useRef<number | null>(null)
  const cart = useCart()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalProduct, setModalProduct] = useState<Product | undefined>(undefined)
  const [fetchingProduct, setFetchingProduct] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null)
  const hasCheckedDeepLink = useRef(false)

  // Update meta tags untuk product sharing
  useProductMetaTags(modalProduct, modalOpen)

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

  // Handle deep linking - check for product slug in URL
  useEffect(() => {
    if (hasCheckedDeepLink.current) return
    if (loading || products.length === 0) return // Wait for initial products to load
    
    const productSlug = searchParams?.get('product')
    if (!productSlug) {
      hasCheckedDeepLink.current = true
      return
    }

    hasCheckedDeepLink.current = true

    // Check if product exists in current list
    const existingProduct = products.find(p => p.product_slug === productSlug)
    
    if (existingProduct) {
      // Product found in list, open modal
      setModalProduct(existingProduct)
      setModalOpen(true)
    } else {
      // Product not in list, fetch from API
      const fetchProductBySlug = async () => {
        setFetchingProduct(true)
        try {
          const product = await apiService.getProductBySlug(productSlug)
          if (product) {
            setModalProduct(product)
            setModalOpen(true)
          } else {
            setToast({ message: 'Produk tidak ditemukan', type: 'error' })
          }
        } catch (error) {
          console.error('Error fetching product by slug:', error)
          setToast({ message: 'Gagal memuat produk', type: 'error' })
        } finally {
          setFetchingProduct(false)
        }
      }
      fetchProductBySlug()
    }
  }, [products, loading, searchParams])

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
        {/* Right controls */}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <button
            type="button"
            aria-label="Toggle product columns"
            className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors h-9 px-2"
            onClick={() => setTwoCols(v => !v)}
          >
            <div className="flex items-center gap-1">
              {twoCols ? (
                // Icon for 1-column view (when active in 2-col)
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/>
                  <line x1="8" y1="4.5" x2="8" y2="19.5" />
                </svg>
              ) : (
                // Icon for 2-columns view
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/>
                  <line x1="8" y1="4.5" x2="8" y2="19.5" />
                  <line x1="16" y1="4.5" x2="16" y2="19.5" />
                </svg>
              )}
              <span className="text-xs font-medium leading-none">{twoCols ? '1 Col' : '2 Col'}</span>
            </div>
          </button>
        </div>
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
          <div className={`grid ${twoCols ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
            {Array.from({ length: LIMIT }).map((_, i) => (
              <ShimmerCard key={i} />
            ))}
          </div>
        </section>
      )}
      {error && (
        <div className="mx-auto max-w-md px-4 py-8 text-center text-red-400">{error}</div>
      )}

      {/* Products list */}
      {!error && (
        <section className="mx-auto max-w-md px-2 pb-16">
          <div className={`grid ${twoCols ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                showDescription={true}
                inCart={cart.isInCart(p.id)}
                onToggleCart={() => cart.toggle(p)}
                onOpenModal={() => {
                  setModalProduct(p)
                  setModalOpen(true)
                }}
              />
            ))}
            {loading && products.length > 0 && (
              <ShimmerCard />
            )}
          </div>
          <div ref={sentinelRef} className="h-10" />
          {!hasMore && products.length > 0 && (
            <div className="py-6 text-center text-white/30 text-xs">You’ve reached the end</div>
          )}
        </section>
      )}

      {/* Floating cart button */}
      <FloatingCartButton
        count={cart.count}
        onClick={() => cart.items.length && whatsappService.sendCartToWhatsApp(cart.items)}
      />

      {/* Product Modal */}
      <ProductModal
        open={modalOpen}
        product={modalProduct}
        inCart={modalProduct ? cart.isInCart(modalProduct.id) : false}
        onClose={() => setModalOpen(false)}
        onToggleCart={() => modalProduct && cart.toggle(modalProduct)}
      />

      {/* Loading overlay for product fetch */}
      {fetchingProduct && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <LoadingScreen />
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  )
}

function ProductCard({ product, showDescription, inCart, onToggleCart, onOpenModal }: { product: Product; showDescription: boolean; inCart: boolean; onToggleCart: () => void; onOpenModal: () => void }) {
  const src = product.asset_link
    ? getOptimizedGoogleDriveUrl(product.asset_link, product.asset_type)
    : undefined
  const description = (product.description || '').trim()
  const [expanded, setExpanded] = useState(false)
  const [showToggle, setShowToggle] = useState(false)
  const descRef = useRef<HTMLParagraphElement | null>(null)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    if (!descRef.current) return
    // Measure overflow while collapsed (line-clamp-2 applied by default)
    const el = descRef.current
    const hasOverflow = el.scrollHeight > el.clientHeight + 1
    setShowToggle(hasOverflow)
  }, [description])

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-white/5 fade-in">
      <button type="button" onClick={onOpenModal} className="group relative aspect-[3/4] w-full bg-white/5 text-left">
        {src ? (
          <Image
            src={src}
            alt={product.product_name}
            fill
            className="object-cover"
            sizes="(max-width: 420px) 100vw, 420px"
            unoptimized={isGoogleDriveUrl(src)}
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs">
            No image
          </div>
        )}
        {/* Zoom hint icon */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/40 border border-white/20 p-2 text-white opacity-80 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
        {/* Added badge (temporary) */}
        <span
          className={`absolute top-2 left-2 rounded-full bg-whatsapp-primary text-white text-[10px] uppercase tracking-wide px-2 py-1 shadow transition-all duration-300 ${justAdded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        >
          Added
        </span>
        {/* Share button at bottom-right */}
        <div className="absolute bottom-2 right-2 pointer-events-auto z-10">
          <ShareButton product={product} compact />
        </div>
      </button>

      <div className="p-3 flex flex-col gap-2 min-h-[132px]">
        <h3 className="text-xs font-semibold leading-snug line-clamp-2">
          {product.product_name}
        </h3>

        {showDescription && description && (
          <div className="space-y-1">
            <p
              ref={descRef}
              className={`text-xs text-white/70 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}
            >
              {description}
            </p>
            {showToggle && (
              <button
                type="button"
                className="text-xs text-white/60 hover:text-white underline underline-offset-2"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? 'Hide' : 'Show'}
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          className={`w-full flex items-center justify-center gap-2 text-sm py-2 mt-auto rounded-full font-medium transition-all ${inCart ? 'bg-emerald-700 text-white active:bg-emerald-600' : 'bg-whatsapp-primary text-white active:bg-whatsapp-primary/80'}`}
          onClick={() => {
            if (!inCart) {
              setJustAdded(true)
              setTimeout(() => setJustAdded(false), 1200)
            }
            onToggleCart()
          }}
        >
          {inCart ? (
            <>
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>In Cart</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>Add To Cart</span>
            </>
          )}
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

// Wrap ShopContent with Suspense for useSearchParams()
export default function ShopPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ShopContent />
    </Suspense>
  )
}
