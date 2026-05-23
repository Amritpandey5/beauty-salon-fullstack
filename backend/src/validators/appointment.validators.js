const { body, query, param } = require('express-validator')
const { TIME_SLOTS } = require('../config/constants')

const createAppointmentRules = [
  body('serviceId')
    .notEmpty().withMessage('Service is required')
    .isMongoId().withMessage('Invalid service ID'),
  body('specialistId')
    .notEmpty().withMessage('Specialist is required')
    .isMongoId().withMessage('Invalid specialist ID'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom(value => {
      const date = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (date < today) throw new Error('Appointment date must be in the future')
      return true
    }),
  body('timeSlot')
    .notEmpty().withMessage('Time slot is required')
    .isIn(TIME_SLOTS).withMessage('Invalid time slot'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
]

const updateStatusRules = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['confirmed', 'completed', 'cancelled', 'no_show'])
    .withMessage('Invalid status value'),
  body('cancellationReason')
    .if(body('status').equals('cancelled'))
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Reason cannot exceed 300 characters'),
]

const listAppointmentsRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending','confirmed','completed','cancelled','no_show']),
  query('from').optional().isISO8601().withMessage('Invalid from date'),
  query('to').optional().isISO8601().withMessage('Invalid to date'),
]

module.exports = { createAppointmentRules, updateStatusRules, listAppointmentsRules }
