import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../features/cart/cartStore'
import { Button } from '../ui/Button'
import { PriceDisplay } from '../ui/PriceDisplay'
import { QuantityStepper } from '../product/QuantityStepper'
import { formatPrice } from '../../lib/utils'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCartStore()
  const navigate = useNavigate()
  const [discountCode, setDiscountCode] = useState('')

  if (!isOpen) return null

  const total = subtotal()

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-brand-black/40 z-50 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-cream-dark">
          <h2 className="font-heading font-semibold uppercase tracking-widest text-sm">
            Your Cart ({items.reduce((s, i) => s + i.quantity, 0)})
          </h2>
          <button onClick={closeCart} className="text-brand-gray hover:text-brand-black transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <svg className="w-16 h-16 text-brand-gray-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <div>
                <p className="font-heading text-sm uppercase tracking-widest text-brand-charcoal">Your cart is empty</p>
                <p className="text-sm text-brand-gray mt-1 font-body">Discover our new collection</p>
              </div>
              <Button variant="secondary" size="sm" as="a" href="/shop" onClick={closeCart}>Shop Now</Button>
            </div>
          ) : (
            items.map(item => {
              const price = item.variant.price_override ?? (item.product.is_on_sale && item.product.sale_price ? item.product.sale_price : item.product.base_price)
              const image = item.product.product_images?.find(i => i.is_primary) ?? item.product.product_images?.[0]
              return (
                <div key={item.variantId} className="flex gap-4">
                  {image && (
                    <Link to={`/product/${item.product.slug}`} onClick={closeCart}>
                      <img src={image.thumb_url ?? image.url} alt={item.product.name}
                        className="w-20 h-24 object-cover bg-brand-cream-dark flex-shrink-0" />
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product.slug}`} onClick={closeCart}
                      className="font-body text-sm text-brand-charcoal hover:text-brand-black block leading-snug">
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-brand-gray mt-0.5 font-body">
                      {[item.variant.size, item.variant.color].filter(Boolean).join(' / ')}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(qty) => updateQuantity(item.variantId, qty)}
                        max={99}
                      />
                      <div className="text-right">
                        <p className="font-heading text-sm font-semibold">{formatPrice(price * item.quantity)}</p>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-xs text-brand-gray hover:text-brand-black transition-colors mt-1 underline font-body"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-brand-cream-dark px-6 py-5 space-y-4">
            {/* Discount */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Discount code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-1 border border-brand-gray-light px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-black"
              />
              <Button variant="outline" size="sm">Apply</Button>
            </div>

            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="font-heading text-xs uppercase tracking-widest text-brand-gray">Subtotal</span>
              <span className="font-heading text-base font-semibold">{formatPrice(total)}</span>
            </div>
            <p className="text-2xs text-brand-gray font-body">Shipping & taxes calculated at checkout</p>

            {/* Actions */}
            <Link to="/cart" onClick={closeCart}>
              <Button variant="secondary" size="md" fullWidth>View Cart</Button>
            </Link>
            <Button 
              variant="primary" 
              size="md" 
              fullWidth
              onClick={() => {
                closeCart()
                navigate('/checkout')
              }}
            >
              Checkout
            </Button>

            <button onClick={closeCart}
              className="w-full text-center text-xs text-brand-gray hover:text-brand-black transition-colors font-heading uppercase tracking-widest pt-1">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
