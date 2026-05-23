import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-obsidian-950 pattern-bg flex items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-gold-900/10 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-gold-900/15 rounded-full animate-spin-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-gold-900/20 rounded-full" />

      {/* Gold blur glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-900/10 rounded-full blur-[120px]" />

      <div className="relative z-10 text-center max-w-xl">
        {/* 404 number */}
        <div className="relative mb-8 inline-block">
          <span className="font-display text-[10rem] md:text-[14rem] leading-none font-400 text-transparent"
            style={{
              WebkitTextStroke: '1px rgba(201,162,39,0.3)',
            }}
          >
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center font-display text-[10rem] md:text-[14rem] leading-none gold-text opacity-20 blur-sm select-none">
            404
          </span>
        </div>

        {/* Ornament */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-px bg-gold-gradient" />
          <span className="text-gold-500 text-lg">✦</span>
          <div className="w-12 h-px bg-gold-gradient" />
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-ivory-100 mb-4">
          Page Not Found
        </h1>
        <p className="font-arabic text-gold-400 text-base mb-6">
          الصفحة غير موجودة
        </p>
        <p className="font-body text-obsidian-400 text-lg leading-relaxed mb-10">
          The page you're looking for has drifted beyond our sanctuary walls. Let us guide you back to beauty.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link to="/" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return Home
          </Link>
          <Link to="/book" className="btn-secondary">
            Book Appointment
          </Link>
        </div>

        {/* Quick links */}
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {[
            { to: '/about', label: 'About' },
            { to: '/services', label: 'Services' },
            { to: '/gallery', label: 'Gallery' },
            { to: '/contact', label: 'Contact' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="font-sans text-xs uppercase tracking-widest text-obsidian-500 hover:text-gold-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Countdown */}
        <p className="font-sans text-xs text-obsidian-600 mt-10">
          Redirecting to home in{' '}
          <span className="text-gold-600 font-600">{countdown}</span>
          {' '}second{countdown !== 1 ? 's' : ''}…
        </p>
      </div>
    </div>
  )
}
