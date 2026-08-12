import React from 'react'
import { formatPrice } from '../../lib/utils'
import { cn } from '../../lib/utils'

interface PriceDisplayProps {
  basePrice: number
  salePrice?: number | null
  isOnSale?: boolean
  priceOverride?: number | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PriceDisplay({ basePrice, salePrice, isOnSale, priceOverride, size = 'md', className }: PriceDisplayProps) {
  const displayPrice = priceOverride ?? basePrice
  const showSale = isOnSale && salePrice && salePrice < displayPrice

  const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' }

  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      {showSale ? (
        <>
          <span className={cn('font-heading font-semibold text-brand-black', textSizes[size])}>
            {formatPrice(salePrice!)}
          </span>
          <span className={cn('line-through text-brand-gray', size === 'lg' ? 'text-base' : 'text-sm')}>
            {formatPrice(displayPrice)}
          </span>
        </>
      ) : (
        <span className={cn('font-heading font-semibold text-brand-black', textSizes[size])}>
          {formatPrice(displayPrice)}
        </span>
      )}
    </div>
  )
}
