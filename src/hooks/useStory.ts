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
  onStoryEnd?: () => void
}

export function useStory({ 
  products, 
  autoPlayDuration = 5000,
  onStoryEnd 
}: UseStoryOptions): UseStoryResult {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)

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

  // Start playing when products are loaded
  useEffect(() => {
    if (products.length > 0 && !isPlaying) {
      play()
    }
  }, [products.length, isPlaying, play])

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