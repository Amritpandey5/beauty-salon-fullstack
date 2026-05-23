const mongoose = require('mongoose')

const availabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, min: 0, max: 6 },
    isWorking: { type: Boolean, default: true },
    startTime: { type: String, default: '09:00 AM' },
    endTime: { type: String, default: '09:00 PM' },
  },
  { _id: false }
)

const specialistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    image: {
      type: String,
      default: null,
    },
    specialties: {
      type: [String],
      default: [],
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],
    availability: {
      type: [availabilitySchema],
      default: [0, 1, 2, 3, 4, 5, 6].map(day => ({
        dayOfWeek: day,
        isWorking: day !== 5 && day !== 6 ? true : day === 5 || day === 6,
        startTime: day === 5 || day === 6 ? '10:00 AM' : '09:00 AM',
        endTime: day === 5 || day === 6 ? '11:00 PM' : '09:00 PM',
      })),
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

specialistSchema.index({ isActive: 1 })

const Specialist = mongoose.model('Specialist', specialistSchema)
module.exports = Specialist
