const router = require('express').Router()
const ctrl = require('../controllers/admin.controller')
const { protect, authorize } = require('../middleware/auth')
const { ROLES } = require('../config/constants')

router.use(protect, authorize(ROLES.ADMIN))

router.get('/dashboard',      ctrl.getDashboard)
router.get('/users',          ctrl.getUsers)
router.patch('/users/:id',    ctrl.updateUser)
router.get('/reviews/pending', ctrl.getPendingReviews)

module.exports = router
