const mongoose = require('mongoose')
const logger = require('../utils/logger')

const connectDB = async () => {
  const uri = process.env.MONGO_URI

  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }

  let retries = 5
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(uri, options)
      logger.info(`MongoDB connected: ${conn.connection.host}`)
      return
    } catch (err) {
      retries -= 1
      logger.error(`MongoDB connection failed. Retries left: ${retries}. Error: ${err.message}`)
      if (retries === 0) {
        logger.error('Could not connect to MongoDB. Exiting.')
        process.exit(1)
      }
      await new Promise(r => setTimeout(r, 3000))
    }
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected')
})

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected')
})

module.exports = connectDB
