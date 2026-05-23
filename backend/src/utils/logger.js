const { createLogger, format, transports } = require('winston')
const path = require('path')
const fs = require('fs')

const logDir = path.join(__dirname, '../../logs')
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })

const { combine, timestamp, printf, colorize, errors } = format

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) =>
    stack
      ? `${timestamp} ${level}: ${message}\n${stack}`
      : `${timestamp} ${level}: ${message}`
  )
)

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  format.json()
)

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: prodFormat,
    }),
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: prodFormat,
    }),
  ],
})

module.exports = logger
