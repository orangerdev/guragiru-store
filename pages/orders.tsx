import React from 'react'
import Head from 'next/head'
import MobileHeader from '../components/MobileHeader'
import MobileNavigation from '../components/MobileNavigation'

export default function Orders() {
  const orders = [
    {
      id: '#GU001',
      date: '2024-01-15',
      status: 'Dikirim',
      total: 15000000,
      items: 2,
      statusColor: 'bg-blue-100 text-blue-600'
    },
    {
      id: '#GU002',
      date: '2024-01-10',
      status: 'Selesai',
      total: 2500000,
      items: 1,
      statusColor: 'bg-green-100 text-green-600'
    },
    {
      id: '#GU003',
      date: '2024-01-08',
      status: 'Dibatalkan',
      total: 800000,
      items: 1,
      statusColor: 'bg-red-100 text-red-600'
    }
  ]

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
        <title>Pesanan Saya - Guragiru Store</title>
      </Head>

      <div className="min-h-screen bg-gray-50 pb-20">
        <MobileHeader cartCount={0} onCartClick={() => {}} />
        
        <div className="pt-20 px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Pesanan Saya</h1>
          
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="card-mobile p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{order.id}</h3>
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{order.items} item(s)</span>
                  <span className="font-semibold text-primary-600">
                    {formatPrice(order.total)}
                  </span>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium btn-touch">
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-500">Belum ada pesanan</p>
            </div>
          )}
        </div>

        <MobileNavigation />
      </div>
    </>
  )
}