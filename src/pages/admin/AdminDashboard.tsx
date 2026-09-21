import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Stats {
  activeProducts: number
  totalOrders: number
  totalRevenue: number
  waitlistEntries: number
  newsletterSubscribers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ activeProducts: 0, totalOrders: 0, totalRevenue: 0, waitlistEntries: 0, newsletterSubscribers: 0 })

  useEffect(() => {
    async function fetchStats() {
      const [{ count: products }, { count: entries }, { count: orders }, { count: subscribers }, { data: revenueData }] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('waitlist_entries').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount'),
      ])
      const totalRevenue = (revenueData || []).reduce((sum: number, o: any) => sum + Number(o.total_amount), 0)
      setStats({
        activeProducts: products || 0,
        totalOrders: orders || 0,
        totalRevenue,
        waitlistEntries: entries || 0,
        newsletterSubscribers: subscribers || 0,
      })
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, sub: 'All time', href: '/admin/orders' },
    { label: 'Total Orders', value: String(stats.totalOrders), sub: 'All time', href: '/admin/orders' },
    { label: 'Active Products', value: String(stats.activeProducts), sub: 'Published to store', href: '/admin/products' },
    { label: 'Waitlist Entries', value: String(stats.waitlistEntries), sub: 'Awaiting restock', href: '/admin/waitlist' },
    { label: 'Newsletter', value: String(stats.newsletterSubscribers), sub: 'Subscribers', href: '/admin/newsletter' },
  ]

  const quickLinks = [
    { label: 'Add a Product', href: '/admin/products', desc: 'Upload new items to the store' },
    { label: 'View Orders', href: '/admin/orders', desc: 'Track and manage customer orders' },
    { label: 'Manage Drops', href: '/admin/drops', desc: 'Schedule limited releases' },
    { label: 'Edit Homepage', href: '/admin/content', desc: 'Update copy, video, and sections' },
    { label: 'View Waitlist', href: '/admin/waitlist', desc: 'See who wants what' },
    { label: 'Newsletter', href: '/admin/newsletter', desc: 'Manage email subscribers' },
  ]

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, sub, href }) => {
          const card = (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-end mb-4 h-6">
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
