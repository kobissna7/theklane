import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LocalCartItem, Product, ProductVariant } from '../../lib/types'

interface CartState {
  items: LocalCartItem[]
  isOpen: boolean
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  itemCount: () => number
  subtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, variant, quantity = 1) => {
        set(state => {
          const existing = state.items.find(i => i.variantId === variant.id)
          if (existing) {
            return { items: state.items.map(i => i.variantId === variant.id ? { ...i, quantity: i.quantity + quantity } : i), isOpen: true }
          }
          return { items: [...state.items, { variantId: variant.id, quantity, product, variant }], isOpen: true }
        })
      },

      removeItem: (variantId) => set(state => ({ items: state.items.filter(i => i.variantId !== variantId) })),

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) { get().removeItem(variantId); return }
        set(state => ({ items: state.items.map(i => i.variantId === variantId ? { ...i, quantity } : i) }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => {
        const price = i.variant.price_override ?? (i.product.is_on_sale && i.product.sale_price ? i.product.sale_price : i.product.base_price)
        return sum + price * i.quantity
      }, 0),
    }),
    { name: 'theklane-cart', partialize: (state) => ({ items: state.items }) }
  )
)
