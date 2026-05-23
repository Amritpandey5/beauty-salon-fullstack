const router  = require('express').Router()
const path    = require('path')
const { protect, authorize } = require('../middleware/auth')
const upload  = require('../middleware/upload')
const catchAsync = require('../utils/catchAsync')
const ApiError   = require('../utils/ApiError')
const respond    = require('../utils/ApiResponse')
const User       = require('../models/User')
const Specialist = require('../models/Specialist')
const { ROLES }  = require('../config/constants')

// PATCH /api/upload/avatar  — authenticated user uploads their own avatar
router.patch(
  '/avatar',
  protect,
  upload.single('avatar'),
  catchAsync(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No file uploaded')
    const relativePath = `/uploads/avatars/${req.file.filename}`
    await User.findByIdAndUpdate(req.user._id, { avatar: relativePath })
    respond(res).success({ avatar: relativePath }, 'Avatar updated')
  })
)

// PATCH /api/upload/specialist/:id/image  — admin uploads specialist photo
router.patch(
  '/specialist/:id/image',
  protect,
  authorize(ROLES.ADMIN),
  upload.single('image'),
  catchAsync(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No file uploaded')
    const relativePath = `/uploads/images/${req.file.filename}`
    const specialist = await Specialist.findByIdAndUpdate(
      req.params.id,
      { image: relativePath },
      { new: true }
    )
    if (!specialist) throw ApiError.notFound('Specialist not found')
    respond(res).success({ image: relativePath }, 'Specialist image updated')
  })
)

// POST /api/upload/service-image  — admin uploads service gallery image
router.post(
  '/service-image',
  protect,
  authorize(ROLES.ADMIN),
  upload.array('images', 5),
  catchAsync(async (req, res) => {
    if (!req.files || req.files.length === 0) throw ApiError.badRequest('No files uploaded')
    const paths = req.files.map(f => `/uploads/images/${f.filename}`)
    respond(res).success({ images: paths }, `${paths.length} image(s) uploaded`)
  })
)

module.exports = router
