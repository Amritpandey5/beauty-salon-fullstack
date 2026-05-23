export function formatCurrency(amount, currency = 'KWD') {
  return `${amount} ${currency}`
}

export function formatDate(dateStr, options = {}) {
  const defaults = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateStr).toLocaleDateString('en-KW', { ...defaults, ...options })
}

export function formatTime(timeStr) {
  return timeStr
}

export function capitalise(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '…'
}

export function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

export function clsx(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const group = item[key]
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {})
}

export function isMobile() {
  return window.innerWidth < 768
}
