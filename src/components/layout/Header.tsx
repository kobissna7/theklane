import React, { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCartStore } from '../../features/cart/cartStore'
import { useAuth } from '../../features/auth/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Category, Collection } from '../../lib/types'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [topCategories, setTopCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const { itemCount } = useCartStore()
  const { user, isAdmin } = useAuth()
  const count = itemCount()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function fetchData() {
      const [{ data: cats }, { data: cols }] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).is('parent_id', null).order('sort_order'),
        supabase.from('collections').select('*').eq('is_active', true).order('sort_order')
      ])
      setTopCategories(cats || [])
      setCollections(cols || [])
    }
    fetchData()
  }, [])

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
    }`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 -ml-2 text-brand-charcoal"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>

          {/* Desktop nav left */}
          <nav className="hidden lg:flex items-center gap-8">
            <div className="relative group" onMouseEnter={() => setShopOpen(true)} onMouseLeave={() => setShopOpen(false)}>
              <NavLink
                to="/shop"
                className="font-heading text-2xs uppercase tracking-widest text-brand-charcoal hover:text-brand-black transition-colors py-2 flex items-center gap-1"
              >
                Shop
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </NavLink>
              {shopOpen && (
                <div className="absolute left-0 top-full mt-0 bg-white shadow-xl border-t border-brand-cream-dark p-6 min-w-48 z-50">
                  <div className="grid grid-cols-1 gap-1">
                    {topCategories.map(cat => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        className="font-heading text-2xs uppercase tracking-widest text-brand-gray hover:text-brand-black transition-colors py-1.5"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <NavLink to="/collections/new-arrivals" className="font-heading text-2xs uppercase tracking-widest text-brand-charcoal hover:text-brand-black transition-colors">
              New Arrivals
            </NavLink>
            <NavLink to="/brand" className="font-heading text-2xs uppercase tracking-widest text-brand-charcoal hover:text-brand-black transition-colors">
              Brand
            </NavLink>
          </nav>

          {/* Logo center — pure text */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="klane-logo text-brand-black font-logo font-light text-2xl sm:text-3xl tracking-[0.18em] uppercase select-none">
              klané
            </span>
          </Link>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <Link to="/search" className="hidden sm:block text-brand-charcoal hover:text-brand-black transition-colors" aria-label="Search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <Link to={user ? (isAdmin ? '/admin' : '/account') : '/account/login'} className="text-brand-charcoal hover:text-brand-black transition-colors" aria-label="Account">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <Link to="/cart" className="relative text-brand-charcoal hover:text-brand-black transition-colors" aria-label="Cart">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-black text-white text-2xs font-heading w-4 h-4 flex items-center justify-center rounded-full">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-brand-cream-dark px-6 pb-6 pt-4 space-y-4">
          <Link to="/shop" className="block font-heading text-xs uppercase tracking-widest text-brand-charcoal py-2" onClick={() => setMobileOpen(false)}>Shop All</Link>
          {topCategories.map(cat => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className="block font-heading text-xs uppercase tracking-widest text-brand-gray py-1.5 pl-4" onClick={() => setMobileOpen(false)}>{cat.name}</Link>
          ))}
          <Link to="/collections/new-arrivals" className="block font-heading text-xs uppercase tracking-widest text-brand-charcoal py-2" onClick={() => setMobileOpen(false)}>New Arrivals</Link>
          <Link to="/brand" className="block font-heading text-xs uppercase tracking-widest text-brand-charcoal py-2" onClick={() => setMobileOpen(false)}>Brand</Link>
          <Link to="/search" className="block font-heading text-xs uppercase tracking-widest text-brand-charcoal py-2" onClick={() => setMobileOpen(false)}>Search</Link>
          <div className="pt-4 border-t border-brand-cream-dark">
            <Link 
              to={user ? (isAdmin ? '/admin' : '/account') : '/account/login'} 
              className="block font-heading text-xs uppercase tracking-widest text-brand-charcoal py-2" 
              onClick={() => setMobileOpen(false)}
            >
              {user ? (isAdmin ? 'Admin Dashboard' : 'My Account') : 'Log In / Sign Up'}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
