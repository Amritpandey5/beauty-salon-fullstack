const { Queue } = require('bullmq')
const { createConnection } = require('../config/redis')

console.log('🚀 Initializing email queue...')

const emailQueue = new Queue('emails', {
  connection: createConnection(),
})

console.log('🚀 Email queue initialized')

module.exports = { emailQueue }