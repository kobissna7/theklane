import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useToastStore } from '../../features/toast/toastStore'
import { Button } from '../../components/ui/Button'

interface Subscriber {
  id: string
  email: string
  created_at: string
}

export default function AdminNewsletter() {
  const addToast = useToastStore(s => s.addToast)
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSubscribers() }, [])

  async function fetchSubscribers() {
    setLoading(true)
    const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false })
    if (error) addToast('error', error.message)
    else setSubscribers(data || [])
    setLoading(false)
  }

  async function deleteSubscriber(id: string) {
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id)
    if (error) addToast('error', error.message)
    else {
      addToast('success', 'Subscriber removed')
      setSubscribers(subscribers.filter(s => s.id !== id))
    }
  }

  function exportCSV() {
    const csv = ['Email,Joined Date', ...subscribers.map(s => `${s.email},${new Date(s.created_at).toLocaleDateString()}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'newsletter_subscribers.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-base uppercase tracking-widest text-brand-dark">Newsletter</h1>
            <p className="font-body text-xs text-brand-dark/40 mt-0.5">
              {subscribers.length} {subscribers.length === 1 ? 'subscriber' : 'subscribers'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={fetchSubscribers}>Refresh</Button>
            {subscribers.length > 0 && (
              <Button size="sm" onClick={exportCSV}>Export CSV</Button>
            )}
          </div>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
          <p className="font-heading text-sm uppercase tracking-widest text-brand-dark/40">No subscribers yet</p>
          <p className="font-body text-xs text-brand-dark/30 mt-1">Visitors who sign up on the home page will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-heading text-2xs uppercase tracking-widest text-brand-dark/60 font-medium">Email</th>
                  <th className="px-6 py-4 font-heading text-2xs uppercase tracking-widest text-brand-dark/60 font-medium">Joined</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscribers.map(subscriber => (
                  <tr key={subscriber.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-brand-dark">{subscriber.email}</td>
                    <td className="px-6 py-4 text-brand-dark/50">
                      {new Date(subscriber.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteSubscriber(subscriber.id)}
                        className="text-xs font-heading uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
