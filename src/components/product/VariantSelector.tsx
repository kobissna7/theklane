import React from 'react'
import { cn } from '../../lib/utils'
import { getStockStatus } from '../../lib/utils'
import type { ProductVariant } from '../../lib/types'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariantId: string | null
  onSelect: (variant: ProductVariant) => void
  trackInventory: boolean
  groupBy?: 'size' | 'color'
}

export function VariantSelector({ variants, selectedVariantId, onSelect, trackInventory, groupBy = 'size' }: VariantSelectorProps) {
  const uniqueValues = [...new Set(variants.map(v => groupBy === 'size' ? v.size : v.color).filter(Boolean))]

  return (
    <div className="flex flex-wrap gap-2">
      {uniqueValues.map(value => {
        const variant = variants.find(v => (groupBy === 'size' ? v.size : v.color) === value)!
        const status = getStockStatus(variant, trackInventory)
        const isSelected = selectedVariantId === variant.id
        const isOutOfStock = status === 'out-of-stock'

        return (
          <button
            key={value}
            onClick={() => !isOutOfStock && onSelect(variant)}
            disabled={isOutOfStock}
            className={cn(
              'h-10 min-w-[2.5rem] px-3 font-heading text-xs uppercase tracking-wider border transition-all duration-150',
              isSelected
                ? 'bg-brand-black text-white border-brand-black'
                : isOutOfStock
                ? 'text-brand-gray-light border-brand-gray-light cursor-not-allowed line-through'
                : 'text-brand-charcoal border-brand-gray-light hover:border-brand-black hover:text-brand-black',
            )}
          >
            {value}
          </button>
        )
      })}
    </div>
  )
}
