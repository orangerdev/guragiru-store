'use client'

import type { UseStoryResult } from '@/hooks/useStory'
import { useSwipeGestures } from '@/hooks/useSwipeGestures'
import type { MessageModalState, Product } from '@/types'
import { useEffect } from 'react'
import MessageModal from './MessageModal'
import NavigationControls from './NavigationControls'
import StoryContent from './StoryContent'
import StoryProgressBar from './StoryProgressBar'

interface StoryViewerProps {
  products: Product[]
  story: UseStoryResult
  messageModal: MessageModalState
  setMessageModal: (modal: MessageModalState) => void
}

export default function StoryViewer({ 
  products, 
  story, 
  messageModal, 
  setMessageModal 
}: StoryViewerProps) {
  const currentProduct = products[story.currentIndex]
    const { goToNext, goToPrevious, currentIndex, progress, isPlaying, isPaused, setHolding } = story

  // Swipe gestures for mobile
  const swipeHandlers = useSwipeGestures({
    onSwipeLeft: story.goToNext,
    onSwipeRight: story.goToPrevious,
    onSwipeUp: () => {
      // Open message modal on swipe up
      setMessageModal({
        isOpen: true,
        product: currentProduct,
        userMessage: ''
      })
    },
    threshold: 50
  })

  // Keyboard navigation (ignore when typing in inputs/textarea or when modal open)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isEditable = !!(
        target && (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          (target as HTMLElement).isContentEditable
        )
      )

      // Do not hijack keys when modal is open or user is typing in an editable element
      if (messageModal.isOpen || isEditable) return

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          goToPrevious()
          break
        case 'ArrowRight':
        case ' ':
          event.preventDefault()
          goToNext()
          break
        case 'Escape':
          // Nothing: handled when modal is open in MessageModal
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious, messageModal.isOpen])

  // Prevent context menu on long press
  useEffect(() => {
    const preventContextMenu = (e: Event) => e.preventDefault()
    document.addEventListener('contextmenu', preventContextMenu)
    return () => document.removeEventListener('contextmenu', preventContextMenu)
  }, [])

  const handleStoryTap = () => {
    setMessageModal({
      isOpen: true,
      product: currentProduct,
      userMessage: ''
    })
  }

  if (!currentProduct) {
    return null
  }

  return (
    <>
      {/* Main Story Interface */}
      <div 
        className="story-container"
        {...swipeHandlers}
      >
        {/* Progress Indicators */}
        <StoryProgressBar 
          products={products}
          currentIndex={currentIndex}
          progress={progress}
        />

        {/* Story Content */}
        <StoryContent 
          product={currentProduct}
          onTap={handleStoryTap}
          setHolding={setHolding}
        />

        {/* Navigation Controls */}
        <NavigationControls 
          isPlaying={isPlaying}
          isPaused={isPaused}
          onPrev={goToPrevious}
          onNext={goToNext}
          onMessageTap={handleStoryTap}
          alwaysVisible={!isPlaying}
        />
      </div>

      {/* Message Modal */}
      {messageModal.isOpen && (
        <MessageModal 
          modal={messageModal}
          setModal={setMessageModal}
        />
      )}
    </>
  )
}