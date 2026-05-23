const request  = require('supertest')
const mongoose = require('mongoose')
const app      = require('../src/server')
const User     = require('../src/models/User')
const Contact  = require('../src/models/Contact')
const { ROLES } = require('../src/config/constants')

const TEST_DB = 'mongodb://localhost:27017/lumiere_contact_test'

let admin, adminToken

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
  await Promise.all([User.deleteMany(), Contact.deleteMany()])
  admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'Admin@1234', role: ROLES.ADMIN })
  adminToken = admin.signAccessToken()
})

const validContact = {
  name:    'Maryam Al-Qattan',
  email:   'maryam@example.com',
  phone:   '+96512345678',
  subject: 'Booking Inquiry',
  message: 'I would like to enquire about your bridal packages for April.',
}

describe('POST /api/contact', () => {
  it('accepts a valid contact submission', async () => {
    const res = await request(app).post('/api/contact').send(validContact)
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)

    const saved = await Contact.findOne({ email: validContact.email })
    expect(saved).toBeTruthy()
    expect(saved.status).toBe('unread')
  })

  it('rejects missing name', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...validContact, name: '' })
    expect(res.status).toBe(400)
  })

  it('rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...validContact, email: 'not-an-email' })
    expect(res.status).toBe(400)
  })

  it('rejects message shorter than 10 characters', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...validContact, message: 'Hi' })
    expect(res.status).toBe(400)
  })

  it('rejects missing message', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Maryam', email: 'maryam@test.com' })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/contact (admin)', () => {
  beforeEach(async () => {
    await Contact.create([
      { ...validContact, status: 'unread' },
      { ...validContact, email: 'other@test.com', status: 'read' },
    ])
  })

  it('admin retrieves all contact submissions', async () => {
    const res = await request(app)
      .get('/api/contact')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.pagination.total).toBe(2)
  })

  it('filters by status', async () => {
    const res = await request(app)
      .get('/api/contact?status=unread')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].status).toBe('unread')
  })

  it('blocks non-admin access', async () => {
    const client = await User.create({ name: 'Client', email: 'c@test.com', password: 'Client@1234' })
    const res = await request(app)
      .get('/api/contact')
      .set('Authorization', `Bearer ${client.signAccessToken()}`)

    expect(res.status).toBe(403)
  })

  it('blocks unauthenticated access', async () => {
    const res = await request(app).get('/api/contact')
    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/contact/:id (admin)', () => {
  it('updates contact status', async () => {
    const contact = await Contact.create({ ...validContact, status: 'unread' })
    const res = await request(app)
      .patch(`/api/contact/${contact._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'replied', adminNotes: 'Responded via WhatsApp on March 10th.' })

    expect(res.status).toBe(200)
    expect(res.body.data.contact.status).toBe('replied')
    expect(res.body.data.contact.adminNotes).toBe('Responded via WhatsApp on March 10th.')
  })

  it('returns 404 for unknown contact ID', async () => {
    const res = await request(app)
      .patch(`/api/contact/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'read' })

    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/contact/:id (admin)', () => {
  it('admin deletes a contact submission', async () => {
    const contact = await Contact.create(validContact)
    const res = await request(app)
      .delete(`/api/contact/${contact._id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(204)
    const found = await Contact.findById(contact._id)
    expect(found).toBeNull()
  })
})
