const request  = require('supertest')
const mongoose = require('mongoose')
const app      = require('../src/server')
const User     = require('../src/models/User')
const Specialist = require('../src/models/Specialist')
const Service    = require('../src/models/Service')
const Appointment = require('../src/models/Appointment')
const { ROLES, APPOINTMENT_STATUS } = require('../src/config/constants')

const TEST_DB = 'mongodb://localhost:27017/lumiere_specialists_test'

let admin, adminToken, service, specialist

beforeAll(async () => {
  process.env.MONGO_URI          = TEST_DB
  process.env.JWT_SECRET         = 'test_secret_key_at_least_32_characters_long'
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_32_chars_long'
  await mongoose.connect(TEST_DB)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

beforeEach(async () => {
  await Promise.all([User.deleteMany(), Specialist.deleteMany(), Service.deleteMany(), Appointment.deleteMany()])

  admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'Admin@1234', role: ROLES.ADMIN })
  adminToken = admin.signAccessToken()

  service = await Service.create({
    title: 'Color & Highlights', category: 'Hair',
    price: { amount: 55, currency: 'KWD', display: 'From 55 KWD' },
    duration: { minMinutes: 90, display: '90 min' },
    icon: 'color',
  })

  specialist = await Specialist.create({
    name: 'Layla Al-Rashidi',
    role: 'Master Colorist',
    specialties: ['Balayage', 'Color Correction'],
    services: [service._id],
    rating: { average: 4.9, count: 142 },
  })
})

describe('GET /api/specialists', () => {
  it('returns all active specialists', async () => {
    const res = await request(app).get('/api/specialists')
    expect(res.status).toBe(200)
    expect(res.body.data.specialists).toHaveLength(1)
    expect(res.body.data.specialists[0].name).toBe('Layla Al-Rashidi')
  })

  it('filters specialists by serviceId', async () => {
    await Specialist.create({ name: 'Other Specialist', role: 'Stylist', specialties: [] })
    const res = await request(app).get(`/api/specialists?serviceId=${service._id}`)
    expect(res.status).toBe(200)
    expect(res.body.data.specialists).toHaveLength(1)
    expect(res.body.data.specialists[0].name).toBe('Layla Al-Rashidi')
  })

  it('does not return inactive specialists', async () => {
    await Specialist.create({ name: 'Inactive', role: 'Stylist', specialties: [], isActive: false })
    const res = await request(app).get('/api/specialists')
    expect(res.status).toBe(200)
    expect(res.body.data.specialists).toHaveLength(1)
  })
})

describe('GET /api/specialists/:id', () => {
  it('returns a specialist by ID with populated services', async () => {
    const res = await request(app).get(`/api/specialists/${specialist._id}`)
    expect(res.status).toBe(200)
    expect(res.body.data.specialist.name).toBe('Layla Al-Rashidi')
    expect(res.body.data.specialist.rating.average).toBe(4.9)
  })

  it('returns 404 for invalid ID', async () => {
    const res = await request(app).get(`/api/specialists/${new mongoose.Types.ObjectId()}`)
    expect(res.status).toBe(404)
  })
})

describe('GET /api/specialists/:id/availability', () => {
  it('returns available slots for a future date', async () => {
    const future = new Date()
    future.setDate(future.getDate() + 3)
    const dateStr = future.toISOString().split('T')[0]

    const res = await request(app)
      .get(`/api/specialists/${specialist._id}/availability?date=${dateStr}`)

    expect(res.status).toBe(200)
    expect(res.body.data.availableSlots).toBeDefined()
    expect(Array.isArray(res.body.data.availableSlots)).toBe(true)
  })

  it('removes booked slots from available list', async () => {
    const client = await User.create({ name: 'Client', email: 'c@test.com', password: 'Client@1234' })
    const future = new Date()
    future.setDate(future.getDate() + 3)
    const dateStr = future.toISOString().split('T')[0]

    await Appointment.create({
      client: client._id,
      service: service._id,
      specialist: specialist._id,
      date: new Date(dateStr),
      timeSlot: '10:00 AM',
      status: APPOINTMENT_STATUS.CONFIRMED,
      price: { amount: 55, currency: 'KWD', display: '55 KWD' },
    })

    const res = await request(app)
      .get(`/api/specialists/${specialist._id}/availability?date=${dateStr}`)

    expect(res.status).toBe(200)
    expect(res.body.data.availableSlots).not.toContain('10:00 AM')
    expect(res.body.data.bookedSlots).toContain('10:00 AM')
  })

  it('returns 400 when date param is missing', async () => {
    const res = await request(app).get(`/api/specialists/${specialist._id}/availability`)
    expect(res.status).toBe(400)
  })
})

describe('POST /api/specialists (admin)', () => {
  it('creates specialist as admin', async () => {
    const res = await request(app)
      .post('/api/specialists')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Sara Mahmoud', role: 'Bridal Specialist', specialties: ['Bridal Hair', 'Updos'] })

    expect(res.status).toBe(201)
    expect(res.body.data.specialist.name).toBe('Sara Mahmoud')
  })

  it('rejects creation without name', async () => {
    const res = await request(app)
      .post('/api/specialists')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'Stylist' })

    expect(res.status).toBe(400)
  })
})

describe('PATCH /api/specialists/:id (admin)', () => {
  it('updates specialist details', async () => {
    const res = await request(app)
      .patch(`/api/specialists/${specialist._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bio: 'Updated bio text for this specialist.' })

    expect(res.status).toBe(200)
    expect(res.body.data.specialist.bio).toBe('Updated bio text for this specialist.')
  })
})
