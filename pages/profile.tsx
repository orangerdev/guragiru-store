import React from 'react'
import Head from 'next/head'
import MobileHeader from '../components/MobileHeader'
import MobileNavigation from '../components/MobileNavigation'

export default function Profile() {
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+62 812 3456 7890',
    avatar: null
  }

  const menuItems = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: 'Edit Profil',
      subtitle: 'Ubah informasi personal'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Alamat',
      subtitle: 'Kelola alamat pengiriman'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: 'Metode Pembayaran',
      subtitle: 'Kelola kartu dan e-wallet'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h5V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h2" />
        </svg>
      ),
      title: 'Riwayat Transaksi',
      subtitle: 'Lihat semua transaksi'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: 'Bantuan',
      subtitle: 'FAQ dan customer service'
    }
  ]

  return (
    <>
      <Head>
        <title>Profil - Guragiru Store</title>
      </Head>

      <div className="min-h-screen bg-gray-50 pb-20">
        <MobileHeader cartCount={0} onCartClick={() => {}} />
        
        <div className="pt-20 px-4 py-6">
          {/* User Profile Card */}
          <div className="card-mobile p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-sm text-gray-500">{user.phone}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="w-full card-mobile p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-gray-400">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.subtitle}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <div className="mt-8">
            <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold btn-touch">
              Keluar
            </button>
          </div>
        </div>

        <MobileNavigation />
      </div>
    </>
  )
}