import satori from 'satori'
import { Resvg } from '@resvg/resvg-wasm'
import { buildInvoiceMarkup, type InvoiceData } from './invoice-template'

let fontData: ArrayBuffer | null = null

async function loadFont(): Promise<ArrayBuffer> {
  if (fontData) return fontData

  // Try loading from public/fonts first (bundled with the app)
  const url = new URL('/fonts/Inter-Regular.woff', 'file://')
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Inter-Regular.woff')
    const buffer = await fs.readFile(fontPath)
    fontData = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    return fontData
  } catch {
    // Fallback: fetch from Google Fonts CDN
    const res = await fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2'
    )
    fontData = await res.arrayBuffer()
    return fontData
  }
}

/**
 * Render invoice data to a PNG buffer using Satori + resvg-wasm.
 */
export async function renderInvoicePng(data: InvoiceData): Promise<Uint8Array> {
  const font = await loadFont()
  const markup = buildInvoiceMarkup(data)

  // Generate SVG via Satori
  const svg = await satori(markup as React.ReactNode, {
    width: 800,
    fonts: [
      {
        name: 'Inter',
        data: font,
        weight: 400,
        style: 'normal',
      },
    ],
  })

  // Convert SVG to PNG via resvg-wasm
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 800 },
  })
  const pngData = resvg.render()
  return pngData.asPng()
}
