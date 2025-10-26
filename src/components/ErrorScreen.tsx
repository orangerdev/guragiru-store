interface ErrorScreenProps {
  error: string
}

export default function ErrorScreen({ error }: ErrorScreenProps) {
  return (
    <div className="story-container">
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center max-w-sm">
          {/* Error icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          
          <h2 className="text-lg font-medium mb-2 text-red-400">Oops! Something went wrong</h2>
          <p className="text-white/60 text-sm mb-4">{error}</p>
          
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-whatsapp-primary text-white rounded-full text-sm font-medium hover:bg-whatsapp-primary/80 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}