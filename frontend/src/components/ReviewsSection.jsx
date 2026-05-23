import { useState, useEffect } from 'react'
import { useToast } from './Toast'
import { useAuth } from '../context/AuthContext'
import Modal from './Modal.jsx'
import { reviewsApi } from '../api/reviews.api'
import Loader from './Loader'

function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0)
  const display = readOnly ? value : (hovered || value)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`transition-all duration-150 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-125'}`}
        >
          <svg
            className={`w-5 h-5 transition-colors duration-150 ${star <= display ? 'text-gold-400 fill-current' : 'text-obsidian-600'}`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function ReviewsSection() {
  const { addToast } = useToast()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 })
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({ rating: 5, text: '', serviceName: '' })
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const LIMIT = 4

  const loadReviews = async (p = 1, append = false) => {
    setLoading(true)
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        reviewsApi.getAll({ page: p, limit: LIMIT }),
        reviewsApi.getSummary(),
      ])
      const fetched = reviewsRes.data || []
      setReviews(prev => append ? [...prev, ...fetched] : fetched)
      setHasMore(reviewsRes.pagination?.hasNext || false)
      setSummary(summaryRes.data?.summary || { averageRating: 0, totalReviews: 0 })
    } catch (err) {
      console.error("Load reviews error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadReviews(1) }, [])

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    loadReviews(next, true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.text || form.text.length < 10) {
      addToast('Review must be at least 10 characters.', 'error')
      return
    }
    setSubmitting(true)
    try {
      await reviewsApi.create({
        rating: form.rating,
        text: form.text,
        serviceName: form.serviceName || undefined,
      })
      setForm({ rating: 5, text: '', serviceName: '' })
      setIsModalOpen(false)
      addToast('Review submitted! It will appear once approved by our team.', 'success')
    } catch (err) {
      console.error("FULL ERROR:", err)

      addToast(
        err?.data?.message ||
        err?.message ||
        "Failed to submit review",
        "error"
      )
    } finally {
      setSubmitting(false)
    }
  }

  const avgDisplay = summary.averageRating
    ? summary.averageRating.toFixed(1)
    : '5.0'

  const serviceOptions = [
    'Couture Styling', 'Color & Highlights', 'Artisan Nail Design',
    'Radiance Facial', 'Bridal Majlis Package', 'Hammam Ritual',
  ]
  // console.log("MODAL STATE:", isModalOpen)
  // console.log("Rendering Modal component")
  return (
    <section className="py-24 bg-ivory-50 dark:bg-obsidian-950">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-gold-gradient" />
              <p className="font-sans text-xs tracking-[0.25em] uppercase text-gold-600 dark:text-gold-400">Client Reviews</p>
            </div>
            <h2 className="section-title text-obsidian-900 dark:text-ivory-100 mb-3">
              What Our <em>Guests Say</em>
            </h2>
            <div className="flex items-center gap-3">
              <StarRating value={Math.round(parseFloat(avgDisplay))} readOnly />
              <span className="font-display text-2xl gold-text">{avgDisplay}</span>
              <span className="font-sans text-sm text-obsidian-500 dark:text-obsidian-400">
                ({summary.totalReviews} reviews)
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              // console.log("Auth state:", { authLoading, isAuthenticated })

              if (authLoading) return

              if (!isAuthenticated) {
                addToast('Please sign in to leave a review.', 'info')
                return
              }
              // console.log('CLicked');
              
              setIsModalOpen(true)
            }}
            className="btn-secondary flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Write a Review
          </button>
        </div>

        {/* Reviews grid */}
        {loading && reviews.length === 0 ? (
          <div className="flex justify-center py-16"><Loader size="lg" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-body text-obsidian-400 mb-2">No reviews yet.</p>
            <p className="font-sans text-xs text-obsidian-500">Be the first to share your experience.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div
                key={review._id || review.id}
                className="border border-obsidian-200 dark:border-obsidian-700/50 bg-white dark:bg-obsidian-900/50 p-6 hover:border-gold-400/40 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold-gradient flex items-center justify-center flex-shrink-0">
                      <span className="font-display text-obsidian-900 font-600">
                        {(review.client?.name || review.name || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-sans text-sm font-600 text-obsidian-900 dark:text-ivory-100">
                        {review.client?.name || review.name}
                      </p>
                      <p className="font-sans text-xs text-obsidian-400">
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString('en-KW', { month: 'long', year: 'numeric' })
                          : 'Recently'}
                      </p>
                    </div>
                  </div>
                  {(review.service?.title || review.serviceName) && (
                    <span className="font-sans text-xs px-2 py-1 bg-gold-500/10 text-gold-500 border border-gold-500/20 hidden sm:block">
                      {review.service?.title || review.serviceName}
                    </span>
                  )}
                </div>

                <StarRating value={review.rating} readOnly />

                <p className="font-body text-sm text-obsidian-600 dark:text-ivory-400 leading-relaxed mt-3 italic">
                  "{review.text}"
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="text-center mt-10">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="btn-secondary disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More Reviews'}
            </button>
          </div>
        )}
      </div>

      {/* Write review modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Share Your Experience"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400 block mb-2">
              Service Received
            </label>
            <select
              value={form.serviceName}
              onChange={e => setForm(p => ({ ...p, serviceName: e.target.value }))}
              className="input-field  text-obsidian-800 dark:text-obsidian-800 appearance-none"
            >
              <option value="">Select a service (optional)</option>
              {serviceOptions.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400 block mb-3">
              Your Rating *
            </label>
            <StarRating
              value={form.rating}
              onChange={r => setForm(p => ({ ...p, rating: r }))}
            />
          </div>

          <div>
            <label className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400 block mb-2">
              Your Review *
            </label>
            <textarea
              value={form.text}
              onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
              placeholder="Tell us about your experience at Lumière... (min. 10 characters)"
              required
              rows={4}
              className="input-field border border-obsidian-300 dark:border-obsidian-600 px-4 py-3  text-obsidian-800 dark:text-obsidian-800 resize-none"
            />
            <p className="font-sans text-xs text-obsidian-500 mt-1">
              {form.text.length}/800 — Reviews are approved before publishing.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border border-obsidian-700 border-t-obsidian-900 rounded-full animate-spin" />
                Submitting...
              </span>
            ) : 'Submit Review'}
          </button>
        </form>
      </Modal>
    </section>
  )
}
