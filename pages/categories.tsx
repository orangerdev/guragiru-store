import React from 'react'
import Head from 'next/head'
import MobileHeader from '../components/MobileHeader'
import MobileNavigation from '../components/MobileNavigation'

export default function Categories() {
  const categories = [
    {
      id: 1,
      name: 'Electronics',
      icon: '📱',
      count: 156,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      name: 'Fashion',
      icon: '👕',
      count: 89,
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: 3,
      name: 'Beauty',
      icon: '💄',
      count: 67,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 4,
      name: 'Sports',
      icon: '⚽',
      count: 43,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 5,
      name: 'Books',
      icon: '📚',
      count: 25,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 6,
      name: 'Home',
      icon: '🏠',
      count: 78,
      color: 'bg-indigo-100 text-indigo-600'
    }
  ]

  return (
    <>
      <Head>
        <title>Kategori - Guragiru Store</title>
      </Head>

      <div className="min-h-screen bg-gray-50 pb-20">
        <MobileHeader cartCount={0} onCartClick={() => {}} />
        
        <div className="pt-20 px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Kategori Produk</h1>
          
          <div className="grid grid-cols-2 gap-4">
            {categories.map(category => (
              <div key={category.id} className="card-mobile p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl ${category.color}`}>
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} produk</p>
              </div>
            ))}
          </div>
        </div>

        <MobileNavigation />
      </div>
    </>
  )
}