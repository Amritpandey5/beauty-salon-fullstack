const cache = {
  specialists: null,
  services: null,
  timestamp: {},
}

const CACHE_TTL = 1000 * 60 * 5 // 5 minutes

export const getCache = (key) => {
  const time = cache.timestamp[key]

  if (!cache[key]) return null
  if (!time) return null

  const isExpired = Date.now() - time > CACHE_TTL
  if (isExpired) {
    console.log(`⏳ CACHE EXPIRED: ${key}`)
    cache[key] = null
    return null
  }
  console.log(`📦 CACHE HIT: ${key}`, cache[key])
  return cache[key]
}

export const setCache = (key, data) => {
  cache[key] = data
  cache.timestamp[key] = Date.now()
  console.log(`💾 CACHE SET: ${key}`, data)
}

export const clearCache = (key) => {
  cache[key] = null
  cache.timestamp[key] = null
}