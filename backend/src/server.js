require('dotenv').config()
const express    = require('express')
const helmet     = require('helmet')
const cors       = require('cors')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const xss        = require('xss-clean')
const morgan     = require('morgan')
const path       = require('path')

const connectDB        = require('./config/db')
const logger           = require('./utils/logger')
const routes           = require('./routes/index')
const { startReminderScheduler } = require('./services/reminder.service')
const { errorHandler, notFound } = require('./middleware/errorHandler')
const { globalLimiter } = require('./middleware/rateLimiter')

const app = express()

// ── Security headers ───────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  ...(process.env.CLIENT_URL?.split(',') || []),
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'https://beauty-salon-fullstack.vercel.app',
  'https://beauty-salon-fullstack-236301038-9531s-projects.vercel.app',
  'https://beautisalon.online',
  'https://www.beautisalon.online'
].map(origin => origin.trim())
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Request parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser(process.env.COOKIE_SECRET))

// ── Data sanitisation ──────────────────────────────────────────────────────────
app.use(mongoSanitize())   // prevent NoSQL injection
app.use(xss())             // strip XSS from req.body / req.query / req.params

// ── Compression ────────────────────────────────────────────────────────────────
app.use(compression())

// ── HTTP request logging ───────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  )
}

// ── Trust proxy (Nginx / Railway / Heroku) ────────────────────────────────────
app.set('trust proxy', 1)

// ── Global rate limiter ────────────────────────────────────────────────────────
app.use('/api', globalLimiter)

// ── Static uploads ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ── API routes ─────────────────────────────────────────────────────────────────
app.use('/api', routes)

// ── Root ───────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name:    'Lumière Salon API',
    version: '1.0.0',
    status:  'running',
    docs:    '/api/health',
    env:     process.env.NODE_ENV,
  })
})

// ── 404 + Global error handler ─────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 5000

const startServer = async () => {
  await connectDB()

  if (process.env.NODE_ENV !== 'test') {
    startReminderScheduler()
  }

  const server = app.listen(PORT, () => {
    logger.info(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✦ Lumière Salon API
  ✦ http://localhost:${PORT}
  ✦ Environment: ${process.env.NODE_ENV || 'development'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  })

  const shutdown = (signal) => {
    logger.info(`${signal} — shutting down gracefully`)
    server.close(() => {
      require('mongoose').connection.close(false, () => {
        logger.info('MongoDB connection closed')
        process.exit(0)
      })
    })
    setTimeout(() => { logger.error('Forced shutdown'); process.exit(1) }, 10_000)
  }

  process.on('SIGTERM',            () => shutdown('SIGTERM'))
  process.on('SIGINT',             () => shutdown('SIGINT'))
  process.on('unhandledRejection', (err) => { logger.error('Unhandled rejection:', err); shutdown('unhandledRejection') })
  process.on('uncaughtException',  (err) => { logger.error('Uncaught exception:', err);  shutdown('uncaughtException')  })
}

if (process.env.NODE_ENV !== 'test') startServer()

module.exports = app
