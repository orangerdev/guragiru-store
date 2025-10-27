'use client'

import type { Product } from '@/types'
import { getOptimizedGoogleDriveUrl, isGoogleDriveUrl } from '@/utils/googleDrive'
import Image from 'next/image'
import { memo, useEffect, useRef, useState } from 'react'

interface StoryContentProps {
  product: Product
  onTap: () => void
  setHolding: (holding: boolean) => void
}

function StoryContent({ product, onTap, setHolding }: StoryContentProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const descContainerRef = useRef<HTMLDivElement>(null)
  const [canCollapse, setCanCollapse] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Reset loading state when product changes to avoid stale state artifacts
  useEffect(() => {
    setImageLoading(true)
    setImageError(false)
  }, [product.asset_link, product.asset_type])

  const handleTouchStart = () => {
    setHolding(true)
  }

  const handleTouchEnd = () => {
    setHolding(false)
  }

  const handleMouseDown = () => {
    setHolding(true)
  }

  const handleMouseUp = () => {
    setHolding(false)
  }

  const formatPrice = (price?: string | number) => {
    if (!price) return null
    
    // Assume price is in IDR
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numPrice)
  }

  // WhatsApp-style text formatting parser
  const formatDescription = (text: string) => {
    return text
      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>') // *bold*
      .replace(/_([^_]+)_/g, '<em>$1</em>') // _italic_
      .replace(/~([^~]+)~/g, '<del>$1</del>') // ~strikethrough~
      .replace(/```([^`]+)```/g, '<code>$1</code>') // ```code```
      .replace(/\n/g, '<br>') // Line breaks
  }

  // Get optimized image URL for Google Drive using utility
  const getOptimizedImageUrl = (url?: string) => {
    if (!url) return url
    return getOptimizedGoogleDriveUrl(url)
  }

  // Measure description height to determine collapse behavior (> 30% viewport height)
  useEffect(() => {
    const measure = () => {
      const el = descContainerRef.current
      if (!el) return
      const maxPx = Math.round(window.innerHeight * 0.18)
      const needsCollapse = el.scrollHeight > maxPx
      setCanCollapse(needsCollapse)
      setIsCollapsed(needsCollapse)
    }

    // Give the browser a tick to render innerHTML before measuring
    const id = window.setTimeout(measure, 0)
    window.addEventListener('resize', measure)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('resize', measure)
    }
  }, [product.description])

  return (
    <div 
      className="relative w-full h-full cursor-pointer select-none"
      onClick={onTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Handle mouse leave to prevent stuck hold state
    >
      {/* Background Image/Video */}
      <div className="absolute inset-0">
        {product.asset_type === 'video' && product.asset_link ? (
          <video
            className="w-full h-full object-cover"
            src={getOptimizedGoogleDriveUrl(product.asset_link)}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadStart={() => setImageLoading(false)}
            onError={(e) => {
              console.error('Video loading error:', e)
              setImageError(true)
            }}
            onCanPlay={() => setImageLoading(false)}
          />
        ) : product.asset_link && !imageError ? (
          <Image
            src={getOptimizedImageUrl(product.asset_link) || product.asset_link}
            alt={product.product_name}
            fill
            className="object-cover"
            priority
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              console.error('Image loading error:', e)
              setImageError(true)
            }}
            sizes="100vw"
            unoptimized={isGoogleDriveUrl(product.asset_link)} // Disable Next.js optimization for Google Drive
          />
        ) : (
          // Fallback background when no image or video
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white/80">{product.product_name}</h3>
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {imageLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* Product Info Overlay */}
      <div className="story-overlay">
        <div className="space-y-3">
          {/* Product Name */}
          <h2 className="text-xl font-bold text-white leading-tight">
            {product.product_name}
          </h2>

          {/* Product Description */}
          {product.description && (
            <div className="relative">
              <div
                ref={descContainerRef}
                className={`text-white/90 text-sm leading-relaxed max-w-full ${isCollapsed ? 'overflow-hidden' : ''}`}
                style={isCollapsed ? { maxHeight: '30vh' } : undefined}
                dangerouslySetInnerHTML={{ __html: formatDescription(product.description) }}
              />

              {canCollapse && isCollapsed && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent" />
              )}

              {canCollapse && (
                <button
                  type="button"
                  className="mt-2 text-xs text-white/70 underline underline-offset-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsCollapsed((v) => !v)
                  }}
                  aria-expanded={!isCollapsed}
                >
                  {isCollapsed ? 'Show more' : 'Show less'}
                </button>
              )}
            </div>
          )}

          {/* Price (if available in description or as separate field) */}
          {/* This would need to be extracted from description or added as separate field */}
          
          {/* Action hint - clickable CTA area */}
          <div
            className="flex items-center justify-between mt-4 pt-2 border-t border-white/20 cursor-pointer select-none"
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              onTap()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                onTap()
              }
            }}
          >
            <div className="text-white/60 text-xs">Tap to send message</div>
            <div className="flex items-center text-whatsapp-primary">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
              </svg>
              <span className="text-xs font-medium">WhatsApp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(StoryContent)