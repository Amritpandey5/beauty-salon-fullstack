const Contact = require('../models/Contact')
const catchAsync = require('../utils/catchAsync')
const ApiError = require('../utils/ApiError')
const respond = require('../utils/ApiResponse')
const paginate = require('../utils/paginate')
const { sendContactAcknowledgement } = require('../services/email.service')

// POST /api/contact
const submitContact = catchAsync(async (req, res) => {
  const { name, email, phone, subject, message } = req.body
  const contact = await Contact.create({ name, email, phone, subject, message, ipAddress: req.ip })
  sendContactAcknowledgement(contact).catch(() => {})
  respond(res).created(null, 'Your message has been received. We will respond within 24 hours.')
})

// GET /api/contact  (admin)
const getContacts = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query
  const filter = {}
  if (status) filter.status = status

  const query = Contact.find(filter).sort({ createdAt: -1 })
  const { data, pagination } = await paginate(Contact, filter, query, page, limit)
  respond(res).paginated(data, pagination)
})

// PATCH /api/contact/:id  (admin)
const updateContact = catchAsync(async (req, res) => {
  const { status, adminNotes } = req.body
  const updates = {}
  if (status)     updates.status     = status
  if (adminNotes) updates.adminNotes = adminNotes

  const contact = await Contact.findByIdAndUpdate(req.params.id, updates, { new: true })
  if (!contact) throw ApiError.notFound('Contact submission not found')
  respond(res).success({ contact }, 'Contact updated')
})

// DELETE /api/contact/:id  (admin)
const deleteContact = catchAsync(async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id)
  if (!contact) throw ApiError.notFound('Contact submission not found')
  respond(res).noContent()
})

module.exports = { submitContact, getContacts, updateContact, deleteContact }
