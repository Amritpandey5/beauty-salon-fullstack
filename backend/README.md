# Lumière Salon — Backend API

Production-ready REST API built with **Node.js + Express + MongoDB (Mongoose)**.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, SMTP credentials

# 3. Seed the database
npm run seed

# 4. Start development server
npm run dev

# 5. Run tests
npm test
```

---

## Project Structure

```
salon-backend/
├── src/
│   ├── server.js                  # Express app entry point
│   ├── config/
│   │   ├── db.js                  # MongoDB connection with retry
│   │   └── constants.js           # Roles, statuses, time slots
│   ├── models/
│   │   ├── User.js                # Auth + JWT methods
│   │   ├── Service.js             # Salon services
│   │   ├── Specialist.js          # Staff + availability
│   │   ├── Appointment.js         # Bookings + double-book guard
│   │   ├── Review.js              # Client reviews
│   │   └── Contact.js             # Contact form submissions
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── service.controller.js
│   │   ├── specialist.controller.js
│   │   ├── appointment.controller.js
│   │   ├── review.controller.js
│   │   ├── contact.controller.js
│   │   ├── newsletter.controller.js
│   │   └── admin.controller.js
│   ├── routes/
│   │   ├── index.js               # Master router
│   │   ├── auth.routes.js
│   │   ├── service.routes.js
│   │   ├── specialist.routes.js
│   │   ├── appointment.routes.js
│   │   ├── review.routes.js
│   │   ├── contact.routes.js
│   │   ├── newsletter.routes.js
│   │   ├── upload.routes.js
│   │   └── admin.routes.js
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + role authorize
│   │   ├── errorHandler.js        # Global error + 404 handler
│   │   ├── rateLimiter.js         # Tiered rate limiting
│   │   ├── upload.js              # Multer config
│   │   └── validate.js            # express-validator collector
│   ├── services/
│   │   ├── auth.service.js        # Token cookie helpers
│   │   ├── email.service.js       # Nodemailer + HTML templates
│   │   └── reminder.service.js    # Appointment reminder scheduler
│   ├── validators/
│   │   ├── auth.validators.js
│   │   ├── appointment.validators.js
│   │   ├── review.validators.js
│   │   ├── contact.validators.js
│   │   ├── service.validators.js
│   │   └── specialist.validators.js
│   └── utils/
│       ├── ApiError.js            # Custom error class
│       ├── ApiResponse.js         # Standardised response wrapper
│       ├── catchAsync.js          # Async error forwarder
│       ├── logger.js              # Winston logger
│       ├── paginate.js            # Pagination helper
│       └── seed.js                # Database seeder
└── tests/
    ├── auth.test.js
    ├── services.test.js
    ├── appointments.test.js
    ├── specialists.test.js
    ├── reviews.test.js
    └── contact.test.js
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/lumiere_salon` |
| `JWT_SECRET` | Access token secret (32+ chars) | `your_secret_here` |
| `JWT_EXPIRES_IN` | Access token TTL | `7d` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `your_refresh_secret` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `30d` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email username | `you@gmail.com` |
| `SMTP_PASS` | Email password / app password | `xxxx xxxx xxxx xxxx` |
| `ADMIN_EMAIL` | Seed admin email | `admin@lumierekuwait.com` |
| `ADMIN_PASSWORD` | Seed admin password | `Admin@Lumiere2025!` |

---

## API Reference

All endpoints are prefixed with `/api`.

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Server + DB status |

---

### Auth  `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create account |
| POST | `/login` | — | Login, receive tokens |
| POST | `/refresh` | Cookie | Refresh access token |
| POST | `/logout` | Bearer | Logout + clear cookies |
| GET | `/me` | Bearer | Get current user |
| PATCH | `/me` | Bearer | Update profile |
| PATCH | `/change-password` | Bearer | Change password |
| POST | `/forgot-password` | — | Send reset email |
| POST | `/reset-password/:token` | — | Reset password |

**Register body:**
```json
{ "name": "Maryam Al-Qattan", "email": "m@example.com", "password": "Secret@123", "phone": "+96512345678" }
```

**Login response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "role": "client" },
    "accessToken": "eyJ..."
  }
}
```

---

### Services  `/api/services`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List all active services |
| GET | `/?category=Hair` | — | Filter by category |
| GET | `/?featured=true` | — | Featured services only |
| GET | `/:id` | — | Get single service (by ID or slug) |
| POST | `/` | Admin | Create service |
| PATCH | `/:id` | Admin | Update service |
| DELETE | `/:id` | Admin | Deactivate service |

---

### Specialists  `/api/specialists`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List all active specialists |
| GET | `/?serviceId=...` | — | Filter by service |
| GET | `/:id` | — | Get specialist detail |
| GET | `/:id/availability?date=YYYY-MM-DD` | — | Get available time slots |
| POST | `/` | Admin | Create specialist |
| PATCH | `/:id` | Admin | Update specialist |
| DELETE | `/:id` | Admin | Deactivate specialist |

**Availability response:**
```json
{
  "availableSlots": ["09:00 AM", "09:30 AM", "11:00 AM"],
  "bookedSlots": ["10:00 AM"],
  "isWorkingDay": true
}
```

---

### Appointments  `/api/appointments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Bearer | List appointments (client: own, admin: all) |
| GET | `/stats` | Admin | Booking stats + revenue |
| GET | `/:id` | Bearer | Get single appointment |
| POST | `/` | Bearer | Create appointment |
| PATCH | `/:id/status` | Bearer | Update status |
| DELETE | `/:id` | Admin | Hard delete |

**Create body:**
```json
{
  "serviceId": "...",
  "specialistId": "...",
  "date": "2025-06-15",
  "timeSlot": "10:00 AM",
  "notes": "First visit, please be gentle."
}
```

**Status values:** `confirmed` `completed` `cancelled` `no_show`

---

### Reviews  `/api/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List approved reviews |
| GET | `/summary` | — | Aggregate rating stats |
| POST | `/` | Bearer | Submit a review |
| PATCH | `/:id/approve` | Admin | Approve / reject review |
| DELETE | `/:id` | Bearer (owner or admin) | Delete review |

---

### Contact  `/api/contact`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | — | Submit contact form |
| GET | `/` | Admin | List all submissions |
| PATCH | `/:id` | Admin | Update status / add notes |
| DELETE | `/:id` | Admin | Delete submission |

---

### Newsletter  `/api/newsletter`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/subscribe` | — | Subscribe email |
| POST | `/unsubscribe` | — | Unsubscribe email |

---

### Upload  `/api/upload`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PATCH | `/avatar` | Bearer | Upload user avatar (field: `avatar`) |
| PATCH | `/specialist/:id/image` | Admin | Upload specialist photo (field: `image`) |
| POST | `/service-image` | Admin | Upload service images (field: `images`, max 5) |

All uploads accept `image/jpeg`, `image/png`, `image/webp` — max 5MB per file.

---

### Admin  `/api/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | Admin | Full analytics overview |
| GET | `/users` | Admin | List all users |
| PATCH | `/users/:id` | Admin | Activate/deactivate, change role |
| GET | `/reviews/pending` | Admin | Pending review approvals |

---

## Response Format

**Success:**
```json
{ "success": true, "message": "...", "data": { ... } }
```

**Paginated:**
```json
{
  "success": true, "message": "Success",
  "data": [...],
  "pagination": { "total": 42, "page": 1, "limit": 10, "totalPages": 5, "hasNext": true, "hasPrev": false }
}
```

**Error:**
```json
{ "success": false, "message": "Validation failed", "errors": ["email: invalid email"] }
```

---

## Security

- **Helmet** — HTTP security headers
- **CORS** — Restricted to `CLIENT_URL` origin
- **Rate limiting** — Global (100/15min), Auth (10/15min), Booking (20/hr), Contact (5/hr)
- **XSS Clean** — Strips script tags from all inputs
- **MongoDB Sanitize** — Prevents NoSQL injection (`$` operators stripped)
- **bcryptjs** — Password hashing (salt rounds: 12)
- **HttpOnly cookies** — Refresh token stored in secure cookie
- **JWT** — Access token (7d) + Refresh token (30d)

---

## Seed Accounts

After running `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@lumierekuwait.com` | `Admin@Lumiere2025!` |
| Client | `maryam@example.com` | `Client@1234` |
| Client | `dana@example.com` | `Client@1234` |
| Client | `reem@example.com` | `Client@1234` |

---

## Connecting to the Frontend

Update `/salon-kuwait/.env` (create it):

```env
VITE_API_URL=http://localhost:5000/api
```

Then replace all `localStorage`-based auth in the frontend with real API calls using the endpoints above.

---

Built with ♡ for Lumière Salon, Kuwait.
