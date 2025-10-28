import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GuraGiru Shop - Product Stories',
  description: 'Discover amazing products through interactive stories',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#25D366',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Histats.com START (async) */}
        <Script id="histats-init" strategy="afterInteractive">
          {`
            var _Hasync = _Hasync || [];
            _Hasync.push(['Histats.start', '1,4987426,4,0,0,0,00010000']);
            _Hasync.push(['Histats.fasi', '1']);
            _Hasync.push(['Histats.track_hits', '']);
            (function() {
              var hs = document.createElement('script'); hs.type = 'text/javascript'; hs.async = true;
              hs.src = ('//s10.histats.com/js15_as.js');
              (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
            })();
          `}
        </Script>
        {/* Histats.com END */}
      </head>
      <body className={inter.className}>
        {children}
        {/* Histats noscript fallback */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              '<a href="/" target="_blank" rel="noopener noreferrer"><img src="//sstatic1.histats.com/0.gif?4987426&101" alt="hit counter code" style="border:0" /></a>'
          }}
        />
      </body>
    </html>
  )
}