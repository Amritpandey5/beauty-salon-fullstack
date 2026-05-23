const ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
  SPECIALIST: 'specialist',
}

const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
}

const SERVICE_CATEGORIES = ['Hair', 'Nails', 'Skin', 'Bridal', 'Wellness']

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '02:00 PM', '02:30 PM', '03:00 PM',
  '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM',
  '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM',
  '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM',
]

const WORKING_DAYS = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
}

const CANCELLATION_HOURS = 24

module.exports = {
  ROLES,
  APPOINTMENT_STATUS,
  SERVICE_CATEGORIES,
  TIME_SLOTS,
  WORKING_DAYS,
  CANCELLATION_HOURS,
}
