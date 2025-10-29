import type { Product, WhatsAppConfig } from '@/types'
import { getOptimizedGoogleDriveUrl, isGoogleDriveUrl } from '@/utils/googleDrive'

class WhatsAppService {
  private config: WhatsAppConfig

  constructor() {
    this.config = {
      phoneNumber: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '62811984666',
      defaultMessage: process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE || 'Halo, saya tertarik dengan produk ini:'
    }
  }

  /**
   * Format text with WhatsApp markdown
   */
  formatWhatsAppText(text: string): string {
    // WhatsApp uses specific formatting:
    // *bold* -> keep as is
    // _italic_ -> keep as is
    // ~strikethrough~ -> keep as is
    // ```code``` -> keep as is
    return text
  }

  /**
   * Generate WhatsApp deep link URL
   */
  generateWhatsAppUrl(product: Product, userMessage?: string): string {
    const { phoneNumber, defaultMessage } = this.config
    
    // Build message components
    const lines: string[] = []
    // Title
    lines.push(`*${product.product_name}*`)

    // Description
    if (product.description) {
      lines.push(this.formatWhatsAppText(product.description))
    }

    // Image URL (only if asset is image)
    if (product.asset_type === 'image' && product.asset_link) {
      const imageUrl = isGoogleDriveUrl(product.asset_link)
        ? getOptimizedGoogleDriveUrl(product.asset_link, 'image')
        : product.asset_link
      lines.push(`Gambar: ${imageUrl}`)
    }

    const productInfo = lines.filter(Boolean).join('\n\n')

    const fullMessage = [
      defaultMessage,
      '',
      productInfo,
      userMessage ? `\n\n_Pesan tambahan:_\n${userMessage}` : ''
    ].filter(Boolean).join('\n')

    // URL encode the message
    const encodedMessage = encodeURIComponent(fullMessage)
    
    // Generate WhatsApp URL (works on both mobile and web)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    
    return whatsappUrl
  }

  /**
   * Generate WhatsApp URL for multiple products (cart)
   */
  generateWhatsAppUrlForCart(products: Product[], userMessage?: string): string {
    const { phoneNumber, defaultMessage } = this.config

    const lines: string[] = []
    lines.push('*Keranjang Belanja*')

    products.forEach((product, idx) => {
      const section: string[] = []
      section.push(`${idx + 1}. *${product.product_name}*`)
      if (product.description) {
        section.push(this.formatWhatsAppText(product.description))
      }
      if (product.asset_type === 'image' && product.asset_link) {
        const imageUrl = isGoogleDriveUrl(product.asset_link)
          ? getOptimizedGoogleDriveUrl(product.asset_link, 'image')
          : product.asset_link
        section.push(`Gambar: ${imageUrl}`)
      }
      lines.push(section.join('\n'))
    })

    const fullMessage = [
      defaultMessage,
      '',
      lines.join('\n\n'),
      userMessage ? `\n\n_Pesan tambahan:_\n${userMessage}` : ''
    ]
      .filter(Boolean)
      .join('\n')

    const encodedMessage = encodeURIComponent(fullMessage)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    return whatsappUrl
  }

  /**
   * Open WhatsApp with product info
   */
  sendToWhatsApp(product: Product, userMessage?: string): void {
    const url = this.generateWhatsAppUrl(product, userMessage)
    
    // Check if we're on mobile or desktop
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // On mobile, try to open WhatsApp app first, fallback to web
      window.location.href = url
    } else {
      // On desktop, open in new tab
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  /**
   * Open WhatsApp with cart info
   */
  sendCartToWhatsApp(products: Product[], userMessage?: string): void {
    const url = this.generateWhatsAppUrlForCart(products, userMessage)
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (isMobile) {
      window.location.href = url
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<WhatsAppConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  getConfig(): WhatsAppConfig {
    return { ...this.config }
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService()

// Export class for testing or custom instances  
export { WhatsAppService }
