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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          story.goToPrevious()
          break
        case 'ArrowRight':
        case ' ':
          event.preventDefault()
          story.goToNext()
          break
        case 'Escape':
          if (messageModal.isOpen) {
            setMessageModal({ ...messageModal, isOpen: false })
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [story, messageModal, setMessageModal])

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
          currentIndex={story.currentIndex}
          progress={story.progress}
        />

        {/* Story Content */}
        <StoryContent 
          product={currentProduct}
          onTap={handleStoryTap}
          story={story}
        />

        {/* Navigation Controls */}
        <NavigationControls 
          story={story}
          onMessageTap={handleStoryTap}
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