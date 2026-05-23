import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { servicesApi } from '../api/services.api'
import { specialistsApi } from '../api/specialists.api'
import { appointmentsApi } from '../api/appointments.api'
import Loader from '../components/Loader'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const steps = ['Service', 'Specialist', 'Date & Time', 'Your Details', 'Confirm']

export default function BookingPage() {
  const location = useLocation()
  const { addToast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const preSelectedId = location.state?.serviceId
  const preSelectedName = location.state?.service

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  // API data
  const [services, setServices] = useState([])
  const [specialists, setSpecialists] = useState([])
  const [availSlots, setAvailSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  const [booking, setBooking] = useState({
    serviceId: preSelectedId || '',
    service: preSelectedName || '',
    specialistId: '',
    specialist: '',
    date: '',
    timeSlot: '',
    name: isAuthenticated ? user?.name || '' : '',
    email: isAuthenticated ? user?.email || '' : '',
    phone: isAuthenticated ? user?.phone || '' : '',
    notes: '',
  })

  // Load services and specialists on mount
  useEffect(() => {
    const load = async () => {
      setDataLoading(true)
      try {
        const [svcRes, spRes] = await Promise.all([
          servicesApi.getAll(),
          specialistsApi.getAll(),
        ])

        setServices(svcRes)
        setSpecialists(spRes)

      } catch {
        addToast('Failed to load booking data. Please refresh.', 'error')
      } finally {
        setDataLoading(false)
      }
    }
    load()
  }, [])

  // console.log(`service:${services}`);
  // console.log(`spaslist:${specialists}`);



  // Load availability when specialist + date change
  useEffect(() => {
    if (!booking.specialistId || !booking.date) return

    const load = async () => {
      setSlotsLoading(true)
      try {
        const res = await specialistsApi.getAvailability(
          booking.specialistId,
          booking.date
        )
        // console.log(res);

        const slots = res || []
        // console.log(slots);

        const filteredSlots = slots.filter(s => {
          const slotDateTime = new Date(`${booking.date} ${s}`)
          const now = new Date()

          if (slotDateTime < now) return false

          const hour = slotDateTime.getHours()
          return hour >= 9 && hour <= 21
        })
        // console.log(filteredSlots);

        setAvailSlots(filteredSlots)

        setBooking(prev => {
          if (prev.timeSlot && !slots.includes(prev.timeSlot)) {
            return { ...prev, timeSlot: '' }
          }
          return prev
        })

      } catch {
        setAvailSlots([])
      } finally {
        setSlotsLoading(false)
      }
    }

    load()
  }, [booking.specialistId, booking.date])

  const today = new Date().toISOString().split('T')[0]
  const update = (field, value) => setBooking(prev => ({ ...prev, [field]: value }))

  const canProceed = () => {
    if (step === 0) return booking.serviceId
    if (step === 1) return booking.specialistId
    if (step === 2) return booking.date && booking.timeSlot
    if (step === 3) return booking.name && booking.email && booking.phone
    return true
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await appointmentsApi.create({
        serviceId: booking.serviceId,
        specialistId: booking.specialistId,
        date: booking.date,
        timeSlot: booking.timeSlot,
        notes: booking.notes,
      })
      setConfirmed(true)
      addToast('Appointment confirmed! Check your email for details.', 'success')
    } catch (err) {
      addToast(err.message || 'Booking failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-ivory-50 dark:bg-obsidian-950 pt-28 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-obsidian-950 pattern-bg flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gold-gradient mx-auto mb-8 flex items-center justify-center">
            <svg className="w-10 h-10 text-obsidian-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-4xl text-ivory-100 mb-4">Appointment Confirmed</h2>
          <p className="font-body text-ivory-400 mb-2">{booking.service}</p>
          <p className="font-body text-gold-400 mb-8">
            {booking.date ? new Date(booking.date).toLocaleDateString('en-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''} at {booking.timeSlot}
          </p>
          <div className="border border-gold-800/40 p-6 mb-8 text-left space-y-3">
            {[['Specialist', booking.specialist], ['Client', booking.name], ['Email', booking.email], ['Phone', booking.phone]].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="font-sans text-xs uppercase tracking-wider text-obsidian-500">{k}</span>
                <span className="font-sans text-sm text-ivory-300">{v}</span>
              </div>
            ))}
          </div>
          <p className="font-sans text-xs text-obsidian-500 mb-6">A confirmation has been sent to {booking.email}</p>
          {isAuthenticated
            ? <a href="/dashboard" className="btn-primary">View My Appointments</a>
            : <a href="/" className="btn-primary">Return to Home</a>
          }
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory-50 dark:bg-obsidian-950 pt-28 pb-16">
      {loading && <Loader fullScreen />}
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-obsidian-900 dark:text-ivory-100 mb-3">
            Book Your <em className="gold-text">Appointment</em>
          </h1>
          <p className="font-body text-obsidian-500 dark:text-obsidian-400">Follow the steps below to reserve your experience at Lumière</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-12 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 flex items-center justify-center text-xs font-sans font-600 transition-all duration-300 ${i < step ? 'bg-gold-gradient text-obsidian-950' : i === step ? 'border-2 border-gold-500 text-gold-500' : 'border border-obsidian-300 dark:border-obsidian-700 text-obsidian-400'
                  }`}>
                  {i < step ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : i + 1}
                </div>
                <span className={`font-sans text-xs mt-1.5 hidden sm:block tracking-wide ${i === step ? 'text-gold-500' : 'text-obsidian-400'}`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 md:w-20 h-px mx-2 flex-shrink-0 transition-all duration-500 ${i < step ? 'bg-gold-gradient' : 'bg-obsidian-300 dark:bg-obsidian-700'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="border border-obsidian-200 dark:border-obsidian-700/50 bg-white dark:bg-obsidian-900/50 p-8 md:p-12 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gold-gradient" />

          {/* Step 0: Service */}
          {step === 0 && (
            <div>
              <h2 className="font-display text-2xl text-obsidian-900 dark:text-ivory-100 mb-8">Select a Service</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map(s => (
                  <button key={s._id} onClick={() => { update('serviceId', s._id); update('service', s.title) }}
                    className={`text-left p-5 border transition-all duration-300 ${booking.serviceId === s._id ? 'border-gold-500 bg-gold-500/5' : 'border-obsidian-200 dark:border-obsidian-700 hover:border-gold-400/50'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-display text-base text-obsidian-900 dark:text-ivory-100 mb-1">{s.title}</p>
                        <p className="font-sans text-xs text-obsidian-500 dark:text-obsidian-400 mb-3">{s.duration?.display}</p>
                      </div>
                      <p className="font-display text-gold-500">{s.price?.display}</p>
                    </div>
                    {booking.serviceId === s._id && (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-4 h-4 bg-gold-gradient flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-obsidian-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="font-sans text-xs text-gold-500">Selected</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Specialist */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-2xl text-obsidian-900 dark:text-ivory-100 mb-8">Choose Your Specialist</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[...specialists, { _id: 'any', name: 'No Preference', role: 'Any Available Specialist', image: null }].map(m => (
                  <button key={m._id}
                    onClick={() => { update('specialistId', m._id === 'any' ? specialists[0]?._id || '' : m._id); update('specialist', m.name) }}
                    className={`text-left p-5 border transition-all duration-300 flex items-center gap-4 ${booking.specialistId === (m._id === 'any' ? specialists[0]?._id || '' : m._id) && booking.specialist === m.name ? 'border-gold-500 bg-gold-500/5' : 'border-obsidian-200 dark:border-obsidian-700 hover:border-gold-400/50'}`}>
                    <div className="w-12 h-12 bg-obsidian-200 dark:bg-obsidian-800 flex-shrink-0 overflow-hidden">
                      {m.image
                        ? <img src={m.image} alt={m.name} className="w-full h-full object-cover" onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=3c342f&color=c9a227` }} />
                        : <div className="w-full h-full flex items-center justify-center text-gold-500"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                      }
                    </div>
                    <div>
                      <p className="font-display text-obsidian-900 dark:text-ivory-100">{m.name}</p>
                      <p className="font-sans text-xs text-gold-500">{m.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-2xl text-obsidian-900 dark:text-ivory-100 mb-8">Select Date & Time</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400 block mb-3">Date (fill date carefully)</label>
                  <DatePicker
                    selected={booking.date ? new Date(booking.date) : null}
                    onChange={(date) =>
                      update('date', date.toLocaleDateString('en-CA'))
                    }
                    minDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    className="input-field border border-obsidian-300 dark:border-obsidian-600 px-4 py-3 w-full"
                  />
                </div>
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400 block mb-3">
                    Time {slotsLoading && <span className="text-gold-500">loading...</span>}
                  </label>
                  {!booking.date ? (
                    <p className="font-sans text-xs text-obsidian-500 dark:text-obsidian-400">Please select a date first</p>
                  ) : slotsLoading ? (
                    <div className="flex justify-center py-4"><Loader size="sm" /></div>
                  ) : availSlots.length === 0 ? (
                    <p className="font-sans text-xs text-obsidian-400">No available slots for this date.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-2">
                      {availSlots.map(slot => (
                        <button key={slot} onClick={() => update('timeSlot', slot)}
                          className={`py-2 font-sans text-xs transition-all duration-200 ${booking.timeSlot === slot ? 'bg-gold-gradient text-obsidian-950' : 'border border-obsidian-200 dark:border-obsidian-700 text-obsidian-600 dark:text-obsidian-400 hover:border-gold-400 hover:text-gold-500'}`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-2xl text-obsidian-900 dark:text-ivory-100 mb-8">Your Details</h2>
              <div className="space-y-6 max-w-lg">
                {[
                  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
                  { key: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
                  { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+965 XXXX XXXX' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400 block mb-2">{f.label} *</label>
                    <input type={f.type} value={booking[f.key]} onChange={e => update(f.key, e.target.value)}
                      placeholder={f.placeholder} className="input-field" />
                  </div>
                ))}
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400 block mb-2">Special Requests</label>
                  <textarea value={booking.notes} onChange={e => update('notes', e.target.value)}
                    placeholder="Any allergies, preferences, or special requests..." rows={3}
                    className="input-field border border-obsidian-300 dark:border-obsidian-600 px-4 py-3 resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div>
              <h2 className="font-display text-2xl text-obsidian-900 dark:text-ivory-100 mb-8">Confirm Your Booking</h2>
              <div className="space-y-4 mb-8">
                {[
                  ['Service', booking.service],
                  ['Specialist', booking.specialist],
                  ['Date', booking.date ? new Date(booking.date).toLocaleDateString('en-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''],
                  ['Time', booking.timeSlot],
                  ['Name', booking.name],
                  ['Email', booking.email],
                  ['Phone', booking.phone],
                  ...(booking.notes ? [['Notes', booking.notes]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex  border-b border-obsidian-200 dark:border-obsidian-700/50 last:border-0">
                    <span className="font-sans text-xs uppercase tracking-wider text-obsidian-500 w-24 flex-shrink-0">{k}:</span>
                    <span className="font-body w-fit text-obsidian-800 dark:text-ivory-200">{v}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gold-50 dark:bg-gold-900/10 border border-gold-200 dark:border-gold-800/30 p-4 mb-6">
                <p className="font-sans text-xs text-obsidian-600 dark:text-ivory-400">
                  By confirming, you agree to our cancellation policy. Please arrive 10 minutes before your appointment.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mt-10 pt-8 border-t border-obsidian-200 dark:border-obsidian-700/50">
            {step > 0
              ? <SecondaryButton onClick={() => setStep(s => s - 1)}>← Back</SecondaryButton>
              : <div />
            }
            {step < steps.length - 1
              ? <PrimaryButton onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>Continue →</PrimaryButton>
              : <PrimaryButton onClick={handleConfirm} loading={loading}>Confirm Appointment</PrimaryButton>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
