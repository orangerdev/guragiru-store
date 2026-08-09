import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db/d1'
import { getAllConfig, setConfig } from '@/lib/db/orders'
import { updateConfigAction } from '../actions'

const CONFIG_KEYS = [
  { key: 'company_name', label: 'Nama Perusahaan', placeholder: 'GuraGiru' },
  { key: 'company_address', label: 'Alamat Perusahaan', placeholder: 'Jl. Contoh No. 1' },
  { key: 'doku_client_id', label: 'DOKU Client ID', placeholder: 'Client ID dari DOKU' },
  { key: 'doku_secret_key', label: 'DOKU Secret Key', placeholder: 'Secret key', sensitive: true },
  { key: 'webhook_url', label: 'n8n Webhook URL', placeholder: 'https://n8n.example.com/webhook/...' },
  { key: 'default_shipping', label: 'Default Ongkir (Rp)', placeholder: '0' },
]

export default async function ConfigPage() {
  const session = await getSession()
  if (!session || !['admin', 'administrator'].includes(session.role)) {
    redirect('/order/dashboard')
  }

  const db = await getDb()
  const configs = await getAllConfig(db)
  const configMap = Object.fromEntries(configs.map((c) => [c.key, c.value]))

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Config</h1>

      <div className="space-y-4 max-w-lg">
        {CONFIG_KEYS.map((item) => (
          <form key={item.key} action={updateConfigAction} className="flex gap-2 items-end">
            <input type="hidden" name="key" value={item.key} />
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">{item.label}</label>
              <input
                name="value"
                type={item.sensitive ? 'password' : 'text'}
                defaultValue={configMap[item.key] || ''}
                placeholder={item.placeholder}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-3 py-2 rounded transition-colors"
            >
              Save
            </button>
          </form>
        ))}
      </div>
    </div>
  )
}
