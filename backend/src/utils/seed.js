require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Service = require('../models/Service')
const Specialist = require('../models/Specialist')
const Appointment = require('../models/Appointment')
const Review = require('../models/Review')
const logger = require('./logger')
const { ROLES, APPOINTMENT_STATUS } = require('../config/constants')

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    logger.info('Connected to MongoDB for seeding')

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Service.deleteMany(),
      Specialist.deleteMany(),
      Appointment.deleteMany(),
      Review.deleteMany(),
    ])
    logger.info('Cleared existing data')

    // ── Users ──────────────────────────────────────────────────────────────────
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@lumierekuwait.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@Lumiere2025!',
      role: ROLES.ADMIN,
      isEmailVerified: true,
    })

    const clients = await User.create([
      { name: 'Maryam Al-Qattan',  email: 'maryam@example.com',  password: 'Client@1234', phone: '+96512345678', role: ROLES.CLIENT, isEmailVerified: true },
      { name: 'Dana Al-Mutairi',   email: 'dana@example.com',    password: 'Client@1234', phone: '+96598765432', role: ROLES.CLIENT, isEmailVerified: true },
      { name: 'Reem Hassan',       email: 'reem@example.com',    password: 'Client@1234', phone: '+96511223344', role: ROLES.CLIENT, isEmailVerified: true },
    ])
    logger.info(`Created ${clients.length + 1} users`)

    // ── Services ───────────────────────────────────────────────────────────────
    const services = await Service.create([
      {
        title: 'Couture Styling',
        category: 'Hair',
        subtitle: 'Expert cuts, blowouts, and bespoke styling for every occasion.',
        description: 'Our master stylists create tailored looks using the finest techniques from Parisian fashion houses, adapted for every hair type.',
        price: { amount: 35, currency: 'KWD', isFrom: false, display: '35 KWD' },
        duration: { minMinutes: 60, maxMinutes: 90, display: '60 – 90 min' },
        icon: 'hair',
        isFeatured: true,
        sortOrder: 1,
      },
      {
        title: 'Color & Highlights',
        category: 'Hair',
        subtitle: 'Balayage, ombré, full color, and toning using premium European pigments.',
        description: 'From bold colour transformations to subtle sun-kissed highlights, our certified colorists bring your vision to life with L\'Oréal Professionnel pigments.',
        price: { amount: 55, currency: 'KWD', isFrom: true, display: 'From 55 KWD' },
        duration: { minMinutes: 90, maxMinutes: 180, display: '90 – 180 min' },
        icon: 'color',
        isFeatured: true,
        sortOrder: 2,
      },
      {
        title: 'Artisan Nail Design',
        category: 'Nails',
        subtitle: 'Manicure, pedicure, gel extensions, and intricate nail art.',
        description: 'From classic French manicures to elaborate hand-painted designs, our nail artists transform your nails into miniature masterpieces.',
        price: { amount: 18, currency: 'KWD', isFrom: true, display: 'From 18 KWD' },
        duration: { minMinutes: 45, maxMinutes: 90, display: '45 – 90 min' },
        icon: 'nail',
        isFeatured: true,
        sortOrder: 3,
      },
      {
        title: 'Radiance Facial',
        category: 'Skin',
        subtitle: 'Deep cleanse, exfoliation, and hydration treatments with Swiss actives.',
        description: 'Using La Prairie and Valmont Swiss formulations, our therapists deliver transformative facials that reveal your skin\'s natural luminosity.',
        price: { amount: 45, currency: 'KWD', isFrom: true, display: 'From 45 KWD' },
        duration: { minMinutes: 60, maxMinutes: 60, display: '60 min' },
        icon: 'facial',
        sortOrder: 4,
      },
      {
        title: 'Bridal Majlis Package',
        category: 'Bridal',
        subtitle: 'Complete bridal preparation — hair, makeup, nails, and skincare.',
        description: 'Our most prestigious offering — a full-day experience dedicated entirely to the bride, encompassing hair styling, makeup application, nail artistry, and skincare preparation.',
        price: { amount: 250, currency: 'KWD', isFrom: true, display: 'From 250 KWD' },
        duration: { minMinutes: 480, maxMinutes: 600, display: 'Full Day' },
        icon: 'bridal',
        isFeatured: true,
        sortOrder: 5,
      },
      {
        title: 'Hammam Ritual',
        category: 'Wellness',
        subtitle: 'Traditional Kuwaiti hammam experience with rose water and oud infusions.',
        description: 'An ancient cleansing ritual reimagined for modern luxury — steam, black soap, kessa exfoliation, and rose water rinse with oud-infused body butter.',
        price: { amount: 65, currency: 'KWD', isFrom: false, display: '65 KWD' },
        duration: { minMinutes: 75, maxMinutes: 75, display: '75 min' },
        icon: 'spa',
        sortOrder: 6,
      },
    ])
    logger.info(`Created ${services.length} services`)

    // ── Specialists ────────────────────────────────────────────────────────────
    const specialists = await Specialist.create([
      {
        name: 'Layla Al-Rashidi',
        role: 'Master Colorist',
        bio: 'Trained at L\'Oréal Academie Paris with 10 years of experience in advanced colour techniques.',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
        specialties: ['Balayage', 'Color Correction', 'Ombré', 'Highlights'],
        services: [services[0]._id, services[1]._id],
        rating: { average: 4.9, count: 142 },
        sortOrder: 1,
      },
      {
        name: 'Sara Mahmoud',
        role: 'Bridal Specialist',
        bio: 'Kuwait\'s most sought-after bridal artist with over 500 weddings to her name.',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
        specialties: ['Bridal Hair', 'Updos', 'Makeup', 'Occasion Styling'],
        services: [services[0]._id, services[4]._id],
        rating: { average: 5.0, count: 98 },
        sortOrder: 2,
      },
      {
        name: 'Noura Al-Sabah',
        role: 'Nail Artist',
        bio: 'Certified nail technician specialising in 3D nail art and gel sculpting techniques.',
        image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=80',
        specialties: ['Nail Art', 'Gel Extensions', 'Pedicure', '3D Design'],
        services: [services[2]._id],
        rating: { average: 4.8, count: 211 },
        sortOrder: 3,
      },
      {
        name: 'Fatima Khaled',
        role: 'Skin Therapist',
        bio: 'Qualified aesthetician trained in Switzerland specialising in advanced facial treatments.',
        image: 'https://images.unsplash.com/photo-1499887142886-791eca5918cd?w=300&q=80',
        specialties: ['Facials', 'Hammam', 'Anti-Aging', 'Microdermabrasion'],
        services: [services[3]._id, services[5]._id],
        rating: { average: 4.9, count: 87 },
        sortOrder: 4,
      },
    ])
    logger.info(`Created ${specialists.length} specialists`)

    // ── Appointments ───────────────────────────────────────────────────────────
    const now = new Date()
    const upcoming1 = new Date(now); upcoming1.setDate(upcoming1.getDate() + 3)
    const upcoming2 = new Date(now); upcoming2.setDate(upcoming2.getDate() + 7)
    const past1 = new Date(now); past1.setDate(past1.getDate() - 10)
    const past2 = new Date(now); past2.setDate(past2.getDate() - 20)

    const appointments = await Appointment.create([
      {
        client: clients[0]._id,
        service: services[0]._id,
        specialist: specialists[0]._id,
        date: past1,
        timeSlot: '10:00 AM',
        status: APPOINTMENT_STATUS.COMPLETED,
        price: { amount: 35, currency: 'KWD', display: '35 KWD' },
      },
      {
        client: clients[0]._id,
        service: services[3]._id,
        specialist: specialists[3]._id,
        date: upcoming1,
        timeSlot: '02:00 PM',
        status: APPOINTMENT_STATUS.CONFIRMED,
        price: { amount: 45, currency: 'KWD', display: '45 KWD' },
      },
      {
        client: clients[1]._id,
        service: services[4]._id,
        specialist: specialists[1]._id,
        date: upcoming2,
        timeSlot: '10:00 AM',
        status: APPOINTMENT_STATUS.CONFIRMED,
        price: { amount: 250, currency: 'KWD', display: 'From 250 KWD' },
        notes: 'Wedding on April 12th. Arabic style preferred.',
      },
      {
        client: clients[2]._id,
        service: services[5]._id,
        specialist: specialists[3]._id,
        date: past2,
        timeSlot: '03:00 PM',
        status: APPOINTMENT_STATUS.COMPLETED,
        price: { amount: 65, currency: 'KWD', display: '65 KWD' },
      },
    ])
    logger.info(`Created ${appointments.length} appointments`)

    // ── Reviews ────────────────────────────────────────────────────────────────
    const reviews = await Review.create([
      {
        client: clients[0]._id,
        appointment: appointments[0]._id,
        specialist: specialists[0]._id,
        service: services[0]._id,
        serviceName: 'Couture Styling',
        rating: 5,
        text: 'Lumière redefined what luxury means to me. The attention to detail, the ambiance, the expertise — I leave feeling like royalty every single time.',
        isApproved: true,
      },
      {
        client: clients[1]._id,
        specialist: specialists[1]._id,
        service: services[4]._id,
        serviceName: 'Bridal Majlis Package',
        rating: 5,
        text: 'My bridal package was an absolute dream. Sara and the entire team made me feel like the most beautiful version of myself on my wedding day.',
        isApproved: true,
      },
      {
        client: clients[2]._id,
        appointment: appointments[3]._id,
        specialist: specialists[3]._id,
        service: services[5]._id,
        serviceName: 'Hammam Ritual',
        rating: 5,
        text: 'I have visited salons in Paris and Dubai, and Lumière stands firmly among the finest. The hammam ritual alone is worth crossing borders for.',
        isApproved: true,
      },
    ])
    logger.info(`Created ${reviews.length} reviews`)

    logger.info('✓ Database seeded successfully')
    logger.info(`Admin login → ${admin.email} / ${process.env.ADMIN_PASSWORD || 'Admin@Lumiere2025!'}`)
    logger.info(`Client login → ${clients[0].email} / Client@1234`)

    process.exit(0)
  } catch (err) {
    logger.error('Seed failed:', err)
    process.exit(1)
  }
}

seed()
