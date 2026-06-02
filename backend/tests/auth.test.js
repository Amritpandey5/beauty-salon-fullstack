process.env.NODE_ENV = 'test'
process.env.AUTH_RATE_LIMIT_MAX = 10000


jest.mock('../src/services/email.service', () => ({
  verificationEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendPasswordReset: jest.fn().mockResolvedValue(true),
  sendAppointmentConfirmation: jest.fn().mockResolvedValue(true),
  sendAppointmentCancellation: jest.fn().mockResolvedValue(true),
  sendAppointmentReminder: jest.fn().mockResolvedValue(true),
  sendContactAcknowledgement: jest.fn().mockResolvedValue(true),
}))



const request = require('supertest')
const mongoose = require('mongoose')
const crypto = require('crypto')
const app = require('../src/server')
const User = require('../src/models/User')

const TEST_DB = 'mongodb://localhost:27017/lumiere_test'

beforeAll(async () => {
  process.env.MONGO_URI = TEST_DB
  process.env.JWT_SECRET = 'test_secret_key_at_least_32_characters_long'
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_at_least_32_chars'
  process.env.JWT_EXPIRES_IN = '1h'
  await mongoose.connect(TEST_DB)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

beforeEach(async () => {
  await User.deleteMany()
})

const validUser = {
  name: 'Test Client',
  email: 'test@lumiere.com',
  password: 'Test@1234',
}

describe('POST /api/auth/register', () => {
  it('registers a new user and sends verification email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)

    expect(res.body.data.user.email).toBe(validUser.email)

    expect(res.body.data.accessToken).toBeUndefined()

    const createdUser = await User.findOne({ email: validUser.email })
      .select('+verificationToken +verificationExpire')

    expect(createdUser).toBeDefined()
    expect(createdUser.verificationToken).toBeDefined()
    expect(createdUser.isEmailVerified).toBe(false)
  })

  it('fails registration if verification email sending fails', async () => {
  const emailService = require('../src/services/email.service')

  emailService.verificationEmail.mockRejectedValueOnce(new Error('Email failed'))

  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: 'fail@test.com',
      password: 'Test@1234',
    })

  expect(res.status).toBe(500)

  const user = await User.findOne({ email: 'fail@test.com' })

  expect(user).toBeNull()
})

  it('rejects duplicate email', async () => {
    await User.create(validUser)
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser)

    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
  })

  it('rejects weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'weak' })

    expect(res.status).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  it('rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' })

    expect(res.status).toBe(400)
  })

  it('rejects missing name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: validUser.email, password: validUser.password })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await User.create({
      ...validUser,
      isEmailVerified: true,
    })
  })

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password })

    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeDefined()
    expect(res.body.data.user.email).toBe(validUser.email)
  })

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPass@1' })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('rejects non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@lumiere.com', password: validUser.password })

    expect(res.status).toBe(404)
  })
})

describe('GET /api/auth/verify-email', () => {
  let user
  let rawToken

  beforeEach(async () => {
    rawToken = crypto.randomBytes(32).toString('hex')

    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex')

    user = await User.create({
      ...validUser,
      verificationToken: hashedToken,
      verificationExpire: Date.now() + 10 * 60 * 1000,
      isEmailVerified: false,
    })
  })

  it('verifies user email with valid token', async () => {
    const res = await request(app)
      .get(`/api/auth/verify-email?id=${user._id}&token=${rawToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    const updatedUser = await User.findById(user._id)

    expect(updatedUser.isEmailVerified).toBe(true)
    expect(updatedUser.verificationToken).toBeUndefined()
  })

  it('rejects invalid verification token', async () => {
    const res = await request(app)
      .get(`/api/auth/verify-email?id=${user._id}&token=wrongtoken`)

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('rejects expired verification token', async () => {
    user.verificationExpire = Date.now() - 1000
    await user.save({ validateBeforeSave: false })

    const res = await request(app)
      .get(`/api/auth/verify-email?id=${user._id}&token=${rawToken}`)

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('POST /api/auth/resend-verification', () => {
  let user

  beforeEach(async () => {
    user = await User.create({
      ...validUser,
      isEmailVerified: false,
    })
  })

  it('resends verification email successfully', async () => {
    const res = await request(app)
      .post('/api/auth/resend-verification')
      .send({ id: user._id })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    const updatedUser = await User.findById(user._id).select(
      '+verificationToken +verificationExpire'
    )

    expect(updatedUser.verificationToken).toBeDefined()
  })

  it('rejects resend for verified user', async () => {
    user.isEmailVerified = true
    await user.save()

    const res = await request(app)
      .post('/api/auth/resend-verification')
      .send({ id: user._id })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('rejects invalid user id', async () => {
    const fakeId = new mongoose.Types.ObjectId()

    const res = await request(app)
      .post('/api/auth/resend-verification')
      .send({ id: fakeId })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('GET /api/auth/me', () => {
  let token

  beforeEach(async () => {
    const user = await User.create({
      ...validUser,
      isEmailVerified: true,
    })
    token = user.signAccessToken()
  })

  it('returns current user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.user.email).toBe(validUser.email)
  })

  it('rejects request without token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('rejects invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here')

    expect(res.status).toBe(401)
  })
})

describe('POST /api/auth/logout', () => {
  it('logs out and clears cookies', async () => {
    const user = await User.create({
      ...validUser,
      isEmailVerified: true,
    })
    const token = user.signAccessToken()

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
