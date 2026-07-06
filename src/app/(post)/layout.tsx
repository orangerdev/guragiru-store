import type { Metadata, Viewport } from 'next'
import CompactHeader from '@/lib/components/CompactHeader'

export const metadata: Metadata = {
  title: {
    template: '%s | GuraGiru',
    default: 'GuraGiru - Blog & Articles',
  },
  description: 'Artikel dan informasi terbaru dari GuraGiru',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}

export default function PostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-[#f1f1f1]">
      <CompactHeader />
      {children}
    </div>
  )
}
