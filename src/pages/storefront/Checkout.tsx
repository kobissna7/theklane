import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../features/cart/cartStore'
import { useToastStore } from '../../features/toast/toastStore'
import { formatPrice } from '../../lib/utils'
import { Button } from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'

export default function Checkout() {
  const navigate = useNavigate()
  const items = useCartStore(state => state.items)
  const clearCart = useCartStore(state => state.clearCart)
  const subtotalFunc = useCartStore(state => state.subtotal)
  const total = subtotalFunc()
  const addToast = useToastStore(state => state.addToast)
  
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  })

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-heading text-3xl mb-4">Your Cart is Empty</h1>
        <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate network delay for checkout
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In a real app, we would create a Stripe PaymentIntent here, 
    // confirm it, and insert an Order row in Supabase.
    // For now, we simulate success.
    
    addToast('success', 'Order placed successfully! Thank you for shopping with us.')
    clearCart()
    navigate('/')
  }

  const tax = total * 0.08
  const shipping = total > 200 ? 0 : 15
  const finalTotal = total + tax + shipping

  return (
    <div className="bg-brand-cream min-h-screen pt-24 pb-32 animate-fade-in">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <h1 className="font-heading text-3xl md:text-4xl text-brand-black mb-12 text-center uppercase tracking-widest">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Form Section */}
          <div className="lg:col-span-7 space-y-12">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-12">
              
              {/* Contact Info */}
              <section>
                <h2 className="font-heading text-xl uppercase tracking-wider mb-6 pb-2 border-b border-brand-gray-light/30">Contact Information</h2>
                <div>
                  <label className="block font-heading text-xs tracking-widest uppercase text-brand-charcoal mb-2">Email Address</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-transparent border border-brand-gray-light p-3 focus:outline-none focus:border-brand-black transition-colors font-body" />
                </div>
              </section>

              {/* Shipping Info */}
              <section>
                <h2 className="font-heading text-xl uppercase tracking-wider mb-6 pb-2 border-b border-brand-gray-light/30">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-heading text-xs tracking-widest uppercase text-brand-charcoal mb-2">First Name</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-transparent border border-brand-gray-light p-3 focus:outline-none focus:border-brand-black transition-colors font-body" />
                  </div>
                  <div>
                    <label className="block font-heading text-xs tracking-widest uppercase text-brand-charcoal mb-2">Last Name</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-transparent border border-brand-gray-light p-3 focus:outline-none focus:border-brand-black transition-colors font-body" />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-heading text-xs tracking-widest uppercase text-brand-charcoal mb-2">Address</label>
                    <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-transparent border border-brand-gray-light p-3 focus:outline-none focus:border-brand-black transition-colors font-body" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block font-heading text-xs tracking-widest uppercase text-brand-charcoal mb-2">City</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-transparent border border-brand-gray-light p-3 focus:outline-none focus:border-brand-black transition-colors font-body" />
                  </div>
                  <div>
                    <label className="block font-heading text-xs tracking-widest uppercase text-brand-charcoal mb-2">State</label>
                    <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full bg-transparent border border-brand-gray-light p-3 focus:outline-none focus:border-brand-black transition-colors font-body" />
                  </div>
                  <div>
                    <label className="block font-heading text-xs tracking-widest uppercase text-brand-charcoal mb-2">Zip Code</label>
                    <input required type="text" name="zip" value={formData.zip} onChange={handleChange} className="w-full bg-transparent border border-brand-gray-light p-3 focus:outline-none focus:border-brand-black transition-colors font-body" />
                  </div>
                </div>
              </section>

              {/* Payment Info */}
              <section>
                <h2 className="font-heading text-xl uppercase tracking-wider mb-6 pb-2 border-b border-brand-gray-light/30">Payment Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block font-heading text-xs tracking-widest uppercase text-brand-charcoal mb-2">Card Number</label>
                    <input required type="text" placeholder="0000 0000 0000 0000" name="cardNumber" value={formData.cardNumber} onChange={handleChange} className="w-full bg-transparent border border-brand-gray-light p-3 focus:outline-none focus:border-brand-black transition-colors font-body" />
                  </div>
                  <div>
                    <label className="block font-heading text-xs tracking-widest uppercase text-brand-charcoal mb-2">Expiry (MM/YY)</label>
                    <input required type="text" placeholder="MM/YY" name="expiry" value={formData.expiry} onChange={handleChange} className="w-full bg-transparent border border-brand-gray-light p-3 focus:outline-none focus:border-brand-black transition-colors font-body" />
                  </div>
                  <div>
                    <label className="block font-heading text-xs tracking-widest uppercase text-brand-charcoal mb-2">CVV</label>
                    <input required type="text" placeholder="123" name="cvv" value={formData.cvv} onChange={handleChange} className="w-full bg-transparent border border-brand-gray-light p-3 focus:outline-none focus:border-brand-black transition-colors font-body" />
                  </div>
                </div>
              </section>

            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-brand-cream-dark p-8 sticky top-32">
              <h2 className="font-heading text-xl uppercase tracking-wider mb-6">Order Summary</h2>
              
              <div className="space-y-6 mb-8 max-h-96 overflow-y-auto pr-2">
                {items.map(item => {
                  const itemPrice = item.variant.price_override ?? item.product.sale_price ?? item.product.base_price
                  return (
                    <div key={item.variantId} className="flex gap-4">
                      <div className="w-20 h-24 bg-brand-cream flex-shrink-0">
                        {item.product.product_images?.[0] && (
                          <img src={item.product.product_images[0].thumb_url || item.product.product_images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <span className="font-heading text-sm uppercase tracking-wider">{item.product.name}</span>
                        <span className="font-body text-sm text-brand-gray mt-1">
                          {item.variant.size && `Size: ${item.variant.size}`}
                          {item.variant.size && item.variant.color && ' | '}
                          {item.variant.color && `Color: ${item.variant.color}`}
                        </span>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-body text-sm text-brand-gray">Qty: {item.quantity}</span>
                          <span className="font-body text-sm">{formatPrice(itemPrice * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-3 pt-6 border-t border-brand-gray-light/30 font-body text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-gray">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray">Estimated Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray">Shipping</span>
                  <span>{shipping === 0 ? 'Complimentary' : formatPrice(shipping)}</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-6 mt-6 border-t border-brand-gray-light/30">
                <span className="font-heading text-base tracking-widest uppercase">Total</span>
                <span className="font-body text-2xl">{formatPrice(finalTotal)}</span>
              </div>

              <div className="mt-10">
                <Button 
                  type="submit" 
                  form="checkout-form" 
                  variant="primary" 
                  size="lg" 
                  fullWidth 
                  disabled={isProcessing}
                  isLoading={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Pay ${formatPrice(finalTotal)}`}
                </Button>
                <p className="text-center text-xs font-body text-brand-gray mt-4">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
