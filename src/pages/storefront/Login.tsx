import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../features/auth/AuthContext'
import { Button } from '../../components/ui/Button'
import { useToastStore } from '../../features/toast/toastStore'

export default function Login() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const addToast = useToastStore(state => state.addToast)

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (user) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/welcome`
          }
        })
        if (error) throw error
        
        if (data.user && data.user.identities && data.user.identities.length === 0) {
           addToast('error', 'This email is already registered. Try logging in.')
        } else {
           // If email confirmation is disabled, go to welcome directly
           if (data.session) {
             navigate('/welcome')
           } else {
             // Email confirmation required — show a message
             addToast('success', 'Check your email to confirm your account!')
             navigate('/account/login')
           }
        }

      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        addToast('success', 'Welcome back!')
        navigate('/account')
      }
    } catch (err: any) {
      addToast('error', err.message || 'Authentication failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-brand-base px-4">
      <div className="w-full max-w-md p-8 bg-white border border-brand-dark/10 shadow-sm">
        <h2 className="font-heading text-3xl mb-6 text-center tracking-widest uppercase">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 font-body">
          {isSignUp && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-brand-dark/70 mb-1">Full Name</label>
              <input 
                type="text" 
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full border border-brand-dark/20 px-4 py-2 text-sm focus:outline-none focus:border-brand-secondary"
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs uppercase tracking-wider text-brand-dark/70 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-brand-dark/20 px-4 py-2 text-sm focus:outline-none focus:border-brand-secondary"
            />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-wider text-brand-dark/70 mb-1">Password</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-brand-dark/20 px-4 py-2 text-sm focus:outline-none focus:border-brand-secondary"
            />
          </div>
          
          <Button type="submit" variant="primary" className="w-full mt-4" isLoading={isLoading}>
            {isSignUp ? 'Sign Up' : 'Log In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm font-body">
          <button 
            type="button" 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-brand-dark/60 hover:text-brand-black transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>
      </div>
    </div>
  )
}
