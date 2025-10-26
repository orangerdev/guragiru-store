'use client'

import { whatsappService } from '@/services/whatsapp'
import type { MessageModalState } from '@/types'
import { useCallback, useEffect, useRef, useState } from 'react'

interface MessageModalProps {
  modal: MessageModalState
  setModal: (modal: MessageModalState) => void
}

export default function MessageModal({ modal, setModal }: MessageModalProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus input when modal opens
  useEffect(() => {
    if (modal.isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [modal.isOpen])

  const handleClose = useCallback(() => {
    setModal({ ...modal, isOpen: false })
    setMessage('')
  }, [modal, setModal])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (modal.isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [modal.isOpen, handleClose])

  const handleSend = async () => {
    if (!modal.product || sending) return

    setSending(true)
    
    try {
      // Send to WhatsApp
      whatsappService.sendToWhatsApp(modal.product, message || undefined)
      
      // Close modal after short delay
      setTimeout(() => {
        handleClose()
        setSending(false)
      }, 500)
      
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      setSending(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!modal.isOpen || !modal.product) {
    return null
  }

  return (
    <div 
      className="whatsapp-modal animate-slide-up"
      onClick={handleBackdropClick}
    >
      {/* Modal Content */}
      <div className="w-full bg-black/95 backdrop-blur-lg p-4 pb-8 border-t border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-whatsapp-primary flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Send to WhatsApp</h3>
              <p className="text-xs text-white/60">{modal.product.product_name}</p>
            </div>
          </div>
          
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message Input */}
        <div className="space-y-3">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add your message... (optional)"
            className="w-full min-h-[100px] bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/60 resize-none focus:outline-none focus:border-whatsapp-primary focus:ring-1 focus:ring-whatsapp-primary"
            maxLength={500}
          />
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">
              {message.length}/500 characters
            </span>
            
            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={sending}
              className="whatsapp-button flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Product Preview */}
        <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="text-sm text-white/80">
            <strong>Product:</strong> {modal.product.product_name}
          </div>
          {modal.product.description && (
            <div className="text-xs text-white/60 mt-1 line-clamp-2">
              {modal.product.description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}