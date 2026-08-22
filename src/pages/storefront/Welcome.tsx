import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Welcome() {
  const navigate = useNavigate()

  // Handle the email confirmation token from URL (Supabase sends ?token_hash=...&type=email)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // They just confirmed their email and are now signed in
        // Give them a moment to enjoy the welcome screen
      }
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-brand-base px-4">
      <div className="max-w-lg text-center">

        {/* Decorative line */}
        <div className="w-16 h-px bg-brand-secondary/40 mx-auto mb-10" />

        <p className="font-heading text-xs uppercase tracking-[0.3em] text-brand-dark/50 mb-6">
          Welcome to KLANÉ
        </p>

        <h1 className="font-heading text-4xl sm:text-5xl font-normal tracking-wider text-brand-dark mb-6 leading-tight">
          You've joined<br />the journey.
        </h1>

        <p className="font-body text-base text-brand-dark/60 leading-relaxed max-w-sm mx-auto mb-12">
          There is a moment in every woman's life when she chooses herself.<br />
          <span className="italic text-brand-dark/80">KLANÉ exists for that moment.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/shop"
            className="inline-block bg-brand-secondary text-white font-heading text-xs uppercase tracking-widest px-10 py-4 hover:bg-brand-secondary/90 transition-colors"
          >
            Shop the Collection
          </Link>
          <Link
            to="/account"
            className="inline-block border border-brand-dark/20 text-brand-dark font-heading text-xs uppercase tracking-widest px-10 py-4 hover:border-brand-dark transition-colors"
          >
            My Account
          </Link>
        </div>

        {/* Decorative line */}
        <div className="w-16 h-px bg-brand-secondary/40 mx-auto mt-10" />
      </div>
    </div>
  )
}
