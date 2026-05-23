const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    specialist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialist',
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    text: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      minlength: [10, 'Review must be at least 10 characters'],
      maxlength: [800, 'Review cannot exceed 800 characters'],
    },
    serviceName: String,
    isApproved: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    adminReply: {
      text: String,
      repliedAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

reviewSchema.index({ service: 1, isApproved: 1 })
reviewSchema.index({ specialist: 1, isApproved: 1 })
reviewSchema.index({ client: 1 })

// After save, update specialist rating average
reviewSchema.post('save', async function () {
  if (!this.specialist) return
  const Specialist = mongoose.model('Specialist')
  const stats = await mongoose.model('Review').aggregate([
    { $match: { specialist: this.specialist, isApproved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  if (stats.length > 0) {
    await Specialist.findByIdAndUpdate(this.specialist, {
      'rating.average': Math.round(stats[0].avg * 10) / 10,
      'rating.count': stats[0].count,
    })
  }
})

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review
