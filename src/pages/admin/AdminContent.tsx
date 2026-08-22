import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { useToastStore } from '../../features/toast/toastStore'

export default function AdminContent() {
  const addToast = useToastStore(state => state.addToast)
  const [isLoading, setIsLoading] = useState(false)
  const [content, setContent] = useState({
    hero_video: '',
    our_story_heading: '',
    our_story_subheading: '',
    our_story_text: ''
  })

  useEffect(() => {
    async function loadContent() {
      const { data, error } = await supabase.from('site_content').select('*')
      if (data && !error) {
        const newContent = { ...content }
        data.forEach(row => {
          if (row.section_key in newContent) {
            newContent[row.section_key as keyof typeof content] = row.value
          }
        })
        setContent(newContent)
      }
    }
    loadContent()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContent(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const updates = Object.entries(content).map(([key, value]) => ({
        section_key: key,
        value,
        content_type: key === 'hero_video' ? 'video' : 'text'
      }))

      const { error } = await supabase.from('site_content').upsert(updates, { onConflict: 'section_key' })
      if (error) throw error
      
      addToast('success', 'Site content updated successfully!')
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update content.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-8 shadow-sm border border-brand-dark/5">
      <h2 className="font-heading text-xl uppercase tracking-widest mb-6 border-b border-brand-dark/10 pb-4">Manage Site Content</h2>
      
      <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
        
        <section>
          <h3 className="font-heading uppercase tracking-widest text-sm text-brand-secondary mb-4">Hero Section</h3>
          <div>
            <label className="block text-sm text-brand-dark/70 mb-2">Background Video URL (mp4)</label>
            <input 
              type="url" 
              name="hero_video" 
              value={content.hero_video} 
              onChange={handleChange}
              className="w-full border border-brand-dark/20 px-4 py-2 text-sm focus:outline-none focus:border-brand-secondary"
              placeholder="https://example.com/video.mp4"
            />
            <p className="text-xs text-brand-dark/50 mt-1">Upload a video to Supabase storage and paste the URL here.</p>
          </div>
        </section>

        <section>
          <h3 className="font-heading uppercase tracking-widest text-sm text-brand-secondary mb-4">Our Story Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-brand-dark/70 mb-2">Heading</label>
              <input 
                type="text" 
                name="our_story_heading" 
                value={content.our_story_heading} 
                onChange={handleChange}
                className="w-full border border-brand-dark/20 px-4 py-2 text-sm focus:outline-none focus:border-brand-secondary"
              />
            </div>
            <div>
              <label className="block text-sm text-brand-dark/70 mb-2">Subheading (Italic text)</label>
              <input 
                type="text" 
                name="our_story_subheading" 
                value={content.our_story_subheading} 
                onChange={handleChange}
                className="w-full border border-brand-dark/20 px-4 py-2 text-sm focus:outline-none focus:border-brand-secondary"
              />
            </div>
            <div>
              <label className="block text-sm text-brand-dark/70 mb-2">Body Text</label>
              <textarea 
                name="our_story_text" 
                rows={4}
                value={content.our_story_text} 
                onChange={handleChange}
                className="w-full border border-brand-dark/20 px-4 py-2 text-sm focus:outline-none focus:border-brand-secondary"
              />
            </div>
          </div>
        </section>

        <div className="pt-4">
          <Button type="submit" variant="primary" isLoading={isLoading}>Save Changes</Button>
        </div>
      </form>
    </div>
  )
}
