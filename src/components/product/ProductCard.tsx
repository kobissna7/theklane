import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge'
import { PriceDisplay } from '../ui/PriceDisplay'
import { Button } from '../ui/Button'
import { useCartStore } from '../../features/cart/cartStore'
import { useToastStore } from '../../features/toast/toastStore'
import type { Product } from '../../lib/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { addItem } = useCartStore()
  const { addToast } = useToastStore()

  const primaryImage = product.product_images?.find(i => i.is_primary) ?? product.product_images?.[0]
  const secondaryImage = product.product_images?.[1]
  const hasVariants = (product.product_variants?.length ?? 0) > 1
  const firstVariant = product.product_variants?.[0]

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!firstVariant || hasVariants) return
    addItem(product, firstVariant, 1)
    addToast('success', `${product.name} added to cart`)
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div className="relative overflow-hidden aspect-product bg-brand-cream-dark">
        {primaryImage && (
          <img
            src={isHovered && secondaryImage ? secondaryImage.url : primaryImage.url}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-500 ease-brand group-hover:scale-[1.02]"
            loading="lazy"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.is_on_sale && <Badge variant="sale" />}
          {product.is_new_arrival && !product.is_on_sale && <Badge variant="new" />}
        </div>

        {/* Quick add overlay */}
        <div className={`absolute bottom-0 inset-x-0 p-3 transition-all duration-300 ease-brand ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleQuickAdd}
            className="text-2xs py-2.5"
          >
            {hasVariants ? 'Choose Options' : 'Add to Cart'}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="pt-3 space-y-1">
        <p className="font-body text-sm text-brand-charcoal group-hover:text-brand-black transition-colors leading-snug">
          {product.name}
        </p>
        <PriceDisplay
          basePrice={product.base_price}
          salePrice={product.sale_price}
          isOnSale={product.is_on_sale}
          size="sm"
        />
      </div>
    </Link>
  )
}
