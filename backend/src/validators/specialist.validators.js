const { body } = require('express-validator')

const createSpecialistRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 80 }).withMessage('Name cannot exceed 80 characters'),
  body('role')
    .trim()
    .notEmpty().withMessage('Role is required')
    .isLength({ max: 80 }).withMessage('Role cannot exceed 80 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('specialties')
    .optional()
    .isArray().withMessage('Specialties must be an array'),
  body('services')
    .optional()
    .isArray().withMessage('Services must be an array')
    .custom((arr) => arr.every(id => /^[0-9a-fA-F]{24}$/.test(id)))
    .withMessage('Each service must be a valid ID'),
]

const updateSpecialistRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 80 }).withMessage('Name cannot exceed 80 characters'),
  body('role')
    .optional()
    .trim()
    .isLength({ max: 80 }).withMessage('Role cannot exceed 80 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer'),
]

module.exports = { createSpecialistRules, updateSpecialistRules }
