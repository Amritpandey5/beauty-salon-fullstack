const request = require('supertest')
const mongoose = require('mongoose')
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
  it('registers a new user and returns tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.user.email).toBe(validUser.email)
    expect(res.body.data.accessToken).toBeDefined()
    expect(res.body.data.user.password).toBeUndefined()
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
    await User.create(validUser)
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

    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/me', () => {
  let token

  beforeEach(async () => {
    const user = await User.create(validUser)
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
    const user = await User.create(validUser)
    const token = user.signAccessToken()

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
