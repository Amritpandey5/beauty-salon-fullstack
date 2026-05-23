export const services = [
  {
    id: 1,
    category: 'Hair',
    title: 'Couture Styling',
    subtitle: 'Expert cuts, blowouts, and bespoke styling for every occasion.',
    price: '35 KWD',
    duration: '60 – 90 min',
    icon: 'hair',
  },
  {
    id: 2,
    category: 'Hair',
    title: 'Color & Highlights',
    subtitle: 'Balayage, ombré, full color, and toning using premium European pigments.',
    price: 'From 55 KWD',
    duration: '90 – 180 min',
    icon: 'color',
  },
  {
    id: 3,
    category: 'Nails',
    title: 'Artisan Nail Design',
    subtitle: 'Manicure, pedicure, gel extensions, and intricate nail art.',
    price: 'From 18 KWD',
    duration: '45 – 90 min',
    icon: 'nail',
  },
  {
    id: 4,
    category: 'Skin',
    title: 'Radiance Facial',
    subtitle: 'Deep cleanse, exfoliation, and hydration treatments with Swiss actives.',
    price: 'From 45 KWD',
    duration: '60 min',
    icon: 'facial',
  },
  {
    id: 5,
    category: 'Bridal',
    title: 'Bridal Majlis Package',
    subtitle: 'Complete bridal preparation — hair, makeup, nails, and skincare.',
    price: 'From 250 KWD',
    duration: 'Full Day',
    icon: 'bridal',
  },
  {
    id: 6,
    category: 'Wellness',
    title: 'Hammam Ritual',
    subtitle: 'Traditional Kuwaiti hammam experience with rose water and oud infusions.',
    price: '65 KWD',
    duration: '75 min',
    icon: 'spa',
  },
]

export const team = [
  {
    id: 1,
    name: 'Layla Al-Rashidi',
    role: 'Master Colorist',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
    specialties: ['Balayage', 'Color Correction', 'Ombré'],
  },
  {
    id: 2,
    name: 'Sara Mahmoud',
    role: 'Bridal Specialist',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    specialties: ['Bridal Hair', 'Updos', 'Makeup'],
  },
  {
    id: 3,
    name: 'Noura Al-Sabah',
    role: 'Nail Artist',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=80',
    specialties: ['Nail Art', 'Gel Extensions', 'Pedicure'],
  },
  {
    id: 4,
    name: 'Fatima Khaled',
    role: 'Skin Therapist',
    image: 'https://images.unsplash.com/photo-1499887142886-791eca5918cd?w=300&q=80',
    specialties: ['Facials', 'Hammam', 'Anti-Aging'],
  },
]

export const testimonials = [
  {
    id: 1,
    quote: 'Lumière redefined what luxury means to me. The attention to detail, the ambiance, the expertise — I leave feeling like royalty every single time.',
    author: 'Maryam Al-Qattan',
    location: 'Salmiya, Kuwait',
    rating: 5,
  },
  {
    id: 2,
    quote: 'My bridal package was an absolute dream. Sara and the entire team made me feel like the most beautiful version of myself on my wedding day.',
    author: 'Dana Al-Mutairi',
    location: 'Mishref, Kuwait',
    rating: 5,
  },
  {
    id: 3,
    quote: 'I have visited salons in Paris and Dubai, and Lumière stands firmly among the finest. The hammam ritual alone is worth crossing borders for.',
    author: 'Reem Hassan',
    location: 'Kuwait City',
    rating: 5,
  },
]

export const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '02:00 PM', '02:30 PM', '03:00 PM',
  '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM',
  '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM',
  '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM',
]

export const mockAppointments = [
  { id: 1, service: 'Couture Styling', date: '2025-03-15', time: '10:00 AM', stylist: 'Layla Al-Rashidi', status: 'completed', price: '35 KWD' },
  { id: 2, service: 'Radiance Facial', date: '2025-03-28', time: '02:00 PM', stylist: 'Fatima Khaled', status: 'upcoming', price: '45 KWD' },
  { id: 3, service: 'Artisan Nail Design', date: '2025-04-02', time: '11:00 AM', stylist: 'Noura Al-Sabah', status: 'upcoming', price: '25 KWD' },
]
