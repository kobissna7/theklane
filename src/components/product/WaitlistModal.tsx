import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToastStore } from '../../features/toast/toastStore'

interface WaitlistModalProps {
  productId: string
  productName: string
  productSlug: string
  isOpen: boolean
  onClose: () => void
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

// Share helpers
function getShareUrl(slug: string) {
  return `${window.location.origin}/product/${slug}`
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  })
}

interface ShareButtonProps {
  href?: string
  onClick?: () => void
  color: string
  label: string
  icon: React.ReactNode
}

function ShareButton({ href, onClick, color, label, icon }: ShareButtonProps) {
  const classes = `flex flex-col items-center gap-1.5 group cursor-pointer`
  const inner = (
    <>
      <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center text-white text-sm shadow-sm group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
      <span className="font-heading text-2xs uppercase tracking-widest text-brand-dark/50">{label}</span>
    </>
  )

  if (href) return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>{inner}</a>
  )
  return <button onClick={onClick} className={classes}>{inner}</button>
}

export function WaitlistModal({ productId, productName, productSlug, isOpen, onClose }: WaitlistModalProps) {
  const addToast = useToastStore(s => s.addToast)
  const [step, setStep] = useState<'join' | 'share'>('join')
  const [form, setForm] = useState({ name: '', email: '', size: '' })
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const shareUrl = getShareUrl(productSlug)
  const shareText = `Just spotted "${productName}" at theKlane — join the waitlist or shop the collection:`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email) return
    setSaving(true)
    try {
      const { error } = await supabase.from('waitlist_entries').insert({
        product_id: productId,
        name: form.name || null,
        email: form.email,
        size: form.size || null,
      })
      if (error && !error.message.includes('duplicate')) throw error
      addToast('success', "You're on the list! We'll notify you when it's back.")
      setStep('share')
    } catch (err: any) {
      if (err.message?.includes('duplicate')) {
        addToast('success', "You're already on the waitlist!")
        setStep('share')
      } else {
        addToast('error', err.message || 'Something went wrong')
      }
    } finally { setSaving(false) }
  }

  const handleCopy = () => {
    copyToClipboard(shareUrl)
    setCopied(true)
    addToast('success', 'Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const encodedText = encodeURIComponent(shareText)
  const encodedUrl = encodeURIComponent(shareUrl)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-in-up sm:animate-fade-up">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-heading text-2xs uppercase tracking-widest text-brand-secondary mb-1">
                {step === 'join' ? 'Join Waitlist' : 'Share This Piece'}
              </p>
              <h2 className="font-heading text-lg text-brand-dark leading-snug">{productName}</h2>
            </div>
            <button onClick={onClose} className="ml-4 mt-0.5 text-brand-dark/30 hover:text-brand-dark transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {step === 'join' ? (
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            <p className="font-body text-sm text-brand-dark/50 leading-relaxed">
              We'll send you an email the moment this item is back in stock.
            </p>

            <div>
              <label className="block font-heading text-2xs uppercase tracking-widest text-brand-dark/50 mb-1.5">Name (optional)</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:border-brand-secondary text-brand-dark placeholder:text-brand-dark/25 transition-colors"
              />
            </div>

            <div>
              <label className="block font-heading text-2xs uppercase tracking-widest text-brand-dark/50 mb-1.5">Email <span className="text-brand-secondary">*</span></label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:border-brand-secondary text-brand-dark placeholder:text-brand-dark/25 transition-colors"
              />
            </div>

            <div>
              <label className="block font-heading text-2xs uppercase tracking-widest text-brand-dark/50 mb-2">Size (optional)</label>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, size: f.size === s ? '' : s }))}
                    className={`h-8 w-10 border rounded-lg font-heading text-xs transition-all ${
                      form.size === s
                        ? 'border-brand-secondary bg-brand-secondary text-white'
                        : 'border-gray-200 text-brand-dark/60 hover:border-brand-dark/30'
                    }`}
                  >{s}</button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !form.email}
              className="w-full bg-brand-secondary text-white rounded-lg py-3 font-heading text-2xs uppercase tracking-widest hover:bg-brand-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {saving ? 'Joining...' : 'Notify Me When Available'}
            </button>

            <button
              type="button"
              onClick={() => setStep('share')}
              className="w-full text-center font-heading text-2xs uppercase tracking-widest text-brand-dark/30 hover:text-brand-dark/50 transition-colors py-1"
            >
              Skip — just share
            </button>
          </form>
        ) : (
          <div className="px-6 pb-6 space-y-5">
            <p className="font-body text-sm text-brand-dark/50 leading-relaxed">
              Love this piece? Share it with your community — the more eyes, the sooner it might restock.
            </p>

            {/* Social share grid */}
            <div className="flex justify-center gap-5 py-2">
              <ShareButton
                href={`https://instagram.com`}
                color="bg-gradient-to-br from-pink-500 to-purple-600"
                label="Instagram"
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                }
              />
              <ShareButton
                href={`https://www.tiktok.com`}
                color="bg-brand-black"
                label="TikTok"
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.41a8.16 8.16 0 004.77 1.52V7.48a4.85 4.85 0 01-1-.79z"/>
                  </svg>
                }
              />
              <ShareButton
                href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
                color="bg-green-500"
                label="WhatsApp"
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                }
              />
              <ShareButton
                href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                color="bg-black"
                label="X / Twitter"
                icon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                }
              />
            </div>

            {/* Copy link */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
              <p className="flex-1 text-xs font-body text-brand-dark/50 truncate">{shareUrl}</p>
              <button
                onClick={handleCopy}
                className={`flex-shrink-0 font-heading text-2xs uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-brand-secondary/10 text-brand-secondary hover:bg-brand-secondary/20'
                }`}
              >
                {copied ? 'Copied ✓' : 'Copy Link'}
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full text-center font-heading text-2xs uppercase tracking-widest text-brand-dark/30 hover:text-brand-dark/50 transition-colors py-1"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
