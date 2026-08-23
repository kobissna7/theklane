import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Product } from '../../lib/types'
import { formatPrice } from '../../lib/utils'
import { useCartStore } from '../../features/cart/cartStore'
import { useToastStore } from '../../features/toast/toastStore'
import { VariantSelector } from '../../components/product/VariantSelector'
import { QuantityStepper } from '../../components/product/QuantityStepper'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { ProductCard } from '../../components/product/ProductCard'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [quantity, setQuantity] = useState(1)

  const addItem = useCartStore(state => state.addItem)
  const setIsOpen = useCartStore(state => state.setIsOpen)
  const addToast = useToastStore(state => state.addToast)

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return
      setLoading(true)
      const { data } = await supabase.from('products').select('*, product_images(id, url, thumb_url, is_primary), product_variants(*)').eq('slug', slug).single()
      if (data) {
        setProduct(data)
        const primary = data.product_images?.find((i: any) => i.is_primary)
        setSelectedImage(primary?.url || data.product_images?.[0]?.url || null)
        if (data.product_variants && data.product_variants.length > 0) {
          setSelectedVariantId(data.product_variants[0].id)
        }
        
        // Fetch related products
        const { data: related } = await supabase.from('products').select('*, product_images(id, url, is_primary)').eq('category_id', data.category_id).neq('id', data.id).limit(4)
        if (related) setRelatedProducts(related)
      }
      setLoading(false)
    }
    fetchProduct()
    window.scrollTo(0, 0)
  }, [slug])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-heading text-xs uppercase tracking-widest text-brand-gray">Loading...</div>
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-heading text-3xl mb-4">Product Not Found</h1>
        <Button onClick={() => navigate('/shop')}>Return to Shop</Button>
      </div>
    )
  }

  const selectedVariant = product.product_variants?.find(v => v.id === selectedVariantId)
  
  // Calculate display price (variant override takes precedence over product price)
  const displayPrice = selectedVariant?.price_override ?? product.sale_price ?? product.base_price
  const originalPrice = product.base_price
  const isOnSale = product.is_on_sale || (product.sale_price !== null && product.sale_price < product.base_price)

  const handleAddToCart = () => {
    if (!selectedVariant) {
      addToast('error', 'Please select an option.')
      return
    }
    
    if (selectedVariant.stock_quantity <= 0) {
      addToast('error', 'This item is out of stock.')
      return
    }

    addItem(product, selectedVariant, quantity)
    setIsOpen(true) // Open cart drawer
  }

  return (
    <div className="bg-brand-cream min-h-screen pt-24 pb-32 animate-fade-in">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Breadcrumb (simplified) */}
        <div className="text-xs font-body tracking-wider uppercase text-brand-gray mb-8">
          <span className="cursor-pointer hover:text-brand-black transition-colors" onClick={() => navigate('/')}>Home</span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:text-brand-black transition-colors" onClick={() => navigate('/shop')}>Shop</span>
          <span className="mx-2">/</span>
          <span className="text-brand-black">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-product bg-brand-cream-dark w-full overflow-hidden">
              {selectedImage ? (
                <img src={selectedImage} alt={product.name} className="w-full h-full object-cover object-center" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-gray">No image available</div>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.product_images && product.product_images.length > 1 && (
              <div className="grid grid-cols-5 gap-4">
                {product.product_images.map((img) => (
                  <button
                    key={img.id}
                    className={`aspect-product bg-brand-cream-dark overflow-hidden focus:outline-none transition-all ${
                      selectedImage === img.url ? 'ring-1 ring-brand-black ring-offset-2 ring-offset-brand-cream opacity-100' : 'opacity-60 hover:opacity-100'
                    }`}
                    onClick={() => setSelectedImage(img.url)}
                  >
                    <img src={img.thumb_url || img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            
            <div className="mb-6 flex flex-wrap gap-2">
              {product.is_new_arrival && <Badge variant="dark">New Arrival</Badge>}
              {isOnSale && <Badge variant="accent">Sale</Badge>}
            </div>

            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-brand-black mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-3 mb-8">
              <span className="font-body text-xl text-brand-black">
                {formatPrice(displayPrice)}
              </span>
              {isOnSale && (
                <span className="font-body text-lg text-brand-gray-light line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            <div className="prose prose-sm font-body text-brand-charcoal mb-10 max-w-none">
              <p className="leading-relaxed">{product.description}</p>
            </div>

            {/* Selection Area */}
            {product.product_variants && product.product_variants.length > 0 && (
              <div className="mb-8">
                <VariantSelector
                  variants={product.product_variants}
                  selectedVariantId={selectedVariantId}
                  onSelect={setSelectedVariantId}
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 mb-12 border-t border-brand-gray-light/30 pt-8">
              <div className="flex-shrink-0">
                <QuantityStepper
                  quantity={quantity}
                  onChange={setQuantity}
                  max={selectedVariant?.stock_quantity || 1}
                />
              </div>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={!selectedVariant || selectedVariant.stock_quantity <= 0}
                onClick={handleAddToCart}
              >
                {!selectedVariant
                  ? 'Select Option'
                  : selectedVariant.stock_quantity <= 0
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </Button>
            </div>

            {/* Product Details Accordion Stubs */}
            <div className="border-t border-brand-gray-light/30 divide-y divide-brand-gray-light/30">
              {product.materials && (
                <details className="group py-4">
                  <summary className="flex justify-between items-center font-heading text-sm tracking-widest uppercase cursor-pointer list-none">
                    <span>Materials</span>
                    <span className="transition group-open:rotate-180">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                      </svg>
                    </span>
                  </summary>
                  <div className="font-body text-sm text-brand-gray mt-4 leading-relaxed">
                    {product.materials}
                  </div>
                </details>
              )}
              {product.care_instructions && (
                <details className="group py-4">
                  <summary className="flex justify-between items-center font-heading text-sm tracking-widest uppercase cursor-pointer list-none">
                    <span>Care Instructions</span>
                    <span className="transition group-open:rotate-180">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                      </svg>
                    </span>
                  </summary>
                  <div className="font-body text-sm text-brand-gray mt-4 leading-relaxed">
                    {product.care_instructions}
                  </div>
                </details>
              )}
              <details className="group py-4">
                <summary className="flex justify-between items-center font-heading text-sm tracking-widest uppercase cursor-pointer list-none">
                  <span>Shipping & Returns</span>
                  <span className="transition group-open:rotate-180">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                    </svg>
                  </span>
                </summary>
                <div className="font-body text-sm text-brand-gray mt-4 leading-relaxed space-y-2">
                  <p>Complimentary standard shipping on all orders over $200.</p>
                  <p>Returns accepted within 14 days of delivery. Items must be unworn with original tags attached.</p>
                </div>
              </details>
            </div>
            
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-32">
            <h2 className="font-heading text-2xl uppercase tracking-widest text-center mb-12">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {relatedProducts.map(rp => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
