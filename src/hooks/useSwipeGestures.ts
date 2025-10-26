import { useCallback, useRef } from 'react'

export interface UseSwipeGesturesOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}

export interface UseSwipeGesturesResult {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}

export function useSwipeGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50
}: UseSwipeGesturesOptions): UseSwipeGesturesResult {
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const touchEnd = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEnd.current = null // Reset touchEnd
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    }
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current || !touchEnd.current) return

    const distanceX = touchStart.current.x - touchEnd.current.x
    const distanceY = touchStart.current.y - touchEnd.current.y
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY)

    if (isHorizontalSwipe) {
      // Horizontal swipes
      if (Math.abs(distanceX) > threshold) {
        if (distanceX > 0) {
          // Swiped left (next story)
          onSwipeLeft?.()
        } else {
          // Swiped right (previous story)
          onSwipeRight?.()
        }
      }
    } else {
      // Vertical swipes
      if (Math.abs(distanceY) > threshold) {
        if (distanceY > 0) {
          // Swiped up
          onSwipeUp?.()
        } else {
          // Swiped down
          onSwipeDown?.()
        }
      }
    }

    // Reset
    touchStart.current = null
    touchEnd.current = null
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }
}