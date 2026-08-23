import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../../components/product/ProductCard'
import { Button } from '../../components/ui/Button'
import { mockProducts, mockReviews, mockCollections } from '../../lib/mockData'
import { supabase } from '../../lib/supabase'

export function useSiteContent() {
  const [content, setContent] = useState({
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
    ]
  })

  useEffect(() => {
    supabase.from('site_settings').select('*').then(({ data }) => {
      if (data) {
        const newContent = { ...content }
        data.forEach(row => {
          if (row.key in newContent) {
            if (row.key === 'instagram_images' && row.message) {
              try { (newContent as any).instagram_images = JSON.parse(row.message) } catch(e){}
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

function HeroSection({ videoUrl }: { videoUrl: string }) {
  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-brand-neutral">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&q=80"
        className="absolute inset-0 w-full h-full object-cover object-center"
      >
        <source src={videoUrl} type="video/mp4" />
        {/* Fallback: poster image is shown if video can't load */}
      </video>
      <div className="absolute inset-0 bg-brand-dark/40" />
      <div className="relative h-full flex flex-col items-center justify-end pb-24 px-6 text-center text-white">
        <p className="font-heading text-xs uppercase tracking-[0.25em] mb-6 drop-shadow-sm">every becoming begins with a choice</p>
        <h1 className="font-heading font-normal text-6xl sm:text-7xl lg:text-8xl tracking-tight leading-none mb-6 drop-shadow-md">
          KLANÉ
        </h1>
        <p className="font-body text-base sm:text-lg text-white/90 max-w-md mb-12 drop-shadow-sm font-light">
          Intentional femininity for the woman becoming
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button variant="primary" size="lg" as="a" href="/shop"
            className="bg-brand-secondary text-white hover:bg-brand-secondary/90 border-none px-10">
            Shop the Collection
          </Button>
        </div>
      </div>
    </section>
  )
}

function OurStorySection({ heading, subheading, text }: { heading: string, subheading: string, text: string }) {
  return (
    <section className="bg-brand-base text-brand-dark py-24 lg:py-32 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-brand-secondary/30" />
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-heading font-normal text-4xl sm:text-5xl lg:text-6xl mb-10 tracking-wide">{heading}</h2>
        <p className="font-heading text-xl sm:text-2xl text-brand-dark/90 italic mb-16 font-light">
          {subheading}
        </p>
        <div className="max-w-2xl mx-auto">
          <p className="font-body text-base sm:text-lg leading-relaxed text-brand-dark/70 whitespace-pre-line">
            {text}
          </p>
        </div>
      </div>
    </section>
  )
}

function ProductRail({ title, products, link }: { title: string; products: typeof mockProducts; link: string }) {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-heading font-semibold text-2xl sm:text-3xl uppercase tracking-wider">{title}</h2>
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
        <h2 className="font-heading font-semibold text-4xl sm:text-6xl uppercase tracking-wider mb-6">{collection?.name || 'Featured'}</h2>
        <Button variant="secondary" size="lg" as="a" href={collection ? `/collections/${collection.slug}` : '/shop'}
          className="bg-white text-brand-black hover:bg-brand-cream">
          Explore Collection
        </Button>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const [active, setActive] = useState(0)
  const reviews = mockReviews

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % reviews.length), 5000)
    return () => clearInterval(t)
  }, [reviews.length])

  return (
    <section className="bg-brand-cream-dark py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="font-heading text-2xs uppercase tracking-[0.3em] text-brand-gray mb-10">What Our Customers Say</p>
        <div className="min-h-40">
          <div className="text-4xl text-brand-sand mb-6">&#8220;</div>
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
              className={`h-1 transition-all duration-300 ${
                i === active ? 'w-8 bg-brand-black' : 'w-3 bg-brand-gray-light'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function ShopAllBanner({ bannerUrl }: { bannerUrl: string }) {
  return (
    <section className="relative h-[50vh] min-h-[380px] overflow-hidden group">
      <img
        src={bannerUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80"}
        alt="Shop All theKlane"
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-brand group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-brand-black/50" />
      <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-6">
        <h2 className="font-heading font-semibold text-3xl sm:text-5xl uppercase tracking-widest mb-8">The Full Edit</h2>
        <Button variant="secondary" size="lg" as="a" href="/shop"
          className="bg-white text-brand-black hover:bg-brand-cream">
          Shop All
        </Button>
      </div>
    </section>
  )
}

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
    <section className="py-16 lg:py-20 border-t border-brand-cream-dark">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="font-heading text-2xs uppercase tracking-[0.3em] text-brand-gray mb-2">Follow Along</p>
          <a href="https://instagram.com/theklane" target="_blank" rel="noopener noreferrer"
            className="font-heading text-xl sm:text-2xl uppercase tracking-wider hover:text-brand-sand transition-colors">
            @theklane
          </a>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1 sm:gap-2">
          {displayImages.map((src, i) => (
            <a key={i} href="https://instagram.com/theklane" target="_blank" rel="noopener noreferrer"
              className="aspect-square overflow-hidden block group">
              <img src={src} alt={`Instagram ${i + 1}`}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:opacity-90" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function EmailSignup() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section className="bg-brand-primary text-brand-dark py-24 lg:py-32">
      <div className="max-w-xl mx-auto px-6 text-center">
        <p className="font-heading text-xs uppercase tracking-[0.25em] text-brand-dark/60 mb-6">Join the journey</p>
        <h2 className="font-heading font-normal text-3xl sm:text-4xl tracking-wider mb-6">
          Be the first to step into klané
        </h2>
        {submitted ? (
          <div className="py-8">
            <p className="font-heading text-sm uppercase tracking-widest text-brand-secondary">Welcome to the journey ✓</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-0 mt-12 max-w-md mx-auto shadow-sm">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white border-none text-brand-dark placeholder:text-brand-dark/40 px-6 py-4 text-sm font-body focus:outline-none focus:ring-1 focus:ring-brand-secondary"
            />
            <button type="submit"
              className="bg-brand-secondary text-white px-8 py-4 font-body text-sm font-medium hover:bg-brand-secondary/90 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export default function Home() {
  const content = useSiteContent()
  const [bestSellers, setBestSellers] = useState<any[]>([])
  const [newArrivals, setNewArrivals] = useState<any[]>([])

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from('products').select('*, product_images(id, url, is_primary)').eq('is_active', true)
      if (data) {
        setBestSellers(data.filter(p => p.is_featured).slice(0, 4))
        setNewArrivals(data.filter(p => p.is_new_arrival).slice(0, 4))
      }
    }
    fetchProducts()
  }, [])

  return (
    <main>
      <HeroSection videoUrl={content.hero_video_url} />
      <OurStorySection heading={content.our_story_heading} subheading={content.our_story_subheading} text={content.our_story_body} />
      {bestSellers.length > 0 && <ProductRail title="Best Sellers" products={bestSellers as any} link="/collections/best-sellers" />}
      <FeaturedCollectionBanner bannerUrl={content.featured_banner_url} />
      {newArrivals.length > 0 && <ProductRail title="New Arrivals" products={newArrivals as any} link="/collections/new-arrivals" />}
      <TestimonialsSection />
      <ShopAllBanner bannerUrl={content.shop_all_banner_url} />
      <InstagramTeaser images={content.instagram_images} />
      <EmailSignup />
    </main>
  )
}
