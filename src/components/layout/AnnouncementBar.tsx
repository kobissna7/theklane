import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import type { SiteSettings } from '../../lib/types'

export function AnnouncementBar() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    async function fetchAnnouncement() {
      const { data } = await supabase.from('site_settings').select('*').eq('key', 'announcement_bar').single()
      if (data) setSettings(data)
    }
    fetchAnnouncement()
  }, [])

  if (!settings || !settings.is_enabled) return null

  const now = new Date()
  if (settings.starts_at && new Date(settings.starts_at) > now) return null
  if (settings.expires_at && new Date(settings.expires_at) < now) return null

  const inner = (
    <div className="animate-marquee whitespace-nowrap flex">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="inline-block px-12">
          {settings.message}
        </span>
      ))}
    </div>
  )

  return (
    <div className="bg-brand-black text-white text-2xs font-heading uppercase tracking-widest py-2.5 overflow-hidden">
      {settings.link_url ? (
        <Link to={settings.link_url} className="block hover:opacity-80 transition-opacity">
          {inner}
        </Link>
      ) : inner}
    </div>
  )
}
