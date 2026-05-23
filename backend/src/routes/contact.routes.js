const router = require('express').Router()
const ctrl = require('../controllers/contact.controller')
const { protect, authorize } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { contactLimiter } = require('../middleware/rateLimiter')
const { ROLES } = require('../config/constants')
const { contactRules } = require('../validators/contact.validators')

router.post('/', contactLimiter, contactRules, validate, ctrl.submitContact)

router.get('/',     protect, authorize(ROLES.ADMIN), ctrl.getContacts)
router.patch('/:id', protect, authorize(ROLES.ADMIN), ctrl.updateContact)
router.delete('/:id', protect, authorize(ROLES.ADMIN), ctrl.deleteContact)

module.exports = router
