const crypto = require('crypto')
const User = require('../models/User')
const catchAsync = require('../utils/catchAsync')
const ApiError = require('../utils/ApiError')
const respond = require('../utils/ApiResponse')
const { setTokenCookies, clearTokenCookies, verifyRefreshToken } = require('../services/auth.service')
const {verificationEmail, sendWelcomeEmail, sendPasswordReset } = require('../services/email.service')
const logger = require('../utils/logger')
const { log } = require('console')

// POST /api/auth/register
const register = catchAsync(async (req, res) => {
  const { name, email, phone, password } = req.body

  const exists = await User.findOne({ email })
  if (exists) throw ApiError.conflict('An account with this email already exists')

  const user = await User.create({ name, email, phone, password });

  // generate verification token and save to user
  const verificationToken = user.generateEmailVerificationToken();
  
  await user.save({ validateBeforeSave: false })


  // send verification email
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?id=${user._id}&token=${verificationToken}`
    await verificationEmail(user, verificationUrl)
  } catch (error) {
    console.error('Error sending verification email:', error)
    await User.deleteOne({ _id: user._id }) // rollback user creation
    throw ApiError.internal('Failed to send verification email. Please try again.')
  }

  logger.info(`New user registered: ${email}`)
  respond(res).created(
    { user: { id: user._id, name: user.name, email: user.email, role: user.role }},
    'Account created successfully & verification email sent'
  )
})

// verify email
const verifyEmail = catchAsync(async(req,res)=>{
  const {id,token} = req.query;

  if(!id || !token){
    throw ApiError.badRequest('Invalid verification link')
  }

  const rawToken = token.replace(/ /g, '+') // Handle URL encoding issues
  // console.log('Raw token from query:', token)
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
  // console.log('Hashed token:', hashedToken)


  const userRecord = await User.findOne({
  _id: id,
  verificationToken: hashedToken,
  verificationExpire: { $gt: Date.now() }
}).select('+verificationToken +verificationExpire')

// console.log(userRecord);


  if(!userRecord){
    throw ApiError.badRequest('Verification link is invalid or has expired.Please resend verification.')
  }

  // Acitvate user and clear verification fields
  userRecord.isEmailVerified = true;
  userRecord.verificationToken = undefined;
  userRecord.verificationExpire = undefined;
  await userRecord.save({validateBeforeSave:false})


  // generate tokens and set cookies
  const accessToken = userRecord.signAccessToken()
  const refreshToken = userRecord.signRefreshToken()
  userRecord.refreshToken = refreshToken
  userRecord.lastLoginAt = new Date()
  await userRecord.save({ validateBeforeSave: false })
  setTokenCookies(res, accessToken, refreshToken)

  // send welcome email
  try {
    await sendWelcomeEmail(userRecord).catch(() => {})
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }

  logger.info(`User email verified: ${userRecord.email}`)
  respond(res).success(
    { user: { id: userRecord._id, name: userRecord.name, email: userRecord.email, role: userRecord.role }, accessToken },
    'Email verified successfully'
  )
});

//---Resend verification email

const resendVerification = catchAsync(async(req,res)=>{
  const {id} = req.body;
  const userRecord = await User.findOne({_id:id}).select('+verificationToken +verificationExpire');

  if(!userRecord){
    throw ApiError.badRequest('No account found with that email')
  } 
  if(userRecord.isEmailVerified){
    throw ApiError.badRequest('Email is already verified. Please log in.')
  }

  // generate new verification token
const rawVerificationToken = userRecord.generateEmailVerificationToken()

await userRecord.save({ validateBeforeSave: false })

  // send verification email

  try{
    await verificationEmail(userRecord, `${process.env.CLIENT_URL}/verify-email?id=${userRecord._id}&token=${rawVerificationToken}`)
  }
  catch(error){
    console.error('Error sending verification email:', error)
    throw ApiError.internal('Failed to send verification email. Please try again.')
  }

  logger.info(`Verification email resent: ${userRecord.email}`)
  respond(res).success(null, 'Verification email resent. Please check your inbox.')


})



// POST /api/auth/login
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password +refreshToken')
  if(!user){
    throw ApiError.notFound('No account found with that email')
  }
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password')
  }
  if (!user.isEmailVerified) throw ApiError.forbidden('Email not verified. Please verify your email.')
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
  user.lastLoginAt = new Date()
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
  verifyEmail,
  resendVerification,
  login,
  refresh,
  logout,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
}
