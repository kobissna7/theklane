import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { convertToWebp } from '../../lib/image'
import { useToastStore } from '../../features/toast/toastStore'
import { Button } from '../../components/ui/Button'
import { Modal, Field, inputClass } from '../../components/admin/AdminModal'
import type { Category } from '../../lib/types'

const empty = { name: '', slug: '', sort_order: 0, is_active: true, image_url: '' }

export default function AdminCategories() {
  const addToast = useToastStore(s => s.addToast)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => { fetchCategories() }, [])

  async function fetchCategories() {
    setLoading(true)
    const { data, error } = await supabase.from('categories').select('*').order('sort_order')
    if (error) addToast('error', error.message)
    else setCategories(data || [])
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setForm(empty)
    setModalOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug, sort_order: cat.sort_order, is_active: cat.is_active, image_url: cat.image_url || '' })
    setModalOpen(true)
  }

  function handleNameChange(name: string) {
    setForm(f => ({ ...f, name, slug: editing ? f.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return
    setUploadingImage(true)
    try {
      const webp = await convertToWebp(e.target.files[0])
      const fileName = `categories/${Date.now()}.webp`
      const { error: upErr } = await supabase.storage.from('public-assets').upload(fileName, webp, { upsert: false })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(fileName)
      setForm(f => ({ ...f, image_url: publicUrl }))
      addToast('success', 'Image uploaded!')
    } catch (err: any) { addToast('error', err.message) }
    finally { setUploadingImage(false) }
  }

  async function handleSave() {
    if (!form.name) return addToast('error', 'Name is required')
    setSaving(true)
    try {
      const payload = { name: form.name, slug: form.slug, sort_order: form.sort_order, is_active: form.is_active, image_url: form.image_url || null }
      if (editing) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editing.id)
        if (error) throw error
        addToast('success', 'Category updated!')
      } else {
        const { error } = await supabase.from('categories').insert(payload)
        if (error) throw error
        addToast('success', 'Category created!')
      }
      setModalOpen(false)
      fetchCategories()
    } catch (err: any) { addToast('error', err.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) addToast('error', error.message)
    else { addToast('success', 'Deleted'); fetchCategories() }
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl shadow-brand-dark/5 border border-gray-100">
      <div className="flex justify-between items-center mb-6 border-b border-brand-dark/10 pb-4">
        <h2 className="font-heading text-xl uppercase tracking-widest">Categories</h2>
        <Button variant="primary" size="sm" onClick={openAdd}>Add Category</Button>
      </div>

      {loading ? (
        <p className="text-center py-12 text-brand-dark/40 font-body">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-center py-12 text-brand-dark/40 font-body italic">No categories yet. Add one to get started.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {['Image','Name','Slug','Sort','Status','Actions'].map(h => (
                  <th key={h} className="py-4 px-4 font-heading uppercase tracking-widest text-2xs text-brand-dark/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="font-body text-sm">
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    {cat.image_url ? <img src={cat.image_url} className="w-12 h-12 rounded-lg object-cover" alt={cat.name} /> : <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-xs text-brand-dark/30">None</div>}
                  </td>
                  <td className="py-3 px-4 font-medium">{cat.name}</td>
                  <td className="py-3 px-4 text-brand-dark/50">{cat.slug}</td>
                  <td className="py-3 px-4">{cat.sort_order}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-2xs uppercase tracking-widest ${cat.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{cat.is_active ? 'Active' : 'Hidden'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(cat)} className="text-xs uppercase tracking-widest text-brand-black hover:text-brand-dark/70 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(cat.id)} className="text-xs uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <Field label="Name" required>
            <input className={inputClass} value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Dresses" />
          </Field>
          <Field label="Slug" hint="Auto-generated from name">
            <input className={inputClass} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
          </Field>
          <Field label="Cover Image">
            {form.image_url && <img src={form.image_url} className="w-full h-40 object-cover mb-2 rounded-lg" alt="preview" />}
            <label className="cursor-pointer inline-block border border-gray-200 rounded-lg px-4 py-2 text-xs uppercase tracking-widest font-heading hover:border-brand-black hover:bg-gray-50 transition-colors">
              {uploadingImage ? 'Uploading...' : 'Upload Image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
            </label>
          </Field>
          <Field label="Sort Order">
            <input type="number" className={inputClass} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
          </Field>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="cat-active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4" />
            <label htmlFor="cat-active" className="text-sm font-body text-brand-dark">Active (visible on site)</label>
          </div>
          <div className="flex gap-3 pt-4 border-t border-brand-dark/10">
            <Button variant="primary" onClick={handleSave} isLoading={saving} className="flex-1">{editing ? 'Save Changes' : 'Create Category'}</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
