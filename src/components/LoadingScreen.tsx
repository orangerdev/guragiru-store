export default function LoadingScreen() {
  return (
    <div className="story-container">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          {/* WhatsApp-style loading animation */}
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-whatsapp-primary animate-spin"></div>
          </div>
          <h2 className="text-lg font-medium mb-2">Loading Stories...</h2>
          <p className="text-white/60 text-sm">Getting latest products</p>
        </div>
      </div>
    </div>
  )
}