import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

export default function AdminLayout() {
  const location = useLocation()
  
  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Site Content', path: '/admin/content' },
    { name: 'Products', path: '/admin/products' },
  ]

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
