import { useScrollAnimationGroup } from '../hooks/useScrollAnimation'
import { useApi } from '../hooks/useApi'
import { specialistsApi } from '../api/specialists.api'
import SectionHeader from '../components/SectionHeader'
import { useNavigate } from 'react-router-dom'
import { TeamCard, StatCard } from '../components/Cards'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'

const values = [
  { title: 'Artistry', arabic: 'الفن', desc: 'Every service is an act of creative expression by our certified specialists.' },
  { title: 'Precision', arabic: 'الدقة', desc: 'We obsess over the details so you walk out absolutely flawless.' },
  { title: 'Discretion', arabic: 'الخصوصية', desc: 'Your personal experience remains entirely private and sacred.' },
  { title: 'Excellence', arabic: 'التميز', desc: 'International certifications, premium products, and continuous training.' },
]

export default function AboutPage() {
  const teamRef = useScrollAnimationGroup()
  const valuesRef = useScrollAnimationGroup()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data, loading } =useApi(() => specialistsApi.getAll(), [])
  // console.log(data);

  const specialists = data || []
  

  return (
    <>
      {/* Hero */}
      <section className="relative pt-40 pb-24 bg-obsidian-950 pattern-bg overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,#0f0d0b_90%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-900/8 rounded-full blur-[140px]" />
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-gold-gradient" />
            <p className="font-sans text-xs tracking-[0.25em] uppercase text-gold-500">Our Story</p>
            <div className="w-8 h-px bg-gold-gradient" />
          </div>
          <h1 className="section-title text-ivory-100 mb-6">
            Born From a Passion<br />for <em className="gold-text">Kuwaiti Beauty</em>
          </h1>
          <p className="font-body text-ivory-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Founded in 2012 in the heart of Kuwait City, Lumière began as a vision — to create a space where Arabian elegance meets European craftsmanship in perfect harmony.
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="py-24 bg-ivory-50 dark:bg-obsidian-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="relative">
                <div className="aspect-square max-w-md bg-obsidian-200 dark:bg-obsidian-800 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80"
                    alt="Salon founder"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-obsidian-950 dark:bg-black border border-gold-700/30 p-6">
                  <p className="font-display text-4xl gold-text">12</p>
                  <p className="font-sans text-xs text-ivory-400 uppercase tracking-wider">Years of Excellence</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="section-title text-obsidian-900 dark:text-ivory-100 mb-6">
                Our Founder's <em className="text-gold-500">Vision</em>
              </h2>
              <p className="font-body text-obsidian-600 dark:text-ivory-400 text-lg leading-relaxed mb-6">
                Nour Al-Ansari, our founder, trained at the prestigious L'Oréal Academie in Paris before returning to Kuwait to bring that world-class experience home to Kuwaiti women.
              </p>
              <p className="font-body text-obsidian-600 dark:text-ivory-400 leading-relaxed mb-8">
                "I wanted every Kuwaiti woman to feel the luxury and artistry that I experienced in Paris — right here at home, surrounded by the warmth and culture of our beautiful country."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold-gradient flex items-center justify-center">
                  <span className="font-display text-obsidian-900 text-lg">N</span>
                </div>
                <div>
                  <p className="font-display text-obsidian-900 dark:text-ivory-100">Nour Al-Ansari</p>
                  <p className="font-sans text-xs text-gold-500 uppercase tracking-widest">Founder & Creative Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-obsidian-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
            {[
              { number: '8K', suffix: '+', label: 'Clients Served' },
              { number: '24', suffix: '', label: 'Specialists' },
              { number: '35', suffix: '+', label: 'Awards Won' },
              { number: '99', suffix: '%', label: 'Satisfaction Rate' },
            ].map(s => <StatCard key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-ivory-50 dark:bg-obsidian-950">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Our Values"
            title={<>What We <em>Stand For</em></>}
          />
          <div ref={valuesRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(v => (
              <div key={v.title} className="animate-on-scroll border border-obsidian-200 dark:border-obsidian-700/50 p-8 hover:border-gold-400/50 transition-all duration-300">
                <p className="font-arabic text-2xl text-gold-500 mb-3">{v.arabic}</p>
                <h3 className="font-display text-xl text-obsidian-900 dark:text-ivory-100 mb-3">{v.title}</h3>
                <p className="font-sans text-sm text-obsidian-500 dark:text-obsidian-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team — loaded from API */}
       <section className="py-24 bg-ivory-100 dark:bg-obsidian-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center mb-6 justify-end  gap-2 flex-wrap">
            {/* ADMIN BUTTON */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin/create-new-specialist')}
                  className="bg-gold-gradient text-obsidian-950 px-6 py-3 rounded-lg font-sans text-xs uppercase tracking-widest hover:scale-105 transition-all duration-300"
                >
                  + Create Speacilist
                </button>
              )}

          </div>
          <SectionHeader
            eyebrow="Our Team"
            title={<>Meet the <em>Artists</em></>}
          />

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader size="lg" />
            </div>
          ) : specialists.length === 0 ? (
            <div className="text-center py-16 border border-obsidian-200 dark:border-obsidian-700/50">
              <p className="text-obsidian-500">
                No specialists available at the moment.
              </p>
            </div>
          ) : (
            <div ref={teamRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {specialists.map(member => (
                <TeamCard
                  key={member._id}
                  name={member.name}
                  role={member.role}
                  image={member.image}
                  specialties={member.specialties || []}
                />
              ))}
            </div>
          )}

        </div>
      </section>


      {/* CTA */}
      <section className="py-24 bg-obsidian-950 relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <h2 className="section-title text-ivory-100 mb-6">Begin Your <em className="gold-text">Journey</em></h2>
          <Link to="/book" className="btn-primary">Book an Appointment</Link>
        </div>
      </section>
    </>
  )
}
