"use client"

import type { Product } from '@/types'
import { getOptimizedGoogleDriveUrl, isGoogleDriveUrl } from '@/utils/googleDrive'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface Props {
  open: boolean
  product?: Product
  inCart: boolean
  onClose: () => void
  onToggleCart: () => void
}

export default function ProductModal({ open, product, inCart, onClose, onToggleCart }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [justAdded, setJustAdded] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [needsExpansion, setNeedsExpansion] = useState(false)
  const prevOpenRef = useRef(open)
  const prevSlugRef = useRef(product?.product_slug)
  
  // Update URL when modal opens/closes
  useEffect(() => {
    const currentProductParam = searchParams?.get('product')
    const currentSlug = product?.product_slug
    
    // Only act on actual state changes
    const openChanged = prevOpenRef.current !== open
    const slugChanged = prevSlugRef.current !== currentSlug
    
    if (openChanged || slugChanged) {
      if (open && currentSlug) {
        // Modal is opening or product changed - add/update URL param
        if (currentProductParam !== currentSlug) {
          const params = new URLSearchParams(searchParams?.toString() || '')
          params.set('product', currentSlug)
          router.push(`/shop?${params.toString()}`, { scroll: false })
        }
      } else if (!open && prevOpenRef.current && currentProductParam) {
        // Modal is closing - remove URL param
        const params = new URLSearchParams(searchParams?.toString() || '')
        params.delete('product')
        const newUrl = params.toString() ? `/shop?${params.toString()}` : '/shop'
        router.push(newUrl, { scroll: false })
      }
      
      prevOpenRef.current = open
      prevSlugRef.current = currentSlug
    }
  }, [open, product?.product_slug, router, searchParams])
  
  useEffect(() => {
    if (!open) {
      setJustAdded(false)
      setShowFullDescription(false)
      setNeedsExpansion(false)
    }
  }, [open])
  
  useEffect(() => {
    if (open && product?.description) {
      const lines = (product.description || '').trim().split('\n').length
      setNeedsExpansion(lines > 6)
    }
  }, [open, product?.description])
  
  if (!open || !product) return null
  const src = product.asset_link ? getOptimizedGoogleDriveUrl(product.asset_link, product.asset_type) : undefined
  const description = (product.description || '').trim()

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-md bg-black rounded-t-2xl border border-white/10 overflow-hidden animate-slide-up max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="relative aspect-[3/4] w-full bg-white/5 flex-shrink-0">
          {src ? (
            <Image
              src={src}
              alt={product.product_name}
              fill
              className="object-cover"
              sizes="(max-width: 420px) 100vw, 420px"
              unoptimized={isGoogleDriveUrl(src)}
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs">No image</div>
          )}
          <button
            type="button"
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white border border-white/20 hover:bg-black/70"
            onClick={onClose}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <h3 className="text-base font-semibold leading-snug">{product.product_name}</h3>
          {description && (
            <div className="space-y-2">
              <p className={`text-sm text-white/70 whitespace-pre-line ${!showFullDescription && needsExpansion ? 'line-clamp-6' : ''}`}>
                {description}
              </p>
              {needsExpansion && (
                <button
                  type="button"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-xs text-whatsapp-primary hover:text-whatsapp-primary/80 font-medium transition-colors"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                if (!inCart) {
                  setJustAdded(true)
                  setTimeout(() => setJustAdded(false), 1200)
                }
                onToggleCart()
              }}
              className={`w-full flex items-center justify-center gap-2 text-sm py-3 rounded-full font-medium transition-all ${inCart ? 'bg-emerald-700 text-white active:bg-emerald-600' : 'bg-whatsapp-primary text-white active:bg-whatsapp-primary/80'}`}
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
            {/* Added toast */}
            <div className={`pointer-events-none mt-3 flex justify-center transition-all duration-300 ${justAdded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}>
              <span className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Added
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
