import React from 'react'
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'

export default function AdminLayout() {
  const location = useLocation()
  const { user, isAdmin, loading, signOut } = useAuth()

  
  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Site Content', path: '/admin/content' },
    { name: 'Products', path: '/admin/products' },
  ]

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-heading">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/account/login" replace />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-base font-body px-4 text-center">
        <h1 className="font-heading text-3xl mb-4 text-brand-dark">Access Denied</h1>
        <p className="text-brand-dark/70 mb-8 max-w-md">
          You do not have administrative privileges. Only admins can access this portal.
        </p>
        <Link to="/" className="text-brand-secondary hover:underline">Return to Storefront</Link>
        <button onClick={signOut} className="mt-8 text-xs text-brand-dark/40 uppercase tracking-widest hover:text-brand-dark">
          Log Out
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-neutral flex flex-col md:flex-row font-body">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-brand-dark text-brand-base flex-shrink-0">
        <div className="p-6">
          <Link to="/" className="font-heading text-2xl tracking-widest uppercase">KLANÉ</Link>
          <span className="block text-xs text-brand-base/50 mt-1 uppercase tracking-widest">Admin Portal</span>
        </div>
        <nav className="mt-6">
          <ul>
            {navItems.map(item => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={`block px-6 py-3 text-sm transition-colors ${
                    location.pathname === item.path 
                      ? 'bg-brand-secondary text-white border-l-4 border-white' 
                      : 'text-brand-base/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-6 mt-auto">
          <button 
            onClick={signOut}
            className="text-xs text-brand-base/50 hover:text-white uppercase tracking-widest transition-colors"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-brand-dark/10 h-16 flex items-center px-8">
          <h2 className="font-heading text-xl uppercase tracking-widest text-brand-dark">
            {navItems.find(i => i.path === location.pathname)?.name || 'Admin'}
          </h2>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
