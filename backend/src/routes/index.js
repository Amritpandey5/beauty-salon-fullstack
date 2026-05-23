const router = require('express').Router()

router.use('/auth',         require('./auth.routes'))
router.use('/services',     require('./service.routes'))
router.use('/specialists',  require('./specialist.routes'))
router.use('/appointments', require('./appointment.routes'))
router.use('/reviews',      require('./review.routes'))
router.use('/contact',      require('./contact.routes'))
router.use('/newsletter',   require('./newsletter.routes'))
router.use('/upload',       require('./upload.routes'))
router.use('/admin',        require('./admin.routes'))

// Health check
router.get('/health', (req, res) => {
  const mongoose = require('mongoose')
  res.json({
    success: true,
    message: 'Lumière API is running',
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  })
})

module.exports = router
