import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { servicesApi } from '../api/services.api'
import { useToast } from '../components/Toast'
import { FormField, FormSection, ToggleSwitch } from '../components/FormField'

const CATEGORIES = ['Hair', 'Nails', 'Skin', 'Bridal', 'Wellness']
const CURRENCIES = ['KWD', 'USD', 'EUR']
const ICONS = [
  { key: 'hair',   label: 'Hair',    emoji: '✂️' },
  { key: 'color',  label: 'Color',   emoji: '🎨' },
  { key: 'nail',   label: 'Nails',   emoji: '💅' },
  { key: 'facial', label: 'Facial',  emoji: '✨' },
  { key: 'bridal', label: 'Bridal',  emoji: '💍' },
  { key: 'spa',    label: 'Wellness',emoji: '🌿' },
]

const INITIAL = {
  title:               '',
  category:            '',
  subtitle:            '',
  description:         '',
  price: {
    amount:   '',
    currency: 'KWD',
    isFrom:   false,
    display:  '',
  },
  duration: {
    minMinutes: '',
    maxMinutes: '',
    display:    '',
  },
  icon:        'hair',
  isFeatured:  false,
  isActive:    true,
  sortOrder:   0,
}

function validate(form) {
  const e = {}
  if (!form.title.trim())                          e.title    = 'Title is required'
  else if (form.title.length > 100)               e.title    = 'Max 100 characters'
  if (!form.category)                             e.category = 'Category is required'
  if (form.subtitle.length > 300)                 e.subtitle = 'Max 300 characters'
  if (!form.price.amount && form.price.amount !== 0) e['price.amount'] = 'Price is required'
  else if (isNaN(form.price.amount) || Number(form.price.amount) < 0) e['price.amount'] = 'Must be a positive number'
  if (!form.duration.minMinutes)                  e['duration.minMinutes'] = 'Duration is required'
  else if (isNaN(form.duration.minMinutes) || Number(form.duration.minMinutes) < 1) e['duration.minMinutes'] = 'Must be at least 1 minute'
  if (form.duration.maxMinutes && Number(form.duration.maxMinutes) < Number(form.duration.minMinutes)) {
    e['duration.maxMinutes'] = 'Max duration must be ≥ min duration'
  }
  return e
}

function buildPayload(form) {
  const priceAmt = Number(form.price.amount)
  const minMin   = Number(form.duration.minMinutes)
  const maxMin   = form.duration.maxMinutes ? Number(form.duration.maxMinutes) : undefined

  const priceDisplay = form.price.display.trim() ||
    `${form.price.isFrom ? 'From ' : ''}${priceAmt} ${form.price.currency}`

  const durationDisplay = form.duration.display.trim() ||
    (maxMin
      ? `${minMin} – ${maxMin} min`
      : `${minMin} min`)

  return {
    title:       form.title.trim(),
    category:    form.category,
    subtitle:    form.subtitle.trim() || undefined,
    description: form.description.trim() || undefined,
    price: {
      amount:   priceAmt,
      currency: form.price.currency,
      isFrom:   form.price.isFrom,
      display:  priceDisplay,
    },
    duration: {
      minMinutes: minMin,
      maxMinutes: maxMin,
      display:    durationDisplay,
    },
    icon:        form.icon,
    isFeatured:  form.isFeatured,
    isActive:    form.isActive,
    sortOrder:   Number(form.sortOrder) || 0,
  }
}

export default function CreateServicePage() {
  const navigate     = useNavigate()
  const { addToast } = useToast()

  const [form,    setForm]    = useState(INITIAL)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const set = (path, value) => {
    setForm(prev => {
      const next = { ...prev }
      if (path.includes('.')) {
        const [parent, child] = path.split('.')
        next[parent] = { ...prev[parent], [child]: value }
      } else {
        next[path] = value
      }
      return next
    })
    setErrors(prev => {
      const next = { ...prev }
      delete next[path]
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const res = await servicesApi.create(buildPayload(form))
      setSuccess(res.data.service)
      addToast(`"${res.data.service.title}" created successfully!`, 'success')
    } catch (err) {
      addToast(err?.message || 'Failed to create service', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-ivory-50 dark:bg-obsidian-950 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gold-gradient mx-auto mb-8 flex items-center justify-center">
            <svg className="w-10 h-10 text-obsidian-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-3xl text-obsidian-900 dark:text-ivory-100 mb-3">Service Created</h2>
          <p className="font-body text-obsidian-500 dark:text-obsidian-400 mb-2">
            <span className="text-gold-500 font-600">"{success.title}"</span> is now live in the <span className="text-gold-500">{success.category}</span> category.
          </p>
          <p className="font-sans text-xs text-obsidian-400 dark:text-obsidian-500 mb-10">
            Slug: <code className="text-gold-600">/{success.slug}</code>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { setForm(INITIAL); setErrors({}); setSuccess(null) }}
              className="btn-primary"
            >
              Create Another Service
            </button>
            <Link to="/services" className="btn-secondary">
              View All Services
            </Link>
          </div>
          <Link to="/dashboard" className="block mt-6 font-sans text-xs text-obsidian-500 hover:text-gold-400 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-ivory-50 dark:bg-obsidian-950">
      {/* Page header */}
      <div className="bg-obsidian-950 pattern-bg border-b border-gold-900/30">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4 text-xs font-sans">
            <Link to="/dashboard" className="text-obsidian-500 hover:text-gold-400 transition-colors">Dashboard</Link>
            <svg className="w-3 h-3 text-obsidian-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/services" className="text-obsidian-500 hover:text-gold-400 transition-colors">Services</Link>
            <svg className="w-3 h-3 text-obsidian-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gold-400">New Service</span>
          </div>
          <h1 className="font-display text-4xl text-ivory-100">
            Create <em className="gold-text">New Service</em>
          </h1>
          <p className="font-body text-obsidian-400 mt-2">
            Add a new treatment to the Lumière service catalogue.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">

          {/* ── Basic info ─────────────────────────────────────────────────── */}
          <FormSection
            title="Basic Information"
            subtitle="The title and category appear on the public services page."
          >
            <FormField label="Service Title" required error={errors.title}>
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="e.g. Couture Styling"
                maxLength={100}
                className="input-field"
                autoFocus
              />
              <p className="font-sans text-xs text-obsidian-500 mt-1 text-right">{form.title.length}/100</p>
            </FormField>

            <FormField label="Category" required error={errors.category}>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => set('category', cat)}
                    className={`px-4 py-2 font-sans text-xs tracking-widest uppercase transition-all duration-200 ${
                      form.category === cat
                        ? 'bg-gold-gradient text-obsidian-950 shadow-gold'
                        : 'border border-obsidian-300 dark:border-obsidian-700 text-obsidian-500 dark:text-obsidian-400 hover:border-gold-500 hover:text-gold-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField
              label="Short Subtitle"
              hint={`${form.subtitle.length}/300`}
              error={errors.subtitle}
            >
              <input
                type="text"
                value={form.subtitle}
                onChange={e => set('subtitle', e.target.value)}
                placeholder="One-line description shown on the service card"
                maxLength={300}
                className="input-field"
              />
            </FormField>

            <FormField label="Full Description">
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Detailed description shown on the service detail page…"
                rows={4}
                className="input-field border border-obsidian-300 dark:border-obsidian-600 px-4 py-3 resize-y min-h-[80px]"
              />
            </FormField>
          </FormSection>

          {/* ── Icon ───────────────────────────────────────────────────────── */}
          <FormSection title="Icon" subtitle="Choose the icon displayed on service cards.">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {ICONS.map(ic => (
                <button
                  key={ic.key}
                  type="button"
                  onClick={() => set('icon', ic.key)}
                  className={`flex flex-col items-center gap-2 p-4 border transition-all duration-200 ${
                    form.icon === ic.key
                      ? 'border-gold-500 bg-gold-500/10'
                      : 'border-obsidian-200 dark:border-obsidian-700 hover:border-gold-400/60'
                  }`}
                >
                  <span className="text-2xl">{ic.emoji}</span>
                  <span className="font-sans text-xs text-obsidian-500 dark:text-obsidian-400">{ic.label}</span>
                  {form.icon === ic.key && (
                    <div className="w-3 h-3 bg-gold-gradient rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </FormSection>

          {/* ── Pricing ────────────────────────────────────────────────────── */}
          <FormSection
            title="Pricing"
            subtitle="Set the price in KWD. Use 'From' for variable-price services."
          >
            <div className="grid sm:grid-cols-3 gap-6">
              <FormField label="Amount" required error={errors['price.amount']}>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.price.amount}
                    onChange={e => set('price.amount', e.target.value)}
                    placeholder="0"
                    className="input-field pr-14"
                  />
                  <span className="absolute right-0 bottom-3 font-sans text-xs text-obsidian-400">
                    {form.price.currency}
                  </span>
                </div>
              </FormField>

              <FormField label="Currency">
                <select
                  value={form.price.currency}
                  onChange={e => set('price.currency', e.target.value)}
                  className="input-field appearance-none cursor-pointer"
                >
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </FormField>

              <FormField
                label="Display Label"
                hint="Optional override"
              >
                <input
                  type="text"
                  value={form.price.display}
                  onChange={e => set('price.display', e.target.value)}
                  placeholder={`${form.price.isFrom ? 'From ' : ''}${form.price.amount || '0'} ${form.price.currency}`}
                  className="input-field"
                />
              </FormField>
            </div>

            <ToggleSwitch
              checked={form.price.isFrom}
              onChange={v => set('price.isFrom', v)}
              label='"From" pricing — price shown as a starting rate'
            />

            {/* Live preview */}
            <div className="flex items-center gap-3 p-4 bg-obsidian-50 dark:bg-obsidian-900 border border-obsidian-200 dark:border-obsidian-700/50">
              <svg className="w-4 h-4 text-obsidian-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p className="font-sans text-xs text-obsidian-500">Preview:</p>
              <p className="font-display text-gold-500">
                {form.price.display.trim() ||
                  `${form.price.isFrom ? 'From ' : ''}${form.price.amount || '0'} ${form.price.currency}`}
              </p>
            </div>
          </FormSection>

          {/* ── Duration ───────────────────────────────────────────────────── */}
          <FormSection
            title="Duration"
            subtitle="Minimum duration is required. Max is optional for variable-length services."
          >
            <div className="grid sm:grid-cols-3 gap-6">
              <FormField label="Min Duration (min)" required error={errors['duration.minMinutes']}>
                <input
                  type="number"
                  min="1"
                  value={form.duration.minMinutes}
                  onChange={e => set('duration.minMinutes', e.target.value)}
                  placeholder="60"
                  className="input-field"
                />
              </FormField>

              <FormField label="Max Duration (min)" error={errors['duration.maxMinutes']}>
                <input
                  type="number"
                  min="1"
                  value={form.duration.maxMinutes}
                  onChange={e => set('duration.maxMinutes', e.target.value)}
                  placeholder="Optional"
                  className="input-field"
                />
              </FormField>

              <FormField label="Display Label" hint="Optional override">
                <input
                  type="text"
                  value={form.duration.display}
                  onChange={e => set('duration.display', e.target.value)}
                  placeholder={
                    form.duration.maxMinutes
                      ? `${form.duration.minMinutes || '0'} – ${form.duration.maxMinutes} min`
                      : `${form.duration.minMinutes || '0'} min`
                  }
                  className="input-field"
                />
              </FormField>
            </div>

            <div className="flex items-center gap-3 p-4 bg-obsidian-50 dark:bg-obsidian-900 border border-obsidian-200 dark:border-obsidian-700/50">
              <svg className="w-4 h-4 text-obsidian-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-sans text-xs text-obsidian-500">Preview:</p>
              <p className="font-sans text-sm text-obsidian-700 dark:text-ivory-300">
                {form.duration.display.trim() ||
                  (form.duration.maxMinutes
                    ? `${form.duration.minMinutes || '0'} – ${form.duration.maxMinutes} min`
                    : `${form.duration.minMinutes || '0'} min`)}
              </p>
            </div>
          </FormSection>

          {/* ── Settings ───────────────────────────────────────────────────── */}
          <FormSection title="Settings">
            <div className="space-y-4">
              <ToggleSwitch
                checked={form.isActive}
                onChange={v => set('isActive', v)}
                label="Active — service is visible on the public site"
              />
              <ToggleSwitch
                checked={form.isFeatured}
                onChange={v => set('isFeatured', v)}
                label="Featured — highlighted on the homepage"
              />
            </div>

            <FormField label="Sort Order" hint="Lower = appears first">
              <input
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={e => set('sortOrder', e.target.value)}
                placeholder="0"
                className="input-field w-32"
              />
            </FormField>
          </FormSection>

          {/* ── Live card preview ───────────────────────────────────────────── */}
          <div className="border border-gold-800/30 bg-obsidian-950 p-6">
            <p className="font-sans text-xs uppercase tracking-widest text-gold-600 mb-4">Card Preview</p>
            <div className="max-w-xs border border-obsidian-700/50 bg-obsidian-900 p-6">
              <div className="w-10 h-10 mb-4 text-gold-400">
                {ICONS.find(i => i.key === form.icon)?.emoji || '✦'}
              </div>
              <p className="font-display text-lg text-ivory-100 mb-1">
                {form.title || 'Service Title'}
              </p>
              <p className="font-sans text-xs text-obsidian-400 mb-4 line-clamp-2">
                {form.subtitle || 'Your service description will appear here.'}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-xs text-obsidian-500 uppercase tracking-wider">
                    {form.duration.display ||
                      (form.duration.minMinutes ? `${form.duration.minMinutes} min` : 'Duration')}
                  </p>
                  <p className="font-display text-lg text-gold-500 mt-0.5">
                    {form.price.display ||
                      (form.price.amount
                        ? `${form.price.isFrom ? 'From ' : ''}${form.price.amount} ${form.price.currency}`
                        : 'Price')}
                  </p>
                </div>
                <div className="px-4 py-2 border border-gold-500/40 text-gold-500 font-sans text-xs">
                  Book
                </div>
              </div>
            </div>
          </div>

          {/* ── Actions ────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-12">
            <Link to="/services" className="font-sans text-sm text-obsidian-500 hover:text-obsidian-700 dark:hover:text-ivory-300 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary min-w-[200px] justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-obsidian-700 border-t-obsidian-900 rounded-full animate-spin" />
                  Creating Service…
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Service
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}