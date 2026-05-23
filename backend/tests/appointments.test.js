const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../src/server')
const User = require('../src/models/User')
const Service = require('../src/models/Service')
const Specialist = require('../src/models/Specialist')
const Appointment = require('../src/models/Appointment')
const { ROLES, APPOINTMENT_STATUS } = require('../src/config/constants')

const TEST_DB = 'mongodb://localhost:27017/lumiere_appointments_test'

let client, admin, service, specialist, clientToken, adminToken

beforeAll(async () => {
  process.env.MONGO_URI = TEST_DB
  process.env.JWT_SECRET = 'test_secret_key_at_least_32_characters_long'
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_32_chars_long'
  await mongoose.connect(TEST_DB)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

beforeEach(async () => {
  await Promise.all([User.deleteMany(), Service.deleteMany(), Specialist.deleteMany(), Appointment.deleteMany()])

  client = await User.create({ name: 'Test Client', email: 'client@test.com', password: 'Client@1234', role: ROLES.CLIENT })
  admin  = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'Admin@1234', role: ROLES.ADMIN })

  clientToken = client.signAccessToken()
  adminToken  = admin.signAccessToken()

  service = await Service.create({
    title: 'Test Service',
    category: 'Hair',
    price: { amount: 35, currency: 'KWD', display: '35 KWD' },
    duration: { minMinutes: 60, display: '60 min' },
    icon: 'hair',
  })

  specialist = await Specialist.create({
    name: 'Test Specialist',
    role: 'Stylist',
    specialties: ['Cuts'],
    services: [service._id],
  })
})

const futureDate = () => {
  const d = new Date()
  d.setDate(d.getDate() + 5)
  return d.toISOString().split('T')[0]
}

const makeBooking = (overrides = {}) => ({
  serviceId: service._id.toString(),
  specialistId: specialist._id.toString(),
  date: futureDate(),
  timeSlot: '10:00 AM',
  ...overrides,
})

describe('POST /api/appointments', () => {
  it('creates appointment for authenticated client', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(makeBooking())

    expect(res.status).toBe(201)
    expect(res.body.data.appointment.status).toBe(APPOINTMENT_STATUS.CONFIRMED)
    expect(res.body.data.appointment.confirmationNumber).toMatch(/^LUM-/)
  })

  it('rejects unauthenticated booking', async () => {
    const res = await request(app).post('/api/appointments').send(makeBooking())
    expect(res.status).toBe(401)
  })

  it('rejects past date', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(makeBooking({ date: '2020-01-01' }))

    expect(res.status).toBe(400)
  })

  it('rejects invalid time slot', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(makeBooking({ timeSlot: '13:00' }))

    expect(res.status).toBe(400)
  })

  it('prevents double booking same slot', async () => {
    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(makeBooking())

    const res2 = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(makeBooking())

    expect(res2.status).toBe(409)
  })
})

describe('GET /api/appointments', () => {
  it('returns only client\'s own appointments', async () => {
    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(makeBooking())

    const res = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${clientToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
  })

  it('admin sees all appointments', async () => {
    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(makeBooking())

    const res = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
  })
})

describe('PATCH /api/appointments/:id/status', () => {
  let apptId

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(makeBooking())
    apptId = res.body.data.appointment._id
  })

  it('admin can mark appointment as completed', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${apptId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'completed' })

    expect(res.status).toBe(200)
    expect(res.body.data.appointment.status).toBe('completed')
  })

  it('client cannot change status to completed', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${apptId}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'completed' })

    expect(res.status).toBe(403)
  })
})

describe('GET /api/appointments/stats', () => {
  it('returns stats for admin', async () => {
    const res = await request(app)
      .get('/api/appointments/stats')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.total).toBeDefined()
    expect(res.body.data.upcoming).toBeDefined()
  })

  it('forbids stats for clients', async () => {
    const res = await request(app)
      .get('/api/appointments/stats')
      .set('Authorization', `Bearer ${clientToken}`)

    expect(res.status).toBe(403)
  })
})
