import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { convertToWebp } from '../../lib/image'
import { useToastStore } from '../../features/toast/toastStore'
import { Button } from '../../components/ui/Button'
import { Modal, Field, inputClass, textareaClass } from '../../components/admin/AdminModal'
import type { Collection } from '../../lib/types'

const empty = { name: '', slug: '', description: '', sort_order: 0, is_active: true, image_url: '' }

export default function AdminCollections() {
  const addToast = useToastStore(s => s.addToast)
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => { fetchCollections() }, [])

  async function fetchCollections() {
    setLoading(true)
    const { data, error } = await supabase.from('collections').select('*').order('sort_order')
    if (error) addToast('error', error.message)
    else setCollections(data || [])
    setLoading(false)
  }

  function openAdd() { setEditing(null); setForm(empty); setModalOpen(true) }
  function openEdit(col: Collection) {
    setEditing(col)
    setForm({ name: col.name, slug: col.slug, description: col.description || '', sort_order: col.sort_order, is_active: col.is_active, image_url: col.image_url || '' })
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
      const fileName = `collections/${Date.now()}.webp`
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
      const payload = { name: form.name, slug: form.slug, description: form.description || null, sort_order: form.sort_order, is_active: form.is_active, image_url: form.image_url || null }
      if (editing) {
        const { error } = await supabase.from('collections').update(payload).eq('id', editing.id)
        if (error) throw error
        addToast('success', 'Collection updated!')
      } else {
        const { error } = await supabase.from('collections').insert(payload)
        if (error) throw error
        addToast('success', 'Collection created!')
      }
      setModalOpen(false)
      fetchCollections()
    } catch (err: any) { addToast('error', err.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this collection?')) return
    const { error } = await supabase.from('collections').delete().eq('id', id)
    if (error) addToast('error', error.message)
    else { addToast('success', 'Deleted'); fetchCollections() }
  }

  return (
    <div className="bg-white p-8 shadow-sm border border-brand-dark/5">
      <div className="flex justify-between items-center mb-6 border-b border-brand-dark/10 pb-4">
        <h2 className="font-heading text-xl uppercase tracking-widest">Collections</h2>
        <Button variant="primary" size="sm" onClick={openAdd}>Add Collection</Button>
      </div>

      {loading ? (
        <p className="text-center py-12 text-brand-dark/40 font-body">Loading...</p>
      ) : collections.length === 0 ? (
        <p className="text-center py-12 text-brand-dark/40 font-body italic">No collections yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(col => (
            <div key={col.id} className="border border-brand-dark/10 overflow-hidden group">
              <div className="relative h-40 bg-brand-dark/5">
                {col.image_url ? <img src={col.image_url} className="w-full h-full object-cover" alt={col.name} /> : <div className="w-full h-full flex items-center justify-center text-xs text-brand-dark/30 font-body">No Image</div>}
                <span className={`absolute top-2 right-2 px-2 py-1 text-xs ${col.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{col.is_active ? 'Active' : 'Hidden'}</span>
              </div>
              <div className="p-4">
                <p className="font-heading uppercase tracking-widest text-sm text-brand-dark">{col.name}</p>
                <p className="text-xs text-brand-dark/50 font-body mt-1 truncate">{col.description || 'No description'}</p>
                <div className="flex gap-3 mt-3">
                  <button onClick={() => openEdit(col)} className="text-xs uppercase tracking-widest text-brand-secondary hover:text-brand-dark transition-colors">Edit</button>
                  <button onClick={() => handleDelete(col.id)} className="text-xs uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Collection' : 'Add Collection'}>
        <div className="space-y-4">
          <Field label="Name" required>
            <input className={inputClass} value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. New Arrivals" />
          </Field>
          <Field label="Slug">
            <input className={inputClass} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
          </Field>
          <Field label="Description">
            <textarea className={textareaClass} rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description..." />
          </Field>
          <Field label="Cover Image">
            {form.image_url && <img src={form.image_url} className="w-full h-40 object-cover mb-2" alt="preview" />}
            <label className="cursor-pointer inline-block border border-brand-dark/20 px-4 py-2 text-xs uppercase tracking-widest font-heading hover:border-brand-secondary transition-colors">
              {uploadingImage ? 'Uploading...' : 'Upload Image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
            </label>
          </Field>
          <Field label="Sort Order">
            <input type="number" className={inputClass} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
          </Field>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="col-active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4" />
            <label htmlFor="col-active" className="text-sm font-body text-brand-dark">Active (visible on site)</label>
          </div>
          <div className="flex gap-3 pt-4 border-t border-brand-dark/10">
            <Button variant="primary" onClick={handleSave} isLoading={saving} className="flex-1">{editing ? 'Save Changes' : 'Create Collection'}</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
