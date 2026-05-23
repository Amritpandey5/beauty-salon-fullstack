const router = require('express').Router()
const ctrl = require('../controllers/specialist.controller')
const { protect, authorize } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { ROLES } = require('../config/constants')
const { createSpecialistRules, updateSpecialistRules } = require('../validators/specialist.validators')

router.get('/',                 ctrl.getSpecialists)
router.get('/:id',              ctrl.getSpecialist)
router.get('/:id/availability', ctrl.getAvailability)

router.post('/',
  protect, authorize(ROLES.ADMIN),
  createSpecialistRules, validate,
  ctrl.createSpecialist)

router.patch('/:id',
  protect, authorize(ROLES.ADMIN),
  updateSpecialistRules, validate,
  ctrl.updateSpecialist)

router.delete('/:id',
  protect, authorize(ROLES.ADMIN),
  ctrl.deleteSpecialist)

module.exports = router
