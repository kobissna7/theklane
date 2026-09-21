import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { convertToWebp } from '../../lib/image'
import { useToastStore } from '../../features/toast/toastStore'
import { Button } from '../../components/ui/Button'
import { Modal, Field, inputClass, textareaClass } from '../../components/admin/AdminModal'

interface Drop {
  id: string
  name: string
  slug: string
  description: string | null
  drop_date: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
}

const empty = { name: '', slug: '', description: '', drop_date: '', image_url: '', is_active: true }

export default function AdminDrops() {
  const addToast = useToastStore(s => s.addToast)
  const [drops, setDrops] = useState<Drop[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Drop | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => { fetchDrops() }, [])

  async function fetchDrops() {
    setLoading(true)
    const { data, error } = await supabase.from('collections').select('*').order('drop_date', { ascending: false, nullsFirst: false })
    if (error) addToast('error', error.message)
    else setDrops((data || []).filter((c: any) => c.is_drop === true || c.drop_date))
    setLoading(false)
  }

  function openAdd() { setEditing(null); setForm(empty); setModalOpen(true) }
  function openEdit(drop: Drop) {
    setEditing(drop)
    setForm({ name: drop.name, slug: drop.slug, description: drop.description || '', drop_date: drop.drop_date ? drop.drop_date.slice(0, 16) : '', image_url: drop.image_url || '', is_active: drop.is_active })
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
      const fileName = `drops/${Date.now()}.webp`
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
      const payload = { name: form.name, slug: form.slug, description: form.description || null, drop_date: form.drop_date || null, image_url: form.image_url || null, is_active: form.is_active, is_drop: true }
      if (editing) {
        const { error } = await supabase.from('collections').update(payload).eq('id', editing.id)
        if (error) throw error
        addToast('success', 'Drop updated!')
      } else {
        const { error } = await supabase.from('collections').insert({ ...payload, sort_order: 0 })
        if (error) throw error
        addToast('success', 'Drop created!')
      }
      setModalOpen(false)
      fetchDrops()
    } catch (err: any) { addToast('error', err.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this drop?')) return
    const { error } = await supabase.from('collections').delete().eq('id', id)
    if (error) addToast('error', error.message)
    else { addToast('success', 'Deleted'); fetchDrops() }
  }

  function getDropStatus(dropDate: string | null) {
    if (!dropDate) return { label: 'No Date', color: 'bg-gray-100 text-gray-600' }
    const d = new Date(dropDate)
    const now = new Date()
    if (d > now) return { label: `Drops ${d.toLocaleDateString()}`, color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Live', color: 'bg-green-100 text-green-800' }
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl shadow-brand-dark/5 border border-gray-100">
      <div className="flex justify-between items-center mb-6 border-b border-brand-dark/10 pb-4">
        <div>
          <h2 className="font-heading text-xl uppercase tracking-widest">Drops</h2>
          <p className="text-xs text-brand-dark/50 font-body mt-1">Limited releases with scheduled drop dates</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>Schedule Drop</Button>
      </div>

      {loading ? (
        <p className="text-center py-12 text-brand-dark/40 font-body">Loading...</p>
      ) : drops.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-body text-brand-dark/40 italic mb-2">No drops scheduled yet.</p>
          <p className="text-xs text-brand-dark/30 font-body">Create a drop to generate buzz before a launch.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drops.map(drop => {
            const status = getDropStatus(drop.drop_date)
            return (
              <div key={drop.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-brand-black/20 hover:shadow-sm transition-all bg-white">
                {drop.image_url ? <img src={drop.image_url} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" alt={drop.name} /> : <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center text-xs text-brand-dark/30">No img</div>}
                <div className="flex-1">
                  <p className="font-heading uppercase tracking-widest text-sm text-brand-dark">{drop.name}</p>
                  <p className="text-xs text-brand-dark/50 font-body mt-1">{drop.description || 'No description'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-2xs uppercase tracking-widest ${status.color} flex-shrink-0`}>{status.label}</span>
                <div className="flex gap-4 flex-shrink-0 pl-4 border-l border-gray-100">
                  <button onClick={() => openEdit(drop)} className="text-xs uppercase tracking-widest text-brand-black hover:text-brand-dark/70 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(drop.id)} className="text-xs uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors">Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Drop' : 'Schedule a Drop'}>
        <div className="space-y-4">
          <Field label="Drop Name" required>
            <input className={inputClass} value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. The Berry Edit" />
          </Field>
          <Field label="Description">
            <textarea className={textareaClass} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Tease what's coming..." />
          </Field>
          <Field label="Drop Date & Time" hint="Leave blank if no specific date yet">
            <input type="datetime-local" className={inputClass} value={form.drop_date} onChange={e => setForm(f => ({ ...f, drop_date: e.target.value }))} />
          </Field>
          <Field label="Cover Image">
            {form.image_url && <img src={form.image_url} className="w-full h-40 object-cover mb-2 rounded-lg" alt="preview" />}
            <label className="cursor-pointer inline-block border border-gray-200 rounded-lg px-4 py-2 text-xs uppercase tracking-widest font-heading hover:border-brand-black hover:bg-gray-50 transition-colors">
              {uploadingImage ? 'Uploading...' : 'Upload Image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
            </label>
          </Field>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="drop-active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4" />
            <label htmlFor="drop-active" className="text-sm font-body text-brand-dark">Active (show on site)</label>
          </div>
          <div className="flex gap-3 pt-4 border-t border-brand-dark/10">
            <Button variant="primary" onClick={handleSave} isLoading={saving} className="flex-1">{editing ? 'Save Changes' : 'Schedule Drop'}</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
