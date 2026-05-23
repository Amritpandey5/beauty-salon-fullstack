const { body } = require('express-validator')
const { SERVICE_CATEGORIES } = require('../config/constants')

const createServiceRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(SERVICE_CATEGORIES).withMessage(`Category must be one of: ${SERVICE_CATEGORIES.join(', ')}`),
  body('price.amount')
    .notEmpty().withMessage('Price amount is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('price.currency')
    .optional()
    .isIn(['KWD', 'USD', 'EUR']).withMessage('Invalid currency'),
  body('duration.minMinutes')
    .notEmpty().withMessage('Minimum duration is required')
    .isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Subtitle cannot exceed 300 characters'),
]

const updateServiceRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('category')
    .optional()
    .isIn(SERVICE_CATEGORIES).withMessage(`Category must be one of: ${SERVICE_CATEGORIES.join(', ')}`),
  body('price.amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration.minMinutes')
    .optional()
    .isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
]

module.exports = { createServiceRules, updateServiceRules }
