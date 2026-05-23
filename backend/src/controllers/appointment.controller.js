const Appointment = require('../models/Appointment')
const Service = require('../models/Service')
const Specialist = require('../models/Specialist')
const catchAsync = require('../utils/catchAsync')
const ApiError = require('../utils/ApiError')
const respond = require('../utils/ApiResponse')
const paginate = require('../utils/paginate')
const { APPOINTMENT_STATUS, CANCELLATION_HOURS, ROLES } = require('../config/constants')
const {
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
} = require('../services/email.service')

// GET /api/appointments
const getAppointments = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, from, to, specialistId } = req.query

  const filter = {}
  if (req.user.role !== ROLES.ADMIN) filter.client = req.user._id
  if (specialistId) filter.specialist = specialistId
  if (status) filter.status = status
  if (from || to) {
    filter.date = {}
    if (from) filter.date.$gte = new Date(from)
    if (to)   filter.date.$lte = new Date(to)
  }

  const query = Appointment.find(filter)
    .sort({ date: -1 })
    .populate('service',    'title category price duration icon')
    .populate('specialist', 'name role image')
    .populate('client',     'name email phone')

  const { data, pagination } = await paginate(Appointment, filter, query, page, limit)
  respond(res).paginated(data, pagination)
})

// GET /api/appointments/stats  (admin)
const getStats = catchAsync(async (req, res) => {
  const [total, byStatus, upcoming, revenueAgg] = await Promise.all([
    Appointment.countDocuments(),
    Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Appointment.countDocuments({ status: APPOINTMENT_STATUS.CONFIRMED, date: { $gte: new Date() } }),
    Appointment.aggregate([
      { $match: { status: APPOINTMENT_STATUS.COMPLETED } },
      { $group: { _id: null, total: { $sum: '$price.amount' } } },
    ]),
  ])
  const statusMap = byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {})
  respond(res).success({
    total,
    upcoming,
    byStatus: statusMap,
    totalRevenue: revenueAgg[0]?.total || 0,
  })
})

// GET /api/appointments/:id
const getAppointment = catchAsync(async (req, res) => {
  const appt = await Appointment.findById(req.params.id)
    .populate('service',    'title category price duration')
    .populate('specialist', 'name role image')
    .populate('client',     'name email phone')

  if (!appt) throw ApiError.notFound('Appointment not found')

  if (req.user.role === ROLES.CLIENT &&
      appt.client._id.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You do not have access to this appointment')
  }
  respond(res).success({ appointment: appt })
})

// POST /api/appointments
const createAppointment = catchAsync(async (req, res) => {
  const { serviceId, specialistId, date, timeSlot, notes } = req.body

  const [service, specialist] = await Promise.all([
    Service.findById(serviceId),
    Specialist.findById(specialistId),
  ])
  if (!service   || !service.isActive)    throw ApiError.notFound('Service not found')
  if (!specialist|| !specialist.isActive) throw ApiError.notFound('Specialist not found')

  const slotTaken = await Appointment.isSlotTaken(specialistId, date, timeSlot)
  
 
  if (slotTaken) throw ApiError.conflict('This time slot is already booked. Please choose another.')

  const appointment = await Appointment.create({
    client: req.user._id,
    service: serviceId,
    specialist: specialistId,
    date: new Date(date),
    timeSlot,
    notes,
    status: APPOINTMENT_STATUS.CONFIRMED,
    price: {
      amount:   service.price.amount,
      currency: service.price.currency,
      display:  service.price.display,
    },
  })

  await appointment.populate([
    { path: 'service',    select: 'title category price duration' },
    { path: 'specialist', select: 'name role image' },
  ])

  sendAppointmentConfirmation(appointment, req.user, service, specialist).catch(() => {})
  respond(res).created({ appointment }, 'Appointment confirmed successfully')
})

// PATCH /api/appointments/:id/status
const updateStatus = catchAsync(async (req, res) => {
  const { status, cancellationReason } = req.body

  const appt = await Appointment.findById(req.params.id)
    .populate('service')
    .populate('client')

  if (!appt) throw ApiError.notFound('Appointment not found')

  const isOwner = appt.client._id.toString() === req.user._id.toString()
  const isAdmin = req.user.role === ROLES.ADMIN

  if (!isOwner && !isAdmin) throw ApiError.forbidden('Not authorised to modify this appointment')

  if (!isAdmin && status !== APPOINTMENT_STATUS.CANCELLED) {
    throw ApiError.forbidden('Clients can only cancel appointments')
  }

  if (!isAdmin && status === APPOINTMENT_STATUS.CANCELLED) {
    const hoursUntil = (new Date(appt.date) - new Date()) / (1000 * 60 * 60)
    console.log(`Hours until appointment: ${hoursUntil}`)
    if (hoursUntil < CANCELLATION_HOURS) {
      throw ApiError.badRequest(
        `Cancellations must be made at least ${CANCELLATION_HOURS} hours in advance`
      )
    }
  }

  appt.status = status
  if (status === APPOINTMENT_STATUS.CANCELLED) {
    appt.cancelledAt       = new Date()
    appt.cancelledBy       = req.user._id
    if (cancellationReason) appt.cancellationReason = cancellationReason
  }
  await appt.save()

  if (status === APPOINTMENT_STATUS.CANCELLED) {
    sendAppointmentCancellation(appt, appt.client, appt.service).catch(() => {})
  }
  respond(res).success({ appointment: appt }, `Appointment ${status}`)
})

// DELETE /api/appointments/:id  (admin)
const deleteAppointment = catchAsync(async (req, res) => {
  const appt = await Appointment.findByIdAndDelete(req.params.id)
  if (!appt) throw ApiError.notFound('Appointment not found')
  respond(res).noContent()
})

module.exports = {
  getAppointments,
  getAppointment,
  getStats,
  createAppointment,
  updateStatus,
  deleteAppointment,
}
