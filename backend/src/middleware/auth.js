const jwt = require('jsonwebtoken')
const catchAsync = require('../utils/catchAsync')
const ApiError = require('../utils/ApiError')
const User = require('../models/User')

const protect = catchAsync(async (req, res, next) => {
  let token

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken
  }

  if (!token) throw ApiError.unauthorized('No token provided')

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw ApiError.unauthorized('Token expired')
    throw ApiError.unauthorized('Invalid token')
  }

  const user = await User.findById(decoded.id).select('+refreshToken')
  if (!user) throw ApiError.unauthorized('User no longer exists')
  if (!user.isActive) throw ApiError.forbidden('Account is deactivated')

  req.user = user
  next()
})

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw ApiError.forbidden(`Role '${req.user.role}' is not permitted to access this resource`)
  }
  next()
}

const optionalAuth = catchAsync(async (req, res, next) => {
  let token
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)
      if (user?.isActive) req.user = user
    } catch {}
  }
  next()
})

module.exports = { protect, authorize, optionalAuth }
