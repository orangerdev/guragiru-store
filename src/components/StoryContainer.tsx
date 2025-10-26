'use client'

import { useProducts } from '@/hooks/useProducts'
import { useStory } from '@/hooks/useStory'
import type { MessageModalState } from '@/types'
import { useState } from 'react'
import ErrorScreen from './ErrorScreen'
import LoadingScreen from './LoadingScreen'
import StoryViewer from './StoryViewer'

export default function StoryContainer() {
  const { products, loading, error } = useProducts()
  const [messageModal, setMessageModal] = useState<MessageModalState>({
    isOpen: false,
    userMessage: ''
  })

  const story = useStory({
    products,
    autoPlayDuration: 5000,
    onStoryEnd: () => {
      // Loop back to first story or show end screen
      story.goToIndex(0)
    }
  })

  // Show loading screen while fetching products
  if (loading) {
    return <LoadingScreen />
  }

  // Show error screen if fetch failed
  if (error) {
    return <ErrorScreen error={error} />
  }

  // Show message if no products found
  if (products.length === 0) {
    return (
      <div className="story-container">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No Products Found</h2>
            <p className="text-white/60">Please check back later</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="story-container">
      <StoryViewer
        products={products}
        story={story}
        messageModal={messageModal}
        setMessageModal={setMessageModal}
      />
    </div>
  )
}