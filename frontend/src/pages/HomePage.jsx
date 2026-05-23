import { Link } from 'react-router-dom'
import { useScrollAnimationGroup } from '../hooks/useScrollAnimation'
import { StatCard } from '../components/Cards'
import SectionHeader from '../components/SectionHeader'
import ReviewsSection from '../components/ReviewsSection'

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-obsidian-950 pattern-bg">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold-900/10 blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gold-800/10 blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,#0f0d0b)]" />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gold-800/10 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-gold-800/5 rounded-full animate-spin-slow" />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in">
          <div className="w-12 h-px bg-gold-gradient" />
          <p className="font-arabic text-gold-400 text-sm tracking-widest">الكويت · منذ ٢٠١٢</p>
          <div className="w-12 h-px bg-gold-gradient" />
        </div>
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-ivory-50 leading-none tracking-tight mb-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Lumière
        </h1>
        <p className="font-body text-xl md:text-2xl text-gold-400 italic mb-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          Where Beauty Meets Artistry
        </p>
        <p className="font-body text-base md:text-lg text-ivory-400 max-w-xl mx-auto leading-relaxed mb-12 animate-fade-up" style={{ animationDelay: '0.6s' }}>
          Kuwait's most distinguished beauty sanctuary. Experience transformative treatments crafted with European precision and Arabian soul.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.8s' }}>
          <Link to="/book" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Reserve Your Appointment
          </Link>
          <Link to="/services" className="btn-secondary border-ivory-600/30 text-ivory-300 hover:bg-ivory-300 hover:text-obsidian-950">
            Explore Services
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-8 mt-20 pt-12 border-t border-white/5 animate-fade-up" style={{ animationDelay: '1s' }}>
          <StatCard number="12" suffix="+" label="Years of Excellence" />
          <StatCard number="8K" suffix="+" label="Happy Clients" />
          <StatCard number="24" label="Expert Specialists" />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
        <p className="font-sans text-xs text-obsidian-500 tracking-[0.3em] uppercase">Scroll</p>
        <div className="w-px h-12 bg-gradient-to-b from-gold-500 to-transparent" />
      </div>
    </section>
  )
}

function ServicesPreview() {
  const ref = useScrollAnimationGroup()
  const items = [
    { title: 'Hair Artistry',    arabic: 'تصفيف الشعر',   icon: '✦', to: '/services' },
    { title: 'Nail Design',      arabic: 'تصميم الأظافر', icon: '◈', to: '/services' },
    { title: 'Skin Treatments',  arabic: 'علاجات البشرة', icon: '◇', to: '/services' },
    { title: 'Bridal Packages',  arabic: 'باقات العرائس', icon: '◉', to: '/services' },
  ]
  return (
    <section className="py-24 bg-ivory-50 dark:bg-obsidian-950">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          eyebrow="What We Offer"
          title={<>The Art of<br /><em className="text-gold-500">Refinement</em></>}
          subtitle="From signature hair colour to ancient hammam rituals — every service at Lumière is a curated journey."
        />
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-obsidian-200 dark:bg-obsidian-800">
          {items.map(item => (
            <div key={item.title} className="animate-on-scroll bg-ivory-50 dark:bg-obsidian-900 p-10 group hover:bg-obsidian-900 dark:hover:bg-obsidian-800 transition-all duration-500 cursor-pointer">
              <div className="text-3xl text-gold-400 mb-6 group-hover:scale-125 transition-transform duration-300 inline-block">{item.icon}</div>
              <h3 className="font-display text-xl text-obsidian-900 dark:text-ivory-100 group-hover:text-ivory-100 mb-2 transition-colors">{item.title}</h3>
              <p className="font-arabic text-sm text-gold-500 mb-6">{item.arabic}</p>
              <Link to={item.to} className="font-sans text-xs tracking-widest uppercase text-obsidian-400 group-hover:text-gold-400 transition-colors flex items-center gap-2">
                Explore
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ExperienceSection() {
  const ref = useScrollAnimationGroup()
  return (
    <section className="py-32 bg-obsidian-950 pattern-bg relative overflow-hidden">
      <div className="absolute right-0 top-0 w-1/2 h-full opacity-20">
        <div className="w-full h-full bg-gradient-to-l from-gold-900/30 to-transparent" />
      </div>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10" ref={ref}>
        <div className="animate-on-scroll">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-gold-gradient" />
            <p className="font-sans text-xs tracking-[0.25em] uppercase text-gold-500">The Lumière Experience</p>
          </div>
          <h2 className="section-title text-ivory-100 mb-6">Every Visit, a <br /><em className="gold-text">Masterpiece</em></h2>
          <p className="font-body text-ivory-400 text-lg leading-relaxed mb-8">
            From the moment you step into our sanctuary, you are enveloped in a world of quiet opulence. Our specialists are trained in the world's finest techniques, tailored exclusively for the discerning women of Kuwait.
          </p>
          <div className="space-y-4 mb-10">
            {["Certified by L'Oréal Professionnel Paris", 'Exclusive Swiss skincare formulations', 'Private consultation for every client'].map(point => (
              <div key={point} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gold-gradient flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-obsidian-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="font-sans text-sm text-ivory-300">{point}</p>
              </div>
            ))}
          </div>
          <Link to="/about" className="btn-secondary">Discover Our Story</Link>
        </div>
        <div className="animate-on-scroll relative">
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] bg-obsidian-800 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80" alt="Salon interior" className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-700" />
            </div>
            <div className="aspect-[3/4] bg-obsidian-800 mt-8 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80" alt="Beauty treatment" className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-700" />
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 bg-obsidian-900/80 border border-gold-700/30 p-5">
            <p className="font-display text-3xl gold-text">8K+</p>
            <p className="font-sans text-xs text-ivory-400 tracking-wide uppercase">Satisfied Clients</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function GalleryTeaser() {
  const ref = useScrollAnimationGroup()
  const images = [
    { src: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&q=80', alt: 'Hair styling'  },
    { src: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&q=80', alt: 'Nail art'    },
    { src: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=80', alt: 'Wellness'    },
    { src: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&q=80', alt: 'Bridal'      },
  ]
  return (
    <section className="py-24 bg-ivory-100 dark:bg-obsidian-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionHeader eyebrow="Our Portfolio" title={<>Beauty in<br /><em>Every Frame</em></>} center={false} />
          <Link to="/gallery" className="btn-secondary flex-shrink-0 self-end md:mb-4">
            View Full Gallery
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={i} className="animate-on-scroll overflow-hidden group aspect-[4/5]">
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-24 bg-obsidian-950 relative overflow-hidden">
      <div className="absolute inset-0 pattern-bg opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-900/10 rounded-full blur-[120px]" />
      <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
        <p className="font-arabic text-gold-400 text-lg mb-4">احجزي موعدك الآن</p>
        <h2 className="section-title text-ivory-100 mb-6">Ready to Be <em className="gold-text">Transformed?</em></h2>
        <p className="font-body text-ivory-400 text-lg mb-10">Book your appointment today and step into a world where beauty is an art form.</p>
        <Link to="/book" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Book Your Experience
        </Link>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesPreview />
      <ExperienceSection />
      <GalleryTeaser />
      <ReviewsSection />
      <CTASection />
    </>
  )
}
