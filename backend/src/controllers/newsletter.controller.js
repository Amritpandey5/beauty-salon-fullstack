const User = require('../models/User')
const catchAsync = require('../utils/catchAsync')
const ApiError = require('../utils/ApiError')
const respond = require('../utils/ApiResponse')

// POST /api/newsletter/subscribe
const subscribe = catchAsync(async (req, res) => {
  const { email, name } = req.body
  if (!email) throw ApiError.badRequest('Email is required')

  const user = await User.findOne({ email })
  if (user) {
    await User.findByIdAndUpdate(user._id, { 'preferences.newsletter': true })
  }
  // In production: integrate with Mailchimp / SendGrid lists
  respond(res).success(null, 'You have been subscribed to the Lumière inner circle')
})

// POST /api/newsletter/unsubscribe
const unsubscribe = catchAsync(async (req, res) => {
  const { email } = req.body
  if (!email) throw ApiError.badRequest('Email is required')

  await User.findOneAndUpdate({ email }, { 'preferences.newsletter': false })
  respond(res).success(null, 'You have been unsubscribed successfully')
})

module.exports = { subscribe, unsubscribe }
