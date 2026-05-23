const mongoose = require('mongoose')
const ApiError = require('../utils/ApiError')
const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  let error = err

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`)
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    const value = err.keyValue[field]
    error = ApiError.conflict(`${field} '${value}' already exists`)
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    error = ApiError.badRequest('Validation failed', messages)
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') error = ApiError.unauthorized('Invalid token')
  if (err.name === 'TokenExpiredError') error = ApiError.unauthorized('Token expired')

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') error = ApiError.badRequest('File size too large (max 5MB)')
  if (err.code === 'LIMIT_UNEXPECTED_FILE') error = ApiError.badRequest('Unexpected file field')

  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal Server Error'

  if (statusCode >= 500 && !error.isOperational) {
    logger.error(`[${req.method}] ${req.originalUrl} → ${statusCode} ${message}`, {
      stack: err.stack,
      body: req.body,
      user: req.user?._id,
    })
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} → ${statusCode} ${message}`)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(error.errors?.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`))
}

module.exports = { errorHandler, notFound }
