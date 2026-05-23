const router = require('express').Router()
const ctrl = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { authLimiter } = require('../middleware/rateLimiter')
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules,
} = require('../validators/auth.validators')

router.post('/register',  authLimiter, registerRules, validate, ctrl.register)
router.post('/login',     authLimiter, loginRules,    validate, ctrl.login)
router.post('/refresh',   ctrl.refresh)
router.post('/logout',    protect, ctrl.logout)

router.get('/me',         protect, ctrl.getMe)
router.patch('/me',       protect, ctrl.updateMe)

router.patch('/change-password', protect, changePasswordRules, validate, ctrl.changePassword)
router.post('/forgot-password',  authLimiter, forgotPasswordRules, validate, ctrl.forgotPassword)
router.post('/reset-password/:token', resetPasswordRules, validate, ctrl.resetPassword)

module.exports = router
