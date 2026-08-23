import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ProductCard } from '../../components/product/ProductCard'
import { supabase } from '../../lib/supabase'
import type { Product, Category, Collection } from '../../lib/types'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()

  const [category, setCategory] = useState<Category | null>(null)
  const [collection, setCollection] = useState<Collection | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!slug) return
      setLoading(true)

      // Check category
      const { data: catData } = await supabase.from('categories').select('*').eq('slug', slug).single()
      if (catData) {
        setCategory(catData)
        const { data: prods } = await supabase.from('products').select('*, product_images(url, is_primary), product_variants(size, color, stock_quantity, price_override)').eq('category_id', catData.id).eq('is_active', true)
        setProducts(prods || [])
      } else {
        // Check collection
        const { data: colData } = await supabase.from('collections').select('*').eq('slug', slug).single()
        if (colData) {
          setCollection(colData)
          // Since we don't have a direct many-to-many collection mapping right now, we fallback to hardcoded slugs for demo,
          // or fetch all active products for normal collections.
          let query = supabase.from('products').select('*, product_images(url, is_primary), product_variants(size, color, stock_quantity, price_override)').eq('is_active', true)
          if (slug === 'best-sellers') query = query.eq('is_featured', true)
          if (slug === 'new-arrivals') query = query.eq('is_new_arrival', true)
          
          const { data: prods } = await query
          setProducts(prods || [])
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [slug])

  const title = category?.name || collection?.name || slug || 'Collection'

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-heading text-xs uppercase tracking-widest text-brand-gray">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-brand-base">
      {/* Category Hero Banner */}
      <div className="relative h-48 sm:h-64 bg-brand-neutral flex items-end">
        <div className="absolute inset-0">
          {(category?.image_url || collection?.image_url) && (
            <img
              src={category?.image_url || collection?.image_url || ''}
              alt={title}
              className="w-full h-full object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-brand-dark/20" />
        </div>
        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
          {/* Breadcrumb */}
          <nav className="mb-3 flex items-center gap-2 text-xs font-body text-brand-dark/60">
            <Link to="/" className="hover:text-brand-dark transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-brand-dark transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-brand-dark">{title}</span>
          </nav>
          <h1 className="font-heading text-3xl sm:text-5xl font-normal tracking-wide text-brand-dark">
            {title}
          </h1>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="font-body text-sm text-brand-dark/50 mb-8">{products.length} pieces</p>

        {products.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-heading text-2xl text-brand-dark/40 mb-4">No pieces here yet</p>
            <p className="font-body text-brand-dark/40 mb-8">Check back soon — new drops coming.</p>
            <Link
              to="/shop"
              className="inline-block bg-brand-secondary text-white px-8 py-3 font-body text-sm hover:bg-brand-secondary/90 transition-colors"
            >
              Shop All
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
