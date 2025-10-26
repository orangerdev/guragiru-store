import type { Product } from '@/types'

interface StoryProgressBarProps {
  products: Product[]
  currentIndex: number
  progress: number
}

export default function StoryProgressBar({ 
  products, 
  currentIndex, 
  progress 
}: StoryProgressBarProps) {
  // Group progress bars for large numbers of products
  // Show max 10 indicators, group others
  const maxIndicators = 10
  const shouldGroup = products.length > maxIndicators
  
  if (shouldGroup) {
    // Group products into segments
    const segmentSize = Math.ceil(products.length / maxIndicators)
    const currentSegment = Math.floor(currentIndex / segmentSize)
    const segmentProgress = ((currentIndex % segmentSize) / segmentSize) * 100 + (progress / segmentSize)
    
    return (
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex gap-1">
          {Array.from({ length: maxIndicators }).map((_, segmentIndex) => {
            let fillWidth = 0
            
            if (segmentIndex < currentSegment) {
              fillWidth = 100 // Completed segments
            } else if (segmentIndex === currentSegment) {
              fillWidth = segmentProgress // Current segment
            }
            
            return (
              <div key={segmentIndex} className="progress-bar flex-1">
                <div 
                  className="progress-fill"
                  style={{ width: `${fillWidth}%` }}
                />
              </div>
            )
          })}
        </div>
        
        {/* Story counter */}
        <div className="mt-2 text-center">
          <span className="text-xs text-white/60">
            {currentIndex + 1} of {products.length}
          </span>
        </div>
      </div>
    )
  }
  
  // Show individual progress bars for smaller numbers
  return (
    <div className="absolute top-4 left-4 right-4 z-10">
      <div className="flex gap-1">
        {products.map((_, index) => {
          let fillWidth = 0
          
          if (index < currentIndex) {
            fillWidth = 100 // Completed stories
          } else if (index === currentIndex) {
            fillWidth = progress // Current story
          }
          
          return (
            <div key={index} className="progress-bar flex-1">
              <div 
                className="progress-fill"
                style={{ width: `${fillWidth}%` }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}