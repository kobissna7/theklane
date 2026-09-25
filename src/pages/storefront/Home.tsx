import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../../components/product/ProductCard'
import { Button } from '../../components/ui/Button'
import { mockReviews, mockCollections } from '../../lib/mockData'
import { supabase } from '../../lib/supabase'

// --- Extended content type with section toggles ---
interface SiteContent {
  hero_video_url: string
  our_story_heading: string
  our_story_subheading: string
  our_story_body: string
  featured_banner_url: string
  shop_all_banner_url: string
  instagram_images: string[]
  // Section visibility toggles
  show_our_story: boolean
  show_best_sellers: boolean
  show_new_arrivals: boolean
  show_summer_drops: boolean
  show_testimonials: boolean
  show_featured_banner: boolean
  show_shop_all_banner: boolean
  show_instagram: boolean
}

const defaultContent: SiteContent = {
  hero_video_url: '/hero-video.mp4',
  our_story_heading: 'Crafted for the Modern Muse.',
  our_story_subheading: 'UNCOMPROMISING QUALITY',
  our_story_body: 'KLANÉ was born from a desire to redefine contemporary elegance. Every piece in our collection is a testament to meticulous craftsmanship and timeless design.',
  featured_banner_url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&q=80',
  shop_all_banner_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80',
  instagram_images: [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80',
    'https://images.unsplash.com/photo-1519407066695-f45c0cdf1da8?w=400&q=80',
  ],
  show_our_story: true,
  show_best_sellers: true,
  show_new_arrivals: true,
  show_summer_drops: true,
  show_testimonials: true,
  show_featured_banner: false,
  show_shop_all_banner: true,
  show_instagram: true,
}

export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(defaultContent)

  useEffect(() => {
    supabase.from('site_settings').select('*').then(({ data }) => {
      if (data) {
        const newContent = { ...defaultContent }
        data.forEach(row => {
          if (row.key in newContent) {
            if (row.key === 'instagram_images' && row.message) {
              try { (newContent as any).instagram_images = JSON.parse(row.message) } catch(e){}
            } else if (typeof (newContent as any)[row.key] === 'boolean') {
              (newContent as any)[row.key] = row.message === 'true' || row.is_enabled === true
            } else {
              (newContent as any)[row.key] = row.link_url || row.message || (newContent as any)[row.key]
            }
          }
        })
        setContent(newContent)
      }
    })
  }, [])

  return content
}

// --- Hero Section ---
function HeroSection({ videoUrl }: { videoUrl: string }) {
  return (
    <section className="relative h-[92vh] min-h-[600px] overflow-hidden bg-brand-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&q=80"
        className="absolute inset-0 w-full h-full object-cover object-center"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      {/* Gradient overlay - subtle */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      <div className="relative h-full flex flex-col items-center justify-end pb-16 sm:pb-24 px-6 text-center text-white">
        <h1 className="klane-logo font-logo font-light text-6xl sm:text-8xl lg:text-9xl leading-none mb-4 sm:mb-5 drop-shadow-md text-white">
          KLANÉ
        </h1>
        <p className="font-heading text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12 drop-shadow-sm opacity-80">
          every becoming begins with a choice
        </p>
        <div className="flex gap-4 flex-wrap justify-center w-full px-4">
          <Button variant="primary" size="lg" as="a" href="/shop"
            className="bg-brand-secondary text-white hover:bg-brand-secondary/90 border-none px-8 sm:px-10 py-4 tracking-widest uppercase text-xs font-heading w-full sm:w-auto max-w-xs">
            Shop the Collection
          </Button>
        </div>
      </div>
    </section>
  )
}

// --- Our Story Section ---
function OurStorySection({ heading, subheading, text }: { heading: string, subheading: string, text: string }) {
  return (
    <section className="bg-white text-brand-dark py-24 lg:py-32 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-px bg-brand-secondary/30" />
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="font-heading text-2xs uppercase tracking-[0.3em] text-brand-secondary/70 mb-6">{subheading}</p>
        <h2 className="font-heading font-normal text-4xl sm:text-5xl lg:text-6xl mb-10 tracking-wide text-brand-dark">{heading}</h2>
        <div className="max-w-xl mx-auto">
          <p className="font-body text-base sm:text-lg leading-relaxed text-brand-dark/60 whitespace-pre-line">
            {text}
          </p>
        </div>
        <div className="mt-10">
          <Link to="/shop" className="font-heading text-2xs uppercase tracking-[0.25em] text-brand-secondary border-b border-brand-secondary/40 pb-0.5 hover:border-brand-secondary transition-colors">
            Discover the Collection
          </Link>
        </div>
      </div>
    </section>
  )
}

// --- Product Rail ---
function ProductRail({ title, products, link }: { title: string; products: any[]; link: string }) {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-heading font-normal text-2xl sm:text-3xl uppercase tracking-[0.15em] text-brand-dark">{title}</h2>
          <Link to={link} className="font-heading text-2xs uppercase tracking-widest text-brand-gray hover:text-brand-black transition-colors underline underline-offset-4">
            Shop All &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}

// --- Summer Drops Rail ---
function SummerDropsRail({ products }: { products: any[] }) {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-heading text-2xs uppercase tracking-[0.3em] text-brand-secondary/70 mb-2">Limited Release</p>
            <h2 className="font-heading font-normal text-2xl sm:text-3xl uppercase tracking-[0.15em] text-brand-dark">Summer Drops</h2>
          </div>
          <Link to="/collections/summer-drops" className="font-heading text-2xs uppercase tracking-widest text-brand-gray hover:text-brand-black transition-colors underline underline-offset-4">
            See All &rarr;
          </Link>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="py-16 text-center border border-dashed border-brand-gray-light/40 rounded-sm">
            <p className="font-heading text-xs uppercase tracking-widest text-brand-gray/50">New drops coming soon</p>
          </div>
        )}
      </div>
    </section>
  )
}

// --- Featured Collection Banner ---
function FeaturedCollectionBanner({ bannerUrl }: { bannerUrl: string }) {
  const collection = mockCollections[1]
  return (
    <section className="relative h-[60vh] min-h-[400px] overflow-hidden group">
      <img
        src={bannerUrl || "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&q=80"}
        alt={collection?.name || 'Featured'}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-brand group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-brand-black/40" />
      <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-6">
        <p className="font-heading text-2xs uppercase tracking-[0.3em] mb-3 opacity-70">Curated Collection</p>
        <h2 className="font-heading font-normal text-4xl sm:text-6xl uppercase tracking-wider mb-6">{collection?.name || 'Featured'}</h2>
        <Button variant="secondary" size="lg" as="a" href={collection ? `/collections/${collection.slug}` : '/shop'}
          className="bg-white text-brand-black hover:bg-white/90 border-none">
          Explore Collection
        </Button>
      </div>
    </section>
  )
}

// --- Testimonials ---
function TestimonialsSection() {
  const [active, setActive] = useState(0)
  const reviews = mockReviews

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % reviews.length), 5000)
    return () => clearInterval(t)
  }, [reviews.length])

  return (
    <section className="bg-white py-20 lg:py-28 border-t border-gray-100">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="font-heading text-2xs uppercase tracking-[0.3em] text-brand-gray mb-10">What Our Customers Say</p>
        <div className="min-h-40">
          <div className="text-4xl text-brand-primary mb-6">&#8220;</div>
          <p className="font-body text-lg sm:text-xl text-brand-charcoal leading-relaxed italic">
            {reviews[active].body}
          </p>
          <p className="mt-6 font-heading text-xs uppercase tracking-widest text-brand-gray">{reviews[active].author}</p>
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-px transition-all duration-300 ${
                i === active ? 'w-8 bg-brand-black' : 'w-3 bg-brand-gray-light'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Shop All / Full Edit Banner ---
function ShopAllBanner({ bannerUrl }: { bannerUrl: string }) {
  return (
    <section className="relative h-[55vh] min-h-[380px] overflow-hidden group">
      <img
        src={bannerUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80"}
        alt="Shop All theKlane"
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-brand group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-brand-black/50" />
      <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-6">
        <p className="font-heading text-2xs uppercase tracking-[0.3em] mb-4 opacity-70">The Complete Edit</p>
        <h2 className="font-heading font-normal text-4xl sm:text-6xl uppercase tracking-[0.15em] mb-8">The Full Edit</h2>
        <Button variant="secondary" size="lg" as="a" href="/shop"
          className="bg-white text-brand-black hover:bg-white/90 border-none">
          Shop All
        </Button>
      </div>
    </section>
  )
}

// --- Instagram Teaser ---
function InstagramTeaser({ images }: { images: string[] }) {
  const displayImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80',
    'https://images.unsplash.com/photo-1519407066695-f45c0cdf1da8?w=400&q=80',
  ]
  return (
    <section className="py-16 lg:py-20 bg-white border-t border-gray-100">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="font-heading text-2xs uppercase tracking-[0.3em] text-brand-gray mb-2">Follow Along</p>
          <a href="https://instagram.com/theklane" target="_blank" rel="noopener noreferrer"
            className="font-heading text-xl sm:text-2xl uppercase tracking-wider text-brand-dark hover:text-brand-secondary transition-colors">
            @theklane
          </a>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1 sm:gap-2">
          {displayImages.map((src, i) => (
            <a key={i} href="https://instagram.com/theklane" target="_blank" rel="noopener noreferrer"
              className="aspect-square overflow-hidden block group">
              <img src={src} alt={`Instagram ${i + 1}`}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-90" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Email Signup ---
function EmailSignup() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const [saving, setSaving] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSaving(true)
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email })
      if (error && !error.message.includes('duplicate')) throw error
      setSubmitted(true)
    } catch (err: any) {
      if (err.message?.includes('duplicate')) {
        setSubmitted(true) // already subscribed, fail silently
      } else {
        alert(err.message || 'Something went wrong')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="bg-brand-primary/10 border-t border-brand-primary/20 py-20 sm:py-24 lg:py-32">
      <div className="max-w-xl mx-auto px-6 text-center">
        <p className="font-heading text-xs uppercase tracking-[0.25em] text-brand-secondary/60 mb-4">Join the journey</p>
        <h2 className="font-heading font-normal text-2xl sm:text-3xl sm:text-4xl tracking-wider mb-4 text-brand-dark">
          Be the first to step into KLANÉ
        </h2>
        <p className="font-body text-sm text-brand-dark/50 mb-8 sm:mb-10">New drops, exclusive access, and early sale previews, direct to your inbox.</p>
        {submitted ? (
          <div className="py-8">
            <p className="font-heading text-sm uppercase tracking-widest text-brand-secondary">Welcome to the journey</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto shadow-sm">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white border border-brand-gray-light/40 sm:border-r-0 text-brand-dark placeholder:text-brand-dark/30 px-6 py-4 text-sm font-body focus:outline-none focus:ring-1 focus:ring-brand-secondary"
            />
            <button type="submit"
              disabled={saving}
              className="bg-brand-secondary text-white px-8 py-4 font-heading text-2xs uppercase tracking-widest hover:bg-brand-secondary/90 transition-colors whitespace-nowrap disabled:opacity-50">
              {saving ? '...' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

// --- Main Page ---
export default function Home() {
  const content = useSiteContent()
  const [bestSellers, setBestSellers] = useState<any[]>([])
  const [newArrivals, setNewArrivals] = useState<any[]>([])
  const [summerDrops, setSummerDrops] = useState<any[]>([])

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from('products').select('*, product_images(id, url, is_primary)').eq('is_active', true)
      if (data) {
        setBestSellers(data.filter(p => p.is_featured).slice(0, 4))
        setNewArrivals(data.filter(p => p.is_new_arrival).slice(0, 4))
        setSummerDrops(data.filter(p => p.is_featured && p.is_new_arrival).slice(0, 4))
      }
    }
    fetchProducts()
  }, [])

  return (
    <main>
      <HeroSection videoUrl={content.hero_video_url} />
      {content.show_our_story && <OurStorySection heading={content.our_story_heading} subheading={content.our_story_subheading} text={content.our_story_body} />}
      {content.show_summer_drops && <SummerDropsRail products={summerDrops} />}
      {content.show_best_sellers && bestSellers.length > 0 && <ProductRail title="Best Sellers" products={bestSellers} link="/collections/best-sellers" />}
      {content.show_featured_banner && <FeaturedCollectionBanner bannerUrl={content.featured_banner_url} />}
      {content.show_new_arrivals && newArrivals.length > 0 && <ProductRail title="New Arrivals" products={newArrivals} link="/collections/new-arrivals" />}
      {content.show_testimonials && <TestimonialsSection />}
      {content.show_shop_all_banner && <ShopAllBanner bannerUrl={content.shop_all_banner_url} />}
      {content.show_instagram && <InstagramTeaser images={content.instagram_images} />}
      <EmailSignup />
    </main>
  )
}
