const Review = require('../models/Review')
const Appointment = require('../models/Appointment')
const catchAsync = require('../utils/catchAsync')
const ApiError = require('../utils/ApiError')
const respond = require('../utils/ApiResponse')
const paginate = require('../utils/paginate')
const { ROLES, APPOINTMENT_STATUS } = require('../config/constants')

// GET /api/reviews
const getReviews = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, serviceId, specialistId } = req.query
  const filter = { isApproved: true, isPublic: true }
  if (serviceId)    filter.service    = serviceId
  if (specialistId) filter.specialist = specialistId

  const query = Review.find(filter)
    .sort({ createdAt: -1 })
    .populate('client',     'name initials')
    .populate('service',    'title')
    .populate('specialist', 'name')

  const { data, pagination } = await paginate(Review, filter, query, page, limit)
  respond(res).paginated(data, pagination)
})

// GET /api/reviews/summary
const getReviewSummary = catchAsync(async (req, res) => {
  const stats = await Review.aggregate([
    { $match: { isApproved: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews:  { $sum: 1 },
        fiveStar:  { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        fourStar:  { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        twoStar:   { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        oneStar:   { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
      },
    },
  ])
  const summary = stats[0] || { averageRating: 0, totalReviews: 0 }
  if (summary.averageRating) {
    summary.averageRating = Math.round(summary.averageRating * 10) / 10
  }
  respond(res).success({ summary })
})

// POST /api/reviews
const createReview = catchAsync(async (req, res) => {
  const { rating, text, serviceId, specialistId, appointmentId, serviceName } = req.body

  if (appointmentId) {
    const appt = await Appointment.findById(appointmentId)
    if (!appt) throw ApiError.notFound('Appointment not found')
    if (appt.client.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('This appointment does not belong to you')
    }
    if (appt.status !== APPOINTMENT_STATUS.COMPLETED) {
      throw ApiError.badRequest('You can only review completed appointments')
    }
    const existing = await Review.findOne({ appointment: appointmentId, client: req.user._id })
    if (existing) throw ApiError.conflict('You have already reviewed this appointment')
  }

  const review = await Review.create({
    client:      req.user._id,
    rating,
    text,
    service:     serviceId    || undefined,
    specialist:  specialistId || undefined,
    appointment: appointmentId || undefined,
    serviceName,
    isApproved: false,
  })

  await review.populate('client', 'name initials')
  respond(res).created({ review }, 'Review submitted and pending approval')
})

// PATCH /api/reviews/:id/approve  (admin)
const approveReview = catchAsync(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isApproved: req.body.approved !== false },
    { new: true }
  )
  if (!review) throw ApiError.notFound('Review not found')
  respond(res).success({ review }, 'Review status updated')
})

// DELETE /api/reviews/:id
const deleteReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) throw ApiError.notFound('Review not found')

  const isOwner = review.client.toString() === req.user._id.toString()
  const isAdmin = req.user.role === ROLES.ADMIN
  if (!isOwner && !isAdmin) throw ApiError.forbidden('Not authorised to delete this review')

  await review.deleteOne()
  respond(res).noContent()
})

module.exports = { getReviews, getReviewSummary, createReview, approveReview, deleteReview }
