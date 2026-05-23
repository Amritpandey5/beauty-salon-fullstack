const crypto = require('crypto')
const User = require('../models/User')
const catchAsync = require('../utils/catchAsync')
const ApiError = require('../utils/ApiError')
const respond = require('../utils/ApiResponse')
const { setTokenCookies, clearTokenCookies, verifyRefreshToken } = require('../services/auth.service')
const { sendWelcomeEmail, sendPasswordReset } = require('../services/email.service')
const logger = require('../utils/logger')

// POST /api/auth/register
const register = catchAsync(async (req, res) => {
  const { name, email, phone, password } = req.body

  const exists = await User.findOne({ email })
  if (exists) throw ApiError.conflict('An account with this email already exists')

  const user = await User.create({ name, email, phone, password })

  const accessToken = user.signAccessToken()
  const refreshToken = user.signRefreshToken()
  user.refreshToken = refreshToken
  user.lastLoginAt = new Date()
  await user.save({ validateBeforeSave: false })

  setTokenCookies(res, accessToken, refreshToken)
  sendWelcomeEmail(user).catch(() => {})

  logger.info(`New user registered: ${email}`)
  respond(res).created(
    { user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken },
    'Account created successfully'
  )
})

// POST /api/auth/login
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password +refreshToken')
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password')
  }
  if (!user.isActive) throw ApiError.forbidden('Account is deactivated. Contact support.')

  const accessToken = user.signAccessToken()
  const refreshToken = user.signRefreshToken()
  user.refreshToken = refreshToken
  user.lastLoginAt = new Date()
  await user.save({ validateBeforeSave: false })

  setTokenCookies(res, accessToken, refreshToken)

  logger.info(`User logged in: ${email}`)
  respond(res).success(
    { user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }, accessToken },
    'Logged in successfully'
  )
})

// POST /api/auth/refresh
const refresh = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken
  if (!token) throw ApiError.unauthorized('No refresh token')

  let decoded
  try {
    decoded = verifyRefreshToken(token)
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token')
  }

  const user = await User.findById(decoded.id).select('+refreshToken')
  if (!user || user.refreshToken !== token) throw ApiError.unauthorized('Refresh token revoked')

  const accessToken = user.signAccessToken()
  const refreshToken = user.signRefreshToken()
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  setTokenCookies(res, accessToken, refreshToken)
  respond(res).success({ accessToken }, 'Token refreshed')
})

// POST /api/auth/logout
const logout = catchAsync(async (req, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null })
  }
  clearTokenCookies(res)
  respond(res).success(null, 'Logged out successfully')
})

// GET /api/auth/me
const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id)
  respond(res).success({ user })
})

// PATCH /api/auth/me
const updateMe = catchAsync(async (req, res) => {
  const { name, phone, preferences } = req.body
  const updates = {}
  if (name) updates.name = name
  if (phone !== undefined) updates.phone = phone
  if (preferences) updates.preferences = { ...req.user.preferences, ...preferences }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
  respond(res).success({ user }, 'Profile updated')
})

// PATCH /api/auth/change-password
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user._id).select('+password')

  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect')
  }
  user.password = newPassword
  await user.save()

  clearTokenCookies(res)
  respond(res).success(null, 'Password changed. Please log in again.')
})

// POST /api/auth/forgot-password
const forgotPassword = catchAsync(async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  // Always respond 200 to prevent user enumeration
  if (!user) {
    return respond(res).success(null, 'If that email exists, a reset link has been sent')
  }

  const token = crypto.randomBytes(32).toString('hex')
  user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000 // 15 min
  await user.save({ validateBeforeSave: false })

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`
  await sendPasswordReset(user, resetUrl)

  respond(res).success(null, 'If that email exists, a reset link has been sent')
})

// POST /api/auth/reset-password
const resetPassword = catchAsync(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires')

  if (!user) throw ApiError.badRequest('Reset token is invalid or has expired')

  user.password = req.body.password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  respond(res).success(null, 'Password reset successfully. Please log in.')
})

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
}
