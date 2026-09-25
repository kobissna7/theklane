import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useToastStore } from '../../features/toast/toastStore'
import { Button } from '../../components/ui/Button'

interface Order {
  id: string
  email: string
  first_name: string
  last_name: string
  total_amount: number
  status: string
  created_at: string
}

export default function AdminOrders() {
  const addToast = useToastStore(s => s.addToast)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    setLoading(true)
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) addToast('error', error.message)
    else setOrders(data || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) addToast('error', error.message)
    else {
      addToast('success', 'Order status updated')
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o))
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-base uppercase tracking-widest text-brand-dark">Orders</h1>
            <p className="font-body text-xs text-brand-dark/40 mt-0.5">
              {orders.length} total {orders.length === 1 ? 'order' : 'orders'}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchOrders}>Refresh</Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-xl"></div>
          <p className="font-heading text-sm uppercase tracking-widest text-brand-dark/40">No orders yet</p>
          <p className="font-body text-xs text-brand-dark/30 mt-1">Orders placed on the storefront will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {orders.map(order => (
              <div key={order.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-body text-sm font-medium text-brand-dark">{order.first_name} {order.last_name}</p>
                    <p className="font-body text-xs text-brand-dark/50 truncate">{order.email}</p>
                  </div>
                  <span className="font-body text-sm font-semibold text-brand-dark flex-shrink-0">${Number(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-heading text-2xs text-brand-dark/40 uppercase tracking-wider">{new Date(order.created_at).toLocaleDateString()}</span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="bg-transparent border border-gray-200 rounded-lg px-2 py-1 text-xs font-heading uppercase tracking-widest focus:outline-none focus:border-brand-black"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-heading text-2xs uppercase tracking-widest text-brand-dark/60 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-heading text-2xs uppercase tracking-widest text-brand-dark/60 font-medium">Customer</th>
                  <th className="px-6 py-4 font-heading text-2xs uppercase tracking-widest text-brand-dark/60 font-medium">Date</th>
                  <th className="px-6 py-4 font-heading text-2xs uppercase tracking-widest text-brand-dark/60 font-medium">Total</th>
                  <th className="px-6 py-4 font-heading text-2xs uppercase tracking-widest text-brand-dark/60 font-medium">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-heading text-xs text-brand-dark">{order.id.slice(0,8)}...</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-brand-dark font-medium">{order.first_name} {order.last_name}</p>
                      <p className="text-brand-dark/50 text-xs">{order.email}</p>
                    </td>
                    <td className="px-6 py-4 text-brand-dark/60">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-brand-dark">
                      ${Number(order.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="bg-transparent border border-gray-200 rounded-lg px-2 py-1 text-xs font-heading uppercase tracking-widest focus:outline-none focus:border-brand-black"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
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
