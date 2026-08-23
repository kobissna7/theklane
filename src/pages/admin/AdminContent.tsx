import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { convertToWebp } from '../../lib/image'
import { useToastStore } from '../../features/toast/toastStore'
import { Button } from '../../components/ui/Button'
import { Field, inputClass, textareaClass } from '../../components/admin/AdminModal'

interface ContentData {
  hero_video_url: string
  our_story_heading: string
  our_story_subheading: string
  our_story_body: string
  featured_banner_url: string
  shop_all_banner_url: string
  instagram_images: string[]
}

const defaultContent: ContentData = {
  hero_video_url: '/hero-video.mp4',
  our_story_heading: 'Crafted for the Modern Muse.',
  our_story_subheading: 'UNCOMPROMISING QUALITY',
  our_story_body: 'KLANÉ was born from a desire to redefine contemporary elegance. Every piece in our collection is a testament to meticulous craftsmanship and timeless design.',
  featured_banner_url: '',
  shop_all_banner_url: '',
  instagram_images: []
}

export default function AdminContent() {
  const addToast = useToastStore(s => s.addToast)
  const [content, setContent] = useState<ContentData>(defaultContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)

  useEffect(() => { fetchContent() }, [])

  async function fetchContent() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('site_settings').select('*')
      if (error) throw error
      
      const newContent = { ...defaultContent }
      if (data) {
        data.forEach(setting => {
          if (setting.key in newContent) {
            if (setting.key === 'instagram_images') {
              try { newContent.instagram_images = JSON.parse(setting.message || '[]') } catch(e){}
            } else {
              ;(newContent as any)[setting.key] = setting.link_url || setting.message || ''
            }
          }
        })
      }
      setContent(newContent)
    } catch (err: any) { addToast('error', err.message) }
    finally { setLoading(false) }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, key: string) {
    if (!e.target.files?.[0]) return
    setUploadingFor(key)
    try {
      // Use webp for images, keep original for video
      const isVideo = e.target.files[0].type.startsWith('video/')
      const file = isVideo ? e.target.files[0] : await convertToWebp(e.target.files[0])
      const ext = isVideo ? e.target.files[0].name.split('.').pop() : 'webp'
      const fileName = `content/${key}-${Date.now()}.${ext}`
      
      const { error: upErr } = await supabase.storage.from('public-assets').upload(fileName, file, { upsert: false })
      if (upErr) throw upErr
      
      const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(fileName)
      
      if (key === 'instagram_images') {
        setContent(c => ({ ...c, instagram_images: [...c.instagram_images, publicUrl] }))
      } else {
        setContent(c => ({ ...c, [key]: publicUrl }))
      }
      addToast('success', 'File uploaded!')
    } catch (err: any) { addToast('error', err.message) }
    finally { setUploadingFor(null) }
  }

  function handleInstaRemove(index: number) {
    setContent(c => {
      const newImgs = [...c.instagram_images]
      newImgs.splice(index, 1)
      return { ...c, instagram_images: newImgs }
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updates = Object.keys(content).map(key => {
        const val = (content as any)[key]
        return {
          key,
          message: key === 'instagram_images' ? JSON.stringify(val) : (['our_story_heading', 'our_story_subheading', 'our_story_body'].includes(key) ? val : null),
          link_url: ['instagram_images', 'our_story_heading', 'our_story_subheading', 'our_story_body'].includes(key) ? null : val,
          is_enabled: true
        }
      })

      const { error } = await supabase.from('site_settings').upsert(updates, { onConflict: 'key' })
      if (error) throw error
      addToast('success', 'Homepage content updated!')
    } catch (err: any) { addToast('error', err.message) }
    finally { setSaving(false) }
  }

  if (loading) return <p className="p-8 font-body text-brand-dark/50">Loading...</p>

  return (
    <div className="bg-white p-8 shadow-sm border border-brand-dark/5 max-w-4xl">
      <div className="flex justify-between items-center mb-6 border-b border-brand-dark/10 pb-4">
        <div>
          <h2 className="font-heading text-xl uppercase tracking-widest">Homepage Content</h2>
          <p className="text-xs text-brand-dark/50 font-body mt-1">Manage all visual and text content on the front page</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>Save Changes</Button>
      </div>

      <div className="space-y-10">
        
        {/* HERO */}
        <section className="space-y-4">
          <h3 className="font-heading uppercase tracking-widest text-sm text-brand-dark border-b border-brand-dark/10 pb-2">Hero Video</h3>
          <div className="flex gap-4 items-start">
            <div className="w-48 h-27 bg-brand-dark/5 border border-brand-dark/10 overflow-hidden flex-shrink-0">
              {content.hero_video_url ? (
                <video src={content.hero_video_url} className="w-full h-full object-cover" muted playsInline />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-brand-dark/30 font-body">No Video</div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Field label="Video URL">
                <input className={inputClass} value={content.hero_video_url} onChange={e => setContent(c => ({ ...c, hero_video_url: e.target.value }))} />
              </Field>
              <div>
                <span className="text-xs text-brand-dark/50 font-body mr-3">OR upload file:</span>
                <label className="cursor-pointer inline-block border border-brand-dark/20 px-3 py-1 text-xs uppercase tracking-widest font-heading hover:border-brand-secondary transition-colors">
                  {uploadingFor === 'hero_video_url' ? 'Uploading...' : 'Upload Video'}
                  <input type="file" accept="video/*" className="hidden" onChange={e => handleImageUpload(e, 'hero_video_url')} disabled={!!uploadingFor} />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* OUR STORY */}
        <section className="space-y-4">
          <h3 className="font-heading uppercase tracking-widest text-sm text-brand-dark border-b border-brand-dark/10 pb-2">Our Story Section</h3>
          <Field label="Subheading (Small text above)">
            <input className={inputClass} value={content.our_story_subheading} onChange={e => setContent(c => ({ ...c, our_story_subheading: e.target.value }))} />
          </Field>
          <Field label="Heading (Main text)">
            <input className={inputClass} value={content.our_story_heading} onChange={e => setContent(c => ({ ...c, our_story_heading: e.target.value }))} />
          </Field>
          <Field label="Body Paragraph">
            <textarea className={textareaClass} rows={4} value={content.our_story_body} onChange={e => setContent(c => ({ ...c, our_story_body: e.target.value }))} />
          </Field>
        </section>

        {/* BANNERS */}
        <section className="space-y-4">
          <h3 className="font-heading uppercase tracking-widest text-sm text-brand-dark border-b border-brand-dark/10 pb-2">Category Banners</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Field label="Featured Collection Banner (Tall)">
                <div className="h-48 bg-brand-dark/5 border border-brand-dark/10 mb-2 overflow-hidden relative">
                  {content.featured_banner_url && <img src={content.featured_banner_url} className="w-full h-full object-cover" alt="" />}
                </div>
                <label className="cursor-pointer block text-center border border-brand-dark/20 px-3 py-2 text-xs uppercase tracking-widest font-heading hover:border-brand-secondary transition-colors w-full">
                  {uploadingFor === 'featured_banner_url' ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'featured_banner_url')} disabled={!!uploadingFor} />
                </label>
              </Field>
            </div>
            
            <div className="space-y-2">
              <Field label="Shop All Banner (Wide)">
                <div className="h-48 bg-brand-dark/5 border border-brand-dark/10 mb-2 overflow-hidden relative">
                  {content.shop_all_banner_url && <img src={content.shop_all_banner_url} className="w-full h-full object-cover" alt="" />}
                </div>
                <label className="cursor-pointer block text-center border border-brand-dark/20 px-3 py-2 text-xs uppercase tracking-widest font-heading hover:border-brand-secondary transition-colors w-full">
                  {uploadingFor === 'shop_all_banner_url' ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'shop_all_banner_url')} disabled={!!uploadingFor} />
                </label>
              </Field>
            </div>
          </div>
        </section>

        {/* INSTAGRAM */}
        <section className="space-y-4">
          <h3 className="font-heading uppercase tracking-widest text-sm text-brand-dark border-b border-brand-dark/10 pb-2 flex justify-between items-center">
            <span>Instagram Grid</span>
            <label className="cursor-pointer inline-block border border-brand-dark/20 px-3 py-1 text-xs uppercase tracking-widest font-heading hover:border-brand-secondary transition-colors font-normal">
              {uploadingFor === 'instagram_images' ? 'Uploading...' : 'Add Image'}
              <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'instagram_images')} disabled={!!uploadingFor} />
            </label>
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {content.instagram_images.map((url, i) => (
              <div key={i} className="aspect-square relative group bg-brand-dark/5 border border-brand-dark/10 overflow-hidden">
                <img src={url} className="w-full h-full object-cover" alt="" />
                <button 
                  onClick={() => handleInstaRemove(i)}
                  className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs uppercase tracking-widest"
                >Remove</button>
              </div>
            ))}
            {content.instagram_images.length === 0 && (
              <div className="col-span-full py-8 text-center text-xs font-body text-brand-dark/50 italic border border-dashed border-brand-dark/20">
                No images added. Add some to show the Instagram feed.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
