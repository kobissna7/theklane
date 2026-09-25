import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useToastStore } from '../../features/toast/toastStore'

export function SiteWaitlistModal() {
  const addToast = useToastStore(s => s.addToast)
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function checkVisibility() {
      // Check localStorage first so we don't spam the user
      const hasSeen = localStorage.getItem('klane_waitlist_modal_seen')
      if (hasSeen) return

      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'show_site_waitlist_modal')
        .single()
      
      if (data && (data.message === 'true' || data.is_enabled === true)) {
        // slight delay so it doesn't pop up immediately on load
        setTimeout(() => {
          setIsOpen(true)
        }, 3000)
      }
    }
    checkVisibility()
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('klane_waitlist_modal_seen', 'true')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSaving(true)
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email })
      if (error && !error.message.includes('duplicate')) throw error
      setSubmitted(true)
      addToast('success', "You're on the list!")
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (err: any) {
      if (err.message?.includes('duplicate')) {
        setSubmitted(true)
        addToast('success', "You're already on the waitlist!")
        setTimeout(() => handleClose(), 2000)
      } else {
        addToast('error', err.message || 'Something went wrong')
      }
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-in-up sm:animate-fade-up">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div>
            <p className="font-heading text-2xs uppercase tracking-widest text-brand-secondary mb-1">
              Exclusive Access
            </p>
            <h2 className="font-heading text-xl text-brand-dark leading-snug">Join the KLANÉ Waitlist</h2>
          </div>
          <button onClick={handleClose} className="ml-4 mt-0.5 text-brand-dark/30 hover:text-brand-dark transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          {submitted ? (
            <div className="py-8 text-center">
              <p className="font-heading text-sm uppercase tracking-widest text-brand-secondary">Welcome to the journey</p>
              <p className="font-body text-sm text-brand-dark/50 mt-2">We'll notify you when we open.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="font-body text-sm text-brand-dark/50 leading-relaxed">
                Be the first to know when we launch and get exclusive early access to our first collection.
              </p>

              <div>
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-body focus:outline-none focus:border-brand-secondary text-brand-dark placeholder:text-brand-dark/25 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={saving || !email}
                className="w-full bg-brand-secondary text-white rounded-lg py-3.5 font-heading text-xs uppercase tracking-widest hover:bg-brand-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Joining...' : 'Join Waitlist'}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full text-center font-heading text-2xs uppercase tracking-widest text-brand-dark/30 hover:text-brand-dark/50 transition-colors py-1"
              >
                No thanks
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
