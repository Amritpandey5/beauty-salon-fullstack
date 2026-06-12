const { Resend } = require('resend')
const logger = require('../utils/logger')

const resend = new Resend(process.env.RESEND_API_KEY)

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    logger.warn(`[Email] Resend not configured — skipping email to ${to}`)
    return
  }

  try {
    // console.log("EMAIL TO:", to);
    const { data, error } = await resend.emails.send({
      from: "Beauti Salon <booking@beautisalon.online>", 
      to,
      subject,
      html,
    })

    if (error) throw error

    logger.info(`[Email] Sent to ${to}: ${subject}`)
    return data
  } catch (err) {
    logger.error(`[Email] Failed to send to ${to}: ${err.message}`)
  }
}

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; font-family: Georgia, serif; background: #0f0d0b; color: #f9f6ee; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; padding: 40px 0 32px; border-bottom: 1px solid #3c342f; }
    .logo { font-size: 36px; color: #c9a227; letter-spacing: 0.05em; }
    .tagline { font-size: 13px; color: #a67c1e; margin-top: 4px; }
    .body { padding: 40px 0; }
    .footer { text-align: center; padding: 32px 0 0; border-top: 1px solid #3c342f; font-size: 12px; color: #524943; }
    h2 { font-size: 24px; color: #f9f6ee; margin: 0 0 16px; }
    p { font-size: 15px; line-height: 1.7; color: #d1cdc8; margin: 0 0 16px; }
    .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #c9a227, #e4c52a, #a67c1e); color: #0f0d0b; font-size: 13px; font-family: sans-serif; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; font-weight: 600; margin: 8px 0; }
    .card { background: #1e1a17; border: 1px solid #3c342f; padding: 24px; margin: 24px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #3c342f; }
    .row:last-child { border-bottom: none; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #8a7f74; font-family: sans-serif; }
    .value { font-size: 14px; color: #f9f6ee; }
    .gold { color: #c9a227; }
    .divider { width: 40px; height: 1px; background: linear-gradient(to right, #c9a227, #a67c1e); margin: 24px auto; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Lumière</div>
      <div class="tagline">لوميير — الكويت</div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <div class="divider"></div>
      <p>© ${new Date().getFullYear()} Lumière Salon, Kuwait. All rights reserved.</p>
      <p>Block 7, Al-Salmiya, Kuwait City · +965 1234 5678</p>
    </div>
  </div>
</body>
</html>
`


// ── Email templates ────────────────────────────────────────────────────────────

const verificationEmail = (user, verificationUrl) =>
  sendEmail({
    to: user.email,
    subject: 'Verify Your Email — Lumière Salon',
    html: baseTemplate(`
      <h2 style='color: #c9a227;'>Verify Your Email</h2>
      <p>Dear <span class="gold">${user.name}</span>, thank you for creating an account with Lumière. Please verify your email address by clicking the button below:</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${verificationUrl}" class="btn">Verify My Email</a>
      </div>
      <p style="font-size:12px;color:#524943">If you did not create this account, please ignore this email.</p>
    `),
  })

const sendWelcomeEmail = (user) =>
  sendEmail({
    to: user.email,
    subject: 'Welcome to Lumière — Kuwait\'s Finest Beauty Sanctuary',
    html: baseTemplate(`
      <h2 style='color: #c9a227;'>Welcome, ${user.name}</h2>
      <div class="divider"></div>
      <p>We are delighted to welcome you to the <span class="gold">Lumière</span> inner circle. Your account has been created and you are now part of Kuwait's most distinguished beauty community.</p>
      <p>With your account you can:</p>
      <ul style="color:#d1cdc8;line-height:2">
        <li>Book appointments online, anytime</li>
        <li>Track your appointment history</li>
        <li>Receive exclusive member offers</li>
        <li>Manage your beauty preferences</li>
      </ul>
      <div style="text-align:center;margin:32px 0">
        <a href="${process.env.CLIENT_URL}/book" class="btn">Book Your First Appointment</a>
      </div>
    `),
  })

const sendAppointmentConfirmation = (appointment, client, service, specialist) =>
  sendEmail({
    to: client.email,
    subject: `Appointment Confirmed — ${appointment.confirmationNumber}`,
    html: baseTemplate(`
      <h2 class="gold">Appointment Confirmed</h2>
      <p>Dear <span class="gold">${client.name}</span>, your appointment has been confirmed. We look forward to welcoming you.</p>
      <div class="card">
        <div class="row"><span class="label">Confirmation:</span><span class="label  gold">${appointment.confirmationNumber}</span></div>
        <div class="row"><span class="label">Service:</span><span class="label ">${service.title}</span></div>
        <div class="row"><span class="label">Specialist:</span><span class="label ">${specialist.name}</span></div>
        <div class="row"><span class="label">Date:</span><span class="label ">${new Date(appointment.date).toLocaleDateString('en-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
        <div class="row"><span class="label">Time:</span><span class="label ">${appointment.timeSlot}</span></div>
        <div class="row"><span class="label">Price:</span><span class="label gold">${appointment.price?.display || service.price?.display}</span></div>
      </div>
      <p style="font-size:13px;color:#8a7f74">Please arrive 10 minutes before your appointment. Cancellations must be made at least 24 hours in advance.</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${process.env.CLIENT_URL}/dashboard" class="btn">View My Appointments</a>
      </div>
    `),
  })

const sendAppointmentCancellation = (appointment, client, service) =>
  sendEmail({
    to: client.email,
    subject: `Appointment Cancelled — ${appointment.confirmationNumber}`,
    html: baseTemplate(`
      <h2 style='color: #c9a227;'>Appointment Cancelled</h2>
      <p>Dear <span class="gold">${client.name}</span>, your appointment has been cancelled as requested.</p>
      <div class="card">
        <div class="row"><span class="label">Confirmation:</span><span class="label gold">${appointment.confirmationNumber}</span></div>
        <div class="row"><span class="label">Service:</span><span class="label">${service.title}</span></div>
        <div class="row"><span class="label">Date:</span><span class="label">${new Date(appointment.date).toLocaleDateString('en-KW', { weekday: 'long', month: 'long', day: 'numeric' })}</span></div>
        <div class="row"><span class="label">Time:</span><span class="label">${appointment.timeSlot}</span></div>
      </div>
      <p>We hope to see you again soon. Book a new appointment at any time.</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${process.env.CLIENT_URL}/book" class="btn">Book Again</a>
      </div>
    `),
  })

const sendAppointmentReminder = (appointment, client, service, specialist) =>
  sendEmail({
    to: client.email,
    subject: `Reminder: Your Lumière appointment is tomorrow`,
    html: baseTemplate(`
      <h2 style='color: #c9a227;'>Your Appointment is Tomorrow</h2>
      <p>Dear <span class="gold">${client.name}</span>, this is a friendly reminder of your upcoming appointment at Lumière.</p>
      <div class="card">
        <div class="row"><span class="label">Service:</span><span class="label">${service.title}</span></div>
        <div class="row"><span class="label">Specialist:</span><span class="label">${specialist.name}</span></div>
        <div class="row"><span class="label">Date:</span><span class="label">${new Date(appointment.date).toLocaleDateString('en-KW', { weekday: 'long', month: 'long', day: 'numeric' })}</span></div>
        <div class="row"><span class="label">Time:</span><span class="label gold">${appointment.timeSlot}</span></div>
      </div>
      <p style="font-size:13px;color:#8a7f74">📍 Block 7, Al-Salmiya, Kuwait City — Please arrive 10 minutes early.</p>
    `),
  })

const sendContactAcknowledgement = (contact) =>
  sendEmail({
    to: contact.email,
    subject: 'We received your message — Lumière Salon',
    html: baseTemplate(`
      <h2 style='color: #c9a227;'>Thank You, ${contact.name}</h2>
      <div class="divider"></div>
      <p>We have received your message and our team will respond within <span class="gold">24 hours</span>.</p>
      <div class="card">
        <div class="row"><span class="label">Subject:</span><span class="label">${contact.subject || 'General Enquiry'}</span></div>
        <div class="row"><span class="label">Message:</span><span class="label">${contact.message.substring(0, 120)}${contact.message.length > 120 ? '…' : ''}</span></div>
      </div>
      <p>For urgent enquiries, please reach us via WhatsApp at <span class="gold">+965 1234 5678</span>.</p>
    `),
  })

const sendPasswordReset = (user, resetUrl) =>
  sendEmail({
    to: user.email,
    subject: 'Password Reset — Lumière Salon',
    html: baseTemplate(`
      <h2 style='color: #c9a227;'>Reset Your Password</h2>
      <p>Dear <span class="gold">${user.name}</span>, you requested a password reset for your Lumière account.</p>
      <p>Click the button below to set a new password. This link expires in <span class="gold">15 minutes</span>.</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>
      <p style="font-size:12px;color:#524943">If you did not request this, please ignore this email. Your password will not change.</p>
    `),
  })

module.exports = {
  verificationEmail,
  sendWelcomeEmail,
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
  sendAppointmentReminder,
  sendContactAcknowledgement,
  sendPasswordReset,
}
