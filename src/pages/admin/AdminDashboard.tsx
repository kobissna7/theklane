import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Stats {
  activeProducts: number
  totalOrders: number
  waitlistEntries: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ activeProducts: 0, totalOrders: 0, waitlistEntries: 0 })

  useEffect(() => {
    async function fetchStats() {
      const [{ count: products }, { count: entries }] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('waitlist_entries').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        activeProducts: products || 0,
        totalOrders: 0,
        waitlistEntries: entries || 0,
      })
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Total Sales', value: '$0.00', sub: 'This month', icon: '💳', href: null },
    { label: 'Active Products', value: String(stats.activeProducts), sub: 'Published to store', icon: '🛍', href: '/admin/products' },
    { label: 'Waitlist Entries', value: String(stats.waitlistEntries), sub: 'Awaiting restock', icon: '🔔', href: '/admin/waitlist' },
  ]

  const quickLinks = [
    { label: 'Add a Product', href: '/admin/products', desc: 'Upload new items to the store' },
    { label: 'Manage Drops', href: '/admin/drops', desc: 'Schedule limited releases' },
    { label: 'Edit Homepage', href: '/admin/content', desc: 'Update copy, video, and sections' },
    { label: 'View Waitlist', href: '/admin/waitlist', desc: 'See who wants what' },
  ]

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">
          ✦
        </div>
        <div>
          <h1 className="font-heading text-lg uppercase tracking-widest text-brand-dark">Welcome back</h1>
          <p className="text-sm text-brand-dark/50 font-body mt-0.5">
            Your store is live. Manage everything from the sidebar.
          </p>
        </div>
        <div className="ml-auto hidden sm:block">
          <Link to="/" className="inline-flex items-center gap-2 font-heading text-2xs uppercase tracking-widest text-brand-black border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            View Store →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(({ label, value, sub, icon, href }) => {
          const card = (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <span className="text-2xl">{icon}</span>
                {href && (
                  <svg className="w-4 h-4 text-brand-dark/20 group-hover:text-brand-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
              <p className="font-heading text-3xl text-brand-dark tracking-tight">{value}</p>
              <p className="font-heading text-2xs uppercase tracking-widest text-brand-dark/40 mt-1">{label}</p>
              <p className="font-body text-xs text-brand-dark/30 mt-0.5">{sub}</p>
            </div>
          )
          return href ? <Link key={label} to={href}>{card}</Link> : <div key={label}>{card}</div>
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-heading text-sm uppercase tracking-widest text-brand-dark">Quick Actions</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {quickLinks.map(({ label, href, desc }) => (
            <Link
              key={href}
              to={href}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
            >
              <div>
                <p className="font-heading text-sm uppercase tracking-wider text-brand-dark group-hover:text-brand-black transition-colors">{label}</p>
                <p className="font-body text-xs text-brand-dark/40 mt-0.5">{desc}</p>
              </div>
              <svg className="w-4 h-4 text-brand-dark/20 group-hover:text-brand-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
