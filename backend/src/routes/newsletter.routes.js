const router = require('express').Router()
const { body } = require('express-validator')
const ctrl = require('../controllers/newsletter.controller')
const validate = require('../middleware/validate')
const { contactLimiter } = require('../middleware/rateLimiter')

const emailRule = [
  body('email').trim().notEmpty().isEmail().withMessage('Valid email required').normalizeEmail(),
]

router.post('/subscribe',   contactLimiter, emailRule, validate, ctrl.subscribe)
router.post('/unsubscribe', emailRule, validate, ctrl.unsubscribe)

module.exports = router
