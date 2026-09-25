import React from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  isLoading?: boolean
  as?: 'button' | 'a'
  href?: string
}

export function Button({
  variant = 'primary', size = 'md', fullWidth = false, loading = false, isLoading = false,
  className, children, disabled, as: Tag = 'button', href, ...props
}: ButtonProps) {
  const isSpinning = loading || isLoading
  const base = 'inline-flex items-center justify-center font-heading font-semibold uppercase tracking-widest transition-all duration-200 ease-brand disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2'

  const variants = {
    primary: 'bg-brand-black text-white hover:bg-brand-charcoal active:scale-[0.98] focus-visible:outline-brand-black',
    secondary: 'bg-brand-cream text-brand-black border border-brand-black hover:bg-brand-black hover:text-white focus-visible:outline-brand-black',
    ghost: 'text-brand-black hover:bg-brand-cream-dark focus-visible:outline-brand-black',
    outline: 'border border-brand-gray-light text-brand-charcoal hover:border-brand-black hover:text-brand-black focus-visible:outline-brand-black',
  }

  const sizes = {
    sm: 'px-4 py-2 text-2xs',
    md: 'px-6 py-3 text-xs',
    lg: 'px-10 py-4 text-sm',
  }

  const classes = cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)

  if (Tag === 'a') {
    return <a href={href} className={classes}>{children}</a>
  }

  return (
    <button className={classes} disabled={disabled || isSpinning} {...props}>
      {isSpinning ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  )
}
