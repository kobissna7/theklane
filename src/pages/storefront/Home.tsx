import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../../components/product/ProductCard'
import { Button } from '../../components/ui/Button'
import { mockProducts, mockReviews, mockCollections } from '../../lib/mockData'

function HeroSection() {
  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-brand-charcoal">
      <img
        src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&q=80"
        alt="theKlane hero"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/20 via-transparent to-brand-black/60" />
      <div className="relative h-full flex flex-col items-center justify-end pb-20 px-6 text-center text-white">
        <p className="font-heading text-2xs uppercase tracking-[0.3em] mb-4 opacity-80">New Collection 2024</p>
        <h1 className="font-heading font-semibold text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-none mb-6">
          Wear Your
          <br />
          <em className="not-italic text-brand-sand">Confidence</em>
        </h1>
        <p className="font-body text-base sm:text-lg text-white/70 max-w-md mb-10">
          Curated pieces for the woman who stands out effortlessly.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button variant="primary" size="lg" as="a" href="/collections/new-arrivals"
            className="bg-white text-brand-black hover:bg-brand-cream">
            Shop the Drop
          </Button>
          <Button variant="ghost" size="lg" as="a" href="/shop"
            className="text-white border border-white/40 hover:bg-white/10">
            Explore All
          </Button>
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

function FeaturedCollectionBanner() {
  const collection = mockCollections[1]
  return (
    <section className="relative h-[60vh] min-h-[400px] overflow-hidden group">
      <img
        src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&q=80"
        alt={collection.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-brand group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-brand-black/40" />
      <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-6">
        <p className="font-heading text-2xs uppercase tracking-[0.3em] mb-3 opacity-70">Curated Collection</p>
        <h2 className="font-heading font-semibold text-4xl sm:text-6xl uppercase tracking-wider mb-6">{collection.name}</h2>
        <Button variant="secondary" size="lg" as="a" href={`/collections/${collection.slug}`}
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

function ShopAllBanner() {
  return (
    <section className="relative h-[50vh] min-h-[380px] overflow-hidden group">
      <img
        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80"
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

function InstagramTeaser() {
  const images = [
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
          {images.map((src, i) => (
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
    <section className="bg-brand-black text-white py-20 lg:py-28">
      <div className="max-w-xl mx-auto px-6 text-center">
        <p className="font-heading text-2xs uppercase tracking-[0.3em] text-white/40 mb-4">Join the Club</p>
        <h2 className="font-heading font-semibold text-3xl sm:text-4xl uppercase tracking-wider mb-4">
          Get 10% Off
        </h2>
        <p className="font-body text-base text-white/60 mb-10">
          Join the theKlane club for early access, exclusive drops, and 10% off your first order.
        </p>
        {submitted ? (
          <div className="py-8">
            <p className="font-heading text-sm uppercase tracking-widest text-brand-sand">Welcome to the club ✓</p>
            <p className="text-sm text-white/50 mt-2 font-body">Check your inbox for your discount code.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-0">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/30 px-4 py-3.5 text-sm font-body focus:outline-none focus:border-brand-sand"
            />
            <button type="submit"
              className="bg-brand-sand text-brand-black px-6 py-3.5 font-heading text-2xs uppercase tracking-widest hover:bg-brand-sand-dark transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export default function Home() {
  const bestSellers = mockProducts.filter(p => p.is_featured).slice(0, 4)
  const newArrivals = mockProducts.filter(p => p.is_new_arrival).slice(0, 4)

  return (
    <main>
      <HeroSection />
      <ProductRail title="Best Sellers" products={bestSellers} link="/collections/best-sellers" />
      <FeaturedCollectionBanner />
      <ProductRail title="New Arrivals" products={newArrivals} link="/collections/new-arrivals" />
      <TestimonialsSection />
      <ShopAllBanner />
      <InstagramTeaser />
      <EmailSignup />
    </main>
  )
}
