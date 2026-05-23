const Specialist = require('../models/Specialist')
const Appointment = require('../models/Appointment')
const catchAsync = require('../utils/catchAsync')
const ApiError = require('../utils/ApiError')
const respond = require('../utils/ApiResponse')
const { APPOINTMENT_STATUS, TIME_SLOTS } = require('../config/constants')

// GET /api/specialists
const getSpecialists = catchAsync(async (req, res) => {
  const { serviceId } = req.query
  const filter = { isActive: true }
  if (serviceId) filter.services = serviceId

  const specialists = await Specialist.find(filter)
    .sort({ sortOrder: 1 })
    .populate('services', 'title category')

  respond(res).success({ specialists, total: specialists.length })
})

// GET /api/specialists/:id
const getSpecialist = catchAsync(async (req, res) => {
  const specialist = await Specialist.findById(req.params.id)
    .populate('services', 'title category price duration')
  if (!specialist || !specialist.isActive) throw ApiError.notFound('Specialist not found')
  respond(res).success({ specialist })
})

// GET /api/specialists/:id/availability?date=YYYY-MM-DD
const getAvailability = catchAsync(async (req, res) => {
  const { date } = req.query
  if (!date) throw ApiError.badRequest('Date is required')

  const specialist = await Specialist.findById(req.params.id)
  if (!specialist || !specialist.isActive) throw ApiError.notFound('Specialist not found')

  const dateObj = new Date(date)
  const dayOfWeek = dateObj.getDay()
  const dayAvailability = specialist.availability.find(a => a.dayOfWeek === dayOfWeek)

  if (!dayAvailability?.isWorking) {
    return respond(res).success({ availableSlots: [], isWorkingDay: false })
  }

  // Get booked slots for the day
  const bookedAppointments = await Appointment.find({
    specialist: req.params.id,
    date: {
      $gte: new Date(date),
      $lt: new Date(new Date(date).setDate(dateObj.getDate() + 1)),
    },
    status: { $nin: [APPOINTMENT_STATUS.CANCELLED] },
  }).select('timeSlot')

  const bookedSlots = new Set(bookedAppointments.map(a => a.timeSlot))
  const availableSlots = TIME_SLOTS.filter(slot => !bookedSlots.has(slot))

  respond(res).success({ availableSlots, isWorkingDay: true, bookedSlots: [...bookedSlots] })
})

// POST /api/specialists (admin)
const createSpecialist = catchAsync(async (req, res) => {
  const specialist = await Specialist.create(req.body)
  respond(res).created({ specialist }, 'Specialist created')
})

// PATCH /api/specialists/:id (admin)
const updateSpecialist = catchAsync(async (req, res) => {
  const specialist = await Specialist.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!specialist) throw ApiError.notFound('Specialist not found')
  respond(res).success({ specialist }, 'Specialist updated')
})

// DELETE /api/specialists/:id (admin)
const deleteSpecialist = catchAsync(async (req, res) => {
  const specialist = await Specialist.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })
  if (!specialist) throw ApiError.notFound('Specialist not found')
  respond(res).success(null, 'Specialist deactivated')
})

module.exports = { getSpecialists, getSpecialist, getAvailability, createSpecialist, updateSpecialist, deleteSpecialist }
