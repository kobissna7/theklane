import React, { useState, useEffect, useMemo } from 'react'
import { ProductCard } from '../../components/product/ProductCard'
import { supabase } from '../../lib/supabase'
import { SIZES, COLORS } from '../../lib/mockData'
import type { SortOption, FilterState, Product, Category } from '../../lib/types'

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Selling', value: 'best-selling' },
]

export default function Shop() {
  const [sort, setSort] = useState<SortOption>('newest')
  const [filters, setFilters] = useState<FilterState>({ categories: [], sizes: [], colors: [], priceMin: null, priceMax: null })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*, product_images(url, is_primary), product_variants(size, color, stock_quantity, price_override)').eq('is_active', true),
        supabase.from('categories').select('*').eq('is_active', true).is('parent_id', null)
      ])
      setAllProducts(prods || [])
      setCategories(cats || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const products = useMemo(() => {
    let p = [...allProducts]

    if (filters.categories.length > 0) p = p.filter(prod => prod.category_id && filters.categories.includes(prod.category_id))
    if (filters.sizes.length > 0) p = p.filter(prod => prod.product_variants?.some(v => v.size && filters.sizes.includes(v.size)))
    if (filters.colors.length > 0) p = p.filter(prod => prod.product_variants?.some(v => v.color && filters.colors.includes(v.color)))
    if (filters.priceMin !== null) p = p.filter(prod => prod.base_price >= filters.priceMin!)
    if (filters.priceMax !== null) p = p.filter(prod => prod.base_price <= filters.priceMax!)

    switch (sort) {
      case 'newest': return p.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'price-asc': return p.sort((a, b) => a.base_price - b.base_price)
      case 'price-desc': return p.sort((a, b) => b.base_price - a.base_price)
      case 'best-selling': return p.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
      default: return p
    }
  }, [sort, filters, allProducts])

  const toggleFilter = (key: keyof FilterState, value: string) => {
    setFilters(f => {
      const arr = f[key] as string[]
      return { ...f, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
    })
  }

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-heading font-semibold text-3xl sm:text-4xl uppercase tracking-wider">Shop All</h1>
        <p className="text-sm text-brand-gray font-body mt-2">{products.length} pieces</p>
      </div>

      <div className="flex gap-10">
        {/* Sidebar Filters — Desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <FilterSidebar filters={filters} setFilters={setFilters} toggleFilter={toggleFilter} categories={categories} />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-8">
            <button
              className="lg:hidden flex items-center gap-2 font-heading text-xs uppercase tracking-widest border border-brand-gray-light px-4 py-2"
              onClick={() => setFiltersOpen(true)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filter
            </button>
            <div className="ml-auto flex items-center gap-3">
              <label className="font-heading text-xs uppercase tracking-widest text-brand-gray">Sort</label>
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortOption)}
                className="border border-brand-gray-light text-sm font-body px-3 py-2 focus:outline-none focus:border-brand-black"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Product grid */}
          {products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-heading text-sm uppercase tracking-widest text-brand-gray">No products found</p>
              <button onClick={() => setFilters({ categories: [], sizes: [], colors: [], priceMin: null, priceMax: null })}
                className="mt-4 text-sm underline text-brand-charcoal font-body">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterSidebar({ filters, setFilters, toggleFilter, categories }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-heading text-2xs uppercase tracking-widest text-brand-gray mb-4">Category</h3>
        <div className="space-y-2">
          {categories.map((cat: any) => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat.id)}
                onChange={() => toggleFilter('categories', cat.id)}
                className="w-4 h-4 border-brand-gray-light"
              />
              <span className="font-body text-sm text-brand-charcoal group-hover:text-brand-black">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-heading text-2xs uppercase tracking-widest text-brand-gray mb-4">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <button
              key={size}
              onClick={() => toggleFilter('sizes', size)}
              className={`h-9 w-12 border font-heading text-xs uppercase transition-all ${
                filters.sizes.includes(size) ? 'bg-brand-black text-white border-brand-black' : 'border-brand-gray-light text-brand-gray hover:border-brand-black'
              }`}
            >{size}</button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-heading text-2xs uppercase tracking-widest text-brand-gray mb-4">Color</h3>
        <div className="space-y-2">
          {COLORS.map(color => (
            <label key={color} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.colors.includes(color)}
                onChange={() => toggleFilter('colors', color)}
                className="w-4 h-4 border-brand-gray-light"
              />
              <span className="font-body text-sm text-brand-charcoal group-hover:text-brand-black">{color}</span>
            </label>
          ))}
        </div>
      </div>
      <button
        onClick={() => setFilters({ categories: [], sizes: [], colors: [], priceMin: null, priceMax: null })}
        className="font-heading text-2xs uppercase tracking-widest text-brand-gray underline hover:text-brand-black transition-colors"
      >
        Clear All
      </button>
    </div>
  )
}
