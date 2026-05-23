import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollAnimationGroup } from '../hooks/useScrollAnimation'
import { useApi } from '../hooks/useApi'
import { servicesApi } from '../api/services.api'
import SectionHeader from '../components/SectionHeader'
import { ServiceCard } from '../components/Cards'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'


const ServiceIcons = {
  hair: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 2C8 2 5 5 5 9c0 3 2 5.5 5 6.5V20h4v-4.5c3-1 5-3.5 5-6.5 0-4-3-7-7-7z" strokeLinecap="round" /><path d="M9 9h6M9 12h4" strokeLinecap="round" /></svg>),
  color: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M7 14c0 2.5 2 4 5 4s5-1.5 5-4c0-3-2-5-5-8C9 9 7 11 7 14z" strokeLinecap="round" /><path d="M12 2v3M4 7l2 2M20 7l-2 2" strokeLinecap="round" /></svg>),
  nail: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="6" y="2" width="4" height="9" rx="2" /><rect x="14" y="2" width="4" height="7" rx="2" /><path d="M5 13h14l-2 9H7l-2-9z" strokeLinecap="round" /></svg>),
  facial: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="8" /><path d="M9 9.5c0-.8.7-1.5 1.5-1.5S12 8.7 12 9.5M12 9.5c0-.8.7-1.5 1.5-1.5S15 8.7 15 9.5" strokeLinecap="round" /><path d="M9 15c.7 1 1.8 1.5 3 1.5s2.3-.5 3-1.5" strokeLinecap="round" /></svg>),
  bridal: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  spa: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 22V12M12 12C12 7 17 3 20 3c0 5-3 9-8 9zM12 12C12 7 7 3 4 3c0 5 3 9 8 9z" strokeLinecap="round" /></svg>),
}

const CATEGORIES = ['All', 'Hair', 'Nails', 'Skin', 'Bridal', 'Wellness']

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const navigate = useNavigate()
  const { user } = useAuth()
  const ref = useScrollAnimationGroup()
  const { data, loading, error } = useApi(
    async () => {
      const res = await servicesApi.getAll()
      // console.log("API RESPONSE RAW:", res)
      return res
    },
    []
  )

  useEffect(() => {
    const elements = document.querySelectorAll('.animate-on-scroll')

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    })

    elements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [data])


  const allServices = data || []

  const filtered =
    activeCategory === 'All'
      ? allServices
      : allServices.filter(
        s => s.category?.toLowerCase() === activeCategory.toLowerCase()
      )

  // console.log('filter category',filtered);





  return (
    <>
      <section className="relative pt-40 pb-24 bg-obsidian-950 pattern-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-obsidian-950" />
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-gold-gradient" />
            <p className="font-sans text-xs tracking-[0.25em] uppercase text-gold-500">Our Services</p>
            <div className="w-8 h-px bg-gold-gradient" />
          </div>
          <h1 className="section-title text-ivory-100 mb-6">Treatments Crafted for<br /><em className="gold-text">Perfection</em></h1>
          <p className="font-body text-ivory-400 text-lg max-w-xl mx-auto">Every service is a carefully choreographed experience using the world's finest products.</p>
        </div>
      </section>

      <section className="py-24 bg-ivory-50 dark:bg-obsidian-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-16">

            {/* Categories */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 font-sans text-xs tracking-widest uppercase transition-all duration-300 ${activeCategory === cat
                      ? 'bg-gold-gradient text-obsidian-950'
                      : 'border border-obsidian-300 dark:border-obsidian-700 text-obsidian-500 dark:text-obsidian-400 hover:border-gold-500 hover:text-gold-500'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* ADMIN BUTTON */}
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/create-new-service')}
                className="bg-gold-gradient text-obsidian-950 px-6 py-3 rounded-lg font-sans text-xs uppercase tracking-widest hover:scale-105 transition-all duration-300"
              >
                + Create Service
              </button>
            )}

          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader size="lg" /></div>
          ) : error ? (
            <p className="text-center font-sans text-red-400 py-12">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="text-center font-body text-obsidian-400 py-12">No services found in this category.</p>
          ) : (
            <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-on-scroll">
              {filtered.map(service => (
                <div key={service._id} className="">
                  <ServiceCard
                    icon={ServiceIcons[service.icon] || ServiceIcons.hair}
                    title={service.title}
                    subtitle={service.subtitle}
                    price={service.price?.display || `${service.price?.amount} ${service.price?.currency}`}
                    duration={service.duration?.display || `${service.duration?.minMinutes} min`}
                    onBook={() => navigate('/book', { state: { serviceId: service._id, service: service.title } })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-obsidian-900">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Luxury Packages" light
            title={<>Custom <em className="gold-text">Experiences</em></>}
            subtitle="Can't find exactly what you're looking for? Our team will create a bespoke package tailored to your desires."
          />
          {/* <div className="max-w-2xl mx-auto border border-gold-700/40 p-10 text-center">
            <p className="font-body text-ivory-400 mb-8 leading-relaxed">Contact our concierge team via WhatsApp for bespoke packages, group bookings, corporate events, or bridal planning sessions.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://wa.me/96512345678" className="btn-primary">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp Concierge
              </a>
              <a href="tel:+96512345678" className="btn-secondary border-ivory-600/30 text-ivory-300 hover:bg-ivory-300 hover:text-obsidian-950">Call Us</a>
            </div>
          </div> */}
        </div>
      </section>
    </>
  )
}