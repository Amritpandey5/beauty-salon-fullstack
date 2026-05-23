const { body, query } = require('express-validator')

const createReviewRules = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('text')
    .trim()
    .notEmpty().withMessage('Review text is required')
    .isLength({ min: 10, max: 800 }).withMessage('Review must be 10–800 characters'),
  body('serviceId')
    .optional()
    .isMongoId().withMessage('Invalid service ID'),
  body('specialistId')
    .optional()
    .isMongoId().withMessage('Invalid specialist ID'),
  body('appointmentId')
    .optional()
    .isMongoId().withMessage('Invalid appointment ID'),
]

const listReviewsRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('approved').optional().isBoolean(),
]

module.exports = { createReviewRules, listReviewsRules }
