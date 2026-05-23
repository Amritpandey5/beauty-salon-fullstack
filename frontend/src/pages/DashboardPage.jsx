import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { useTheme } from '../App'
import { appointmentsApi } from '../api/appointments.api'
import { authApi } from '../api/auth.api'
import { uploadApi } from '../api/upload.api'
import Modal from '../components/Modal'
import Loader from '../components/Loader'

const sidebarNav = [
  { id: 'overview', label: 'Overview', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" /></svg> },
  { id: 'appointments', label: 'Appointments', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { id: 'profile', label: 'My Profile', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
]

export default function DashboardPage() {
  const { user, logout, updateUser } = useAuth()
  const { addToast } = useToast()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cancelModal, setCancelModal] = useState(null)
  const today = new Date().toLocaleDateString('en-CA')
  // console.log(today);
  

  const [selectedDate, setSelectedDate] = useState(today)
  const [showAllAppointments, setShowAllAppointments] = useState(false)

  // Appointments state
  const [appointments, setAppointments] = useState([])
  const [apptLoading, setApptLoading] = useState(true)
  const [apptError, setApptError] = useState(null)

  // Profile state
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const loadAppointments = async () => {
    setApptLoading(true)
    setApptError(null)
    try {
      const res = await appointmentsApi.getAll({ limit: 50 })
      setAppointments(res.data || [])
    } catch (err) {
      setApptError(err.message || 'Failed to load appointments')
    } finally {
      setApptLoading(false)
    }
  }

  useEffect(() => { loadAppointments() }, [])

  const handleCancel = async (id) => {
    try {
      await appointmentsApi.updateStatus(id, 'cancelled')
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a))
      addToast('Appointment cancelled successfully.', 'info')
    } catch (err) {
      addToast(err.message || 'Cancellation failed', 'error')
    } finally {
      setCancelModal(null)
    }
  }

  const handleComplete = async (id) => {
    try {
      await appointmentsApi.updateStatus(id, 'completed')

      setAppointments(prev =>
        prev.map(a =>
          a._id === id
            ? { ...a, status: 'completed' }
            : a
        )
      )

      addToast('Appointment marked as completed.', 'success')
    } catch (err) {
      addToast(err.message || 'Failed to update appointment', 'error')
    }
  }

  const handleProfileSave = async () => {
    setProfileSaving(true)
    try {
      const res = await authApi.updateMe(profile)
      updateUser(res.data.user)
      addToast('Profile updated successfully.', 'success')
    } catch (err) {
      addToast(err.message || 'Update failed', 'error')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const res = await uploadApi.avatar(file)
      updateUser({ avatar: res.data.avatar })
      addToast('Avatar updated!', 'success')
    } catch (err) {
      addToast(err.message || 'Upload failed', 'error')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    addToast('Signed out successfully.', 'info')
    navigate('/login')
  }

  const filteredAppointments = appointments.filter(appt => {
    if (showAllAppointments) return true

    if (!appt.date) return false

    const apptDate = new Date(appt.date).toISOString().split('T')[0]

    return apptDate === selectedDate
  })

  const upcoming = filteredAppointments.filter(
    a => a.status === 'confirmed' || a.status === 'pending'
  )

  const completed = filteredAppointments.filter(
    a => a.status === 'completed'
  )
  const userName = user?.name || 'Guest'
  const userInitial = userName[0]?.toUpperCase() || 'G'
  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

  const statusStyle = {
    pending: 'bg-gold-500/10 text-gold-400',
    confirmed: 'bg-gold-500/10 text-gold-500',
    completed: 'bg-obsidian-100 dark:bg-obsidian-800 text-obsidian-500 dark:text-obsidian-400',
    cancelled: 'bg-red-500/10 text-red-400',
    no_show: 'bg-red-500/10 text-red-400',
  }

  return (
    <div className="min-h-screen bg-ivory-50 dark:bg-obsidian-950 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-obsidian-950 border-r border-gold-900/30 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="p-6 border-b border-gold-900/30">
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-display text-2xl gold-text">Lumière</span>
            <span className="font-arabic text-xs text-gold-500/70">لوميير</span>
          </Link>
        </div>

        <div className="p-6 border-b border-gold-900/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gold-gradient flex items-center justify-center overflow-hidden">
                {user?.avatar
                  ? <img src={`${BASE_URL}${user.avatar}`} alt={userName} className="w-full h-full object-cover" />
                  : <span className="font-display text-obsidian-900 font-600">{userInitial}</span>
                }
              </div>
              {avatarUploading && (
                <div className="absolute inset-0 bg-obsidian-900/60 flex items-center justify-center">
                  <div className="w-3 h-3 border border-gold-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <p className="font-sans text-sm text-ivory-100">{userName}</p>
              <p className="font-sans text-xs text-gold-500">Premium Member</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          {sidebarNav.map(item => (
            <button key={item.id} onClick={() => { setActiveSection(item.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left font-sans text-sm transition-all duration-300 mb-1 ${activeSection === item.id ? 'text-gold-400 bg-gold-500/10 border-l-2 border-gold-500' : 'text-obsidian-400 hover:text-ivory-300 hover:bg-obsidian-800/50'
                }`}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gold-900/30 space-y-1">
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-2.5 text-obsidian-400 hover:text-gold-400 transition-colors font-sans text-sm">
            {isDark
              ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            }
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-obsidian-400 hover:text-red-400 transition-colors font-sans text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-obsidian-950/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-obsidian-900 border-b border-obsidian-200 dark:border-obsidian-700/50 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-obsidian-500 hover:text-gold-400 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="font-display text-xl text-obsidian-900 dark:text-ivory-100 flex-1">
            {sidebarNav.find(n => n.id === activeSection)?.label}
          </h1>
          <Link to="/book" className="btn-primary text-xs py-2.5 px-5">+ Book Appointment</Link>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-auto">

          {/* Overview */}
          {activeSection === 'overview' && (

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">

                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-obsidian-700 dark:text-ivory-200">
                    Select Date:
                  </label>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setShowAllAppointments(false)
                    }}
                    className="border border-obsidian-300 dark:border-obsidian-700 bg-white dark:bg-obsidian-900 px-3 py-2 rounded-lg text-sm"
                  />
                </div>

                {/* Show All Button */}
                <button
                  onClick={() => setShowAllAppointments(true)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${showAllAppointments
                    ? 'bg-gold-500 text-black'
                    : 'bg-obsidian-200 dark:bg-obsidian-800 text-obsidian-700 dark:text-ivory-200'
                    }`}
                >
                  Show All
                </button>

                {/* Today Button */}
                <button
                  onClick={() => {
                    setSelectedDate(today)
                    setShowAllAppointments(false)
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm"
                >
                  Today
                </button>

              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

                {[
                  { label: 'Upcoming', value: upcoming.length, color: 'text-gold-500' },
                  { label: 'Completed', value: completed.length, color: 'text-green-400' },
                  { label: 'Total', value: appointments.length, color: 'text-ivory-100' },
                ].map(s => (
                  <div key={s.label} className="bg-white dark:bg-obsidian-900 border border-obsidian-200 dark:border-obsidian-700/50 p-6">
                    <p className={`font-display text-4xl ${s.color} mb-1`}>{s.value}</p>
                    <p className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400">{s.label}</p>
                  </div>
                ))}
              </div>
              <h2 className="font-display text-xl text-obsidian-900 dark:text-ivory-100 mb-4">Upcoming Appointments</h2>
              {apptLoading ? <div className="flex justify-center py-12"><Loader /></div>
                : apptError ? <p className="font-sans text-red-400 text-sm">{apptError}</p>
                  : upcoming.length === 0 ? (
                    <div className="bg-white dark:bg-obsidian-900 border border-obsidian-200 dark:border-obsidian-700/50 p-12 text-center">
                      <p className="font-body text-obsidian-400 mb-4">No upcoming appointments</p>
                      <Link to="/book" className="btn-primary text-xs py-2.5">Book Now</Link>
                    </div>
                  ) : upcoming.map(appt => (
                    <AppointmentRow
                      key={appt._id}
                      appt={appt}
                      statusStyle={statusStyle}
                      isAdmin={user?.role === 'admin'}
                      onComplete={
                        appt.status === 'confirmed'
                          ? () => handleComplete(appt._id)
                          : null
                      }
                      onCancel={
                        appt.status === 'confirmed'
                          ? () => setCancelModal(appt._id)
                          : null
                      }
                    />
                  ))
              }
            </div>
          )}

          {/* Appointments */}
          {activeSection === 'appointments' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">

                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-obsidian-700 dark:text-ivory-200">
                    Select Date:
                  </label>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setShowAllAppointments(false)
                    }}
                    className="border border-obsidian-300 dark:border-obsidian-700 bg-white dark:bg-obsidian-900 px-3 py-2 rounded-lg text-sm"
                  />
                </div>

                {/* Show All Button */}
                <button
                  onClick={() => setShowAllAppointments(true)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${showAllAppointments
                    ? 'bg-gold-500 text-black'
                    : 'bg-obsidian-200 dark:bg-obsidian-800 text-obsidian-700 dark:text-ivory-200'
                    }`}
                >
                  Show All
                </button>

                {/* Today Button */}
                <button
                  onClick={() => {
                    setSelectedDate(today)
                    setShowAllAppointments(false)
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm"
                >
                  Today
                </button>

              </div>
              {apptLoading ? <div className="flex justify-center py-12"><Loader /></div>
                : apptError ? <p className="font-sans text-red-400 text-sm">{apptError}</p>
                  : appointments.length === 0 ? (
                    <div className="bg-white dark:bg-obsidian-900 border border-obsidian-200 dark:border-obsidian-700/50 p-12 text-center">
                      <p className="font-body text-obsidian-400 mb-4">No appointments yet</p>
                      <Link to="/book" className="btn-primary text-xs py-2.5">Book Your First Appointment</Link>
                    </div>
                  ) : filteredAppointments.map(appt => (
                    <AppointmentRow
                      key={appt._id}
                      appt={appt}
                      statusStyle={statusStyle}
                      isAdmin={user?.role === 'admin'}
                      onComplete={
                        appt.status === 'confirmed'
                          ? () => handleComplete(appt._id)
                          : null
                      }
                      onCancel={
                        appt.status === 'confirmed'
                          ? () => setCancelModal(appt._id)
                          : null
                      }
                    />
                  ))
              }
            </div>
          )}

          {/* Profile */}
          {activeSection === 'profile' && (
            <div className="max-w-lg">
              <div className="bg-white dark:bg-obsidian-900 border border-obsidian-200 dark:border-obsidian-700/50 p-5 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                  <div className="relative group">
                    <div className="w-16 h-16 bg-gold-gradient flex items-center justify-center overflow-hidden cursor-pointer">
                      {user?.avatar
                        ? <img src={`${BASE_URL}${user.avatar}`} alt={userName} className="w-full h-full object-cover" />
                        : <span className="font-display text-2xl text-obsidian-900">{userInitial}</span>
                      }
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-obsidian-900/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                  </div>
                  <div>
                    <p className="font-display text-xl text-obsidian-900 dark:text-ivory-100">{userName}</p>
                    <p className="font-sans text-xs text-gold-500 uppercase tracking-widest">Premium Member</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400 block mb-2">Full Name</label>
                    <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400 block mb-2">Email Address</label>
                    <input type="email" defaultValue={user?.email} disabled className="input-field opacity-50 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400 block mb-2">Phone Number</label>
                    <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+965 XXXX XXXX" className="input-field" />
                  </div>
                  <div className='flex flex-col sm:flex-row gap-2'>
                    <button onClick={handleProfileSave} disabled={profileSaving}
                      className="btn-primary text-xs py-2.5 w-full sm:w-auto disabled:opacity-50">
                      {profileSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={navigate.bind(null, '/change-password')}
                      className="btn-primary text-xs py-2.5 w-full sm:w-auto disabled:opacity-50">
                      Change Password
                    </button>

                  </div>

                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Appointment" size="sm">
        <p className="font-body text-obsidian-600 dark:text-ivory-400 mb-6">
          Are you sure you want to cancel this appointment? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => handleCancel(cancelModal)}
            className="flex-1 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-sans text-sm hover:bg-red-500/20 transition-colors">
            Yes, Cancel
          </button>
          <button onClick={() => setCancelModal(null)}
            className="flex-1 py-3 border border-obsidian-300 dark:border-obsidian-600 text-obsidian-600 dark:text-obsidian-300 font-sans text-sm hover:border-gold-500 transition-colors">
            Keep Appointment
          </button>
        </div>
      </Modal>
    </div>
  )
}

function AppointmentRow({
  appt,
  statusStyle,
  onCancel,
  onComplete,
  isAdmin,
}) {
  const service = appt.service
  const specialist = appt.specialist

  return (
    <div className="bg-white dark:bg-obsidian-900 border border-obsidian-200 dark:border-obsidian-700/50 p-5 flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-display text-base text-obsidian-900 dark:text-ivory-100">
            {service?.title || 'Service'}
          </h3>

          <span
            className={`font-sans text-xs px-2 py-0.5 uppercase tracking-wider ${
              statusStyle[appt.status] || ''
            }`}
          >
            {appt.status}
          </span>
        </div>

        <p className="font-sans text-sm text-obsidian-500 dark:text-obsidian-400">
          {appt.date
            ? new Date(appt.date).toLocaleDateString('en-KW', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })
            : ''}

          {appt.timeSlot ? ` · ${appt.timeSlot}` : ''}

          {specialist?.name ? ` · ${specialist.name}` : ''}
        </p>

        {appt.confirmationNumber && (
          <p className="font-sans text-xs text-gold-600 mt-0.5">
            {appt.confirmationNumber}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {appt.price?.display && (
          <p className="font-display text-gold-500">
            {appt.price.display}
          </p>
        )}

        <div className="flex items-center gap-4">

          {/* Admin Complete Button */}
          {isAdmin && onComplete && (
            <button
              onClick={onComplete}
              className="font-sans text-xs text-green-300 hover:text-green-400 transition-colors"
            >
              Mark Complete
            </button>
          )}

          {/* Cancel Button */}
          {onCancel && (
            <button
              onClick={onCancel}
              className="font-sans text-xs text-obsidian-400 hover:text-red-400 transition-colors"
            >
              Cancel
            </button>
          )}

        </div>
      </div>
    </div>
  )
}
