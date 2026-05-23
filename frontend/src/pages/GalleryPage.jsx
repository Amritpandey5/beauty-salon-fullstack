import { useState } from 'react'
import ImageGallery from '../components/ImageGallery'
import SectionHeader from '../components/SectionHeader'
import Breadcrumb from '../components/Breadcrumb'
import { useScrollAnimationGroup } from '../hooks/useScrollAnimation'

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80', alt: 'Luxury salon interior', category: 'Interior' },
  { src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80', alt: 'Hair styling session', category: 'Hair' },
  { src: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80', alt: 'Expert colorist at work', category: 'Hair' },
  { src: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80', alt: 'Nail artistry close-up', category: 'Nails' },
  { src: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80', alt: 'Facial treatment', category: 'Skin' },
  { src: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80', alt: 'Relaxing spa ambiance', category: 'Wellness' },
  { src: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80', alt: 'Bridal hair styling', category: 'Bridal' },
  { src: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80', alt: 'Elegant nail design', category: 'Nails' },
  { src: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80', alt: 'Premium hair treatment', category: 'Hair' },
  { src: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&q=80', alt: 'Salon styling tools', category: 'Interior' },
  { src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80', alt: 'Hair colour consultation', category: 'Hair' },
  { src: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80', alt: 'Bridal makeup artistry', category: 'Bridal' },
  { src: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&q=80', alt: 'Balayage highlights', category: 'Hair' },
  { src: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=600&q=80', alt: 'Manicure in progress', category: 'Nails' },
  { src: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80', alt: 'Spa wellness ritual', category: 'Wellness' },
  { src: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600&q=80', alt: 'Skincare treatment', category: 'Skin' },
  { src: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&q=80', alt: 'Bridal preparation', category: 'Bridal' },
  { src: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&q=80', alt: 'Luxury pedicure', category: 'Nails' },
]

const categories = ['All', 'Hair', 'Nails', 'Skin', 'Bridal', 'Wellness', 'Interior']

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const statsRef = useScrollAnimationGroup()

  const filtered = activeFilter === 'All'
    ? galleryImages
    : galleryImages.filter(img => img.category === activeFilter)

  return (
    <>
      {/* Hero */}
      <section className="relative pt-40 pb-20 bg-obsidian-950 pattern-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-gold-800/8 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-gold-800/10 rounded-full animate-spin-slow" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Breadcrumb className="justify-center mb-8" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-px bg-gold-gradient" />
              <p className="font-sans text-xs tracking-[0.25em] uppercase text-gold-500">Our Portfolio</p>
              <div className="w-8 h-px bg-gold-gradient" />
            </div>
            <h1 className="section-title text-ivory-100 mb-6">
              Beauty Captured<br />
              <em className="gold-text">In Every Frame</em>
            </h1>
            <p className="font-body text-ivory-400 text-lg max-w-xl mx-auto leading-relaxed">
              A curated portfolio of transformations — from bold colour work to timeless bridal looks — all crafted within the walls of Lumière.
            </p>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-12 bg-obsidian-900 border-y border-gold-900/30">
        <div ref={statsRef} className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: '500+', label: 'Transformations' },
            { n: '18', label: 'Categories' },
            { n: '12', label: 'Years of Work' },
            { n: '100%', label: 'Client Approved' },
          ].map(s => (
            <div key={s.label} className="animate-on-scroll">
              <p className="font-display text-3xl gold-text mb-1">{s.n}</p>
              <p className="font-sans text-xs uppercase tracking-widest text-obsidian-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-ivory-50 dark:bg-obsidian-950">
        <div className="max-w-7xl mx-auto px-6">
          {/* Filter tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-14">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2 font-sans text-xs tracking-widest uppercase transition-all duration-300 ${
                  activeFilter === cat
                    ? 'bg-gold-gradient text-obsidian-950 shadow-gold'
                    : 'border border-obsidian-300 dark:border-obsidian-700 text-obsidian-500 dark:text-obsidian-400 hover:border-gold-500 hover:text-gold-500'
                }`}
              >
                {cat}
                {cat !== 'All' && (
                  <span className="ml-2 opacity-60">
                    ({galleryImages.filter(i => i.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mb-4 text-right">
            <p className="font-sans text-xs text-obsidian-400 dark:text-obsidian-500">
              Showing {filtered.length} image{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          <ImageGallery images={filtered} />
        </div>
      </section>

      {/* Instagram CTA */}
      <section className="py-20 bg-obsidian-950 relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-30" />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <div className="w-14 h-14 mx-auto mb-6 bg-gold-gradient/10 border border-gold-700/40 flex items-center justify-center">
            <svg className="w-6 h-6 text-gold-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <h3 className="font-display text-3xl text-ivory-100 mb-4">
            Follow <em className="gold-text">@lumierekuwait</em>
          </h3>
          <p className="font-body text-obsidian-400 mb-8 leading-relaxed">
            Stay inspired with daily transformations, behind-the-scenes moments, and exclusive offers on our Instagram.
          </p>
          <a
            href="https://instagram.com/amritpandey506"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Follow on Instagram
          </a>
        </div>
      </section>
    </>
  )
}
