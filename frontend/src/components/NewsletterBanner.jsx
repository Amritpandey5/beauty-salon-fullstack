import { useState } from 'react'
import { useToast } from './Toast'
import { newsletterApi } from '../api/contact.api'

export default function NewsletterBanner() {
  const { addToast } = useToast()
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await newsletterApi.subscribe(email)
      setEmail('')
      addToast("Welcome! You've been added to the Lumière inner circle.", 'success')
    } catch (err) {
      addToast(err.message || 'Subscription failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 bg-obsidian-900 border-y border-gold-900/30 relative overflow-hidden">
      <div className="absolute inset-0 pattern-bg opacity-20" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-gold-900/10 rounded-full blur-[80px]" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-gold-900/10 rounded-full blur-[80px]" />

      <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-px bg-gold-gradient" />
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-gold-500">Exclusive Circle</p>
          <div className="w-8 h-px bg-gold-gradient" />
        </div>
        <h3 className="font-display text-3xl text-ivory-100 mb-3">
          Join the <em className="gold-text">Inner Circle</em>
        </h3>
        <p className="font-body text-obsidian-400 mb-8 leading-relaxed">
          Receive priority booking, exclusive member offers, seasonal beauty guides, and first access to new treatments.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="your@email.com"
              className="w-full px-4 py-3.5 bg-obsidian-800 border border-obsidian-700 text-ivory-100 text-sm font-sans placeholder-obsidian-500 focus:outline-none focus:border-gold-500 transition-colors"
            />
            {error && <p className="font-sans text-xs text-red-400 mt-1 text-left">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-xs py-3.5 px-6 flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border border-obsidian-700 border-t-obsidian-900 rounded-full animate-spin" />
                Joining...
              </span>
            ) : 'Join Now'}
          </button>
        </form>
        <p className="font-sans text-xs text-obsidian-600 mt-4">No spam. Unsubscribe anytime. We value your privacy.</p>
      </div>
    </section>
  )
}
