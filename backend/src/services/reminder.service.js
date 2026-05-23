/**
 * Reminder Service
 * ─────────────────
 * Polls for appointments happening tomorrow and sends email reminders.
 * In production replace setInterval with a proper job queue (Bull, Agenda).
 *
 * Usage: call startReminderScheduler() once from server.js after DB connect.
 */
const Appointment = require('../models/Appointment')
const Specialist  = require('../models/Specialist')
const { sendAppointmentReminder } = require('./email.service')
const { APPOINTMENT_STATUS } = require('../config/constants')
const logger = require('../utils/logger')

const INTERVAL_MS = 60 * 60 * 1000 // run every hour

const sendReminders = async () => {
  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const start = new Date(tomorrow.setHours(0, 0, 0, 0))
    const end   = new Date(tomorrow.setHours(23, 59, 59, 999))

    const appointments = await Appointment.find({
      status: APPOINTMENT_STATUS.CONFIRMED,
      date: { $gte: start, $lte: end },
      reminderSent: false,
    })
      .populate('client',     'name email preferences')
      .populate('service',    'title')
      .populate('specialist', 'name')

    if (appointments.length === 0) return

    logger.info(`[Reminder] Sending ${appointments.length} reminder(s)`)

    await Promise.allSettled(
      appointments.map(async (appt) => {
        // Respect client email reminder preferences
        if (appt.client?.preferences?.emailReminders === false) return

        await sendAppointmentReminder(
          appt,
          appt.client,
          appt.service,
          appt.specialist
        )

        await Appointment.findByIdAndUpdate(appt._id, {
          reminderSent:   true,
          reminderSentAt: new Date(),
        })

        logger.info(`[Reminder] Sent to ${appt.client.email} for appt ${appt.confirmationNumber}`)
      })
    )
  } catch (err) {
    logger.error('[Reminder] Failed to send reminders:', err.message)
  }
}

const startReminderScheduler = () => {
  logger.info('[Reminder] Scheduler started (interval: 1 hour)')
  sendReminders() // run immediately on start
  setInterval(sendReminders, INTERVAL_MS)
}

module.exports = { startReminderScheduler, sendReminders }
