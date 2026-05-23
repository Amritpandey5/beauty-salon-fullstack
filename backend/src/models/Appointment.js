const mongoose = require('mongoose')
const { APPOINTMENT_STATUS } = require('../config/constants')

const appointmentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    specialist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialist',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.PENDING,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    price: {
      amount: { type: Number },
      currency: { type: String, default: 'KWD' },
      display: { type: String },
    },
    // Cancellation
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: String,
    // Reminder tracking
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderSentAt: Date,
    // Confirmation
    confirmationNumber: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

appointmentSchema.index({ client: 1, status: 1 })
appointmentSchema.index({ specialist: 1, date: 1, timeSlot: 1 })
appointmentSchema.index({ date: 1, status: 1 })
appointmentSchema.index({ confirmationNumber: 1 })

// Generate confirmation number before save
appointmentSchema.pre('save', function (next) {
  if (this.isNew && !this.confirmationNumber) {
    const ts = Date.now().toString(36).toUpperCase()
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase()
    this.confirmationNumber = `LUM-${ts}-${rand}`
  }
  next()
})

// Check for double-booking
appointmentSchema.statics.isSlotTaken = async function (specialistId, date, timeSlot, excludeId = null) {
  const query = {
    specialist: specialistId,
    date: new Date(date),
    timeSlot,
    status: { $nin: [APPOINTMENT_STATUS.CANCELLED] },
  }
  if (excludeId) query._id = { $ne: excludeId }
  const existing = await this.findOne(query)
  return !!existing
}

const Appointment = mongoose.model('Appointment', appointmentSchema)
module.exports = Appointment
