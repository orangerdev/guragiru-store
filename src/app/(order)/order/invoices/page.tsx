'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface Event {
  id: number
  name: string
}

interface Customer {
  id: number
  name: string
}

interface Item {
  id: number
  item_name: string
  quantity: number
  price: number
}

function formatCurrency(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID')
}

export default function GenerateInvoicePage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [phone, setPhone] = useState('')
  const [discount, setDiscount] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load events on mount
  useEffect(() => {
    fetch('/api/order/events')
      .then((r) => r.json() as Promise<{ events: Event[] }>)
      .then((data) => setEvents(data.events || []))
      .catch(() => setError('Gagal memuat events'))
  }, [])

  // Load customers when event selected
  useEffect(() => {
    if (!selectedEvent) {
      setCustomers([])
      return
    }
    fetch(`/api/order/events/${selectedEvent}/customers`)
      .then((r) => r.json() as Promise<{ customers: Customer[] }>)
      .then((data) => setCustomers(data.customers || []))
      .catch(() => setError('Gagal memuat customers'))
    setSelectedCustomer(null)
    setItems([])
    setSelectedItems([])
  }, [selectedEvent])

  // Load items when customer selected
  useEffect(() => {
    if (!selectedCustomer) {
      setItems([])
      return
    }
    fetch(`/api/order/customers/${selectedCustomer}/items`)
      .then((r) => r.json() as Promise<{ items: Item[] }>)
      .then((data) => {
        setItems(data.items || [])
        setSelectedItems((data.items || []).map((i) => i.id))
      })
      .catch(() => setError('Gagal memuat items'))
  }, [selectedCustomer])

  const subtotal = items
    .filter((i) => selectedItems.includes(i.id))
    .reduce((sum, i) => sum + i.price * i.quantity, 0)
  const total = subtotal - discount + shipping

  function toggleItem(id: number) {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEvent || !selectedCustomer || selectedItems.length === 0 || !phone) {
      setError('Lengkapi semua field')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/order/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: selectedEvent,
          customer_id: selectedCustomer,
          phone,
          discount,
          shipping,
          selected_item_ids: selectedItems,
        }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error || 'Gagal generate invoice')
        return
      }

      const data = (await res.json()) as { order_id: number }
      router.push(`/order/orders/${data.order_id}`)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Buat Invoice</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-3 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Event Selection */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Event</label>
          <select
            value={selectedEvent ?? ''}
            onChange={(e) => setSelectedEvent(Number(e.target.value) || null)}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">Pilih event...</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Selection */}
        {selectedEvent && (
          <div>
            <label className="block text-sm text-gray-400 mb-1">Customer</label>
            <select
              value={selectedCustomer ?? ''}
              onChange={(e) => setSelectedCustomer(Number(e.target.value) || null)}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Pilih customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Phone */}
        {selectedCustomer && (
          <div>
            <label className="block text-sm text-gray-400 mb-1">No. Telepon</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Items Selection */}
        {items.length > 0 && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Pilih Items ({selectedItems.length}/{items.length})
            </label>
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              {items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="rounded"
                  />
                  <span className="flex-1 text-sm text-white">{item.item_name}</span>
                  <span className="text-sm text-gray-400">x{item.quantity}</span>
                  <span className="text-sm text-white">{formatCurrency(item.price * item.quantity)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Discount & Shipping */}
        {selectedItems.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Diskon (Rp)</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ongkir (Rp)</label>
              <input
                type="number"
                min="0"
                value={shipping}
                onChange={(e) => setShipping(Number(e.target.value))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Summary */}
        {selectedItems.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Diskon</span>
                <span className="text-red-400">-{formatCurrency(discount)}</span>
              </div>
            )}
            {shipping > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Ongkir</span>
                <span className="text-white">{formatCurrency(shipping)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold border-t border-gray-800 pt-2">
              <span className="text-gray-300">Total</span>
              <span className="text-white">{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        {/* Submit */}
        {selectedItems.length > 0 && (
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-3 rounded transition-colors"
          >
            {loading ? 'Generating invoice...' : 'Generate Invoice'}
          </button>
        )}
      </form>
    </div>
  )
}
