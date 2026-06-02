const mongoose = require('mongoose')
const { SERVICE_CATEGORIES } = require('../config/constants')

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      // unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: SERVICE_CATEGORIES,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, 'Subtitle cannot exceed 300 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'KWD' },
      isFrom: { type: Boolean, default: false },
      display: { type: String },
    },
    duration: {
      minMinutes: { type: Number, required: true },
      maxMinutes: { type: Number },
      display: { type: String },
    },
    icon: {
      type: String,
      default: 'default',
    },
    images: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    requiredSpecialists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Specialist',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

serviceSchema.index({ category: 1, isActive: 1 })
serviceSchema.index({ slug: 1 })

// Auto-generate slug from title
serviceSchema.pre('save', async function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  next()
})

const Service = mongoose.model('Service', serviceSchema)
module.exports = Service
