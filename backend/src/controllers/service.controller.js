const Service = require('../models/Service')
const catchAsync = require('../utils/catchAsync')
const ApiError = require('../utils/ApiError')
const respond = require('../utils/ApiResponse')

// GET /api/services
const getServices = catchAsync(async (req, res) => {
  const { category, featured, search } = req.query
  const filter = { isActive: true }
  if (category) filter.category = category
  if (featured === 'true') filter.isFeatured = true
  if (search) filter.title = { $regex: search, $options: 'i' }

  const services = await Service.find(filter)
    .sort({ sortOrder: 1, createdAt: 1 })
    .populate('requiredSpecialists', 'name role image')

  respond(res).success({ services, total: services.length })
})

// GET /api/services/:id
const getService = catchAsync(async (req, res) => {
  const { id } = req.params

  let service

  // ✔ If it's a valid Mongo ObjectId
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    service = await Service.findOne({
      _id: id,
      isActive: true,
    })
  } else {
    // ✔ Otherwise treat it as slug
    service = await Service.findOne({
      slug: id,
      isActive: true,
    })
  }

  if (!service) {
    throw ApiError.notFound('Service not found')
  }

  respond(res).success({ service })
})

// POST /api/services (admin)
const createService = catchAsync(async (req, res) => {
  const service = await Service.create(req.body)
  respond(res).created({ service }, 'Service created successfully')
})

// PATCH /api/services/:id (admin)
const updateService = catchAsync(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!service) throw ApiError.notFound('Service not found')
  respond(res).success({ service }, 'Service updated')
})

// DELETE /api/services/:id (admin)
const deleteService = catchAsync(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })
  if (!service) throw ApiError.notFound('Service not found')
  respond(res).success(null, 'Service deactivated')
})

module.exports = { getServices, getService, createService, updateService, deleteService }
