import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTheme } from '../App'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'

const navLinks = [
  { to: '/',        label: 'Home'     },
  { to: '/about',   label: 'About'    },
  { to: '/services',label: 'Services' },
  { to: '/gallery', label: 'Gallery'  },
  { to: '/contact', label: 'Contact'  },
]

export default function Navbar() {
  const { isDark, toggleTheme }      = useTheme()
  const { isAuthenticated, user, logout } = useAuth()
  const { addToast }                 = useToast()
  const [scrolled, setScrolled]      = useState(false)
  const [mobileOpen, setMobileOpen]  = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  const handleLogout = async () => {
    await logout()
    addToast('Signed out successfully.', 'info')
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'py-3 bg-obsidian-950/95 backdrop-blur-md shadow-luxury'
          : 'py-6 bg-transparent'
      }`}>
        <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex flex-col leading-none group">
            <span className="font-display text-2xl gold-text tracking-wide">Lumière</span>
            <span className="font-arabic text-xs text-gold-400 tracking-widest opacity-80">لوميير — الكويت</span>
          </Link>

          <ul className="hidden lg:flex items-center gap-10">
            {navLinks.map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to} end={link.to === '/'}
                  className={({ isActive }) =>
                    `font-sans text-sm tracking-widest uppercase transition-all duration-300 relative group ${
                      isActive ? 'text-gold-400' : 'text-ivory-300 hover:text-gold-400'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      <span className={`absolute -bottom-1 left-0 h-px bg-gold-gradient transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gold-700/50 text-gold-400 hover:border-gold-400 hover:bg-gold-400/10 transition-all duration-300"
            >
              {isDark
                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              }
            </button>

            {isAuthenticated ? (
              <div className="hidden lg:flex items-center gap-3">
                <Link to="/dashboard" className="flex items-center gap-2 text-xs font-sans text-ivory-300 hover:text-gold-400 transition-colors uppercase tracking-widest">
                  <div className="w-7 h-7 bg-gold-gradient flex items-center justify-center">
                    <span className="font-display text-obsidian-900 text-xs font-600">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-sans text-obsidian-400 hover:text-red-400 transition-colors uppercase tracking-widest"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <Link to="/login" className="font-sans text-xs text-ivory-400 hover:text-gold-400 transition-colors uppercase tracking-widest">
                  Login
                </Link>
                <Link to="/book" className="btn-primary text-xs py-2.5 px-6">
                  Book Now
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(p => !p)}
              className="lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 text-gold-400"
            >
              <span className={`block w-6 h-px bg-current transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-4 h-px bg-current transition-all duration-300 ml-auto ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-px bg-current transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-obsidian-950/98 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-72 bg-obsidian-900 border-l border-gold-800/30 flex flex-col pt-24 px-8 transition-transform duration-500 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="mb-8">
            <div className="w-12 h-px bg-gold-gradient mb-6" />
            <p className="font-arabic text-gold-400 text-sm">القائمة الرئيسية</p>
          </div>
          <ul className="flex flex-col gap-6 flex-1">
            {navLinks.map((link, i) => (
              <li key={link.to} style={{ animationDelay: `${i * 80}ms` }}>
                <NavLink to={link.to} end={link.to === '/'} className={({ isActive }) => `font-display text-2xl transition-all duration-300 ${isActive ? 'text-gold-400' : 'text-ivory-200 hover:text-gold-400'}`}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="pb-12">
            {isAuthenticated ? (
              <div className="space-y-3">
                <Link to="/dashboard" className="btn-primary w-full justify-center text-xs">
                  My Dashboard
                </Link>
                <button onClick={handleLogout} className="w-full text-xs text-obsidian-400 hover:text-red-400 transition-colors uppercase tracking-widest font-sans py-2">
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link to="/book" className="btn-primary w-full justify-center text-xs">
                  Book Appointment
                </Link>
                <div className="flex gap-4 mt-6">
                  <Link to="/login"    className="text-xs text-obsidian-400 hover:text-gold-400 transition-colors uppercase tracking-widest font-sans">Login</Link>
                  <span className="text-obsidian-600">·</span>
                  <Link to="/register" className="text-xs text-obsidian-400 hover:text-gold-400 transition-colors uppercase tracking-widest font-sans">Register</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
