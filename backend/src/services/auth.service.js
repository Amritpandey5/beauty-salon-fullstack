const jwt = require('jsonwebtoken')

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
}

const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/api/auth/refresh',
  })
}

const clearTokenCookies = (res) => {
  res.clearCookie('accessToken', COOKIE_OPTIONS)
  res.clearCookie('refreshToken', { ...COOKIE_OPTIONS, path: '/api/auth/refresh' })
}

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
}

module.exports = { setTokenCookies, clearTokenCookies, verifyRefreshToken }
