const router = require('express').Router()
const ctrl = require('../controllers/service.controller')
const { protect, authorize } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { ROLES } = require('../config/constants')
const { createServiceRules, updateServiceRules } = require('../validators/service.validators')

router.get('/',    ctrl.getServices)
router.get('/:id', ctrl.getService)

router.post('/',
  protect, authorize(ROLES.ADMIN),
  createServiceRules, validate,
  ctrl.createService)

router.patch('/:id',
  protect, authorize(ROLES.ADMIN),
  updateServiceRules, validate,
  ctrl.updateService)

router.delete('/:id',
  protect, authorize(ROLES.ADMIN),
  ctrl.deleteService)

module.exports = router
