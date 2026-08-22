import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { useToastStore } from '../../features/toast/toastStore'
import { convertToWebp } from '../../lib/image'
import { supabase } from '../../lib/supabase'
import type { Product } from '../../lib/types'

export default function AdminProducts() {
  const addToast = useToastStore(state => state.addToast)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images ( id, url, is_primary )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProducts(data || [])
    } catch (err: any) {
      addToast('error', err.message || 'Failed to load products.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    addToast('info', 'Processing image (converting to webp)...')
    
    try {
      // 1. Convert to WebP
      const webpFile = await convertToWebp(file)
      
      // 2. Upload to Supabase Storage
      const fileName = `${productId}-${Date.now()}.webp`
      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(fileName, webpFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public-assets')
        .getPublicUrl(fileName)

      // 4. Save to product_images table
      const { error: dbError } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          url: publicUrl,
          is_primary: true // Make first uploaded image primary for simplicity
        })

      if (dbError) throw dbError

      addToast('success', 'Image uploaded successfully!')
      fetchProducts() // Refresh to show new image

    } catch (err: any) {
      addToast('error', err.message || 'Failed to upload image.')
    }
  }

  const toggleProductActive = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId)
      
      if (error) throw error
      addToast('success', 'Product status updated.')
      fetchProducts()
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update product.')
    }
  }

  return (
    <div className="bg-white p-8 shadow-sm border border-brand-dark/5">
      <div className="flex justify-between items-center mb-6 border-b border-brand-dark/10 pb-4">
        <h2 className="font-heading text-xl uppercase tracking-widest">Manage Products</h2>
        <Button variant="primary" size="sm">Add New Product</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-brand-dark/50 font-body">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-body text-brand-dark/70 mb-4">No products found in the database.</p>
          <p className="text-sm text-brand-dark/50">Run the SQL script to insert mock products, or add one here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-dark/10">
                <th className="py-3 px-4 font-heading uppercase tracking-widest text-xs text-brand-dark/60">Image</th>
                <th className="py-3 px-4 font-heading uppercase tracking-widest text-xs text-brand-dark/60">Product</th>
                <th className="py-3 px-4 font-heading uppercase tracking-widest text-xs text-brand-dark/60">Price</th>
                <th className="py-3 px-4 font-heading uppercase tracking-widest text-xs text-brand-dark/60">Status</th>
                <th className="py-3 px-4 font-heading uppercase tracking-widest text-xs text-brand-dark/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body text-sm">
              {products.map(product => {
                const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0]
                return (
                  <tr key={product.id} className="border-b border-brand-dark/5 hover:bg-brand-neutral/30 transition-colors">
                    <td className="py-3 px-4">
                      {primaryImage ? (
                        <img src={primaryImage.url} alt={product.name} className="w-12 h-16 object-cover" />
                      ) : (
                        <div className="w-12 h-16 bg-brand-dark/5 flex items-center justify-center text-xs text-brand-dark/40">No Img</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-brand-dark">{product.name}</p>
                      <p className="text-xs text-brand-dark/50 mt-1">{product.slug}</p>
                    </td>
                    <td className="py-3 px-4">
                      ${product.base_price}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-none ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.is_active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        {/* Custom file upload button */}
                        <label className="cursor-pointer text-xs uppercase tracking-widest text-brand-secondary hover:text-brand-dark transition-colors">
                          Upload Image
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, product.id)} 
                          />
                        </label>
                        
                        <button 
                          onClick={() => toggleProductActive(product.id, product.is_active)}
                          className="text-xs uppercase tracking-widest text-brand-dark/50 hover:text-brand-dark transition-colors"
                        >
                          {product.is_active ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
