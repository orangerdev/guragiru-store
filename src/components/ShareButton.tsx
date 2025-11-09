"use client"

import type { Product } from '@/types'
import { useState } from 'react'
import {
  WhatsappShareButton,
  FacebookShareButton,
  TwitterShareButton,
  TelegramShareButton,
  WhatsappIcon,
  FacebookIcon,
  XIcon,
  TelegramIcon,
} from 'react-share'

interface Props {
  product: Product
  className?: string
}

export default function ShareButton({ product, className = '' }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  
  // Generate shareable URL
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/shop?product=${product.product_slug}`
    : ''
  
  // Share title and description
  const shareTitle = `${product.product_name} - Gura Giru`
  const shareDescription = product.description 
    ? `${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}`
    : `Check out this product: ${product.product_name}`

  return (
    <div className={`relative ${className}`}>
      {/* Share Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setShowMenu(!showMenu)
        }}
        className="p-2 rounded-full bg-black/60 text-white border border-white/20 hover:bg-black/80 transition-colors backdrop-blur-sm"
        aria-label="Share product"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>

      {/* Share Menu Popup */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(false)
            }}
          />
          
          {/* Menu */}
          <div className="absolute bottom-full right-0 mb-2 z-50 bg-black/95 backdrop-blur-md rounded-lg border border-white/20 p-3 shadow-xl min-w-[200px]">
            <div className="text-white text-xs font-semibold mb-3 px-1">Share to:</div>
            <div className="flex flex-col gap-2">
              {/* WhatsApp */}
              <WhatsappShareButton
                url={shareUrl}
                title={shareTitle}
                separator=" - "
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                }}
                className="flex items-center gap-3 hover:bg-white/10 rounded-lg p-2 transition-colors w-full"
              >
                <WhatsappIcon size={32} round />
                <span className="text-white text-sm font-medium">WhatsApp</span>
              </WhatsappShareButton>

              {/* Facebook */}
              <FacebookShareButton
                url={shareUrl}
                hashtag="#GuraGiru"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                }}
                className="flex items-center gap-3 hover:bg-white/10 rounded-lg p-2 transition-colors w-full"
              >
                <FacebookIcon size={32} round />
                <span className="text-white text-sm font-medium">Facebook</span>
              </FacebookShareButton>

              {/* Twitter / X */}
              <TwitterShareButton
                url={shareUrl}
                title={shareTitle}
                hashtags={['GuraGiru', 'Shopping']}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                }}
                className="flex items-center gap-3 hover:bg-white/10 rounded-lg p-2 transition-colors w-full"
              >
                <XIcon size={32} round />
                <span className="text-white text-sm font-medium">Twitter / X</span>
              </TwitterShareButton>

              {/* Telegram */}
              <TelegramShareButton
                url={shareUrl}
                title={shareTitle}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                }}
                className="flex items-center gap-3 hover:bg-white/10 rounded-lg p-2 transition-colors w-full"
              >
                <TelegramIcon size={32} round />
                <span className="text-white text-sm font-medium">Telegram</span>
              </TelegramShareButton>

              {/* Copy Link */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(shareUrl)
                  setShowMenu(false)
                  // You can add a toast notification here
                }}
                className="flex items-center gap-3 hover:bg-white/10 rounded-lg p-2 transition-colors w-full"
              >
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium">Copy Link</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
