import { Link, useLocation } from 'react-router-dom'

const routeLabels = {
  '': 'Home',
  about: 'About',
  services: 'Services',
  contact: 'Contact',
  book: 'Book Appointment',
  gallery: 'Gallery',
  login: 'Login',
  register: 'Register',
  dashboard: 'Dashboard',
}

export default function Breadcrumb({ className = '' }) {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = [
    { label: 'Home', to: '/' },
    ...segments.map((seg, i) => ({
      label: routeLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
      to: '/' + segments.slice(0, i + 1).join('/'),
    })),
  ]

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 ${className}`}>
      {crumbs.map((crumb, i) => (
        <span key={crumb.to} className="flex items-center gap-2">
          {i > 0 && (
            <span className="text-gold-700">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
          {i === crumbs.length - 1 ? (
            <span className="font-sans text-xs text-gold-400 tracking-wide">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.to}
              className="font-sans text-xs text-obsidian-400 hover:text-gold-400 transition-colors tracking-wide"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
