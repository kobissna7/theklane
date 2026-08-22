import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { Button } from '../../components/ui/Button'

export default function Account() {
  const { user, profile, isAdmin, loading, signOut } = useAuth()

  if (loading) {
    return <div className="min-h-[80vh] flex items-center justify-center font-heading tracking-widest text-brand-dark/50">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/account/login" replace />
  }

  return (
    <div className="min-h-[80vh] bg-brand-base py-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-heading text-xs uppercase tracking-[0.3em] text-brand-dark/50 mb-3">Welcome back</p>
          <h1 className="font-heading text-4xl md:text-5xl tracking-wider text-brand-dark">
            {profile?.full_name || 'My Account'}
          </h1>
          <p className="font-body text-sm text-brand-dark/60 mt-3">{user.email}</p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Link
            to="/shop"
            className="group border border-brand-dark/10 p-6 hover:border-brand-secondary transition-colors bg-white"
          >
            <p className="font-heading uppercase tracking-widest text-sm text-brand-dark group-hover:text-brand-secondary transition-colors mb-1">Shop</p>
            <p className="font-body text-xs text-brand-dark/50">Explore the full collection</p>
          </Link>

          <Link
            to="/collections/new-arrivals"
            className="group border border-brand-dark/10 p-6 hover:border-brand-secondary transition-colors bg-white"
          >
            <p className="font-heading uppercase tracking-widest text-sm text-brand-dark group-hover:text-brand-secondary transition-colors mb-1">New Arrivals</p>
            <p className="font-body text-xs text-brand-dark/50">See what's just dropped</p>
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="group border border-brand-secondary/40 p-6 hover:border-brand-secondary transition-colors bg-brand-secondary/5 sm:col-span-2"
            >
              <p className="font-heading uppercase tracking-widest text-sm text-brand-secondary mb-1">Admin Dashboard</p>
              <p className="font-body text-xs text-brand-dark/50">Manage products, content and orders</p>
            </Link>
          )}
        </div>

        {/* Orders placeholder */}
        <div className="border border-brand-dark/10 bg-white p-8 mb-6">
          <h2 className="font-heading uppercase tracking-widest text-sm text-brand-dark mb-4">Order History</h2>
          <p className="font-body text-sm text-brand-dark/50 italic">
            You have no orders yet. Time to treat yourself.
          </p>
          <Link to="/shop" className="inline-block mt-4 font-heading text-xs uppercase tracking-widest text-brand-secondary hover:underline underline-offset-4">
            Start Shopping →
          </Link>
        </div>

        {/* Sign out */}
        <div className="text-center mt-8">
          <button
            onClick={signOut}
            className="font-heading text-xs uppercase tracking-widest text-brand-dark/40 hover:text-brand-dark transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}
