const router = require('express').Router()
const ctrl = require('../controllers/review.controller')
const { protect, authorize } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { ROLES } = require('../config/constants')
const { createReviewRules, listReviewsRules } = require('../validators/review.validators')

router.get('/summary', ctrl.getReviewSummary)
router.get('/', listReviewsRules, validate, ctrl.getReviews)

router.post('/',              protect, createReviewRules, validate, ctrl.createReview)
router.patch('/:id/approve',  protect, authorize(ROLES.ADMIN), ctrl.approveReview)
router.delete('/:id',         protect, ctrl.deleteReview)

module.exports = router
