const request  = require('supertest')
const mongoose = require('mongoose')
const app      = require('../src/server')
const User     = require('../src/models/User')
const Review   = require('../src/models/Review')
const Service  = require('../src/models/Service')
const { ROLES } = require('../src/config/constants')

const TEST_DB = 'mongodb://localhost:27017/lumiere_reviews_test'

let client, admin, clientToken, adminToken, service

beforeAll(async () => {
  process.env.MONGO_URI        = TEST_DB
  process.env.JWT_SECRET       = 'test_secret_key_at_least_32_characters_long'
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_32_chars_long'
  await mongoose.connect(TEST_DB)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

beforeEach(async () => {
  await Promise.all([User.deleteMany(), Review.deleteMany(), Service.deleteMany()])

  client = await User.create({ name: 'Client', email: 'client@test.com', password: 'Client@1234', role: ROLES.CLIENT })
  admin  = await User.create({ name: 'Admin',  email: 'admin@test.com',  password: 'Admin@1234',  role: ROLES.ADMIN  })
  clientToken = client.signAccessToken()
  adminToken  = admin.signAccessToken()

  service = await Service.create({
    title: 'Hammam Ritual', category: 'Wellness',
    price: { amount: 65, currency: 'KWD', display: '65 KWD' },
    duration: { minMinutes: 75, display: '75 min' },
    icon: 'spa',
  })
})

describe('GET /api/reviews/summary', () => {
  it('returns zero summary when no reviews', async () => {
    const res = await request(app).get('/api/reviews/summary')
    expect(res.status).toBe(200)
    expect(res.body.data.summary.totalReviews).toBe(0)
    expect(res.body.data.summary.averageRating).toBe(0)
  })

  it('calculates average rating correctly', async () => {
    await Review.create([
      { client: client._id, rating: 5, text: 'Absolutely magnificent experience.', isApproved: true, serviceName: 'Hammam' },
      { client: admin._id,  rating: 4, text: 'Very lovely and relaxing session.',   isApproved: true, serviceName: 'Hammam' },
    ])
    const res = await request(app).get('/api/reviews/summary')
    expect(res.status).toBe(200)
    expect(res.body.data.summary.averageRating).toBe(4.5)
    expect(res.body.data.summary.totalReviews).toBe(2)
  })
})

describe('GET /api/reviews', () => {
  it('returns only approved reviews publicly', async () => {
    await Review.create([
      { client: client._id, rating: 5, text: 'Wonderful experience at the salon.',   isApproved: true  },
      { client: client._id, rating: 3, text: 'Decent but could be much better here.', isApproved: false },
    ])
    const res = await request(app).get('/api/reviews')
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
  })

  it('supports pagination', async () => {
    for (let i = 0; i < 5; i++) {
      await Review.create({
        client: client._id,
        rating: 5,
        text: `Review number ${i + 1} is very detailed and lovely.`,
        isApproved: true,
      })
    }
    const res = await request(app).get('/api/reviews?page=1&limit=3')
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(3)
    expect(res.body.pagination.total).toBe(5)
    expect(res.body.pagination.totalPages).toBe(2)
  })
})

describe('POST /api/reviews', () => {
  it('creates a review for authenticated client', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ rating: 5, text: 'Truly outstanding service from start to finish.', serviceName: 'Hammam' })

    expect(res.status).toBe(201)
    expect(res.body.data.review.isApproved).toBe(false)
    expect(res.body.data.review.rating).toBe(5)
  })

  it('rejects review without auth', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({ rating: 5, text: 'Great experience overall.' })
    expect(res.status).toBe(401)
  })

  it('rejects rating outside 1-5', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ rating: 6, text: 'Amazing service every time.' })
    expect(res.status).toBe(400)
  })

  it('rejects text shorter than 10 chars', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ rating: 5, text: 'Great' })
    expect(res.status).toBe(400)
  })
})

describe('PATCH /api/reviews/:id/approve', () => {
  it('admin can approve a review', async () => {
    const review = await Review.create({
      client: client._id, rating: 5,
      text: 'Exceptional experience from the whole team.',
      isApproved: false,
    })
    const res = await request(app)
      .patch(`/api/reviews/${review._id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ approved: true })

    expect(res.status).toBe(200)
    expect(res.body.data.review.isApproved).toBe(true)
  })

  it('client cannot approve a review', async () => {
    const review = await Review.create({
      client: client._id, rating: 5,
      text: 'Amazing service from the talented team.',
      isApproved: false,
    })
    const res = await request(app)
      .patch(`/api/reviews/${review._id}/approve`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ approved: true })

    expect(res.status).toBe(403)
  })
})

describe('DELETE /api/reviews/:id', () => {
  it('owner can delete their own review', async () => {
    const review = await Review.create({
      client: client._id, rating: 4,
      text: 'Very good experience overall at Lumière.',
      isApproved: true,
    })
    const res = await request(app)
      .delete(`/api/reviews/${review._id}`)
      .set('Authorization', `Bearer ${clientToken}`)

    expect(res.status).toBe(204)
  })

  it('non-owner cannot delete review', async () => {
    const other = await User.create({ name: 'Other', email: 'other@test.com', password: 'Other@1234' })
    const review = await Review.create({
      client: client._id, rating: 4,
      text: 'Nice salon with excellent specialists.',
      isApproved: true,
    })
    const res = await request(app)
      .delete(`/api/reviews/${review._id}`)
      .set('Authorization', `Bearer ${other.signAccessToken()}`)

    expect(res.status).toBe(403)
  })
})
