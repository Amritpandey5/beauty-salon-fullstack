# Lumière — Luxury Salon Booking Website (Kuwait)

A production-ready, fully responsive luxury salon booking website built with **Vite + React + Tailwind CSS**.

---

## 🏗️ Project Structure

```
salon-kuwait/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx
    ├── App.jsx              # Root — routing, theme context, auth guard
    ├── index.css            # Global styles + Tailwind layers
    │
    ├── layouts/
    │   └── MainLayout.jsx   # Navbar + Outlet + Newsletter + Footer
    │
    ├── pages/
    │   ├── HomePage.jsx     # Hero, Services, Experience, Gallery teaser, Reviews, CTA
    │   ├── AboutPage.jsx    # Story, Founder, Values, Team
    │   ├── ServicesPage.jsx # Filterable service cards + custom package CTA
    │   ├── GalleryPage.jsx  # Masonry gallery with lightbox + filter tabs
    │   ├── ContactPage.jsx  # Contact form + location info
    │   ├── BookingPage.jsx  # 5-step booking wizard → confirmation screen
    │   ├── LoginPage.jsx    # Auth with redirect-back support
    │   ├── RegisterPage.jsx # Registration with auth flag
    │   ├── DashboardPage.jsx# Responsive sidebar dashboard
    │   └── NotFoundPage.jsx # 404 with auto-redirect countdown
    │
    ├── components/
    │   ├── Navbar.jsx          # Responsive + mobile drawer + theme toggle
    │   ├── Footer.jsx          # Full footer with links + hours
    │   ├── Buttons.jsx         # PrimaryButton, SecondaryButton, IconButton
    │   ├── Cards.jsx           # ServiceCard, TeamCard, TestimonialCard, StatCard
    │   ├── Modal.jsx           # Accessible modal with ESC + backdrop close
    │   ├── Toast.jsx           # Toast notification system (context)
    │   ├── Loader.jsx          # Spinner + full-screen loader
    │   ├── SectionHeader.jsx   # Reusable eyebrow + title + subtitle
    │   ├── Breadcrumb.jsx      # Auto-generated from route path
    │   ├── ImageGallery.jsx    # Masonry grid + full lightbox with keyboard nav
    │   ├── ReviewsSection.jsx  # Live reviews + star rating + write review modal
    │   ├── NewsletterBanner.jsx# Email signup with validation
    │   ├── ScrollToTop.jsx     # Resets scroll on every route change
    │   ├── ProtectedRoute.jsx  # Auth guard — redirects to /login
    │   └── PageTransition.jsx  # Fade+slide animation on route change
    │
    ├── hooks/
    │   ├── useScrollAnimation.js  # IntersectionObserver scroll reveals
    │   ├── useForm.js             # Full form state + validation + blur tracking
    │   ├── useLocalStorage.js     # Persistent localStorage state
    │   └── useDebounce.js         # Debounced value hook
    │
    └── utils/
        ├── data.js       # Services, team, testimonials, time slots, mock appointments
        ├── validation.js # Email, phone, required, minLength validators
        └── helpers.js    # formatDate, formatCurrency, getInitials, slugify, clsx, etc.
```

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔐 Authentication (Demo)

- Register or login with any email + 6+ character password
- Auth state stored in `localStorage` (`lumiere_auth: 'true'`)
- Dashboard is protected — unauthenticated users are redirected to `/login`
- Sign out clears auth and redirects to `/login`

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary font | Playfair Display (display) |
| Body font | Cormorant Garamond |
| UI font | DM Sans |
| Arabic font | Noto Naskh Arabic |
| Gold | `#c9a227` → `#e4c52a` → `#a67c1e` |
| Obsidian | `#0f0d0b` |
| Ivory | `#f9f6ee` |
| Dark mode | `class` strategy |

---

## 📄 Pages

| Route | Page | Auth |
|---|---|---|
| `/` | Home | Public |
| `/about` | About Us | Public |
| `/services` | Services | Public |
| `/gallery` | Gallery | Public |
| `/contact` | Contact | Public |
| `/book` | Book Appointment | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Client Dashboard | **Protected** |
| `*` | 404 Not Found | Public |

---

## ✨ Features

- **Dark/Light mode** toggle — persisted to localStorage
- **5-step booking wizard** with service, specialist, date/time, details, confirm
- **Lightbox gallery** with keyboard navigation (← → Esc)
- **Live reviews** with star rating + write-a-review modal
- **Toast notifications** for all user actions
- **Scroll animations** via IntersectionObserver
- **Page transitions** on every route change
- **Protected dashboard** with sidebar navigation + cancel appointments
- **Newsletter signup** with email validation
- **404 page** with 10-second auto-redirect countdown
- **Breadcrumbs** auto-generated from route
- **Fully responsive** — mobile-first, works on all screen sizes
- **Arabic text** throughout for Kuwait authenticity

---

Built with ♡ for the discerning women of Kuwait.
