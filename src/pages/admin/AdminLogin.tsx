import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useToastStore } from '../../features/toast/toastStore'
import { Button } from '../../components/ui/Button'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const addToast = useToastStore(state => state.addToast)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // Verify they are actually an admin
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      
      if (profile?.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Access denied. Admin privileges required.')
      }

      addToast('success', 'Admin login successful')
      navigate('/admin')
    } catch (err: any) {
      addToast('error', err.message || 'Authentication failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-body relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-secondary/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <span className="klane-logo text-brand-black font-logo font-light text-3xl tracking-[0.22em] uppercase block">
              KLANÉ
            </span>
          </Link>
          <p className="text-brand-dark/40 font-heading text-xs uppercase tracking-widest mt-2">Admin Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-brand-dark/5 p-8 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block font-heading text-2xs uppercase tracking-widest text-brand-dark/50 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-body focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary text-brand-dark transition-all"
                placeholder="admin@theklane.com"
              />
            </div>

            <div>
              <label className="block font-heading text-2xs uppercase tracking-widest text-brand-dark/50 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-body focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary text-brand-dark transition-all"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full py-3.5 mt-2 rounded-xl text-xs" isLoading={isLoading}>
              Sign In to Dashboard
            </Button>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/" className="text-2xs font-heading uppercase tracking-widest text-brand-dark/30 hover:text-brand-dark transition-colors">
            ← Return to Store
          </Link>
        </div>
      </div>
    </div>
  )
}
