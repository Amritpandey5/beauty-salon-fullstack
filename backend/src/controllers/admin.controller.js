const User = require('../models/User')
const Appointment = require('../models/Appointment')
const Service = require('../models/Service')
const Review = require('../models/Review')
const Contact = require('../models/Contact')
const catchAsync = require('../utils/catchAsync')
const ApiError = require('../utils/ApiError')
const respond = require('../utils/ApiResponse')
const paginate = require('../utils/paginate')
const { APPOINTMENT_STATUS, ROLES } = require('../config/constants')

// GET /api/admin/dashboard
const getDashboard = catchAsync(async (req, res) => {
  const now = new Date()
  const startOfMonth    = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalUsers, newUsersThisMonth,
    totalAppointments, appointmentsThisMonth,
    upcomingCount, completedCount, cancelledCount,
    revenueThisMonth, revenueLastMonth,
    pendingReviews, unreadContacts,
    topServices, recentAppointments,
  ] = await Promise.all([
    User.countDocuments({ role: ROLES.CLIENT }),
    User.countDocuments({ role: ROLES.CLIENT, createdAt: { $gte: startOfMonth } }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Appointment.countDocuments({ status: APPOINTMENT_STATUS.CONFIRMED, date: { $gte: now } }),
    Appointment.countDocuments({ status: APPOINTMENT_STATUS.COMPLETED }),
    Appointment.countDocuments({ status: APPOINTMENT_STATUS.CANCELLED }),
    Appointment.aggregate([
      { $match: { status: APPOINTMENT_STATUS.COMPLETED, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$price.amount' } } },
    ]),
    Appointment.aggregate([
      { $match: { status: APPOINTMENT_STATUS.COMPLETED, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$price.amount' } } },
    ]),
    Review.countDocuments({ isApproved: false }),
    Contact.countDocuments({ status: 'unread' }),
    Appointment.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'service' } },
      { $unwind: '$service' },
      { $project: { _id: 0, title: '$service.title', category: '$service.category', count: 1 } },
    ]),
    Appointment.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('client',     'name email')
      .populate('service',    'title')
      .populate('specialist', 'name'),
  ])

  const thisMonthRevenue = revenueThisMonth[0]?.total || 0
  const lastMonthRevenue  = revenueLastMonth[0]?.total || 0
  const revenueGrowth = lastMonthRevenue > 0
    ? +(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    : 0

  respond(res).success({
    overview: {
      totalUsers, newUsersThisMonth,
      totalAppointments, appointmentsThisMonth,
      upcomingCount, completedCount, cancelledCount,
      pendingReviews, unreadContacts,
    },
    revenue: { thisMonth: thisMonthRevenue, lastMonth: lastMonthRevenue, growth: revenueGrowth },
    topServices,
    recentAppointments,
  })
})

// GET /api/admin/users
const getUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query
  const filter = {}
  if (role) filter.role = role
  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]
  }
  const query = User.find(filter).sort({ createdAt: -1 })
  const { data, pagination } = await paginate(User, filter, query, page, limit)
  respond(res).paginated(data, pagination)
})

// PATCH /api/admin/users/:id
const updateUser = catchAsync(async (req, res) => {
  const { isActive, role } = req.body
  const updates = {}
  if (isActive !== undefined) updates.isActive = isActive
  if (role) updates.role = role

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
  if (!user) throw ApiError.notFound('User not found')
  respond(res).success({ user }, 'User updated')
})

// GET /api/admin/reviews  (pending approval list)
const getPendingReviews = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const filter = { isApproved: false }
  const query = require('../models/Review').find(filter)
    .sort({ createdAt: -1 })
    .populate('client',  'name email')
    .populate('service', 'title')
  const { data, pagination } = await paginate(Review, filter, query, page, limit)
  respond(res).paginated(data, pagination)
})

module.exports = { getDashboard, getUsers, updateUser, getPendingReviews }
