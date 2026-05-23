const router = require('express').Router()
const ctrl = require('../controllers/appointment.controller')
const { protect, authorize } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { bookingLimiter } = require('../middleware/rateLimiter')
const { ROLES } = require('../config/constants')
const {
  createAppointmentRules,
  updateStatusRules,
  listAppointmentsRules,
} = require('../validators/appointment.validators')

router.use(protect)

router.get('/',     listAppointmentsRules, validate, ctrl.getAppointments)
router.get('/stats', authorize(ROLES.ADMIN), ctrl.getStats)
router.get('/:id',  ctrl.getAppointment)

router.post('/', bookingLimiter, createAppointmentRules, validate, ctrl.createAppointment)
router.patch('/:id/status', updateStatusRules, validate, ctrl.updateStatus)
router.delete('/:id', authorize(ROLES.ADMIN), ctrl.deleteAppointment)

module.exports = router
