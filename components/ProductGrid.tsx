import React from 'react'

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
}

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="px-4 py-6">
      <div className="grid grid-cols-2 gap-4">
        {products.map(product => (
          <div key={product.id} className="card-mobile">
            {/* Product Image */}
            <div className="aspect-square bg-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {/* Category Badge */}
              <div className="absolute top-2 left-2">
                <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-3">
              <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary-600 text-sm">
                  {formatPrice(product.price)}
                </span>
                <button
                  onClick={() => onAddToCart(product)}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors btn-touch"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-500">Tidak ada produk dalam kategori ini</p>
        </div>
      )}
    </div>
  )
}

export default ProductGrid