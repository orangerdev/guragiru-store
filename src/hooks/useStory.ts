import type { Product } from '@/types'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseStoryResult {
  currentIndex: number
  isPlaying: boolean
  isPaused: boolean
  progress: number
  goToNext: () => void
  goToPrevious: () => void
  goToIndex: (index: number) => void
  play: () => void
  pause: () => void
  reset: () => void
  setHolding: (holding: boolean) => void
}

interface UseStoryOptions {
  products: Product[]
  autoPlayDuration?: number
  autoPlay?: boolean
  onStoryEnd?: () => void
  storageKey?: string
}

export function useStory({ 
  products, 
  autoPlayDuration = 5000,
  autoPlay = true,
  onStoryEnd,
  storageKey
}: UseStoryOptions): UseStoryResult {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)
  const initializedFromStorageRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const goToNext = useCallback(() => {
    if (currentIndex < products.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setProgress(0)
    } else if (onStoryEnd) {
      onStoryEnd()
    }
  }, [currentIndex, products.length, onStoryEnd])

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setProgress(0)
    }
  }, [currentIndex])

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < products.length) {
      setCurrentIndex(index)
      setProgress(0)
    }
  }, [products.length])

  const play = useCallback(() => {
    setIsPlaying(true)
    setIsPaused(false)
    startTimeRef.current = Date.now() - pausedTimeRef.current
  }, [])

  const pause = useCallback(() => {
    setIsPaused(true)
    pausedTimeRef.current = Date.now() - startTimeRef.current
  }, [])

  const reset = useCallback(() => {
    setCurrentIndex(0)
    setProgress(0)
    setIsPlaying(false)
    setIsPaused(false)
    pausedTimeRef.current = 0
    clearTimer()
  }, [clearTimer])

  const setHolding = useCallback((holding: boolean) => {
    setIsHolding(holding)
    if (holding) {
      pause()
    } else if (isPlaying) {
      play()
    }
  }, [isPlaying, pause, play])

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying || isPaused || isHolding || products.length === 0) {
      return
    }

    startTimeRef.current = Date.now()
    pausedTimeRef.current = 0

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const progressPercent = Math.min((elapsed / autoPlayDuration) * 100, 100)
      
      setProgress(progressPercent)

      if (elapsed >= autoPlayDuration) {
        goToNext()
      }
    }, 50) // Update every 50ms for smooth progress

    return clearTimer
  }, [isPlaying, isPaused, isHolding, currentIndex, autoPlayDuration, goToNext, clearTimer, products.length])

  // Reset progress when index changes
  useEffect(() => {
    setProgress(0)
    pausedTimeRef.current = 0
    if (isPlaying) {
      startTimeRef.current = Date.now()
    }
  }, [currentIndex, isPlaying])

  // Start playing when products are loaded (only if autoplay enabled)
  useEffect(() => {
    if (!autoPlay) return
    if (products.length > 0 && !isPlaying) {
      play()
    }
  }, [products.length, isPlaying, play, autoPlay])

  // Initialize current index from localStorage when products are ready
  useEffect(() => {
    if (!storageKey) return
    if (initializedFromStorageRef.current) return
    if (products.length === 0) return
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
      const parsed = raw != null ? parseInt(raw, 10) : NaN
      if (!Number.isNaN(parsed)) {
        const clamped = Math.max(0, Math.min(products.length - 1, parsed))
        setCurrentIndex(clamped)
      }
    } catch (e) {
      // ignore storage errors
    } finally {
      initializedFromStorageRef.current = true
    }
  }, [products.length, storageKey])

  // Persist current index to localStorage
  useEffect(() => {
    if (!storageKey) return
    if (products.length === 0) return
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, String(currentIndex))
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [currentIndex, products.length, storageKey])

  // Clamp current index if products length changed and index out of bounds
  useEffect(() => {
    if (products.length === 0) return
    setCurrentIndex((idx) => Math.max(0, Math.min(products.length - 1, idx)))
  }, [products.length])

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  return {
    currentIndex,
    isPlaying,
    isPaused,
    progress,
    goToNext,
    goToPrevious,
    goToIndex,
    play,
    pause,
    reset,
    setHolding
  }
}