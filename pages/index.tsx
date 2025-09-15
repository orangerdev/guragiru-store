import React, { useState } from 'react'
import Head from 'next/head'
import MobileHeader from '../components/MobileHeader'
import ProductGrid from '../components/ProductGrid'

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    price: 15000000,
    image: "/images/iphone15pro.jpg",
    category: "Electronics",
    description: "Latest iPhone with titanium design"
  },
  {
    id: 2,
    name: "MacBook Air M3",
    price: 18000000,
    image: "/images/macbook.jpg",
    category: "Electronics",
    description: "Powerful and lightweight laptop"
  },
  {
    id: 3,
    name: "Nike Air Jordan",
    price: 2500000,
    image: "/images/jordan.jpg",
    category: "Fashion",
    description: "Classic basketball shoes"
  },
  {
    id: 4,
    name: "Skincare Set",
    price: 800000,
    image: "/images/skincare.jpg",
    category: "Beauty",
    description: "Complete skincare routine"
  },
]

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const filteredProducts = selectedCategory === 'All' 
    ? mockProducts 
    : mockProducts.filter(product => product.category === selectedCategory)

  const categories = ['All', ...Array.from(new Set(mockProducts.map(p => p.category)))]

  // WhatsApp configuration
  const whatsappNumber = "+6281234567890" // Replace with actual WhatsApp number
  
  const sendWhatsAppMessage = (product: Product) => {
    const message = `Halo, saya tertarik dengan produk ${product.name} seharga ${formatPrice(product.price)}. Apakah masih tersedia?`
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <>
      <Head>
        <title>Guragiru Store - Mobile Shopping Experience</title>
        <meta name="description" content="Shop the latest products with our mobile-optimized e-commerce platform" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <MobileHeader />

        {/* Category Filter */}
        <div className="sticky top-16 z-30 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <ProductGrid 
          products={filteredProducts}
          onWhatsAppClick={sendWhatsAppMessage}
        />
      </div>
    </>
  )
}