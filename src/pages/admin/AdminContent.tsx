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
  // Section toggles
  show_our_story: boolean
  show_best_sellers: boolean
  show_new_arrivals: boolean
  show_summer_drops: boolean
  show_testimonials: boolean
  show_featured_banner: boolean
  show_shop_all_banner: boolean
  show_instagram: boolean
}

const defaultContent: ContentData = {
  hero_video_url: '/hero-video.mp4',
  our_story_heading: 'Crafted for the Modern Muse.',
  our_story_subheading: 'UNCOMPROMISING QUALITY',
  our_story_body: 'KLANÉ was born from a desire to redefine contemporary elegance. Every piece in our collection is a testament to meticulous craftsmanship and timeless design.',
  featured_banner_url: '',
  shop_all_banner_url: '',
  instagram_images: [],
  show_our_story: true,
  show_best_sellers: true,
  show_new_arrivals: true,
  show_summer_drops: true,
  show_testimonials: true,
  show_featured_banner: false,
  show_shop_all_banner: true,
  show_instagram: true,
}

// Toggle switch component
function Toggle({ value, onChange, id }: { value: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        value ? 'bg-brand-black' : 'bg-gray-200'
      }`}
      role="switch"
      aria-checked={value}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
          value ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

// Section toggle row
function SectionToggle({ label, description, value, onChange, id }: {
  label: string; description?: string; value: boolean; onChange: (v: boolean) => void; id: string
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="flex-1 pr-4">
        <p className="font-heading text-sm uppercase tracking-wider text-brand-dark">{label}</p>
        {description && <p className="text-xs text-brand-dark/40 font-body mt-0.5">{description}</p>}
      </div>
      <Toggle id={id} value={value} onChange={onChange} />
    </div>
  )
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
            } else if (typeof (newContent as any)[setting.key] === 'boolean') {
              ;(newContent as any)[setting.key] = setting.message === 'true' || setting.is_enabled === true
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
        const isBool = typeof val === 'boolean'
        return {
          key,
          message: isBool
            ? String(val)
            : key === 'instagram_images'
            ? JSON.stringify(val)
            : ['our_story_heading', 'our_story_subheading', 'our_story_body'].includes(key) ? val : null,
          link_url: (!isBool && !['instagram_images', 'our_story_heading', 'our_story_subheading', 'our_story_body'].includes(key)) ? val : null,
          is_enabled: true
        }
      })
      const { error } = await supabase.from('site_settings').upsert(updates, { onConflict: 'key' })
      if (error) throw error
      addToast('success', 'Homepage content updated!')
    } catch (err: any) { addToast('error', err.message) }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl space-y-8">

      {/* Section Visibility Toggles */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-heading text-base uppercase tracking-widest text-brand-dark">Homepage Sections</h2>
          <p className="text-xs text-brand-dark/40 font-body mt-1">Toggle which sections appear on the homepage</p>
        </div>
        <div className="p-4 space-y-1">
          <SectionToggle id="toggle-our-story" label="Our Story" description="Brand narrative section" value={content.show_our_story} onChange={v => setContent(c => ({ ...c, show_our_story: v }))} />
          <SectionToggle id="toggle-summer-drops" label="Summer Drops" description="Limited release rail" value={content.show_summer_drops} onChange={v => setContent(c => ({ ...c, show_summer_drops: v }))} />
          <SectionToggle id="toggle-best-sellers" label="Best Sellers" description="Featured products rail" value={content.show_best_sellers} onChange={v => setContent(c => ({ ...c, show_best_sellers: v }))} />
          <SectionToggle id="toggle-new-arrivals" label="New Arrivals" description="Latest products rail" value={content.show_new_arrivals} onChange={v => setContent(c => ({ ...c, show_new_arrivals: v }))} />
          <SectionToggle id="toggle-featured-banner" label="Featured Collection Banner" description="Full-width editorial banner" value={content.show_featured_banner} onChange={v => setContent(c => ({ ...c, show_featured_banner: v }))} />
          <SectionToggle id="toggle-testimonials" label="Testimonials" description="Customer reviews carousel" value={content.show_testimonials} onChange={v => setContent(c => ({ ...c, show_testimonials: v }))} />
          <SectionToggle id="toggle-shop-all-banner" label="Full Edit Banner" description="Shop all call-to-action" value={content.show_shop_all_banner} onChange={v => setContent(c => ({ ...c, show_shop_all_banner: v }))} />
          <SectionToggle id="toggle-instagram" label="Instagram Grid" description="Social media feed section" value={content.show_instagram} onChange={v => setContent(c => ({ ...c, show_instagram: v }))} />
        </div>
      </div>

      {/* Hero Video */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-heading text-base uppercase tracking-widest text-brand-dark">Hero Video</h2>
        </div>
        <div className="p-6">
          <div className="flex gap-4 items-start">
            <div className="w-48 h-28 bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 rounded-lg">
              {content.hero_video_url ? (
                <video src={content.hero_video_url} className="w-full h-full object-cover" muted playsInline />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-brand-dark/30 font-body">No Video</div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <Field label="Video URL">
                <input className={inputClass} value={content.hero_video_url} onChange={e => setContent(c => ({ ...c, hero_video_url: e.target.value }))} />
              </Field>
              <div>
                <span className="text-xs text-brand-dark/50 font-body mr-3">OR upload file:</span>
                <label className="cursor-pointer inline-block bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-2 text-xs uppercase tracking-widest font-heading rounded-lg transition-colors">
                  {uploadingFor === 'hero_video_url' ? 'Uploading...' : 'Upload Video'}
                  <input type="file" accept="video/*" className="hidden" onChange={e => handleImageUpload(e, 'hero_video_url')} disabled={!!uploadingFor} />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-heading text-base uppercase tracking-widest text-brand-dark">Our Story Section</h2>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Subheading (Small text above)">
            <input className={inputClass} value={content.our_story_subheading} onChange={e => setContent(c => ({ ...c, our_story_subheading: e.target.value }))} />
          </Field>
          <Field label="Heading (Main text)">
            <input className={inputClass} value={content.our_story_heading} onChange={e => setContent(c => ({ ...c, our_story_heading: e.target.value }))} />
          </Field>
          <Field label="Body Paragraph">
            <textarea className={textareaClass} rows={4} value={content.our_story_body} onChange={e => setContent(c => ({ ...c, our_story_body: e.target.value }))} />
          </Field>
        </div>
      </div>

      {/* Banners */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-heading text-base uppercase tracking-widest text-brand-dark">Banners</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Field label="Featured Collection Banner">
                <div className="h-40 bg-gray-50 border border-gray-100 mb-2 overflow-hidden relative rounded-lg">
                  {content.featured_banner_url && <img src={content.featured_banner_url} className="w-full h-full object-cover" alt="" />}
                </div>
                <label className="cursor-pointer block text-center bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 text-xs uppercase tracking-widest font-heading rounded-lg transition-colors w-full">
                  {uploadingFor === 'featured_banner_url' ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'featured_banner_url')} disabled={!!uploadingFor} />
                </label>
              </Field>
            </div>
            <div className="space-y-3">
              <Field label="Shop All / Full Edit Banner">
                <div className="h-40 bg-gray-50 border border-gray-100 mb-2 overflow-hidden relative rounded-lg">
                  {content.shop_all_banner_url && <img src={content.shop_all_banner_url} className="w-full h-full object-cover" alt="" />}
                </div>
                <label className="cursor-pointer block text-center bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 text-xs uppercase tracking-widest font-heading rounded-lg transition-colors w-full">
                  {uploadingFor === 'shop_all_banner_url' ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'shop_all_banner_url')} disabled={!!uploadingFor} />
                </label>
              </Field>
            </div>
          </div>
        </div>
      </div>

      {/* Instagram Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="font-heading text-base uppercase tracking-widest text-brand-dark">Instagram Grid</h2>
            <p className="text-xs text-brand-dark/40 font-body mt-0.5">{content.instagram_images.length} / 6 images</p>
          </div>
          <label className="cursor-pointer inline-block bg-gray-50 hover:bg-gray-100 text-brand-black border border-gray-200 px-4 py-2 text-xs uppercase tracking-widest font-heading rounded-lg transition-colors">
            {uploadingFor === 'instagram_images' ? 'Uploading...' : 'Add Image'}
            <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'instagram_images')} disabled={!!uploadingFor} />
          </label>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {content.instagram_images.map((url, i) => (
              <div key={i} className="aspect-square relative group bg-gray-50 rounded-lg overflow-hidden">
                <img src={url} className="w-full h-full object-cover" alt="" />
                <button
                  onClick={() => handleInstaRemove(i)}
                  className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs uppercase tracking-widest rounded-lg"
                >Remove</button>
              </div>
            ))}
            {content.instagram_images.length === 0 && (
              <div className="col-span-full py-10 text-center text-xs font-body text-brand-dark/40 italic border border-dashed border-gray-200 rounded-lg">
                No images added yet. Upload up to 6 photos for the Instagram grid.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pb-8">
        <Button variant="primary" onClick={handleSave} isLoading={saving} className="px-10">
          Save All Changes
        </Button>
      </div>
    </div>
  )
}
