const rateLimit = require('express-rate-limit')
const ApiError = require('../utils/ApiError')

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => next(ApiError.tooMany(message)),
  })

const globalLimiter = createLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX) || 100,
  'Too many requests from this IP, please try again later'
)

const authLimiter = createLimiter(
  15 * 60 * 1000,
  parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  'Too many login attempts, please try again in 15 minutes'
)

const bookingLimiter = createLimiter(
  60 * 60 * 1000,
  20,
  'Too many booking requests, please try again in an hour'
)

const contactLimiter = createLimiter(
  60 * 60 * 1000,
  5,
  'Too many messages sent, please try again in an hour'
)

module.exports = { globalLimiter, authLimiter, bookingLimiter, contactLimiter }
