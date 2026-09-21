import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useToastStore } from '../../features/toast/toastStore'
import { Button } from '../../components/ui/Button'

interface WaitlistEntry {
  id: string
  created_at: string
  product_id: string
  name: string | null
  email: string
  size: string | null
}

interface ProductSummary {
  id: string
  name: string
  slug: string
  base_price: number
  entry_count: number
  entries: WaitlistEntry[]
}

export default function AdminWaitlist() {
  const addToast = useToastStore(s => s.addToast)
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { fetchWaitlist() }, [])

  async function fetchWaitlist() {
    setLoading(true)
    try {
      const { data: entries, error } = await supabase
        .from('waitlist_entries')
        .select('*, products(id, name, slug, base_price)')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group by product
      const map = new Map<string, ProductSummary>()
      ;(entries || []).forEach((entry: any) => {
        const p = entry.products
        if (!p) return
        if (!map.has(p.id)) {
          map.set(p.id, { id: p.id, name: p.name, slug: p.slug, base_price: p.base_price, entry_count: 0, entries: [] })
        }
        const ps = map.get(p.id)!
        ps.entry_count++
        ps.entries.push({ id: entry.id, created_at: entry.created_at, product_id: p.id, name: entry.name, email: entry.email, size: entry.size })
      })

      setProducts(Array.from(map.values()))
    } catch (err: any) {
      addToast('error', err.message)
    } finally { setLoading(false) }
  }

  function exportCsv(product: ProductSummary) {
    const headers = ['Name', 'Email', 'Size', 'Joined']
    const rows = product.entries.map(e => [
      e.name || '',
      e.email,
      e.size || '',
      new Date(e.created_at).toLocaleDateString()
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `waitlist-${product.slug}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function removeEntry(id: string) {
    const { error } = await supabase.from('waitlist_entries').delete().eq('id', id)
    if (error) { addToast('error', error.message); return }
    addToast('success', 'Entry removed')
    fetchWaitlist()
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-brand-secondary/30 border-t-brand-secondary rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-base uppercase tracking-widest text-brand-dark">Product Waitlist</h1>
            <p className="font-body text-xs text-brand-dark/40 mt-0.5">
              {products.reduce((sum, p) => sum + p.entry_count, 0)} total signups across {products.length} products
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchWaitlist}>Refresh</Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">🔔</div>
          <p className="font-heading text-sm uppercase tracking-widest text-brand-dark/40">No waitlist entries yet</p>
          <p className="font-body text-xs text-brand-dark/30 mt-1">When items are out of stock, customers can join the waitlist from the product page.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Product row */}
              <button
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === product.id ? null : product.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-brand-secondary/10 rounded-full flex items-center justify-center">
                    <span className="font-heading text-sm text-brand-secondary">{product.entry_count}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-heading text-sm uppercase tracking-wider text-brand-dark">{product.name}</p>
                    <p className="font-body text-xs text-brand-dark/40">{product.entry_count} waitlist {product.entry_count === 1 ? 'entry' : 'entries'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={e => { e.stopPropagation(); exportCsv(product) }}
                    className="font-heading text-2xs uppercase tracking-widest text-brand-secondary border border-brand-secondary/30 px-3 py-1.5 rounded-lg hover:bg-brand-secondary/5 transition-colors"
                  >
                    Export CSV
                  </button>
                  <svg className={`w-4 h-4 text-brand-dark/30 transition-transform ${expanded === product.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded entries */}
              {expanded === product.id && (
                <div className="border-t border-gray-50">
                  <div className="px-6 py-3 bg-gray-50 grid grid-cols-4 gap-3">
                    {['Name', 'Email', 'Size', ''].map(h => (
                      <span key={h} className="font-heading text-2xs uppercase tracking-widest text-brand-dark/30">{h}</span>
                    ))}
                  </div>
                  {product.entries.map(entry => (
                    <div key={entry.id} className="px-6 py-3 grid grid-cols-4 gap-3 border-t border-gray-50 items-center hover:bg-gray-50/50 transition-colors">
                      <p className="font-body text-sm text-brand-dark truncate">{entry.name || '—'}</p>
                      <p className="font-body text-sm text-brand-dark truncate">{entry.email}</p>
                      <p className="font-body text-sm text-brand-dark">{entry.size || '—'}</p>
                      <button
                        onClick={() => removeEntry(entry.id)}
                        className="text-2xs text-red-400 hover:text-red-600 uppercase tracking-widest font-heading transition-colors justify-self-end"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
