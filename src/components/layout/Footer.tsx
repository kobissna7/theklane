import React from 'react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-brand-black text-white mt-auto">
      {/* Main footer */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="inline-block">
              <span className="klane-logo text-white font-logo font-light text-2xl tracking-[0.18em] uppercase select-none">
                KLANÉ
              </span>
            </Link>
            <p className="mt-4 text-sm text-white/60 font-body max-w-xs leading-relaxed">
              For the woman who has found her voice through fashion. Clothes are not just what we wear — they are who we are.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {['instagram', 'tiktok', 'pinterest'].map(social => (
                <a key={social} href={`https://${social}.com/theklane`} target="_blank" rel="noopener noreferrer"
                  className="text-white/40 hover:text-white transition-colors capitalize text-2xs font-heading uppercase tracking-widest">
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-heading text-2xs uppercase tracking-widest text-white/40 mb-4">Shop</h3>
            <ul className="space-y-3">
              {[
                ['All Products', '/shop'],
                ['Dresses', '/category/dresses'],
                ['Tops', '/category/tops'],
                ['Sets', '/category/sets'],
                ['Bottoms', '/category/bottoms'],
                ['New Arrivals', '/collections/new-arrivals'],
              ].map(([label, href]) => (
                <li key={href}><Link to={href} className="text-sm text-white/60 hover:text-white transition-colors font-body">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-heading text-2xs uppercase tracking-widest text-white/40 mb-4">Company</h3>
            <ul className="space-y-3">
              {[
                ['Our Brand', '/brand'],
                ['Contact Us', '/contact'],
                ['FAQ', '/faqs'],
                ['Size Chart', '/size-chart'],
              ].map(([label, href]) => (
                <li key={href}><Link to={href} className="text-sm text-white/60 hover:text-white transition-colors font-body">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-heading text-2xs uppercase tracking-widest text-white/40 mb-4">Help</h3>
            <ul className="space-y-3">
              {[
                ['Shipping Info', '/pages/shipping'],
                ['Returns & Exchanges', '/pages/returns'],
                ['Privacy Policy', '/pages/privacy'],
                ['Terms of Service', '/pages/terms'],
              ].map(([label, href]) => (
                <li key={href}><Link to={href} className="text-sm text-white/60 hover:text-white transition-colors font-body">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-2xs text-white/30 font-body">
            &copy; {new Date().getFullYear()} theKlane. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {['visa', 'mastercard', 'amex', 'paypal'].map(method => (
              <span key={method} className="text-2xs text-white/30 font-heading uppercase tracking-wider">{method}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
