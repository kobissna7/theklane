import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { convertToWebp } from '../../lib/image'
import { useToastStore } from '../../features/toast/toastStore'
import { Button } from '../../components/ui/Button'
import { Modal, Field, inputClass, textareaClass, selectClass } from '../../components/admin/AdminModal'
import type { Product, Category, Collection } from '../../lib/types'

const emptyForm = {
  name: '', slug: '', description: '', materials: '', care_instructions: '',
  base_price: '', sale_price: '', category_id: '', collection_id: '',
  is_active: true, is_featured: false, is_new_arrival: false, is_on_sale: false,
}

export default function AdminProducts() {
  const addToast = useToastStore(s => s.addToast)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: prods }, { data: cats }, { data: cols }] = await Promise.all([
      supabase.from('products').select('*, product_images(id, url, is_primary, position), category:categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name').order('sort_order'),
      supabase.from('collections').select('id, name').order('sort_order'),
    ])
    setProducts(prods || [])
    setCategories(cats || [])
    setCollections(cols || [])
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name, slug: p.slug, description: p.description || '', materials: p.materials || '',
      care_instructions: p.care_instructions || '', base_price: String(p.base_price),
      sale_price: p.sale_price ? String(p.sale_price) : '', category_id: p.category_id || '',
      collection_id: '', is_active: p.is_active, is_featured: p.is_featured,
      is_new_arrival: p.is_new_arrival, is_on_sale: p.is_on_sale,
    })
    setModalOpen(true)
  }

  function handleNameChange(name: string) {
    setForm(f => ({ ...f, name, slug: editing ? f.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, productId: string) {
    if (!e.target.files?.[0]) return
    setUploadingFor(productId)
    try {
      const webp = await convertToWebp(e.target.files[0])
      const fileName = `products/${productId}-${Date.now()}.webp`
      const { error: upErr } = await supabase.storage.from('public-assets').upload(fileName, webp, { upsert: false })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(fileName)
      const existingImages = products.find(p => p.id === productId)?.product_images || []
      const isPrimary = existingImages.length === 0
      const { error: dbErr } = await supabase.from('product_images').insert({ product_id: productId, url: publicUrl, is_primary: isPrimary, position: existingImages.length })
      if (dbErr) throw dbErr
      addToast('success', 'Image uploaded!')
      fetchAll()
    } catch (err: any) { addToast('error', err.message) }
    finally { setUploadingFor(null) }
  }

  async function handleDeleteImage(imageId: string) {
    if (!confirm('Remove this image?')) return
    const { error } = await supabase.from('product_images').delete().eq('id', imageId)
    if (error) addToast('error', error.message)
    else { addToast('success', 'Image removed'); fetchAll() }
  }

  async function handleSave() {
    if (!form.name || !form.base_price) return addToast('error', 'Name and price are required')
    setSaving(true)
    try {
      const payload = {
        name: form.name, slug: form.slug, description: form.description || null,
        materials: form.materials || null, care_instructions: form.care_instructions || null,
        base_price: parseFloat(form.base_price), sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        category_id: form.category_id || null, is_active: form.is_active, is_featured: form.is_featured,
        is_new_arrival: form.is_new_arrival, is_on_sale: form.is_on_sale, track_inventory: false,
      }
      let productId = editing?.id
      if (editing) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing.id)
        if (error) throw error
        addToast('success', 'Product updated!')
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select().single()
        if (error) throw error
        productId = data.id
        // Add to collection if selected
        if (form.collection_id && productId) {
          await supabase.from('collection_products').insert({ collection_id: form.collection_id, product_id: productId }).select()
        }
        addToast('success', 'Product created! Now upload images below.')
      }
      setModalOpen(false)
      fetchAll()
    } catch (err: any) { addToast('error', err.message) }
    finally { setSaving(false) }
  }

  async function toggleActive(productId: string, current: boolean) {
    const { error } = await supabase.from('products').update({ is_active: !current }).eq('id', productId)
    if (error) addToast('error', error.message)
    else fetchAll()
  }

  async function handleDelete(productId: string) {
    if (!confirm('Delete this product and all its images?')) return
    await supabase.from('product_images').delete().eq('product_id', productId)
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) addToast('error', error.message)
    else { addToast('success', 'Product deleted'); fetchAll() }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white p-8 shadow-sm border border-brand-dark/5">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-6 border-b border-brand-dark/10 pb-4">
        <h2 className="font-heading text-xl uppercase tracking-widest">Products</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <input
            type="search" placeholder="Search products..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 sm:w-48 border border-brand-dark/20 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-secondary"
          />
          <Button variant="primary" size="sm" onClick={openAdd}>Add Product</Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-12 text-brand-dark/40 font-body">Loading products...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-12 text-brand-dark/40 font-body italic">
          {searchTerm ? 'No products match your search.' : 'No products yet. Add one to get started.'}
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map(product => {
            const primaryImage = product.product_images?.find(i => i.is_primary) || product.product_images?.[0]
            return (
              <div key={product.id} className="border border-brand-dark/10 p-4">
                <div className="flex gap-4">
                  {/* Primary image */}
                  <div className="flex-shrink-0 w-20 h-24 bg-brand-dark/5 overflow-hidden">
                    {primaryImage ? (
                      <img src={primaryImage.url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-brand-dark/30 font-body text-center px-1">No Image</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 items-start justify-between">
                      <div>
                        <p className="font-heading uppercase tracking-widest text-sm text-brand-dark">{product.name}</p>
                        <p className="text-xs text-brand-dark/50 font-body mt-0.5">{product.slug}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {product.is_featured && <span className="px-2 py-0.5 text-xs bg-brand-primary/30 text-brand-secondary">Featured</span>}
                        {product.is_new_arrival && <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700">New</span>}
                        {product.is_on_sale && <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700">Sale</span>}
                        <span className={`px-2 py-0.5 text-xs ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.is_active ? 'Active' : 'Draft'}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-2">
                      <p className="text-sm font-body text-brand-dark font-medium">${product.base_price}</p>
                      {product.sale_price && <p className="text-sm font-body text-brand-secondary">${product.sale_price} sale</p>}
                      {product.category && <p className="text-xs font-body text-brand-dark/50">{product.category.name}</p>}
                    </div>

                    {/* Image row */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {product.product_images?.map(img => (
                        <div key={img.id} className="relative group w-10 h-10">
                          <img src={img.url} className="w-full h-full object-cover" alt="" />
                          <button
                            onClick={() => handleDeleteImage(img.id)}
                            className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >×</button>
                        </div>
                      ))}
                      <label className="w-10 h-10 border border-dashed border-brand-dark/30 flex items-center justify-center cursor-pointer hover:border-brand-secondary transition-colors text-brand-dark/40 hover:text-brand-secondary">
                        {uploadingFor === product.id ? '...' : '+'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, product.id)} disabled={uploadingFor === product.id} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-3 pt-3 border-t border-brand-dark/5">
                  <button onClick={() => openEdit(product)} className="text-xs uppercase tracking-widest text-brand-secondary hover:text-brand-dark transition-colors">Edit</button>
                  <button onClick={() => toggleActive(product.id, product.is_active)} className="text-xs uppercase tracking-widest text-brand-dark/40 hover:text-brand-dark transition-colors">
                    {product.is_active ? 'Set Draft' : 'Set Active'}
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-xs uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors ml-auto">Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit: ${editing.name}` : 'Add New Product'} width="max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Product Name" required>
            <input className={inputClass} value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Blush Silk Midi Dress" />
          </Field>
          <Field label="Slug">
            <input className={inputClass} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
          </Field>
          <Field label="Base Price (USD)" required>
            <input type="number" step="0.01" className={inputClass} value={form.base_price} onChange={e => setForm(f => ({ ...f, base_price: e.target.value }))} placeholder="120.00" />
          </Field>
          <Field label="Sale Price (leave blank if not on sale)">
            <input type="number" step="0.01" className={inputClass} value={form.sale_price} onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} placeholder="90.00" />
          </Field>
          <Field label="Category">
            <select className={selectClass} value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
              <option value="">— None —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Add to Collection">
            <select className={selectClass} value={form.collection_id} onChange={e => setForm(f => ({ ...f, collection_id: e.target.value }))}>
              <option value="">— None —</option>
              {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea className={textareaClass} rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description..." />
            </Field>
          </div>
          <Field label="Materials">
            <input className={inputClass} value={form.materials} onChange={e => setForm(f => ({ ...f, materials: e.target.value }))} placeholder="e.g. 100% Silk" />
          </Field>
          <Field label="Care Instructions">
            <input className={inputClass} value={form.care_instructions} onChange={e => setForm(f => ({ ...f, care_instructions: e.target.value }))} placeholder="e.g. Dry clean only" />
          </Field>

          {/* Flags */}
          <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { key: 'is_active', label: 'Active' },
              { key: 'is_featured', label: 'Featured' },
              { key: 'is_new_arrival', label: 'New Arrival' },
              { key: 'is_on_sale', label: 'On Sale' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <input type="checkbox" id={key} checked={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="w-4 h-4" />
                <label htmlFor={key} className="text-sm font-body text-brand-dark">{label}</label>
              </div>
            ))}
          </div>

          <div className="sm:col-span-2 flex gap-3 pt-4 border-t border-brand-dark/10">
            <Button variant="primary" onClick={handleSave} isLoading={saving} className="flex-1">
              {editing ? 'Save Changes' : 'Create Product'}
            </Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
