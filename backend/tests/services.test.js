const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../src/server')
const User = require('../src/models/User')
const Service = require('../src/models/Service')
const { ROLES } = require('../src/config/constants')

const TEST_DB = 'mongodb://localhost:27017/lumiere_services_test'

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
  await Service.deleteMany()
  await User.deleteMany()
})

const servicePayload = {
  title: 'Couture Styling',
  category: 'Hair',
  subtitle: 'Expert cuts and styling.',
  price: { amount: 35, currency: 'KWD', display: '35 KWD' },
  duration: { minMinutes: 60, display: '60 min' },
  icon: 'hair',
}

const getAdminToken = async () => {
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: 'Admin@1234',
    role: ROLES.ADMIN,
  })
  return admin.signAccessToken()
}

describe('GET /api/services', () => {
  it('returns empty array when no services', async () => {
    const res = await request(app).get('/api/services')
    expect(res.status).toBe(200)
    expect(res.body.data.services).toEqual([])
  })

  it('returns active services', async () => {
    await Service.create(servicePayload)
    const res = await request(app).get('/api/services')
    expect(res.status).toBe(200)
    expect(res.body.data.services).toHaveLength(1)
    expect(res.body.data.services[0].title).toBe('Couture Styling')
  })

  it('filters by category', async () => {
    await Service.create(servicePayload)
    await Service.create({ ...servicePayload, title: 'Nail Art', category: 'Nails' })

    const res = await request(app).get('/api/services?category=Hair')
    expect(res.status).toBe(200)
    expect(res.body.data.services).toHaveLength(1)
    expect(res.body.data.services[0].category).toBe('Hair')
  })
})

describe('GET /api/services/:id', () => {
  it('returns a service by ID', async () => {
    const svc = await Service.create(servicePayload)
    const res = await request(app).get(`/api/services/${svc._id}`)
    expect(res.status).toBe(200)
    expect(res.body.data.service.title).toBe('Couture Styling')
  })

  it('returns 404 for unknown ID', async () => {
    const res = await request(app).get(`/api/services/${new mongoose.Types.ObjectId()}`)
    expect(res.status).toBe(404)
  })

  it('returns service by slug', async () => {
    const svc = await Service.create(servicePayload)
    const res = await request(app).get(`/api/services/${svc.slug}`)
    expect(res.status).toBe(200)
  })
})

describe('POST /api/services (admin)', () => {
  it('creates a service as admin', async () => {
    const token = await getAdminToken()
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${token}`)
      .send(servicePayload)

    expect(res.status).toBe(201)
    expect(res.body.data.service.title).toBe('Couture Styling')
    expect(res.body.data.service.slug).toBe('couture-styling')
  })

  it('rejects creation without auth', async () => {
    const res = await request(app).post('/api/services').send(servicePayload)
    expect(res.status).toBe(401)
  })

  it('rejects creation by non-admin', async () => {
    const client = await User.create({ name: 'Client', email: 'c@test.com', password: 'Client@1234', role: ROLES.CLIENT })
    const token = client.signAccessToken()
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${token}`)
      .send(servicePayload)
    expect(res.status).toBe(403)
  })
})

describe('PATCH /api/services/:id (admin)', () => {
  it('updates a service', async () => {
    const token = await getAdminToken()
    const svc = await Service.create(servicePayload)

    const res = await request(app)
      .patch(`/api/services/${svc._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isFeatured: true })

    expect(res.status).toBe(200)
    expect(res.body.data.service.isFeatured).toBe(true)
  })
})
