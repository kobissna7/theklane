import React, { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ProductCard } from '../../components/product/ProductCard'
import { mockProducts, mockCategories, mockCollections } from '../../lib/mockData'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()

  // Check if it's a category or collection
  const category = mockCategories.find(c => c.slug === slug)
  const collection = mockCollections.find(c => c.slug === slug)

  const title = category?.name || collection?.name || slug || 'Collection'

  const products = useMemo(() => {
    if (category) {
      return mockProducts.filter(p => p.is_active && p.category_id === category.id)
    }
    if (collection) {
      // For now, show featured products in collections
      if (collection.slug === 'best-sellers') return mockProducts.filter(p => p.is_featured)
      if (collection.slug === 'new-arrivals') return mockProducts.filter(p => p.is_new_arrival)
      return mockProducts.filter(p => p.is_active)
    }
    return mockProducts.filter(p => p.is_active)
  }, [slug, category, collection])

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
