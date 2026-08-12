import React from 'react'
import { cn } from '../../lib/utils'

interface BadgeProps {
  variant?: 'sale' | 'new' | 'low-stock' | 'out-of-stock' | 'default'
  className?: string
  children?: React.ReactNode
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  const base = 'inline-flex items-center px-2 py-0.5 font-heading font-semibold uppercase tracking-widest text-2xs'

  const variants = {
    sale: 'bg-brand-black text-white',
    new: 'border border-brand-black text-brand-black',
    'low-stock': 'text-amber-700 border border-amber-300 bg-amber-50',
    'out-of-stock': 'text-brand-gray border border-brand-gray-light',
    default: 'bg-brand-cream text-brand-charcoal border border-brand-gray-light',
  }

  const labels = { sale: 'Sale', new: 'New', 'low-stock': 'Low Stock', 'out-of-stock': 'Sold Out', default: '' }

  return (
    <span className={cn(base, variants[variant], className)}>
      {children ?? labels[variant]}
    </span>
  )
}
