'use client'

import { memo, useEffect, useState } from 'react'

interface NavigationControlsProps {
  isPlaying: boolean
  isPaused: boolean
  onPrev: () => void
  onNext: () => void
  onMessageTap: () => void
  alwaysVisible?: boolean
}

function NavigationControls({ isPlaying, isPaused, onPrev, onNext, onMessageTap, alwaysVisible = false }: NavigationControlsProps) {
  const [showControls, setShowControls] = useState(alwaysVisible)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)

  // Show controls on interaction, hide after delay
  const handleInteraction = () => {
    setShowControls(true)
    if (alwaysVisible) return
    if (hideTimeout) clearTimeout(hideTimeout)
    const timeout = setTimeout(() => {
      setShowControls(false)
    }, 3000)
    setHideTimeout(timeout)
  }

  useEffect(() => {
    return () => {
      if (hideTimeout) clearTimeout(hideTimeout)
    }
  }, [hideTimeout])

  return (
    <>
      {/* Invisible tap zones for navigation */}
      <div className="absolute inset-0 flex">
        {/* Left tap zone - Previous */}
        <div 
          className="w-1/3 h-full flex items-center justify-start pl-4 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
            handleInteraction()
          }}
          onTouchEnd={(e) => {
            e.stopPropagation()
            onPrev()
            handleInteraction()
          }}
        >
          {showControls && (
            <div className="bg-black/30 rounded-full p-2 backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          )}
        </div>

        {/* Center tap zone - Message */}
        <div 
          className="flex-1 h-full flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            onMessageTap()
            handleInteraction()
          }}
          onTouchEnd={(e) => {
            e.stopPropagation()
            onMessageTap()
            handleInteraction()
          }}
        >
          {showControls && (
            <div className="bg-whatsapp-primary/20 rounded-full p-3 backdrop-blur-sm border border-whatsapp-primary/30">
              <svg className="w-6 h-6 text-whatsapp-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
              </svg>
            </div>
          )}
        </div>

        {/* Right tap zone - Next */}
        <div 
          className="w-1/3 h-full flex items-center justify-end pr-4 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            onNext()
            handleInteraction()
          }}
          onTouchEnd={(e) => {
            e.stopPropagation()
            onNext()
            handleInteraction()
          }}
        >
          {showControls && (
            <div className="bg-black/30 rounded-full p-2 backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Play/Pause indicator (hide when controls are always visible i.e., autoplay off) */}
      {!alwaysVisible && !isPlaying && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      )}

      {/* Pause indicator when holding */}
      {!alwaysVisible && isPaused && isPlaying && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </div>
        </div>
      )}
    </>
  )
}

export default memo(NavigationControls)