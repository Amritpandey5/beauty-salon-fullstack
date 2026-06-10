const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ── Token storage ─────────────────────────────────────────────────────────────
let accessToken = localStorage.getItem("accessToken") || null

export const getAccessToken = () => accessToken

export const setAccessToken = (token) => {
  accessToken = token
  localStorage.setItem("accessToken", token)
}

export const clearAccessToken = () => {
  accessToken = null
  localStorage.removeItem("accessToken")
}

// ── Refresh lock — prevent parallel refresh storms ────────────────────────────
let refreshPromise = null

const doRefresh = async () => {
  if (refreshPromise) return refreshPromise
  refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(async (res) => {
      if (!res.ok) throw new Error('Refresh failed')
      const data = await res.json()
      setAccessToken(data.data.accessToken)
      return data.data.accessToken
    })
    .finally(() => { refreshPromise = null })
  return refreshPromise
}

// ── Core request ──────────────────────────────────────────────────────────────
const request = async (endpoint, options = {}, retry = true) => {
  const url = `${BASE_URL}${endpoint}`

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const config = {
    credentials: 'include',
    ...options,
    headers,
  }

  // Don't set Content-Type for FormData (let browser set multipart boundary)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type']
  }

  let res
  try {
    res = await fetch(url, config)
  } catch (err) {
    throw { message: 'Network error — please check your connection', status: 0 }
  }

  // Token expired → try refresh once
  if (res.status === 401 && retry) {
    try {
      await doRefresh()
      return request(endpoint, options, false)
    } catch {
      clearAccessToken()
      window.dispatchEvent(new CustomEvent('auth:expired'))
      console.log(res.message);
      throw { message: res.message, status: 401 }
    }
  }

  // No content
  if (res.status === 204) return null

  const data = await res.json()

  if (!res.ok) {
    const message = data?.errors?.length
      ? data.errors.join('. ')
      : data?.message || 'Something went wrong'
    throw { message, status: res.status, data }
  }

  return data
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
export const api = {
  get:    (endpoint, options = {}) =>
    request(endpoint, { method: 'GET', ...options }),

  post:   (endpoint, body, options = {}) =>
    request(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  patch:  (endpoint, body, options = {}) =>
    request(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  put:    (endpoint, body, options = {}) =>
    request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { method: 'DELETE', ...options }),
}

export default api
