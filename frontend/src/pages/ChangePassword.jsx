import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth.api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { useTheme } from '../App'

function getStrength(pw) {
  if (!pw || pw.length < 8) return 0
  let score = 1
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 3)
}

const STRENGTH_META = [
  { label: 'Too short',  textColor: 'text-red-400'    },
  { label: 'Weak',       textColor: 'text-orange-400'  },
  { label: 'Fair',       textColor: 'text-yellow-400'  },
  { label: 'Strong',     textColor: 'text-green-400'   },
]

const SEGMENT_COLORS = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']

export default function ChangePasswordPage() {
  const navigate      = useNavigate()
  const { logout }    = useAuth()
  const { addToast }  = useToast()
  const { isDark, toggleTheme } = useTheme()

  const [form,    setForm]    = useState({ current: '', password: '', confirm: '' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [show,    setShow]    = useState({ current: false, password: false, confirm: false })
  const [success, setSuccess] = useState(false)

  const strength = getStrength(form.password)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }))
  }

  const toggleShow = (field) => setShow(p => ({ ...p, [field]: !p[field] }))

  const validate = () => {
    const errs = {}
    if (!form.current) errs.current = 'Current password is required'
    if (!form.password) {
      errs.password = 'New password is required'
    } else if (form.password.length < 8) {
      errs.password = 'Must be at least 8 characters'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      errs.password = 'Must include uppercase, lowercase, and a number'
    } else if (form.password === form.current) {
      errs.password = 'New password must be different from your current password'
    }
    if (!form.confirm) {
      errs.confirm = 'Please confirm your new password'
    } else if (form.password !== form.confirm) {
      errs.confirm = 'Passwords do not match'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await authApi.changePassword({
        currentPassword: form.current,
        newPassword:     form.password,
      })
      setSuccess(true)
      addToast('Password changed successfully. Please sign in again.', 'success')
      // Backend clears session after password change — log out client side too
      setTimeout(async () => {
        await logout()
        navigate('/login')
      }, 2500)
    } catch (err) {
      const msg = err?.message || 'Failed to change password'
      addToast(msg, 'error')
      if (msg.toLowerCase().includes('current') || msg.toLowerCase().includes('incorrect')) {
        setErrors({ current: 'Current password is incorrect' })
      }
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = ({ visible }) => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {visible ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      )}
    </svg>
  )

  const FieldError = ({ msg }) =>
    msg ? (
      <p className="font-sans text-xs text-red-400 mt-2 flex items-center gap-1.5">
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {msg}
      </p>
    ) : null

  return (
    <div className="min-h-screen bg-obsidian-950 pattern-bg flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&q=80"
          alt="Lumière Salon"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950 to-obsidian-950/10" />

        {/* Decorative rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-gold-800/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border border-gold-700/30 rounded-full animate-spin-slow" />

        <div className="absolute bottom-16 left-12 max-w-xs">
          <p className="font-display text-5xl gold-text mb-3">Lumière</p>
          <p className="font-arabic text-gold-400/70 text-base mb-6">لوميير — الكويت</p>
          <p className="font-body text-ivory-500 text-sm leading-relaxed">
            Keep your account secure with a strong, unique password.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 relative">
        <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gold-700/50 text-gold-400 hover:border-gold-400 hover:bg-gold-400/10 transition-all duration-300"
            >
              {isDark
                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              }
            </button>


        <div className="w-full max-w-md">
          <Link to="/" className="flex flex-col items-center mb-10">
            <span className="font-display text-3xl gold-text">Lumière</span>
            <span className="font-arabic text-xs text-gold-500/70 mt-1">لوميير</span>
          </Link>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 justify-center">
            <Link to="/dashboard" className="font-sans text-xs text-obsidian-500 hover:text-gold-400 transition-colors">
              Dashboard
            </Link>
            <svg className="w-3 h-3 text-obsidian-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-sans text-xs text-gold-400">Change Password</span>
          </div>

          {!success ? (
            <>
              {/* Header */}
              <div className="flex flex-col items-center mb-10">
                <div className="w-16 h-16 bg-gold-gradient/10 border border-gold-700/40 flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="font-display text-3xl text-ivory-100 mb-2">Change Password</h1>
                <p className="font-body text-obsidian-400 text-center text-sm leading-relaxed">
                  You'll be signed out after changing your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Current password */}
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest text-obsidian-400 block mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      name="current"
                      type={show.current ? 'text' : 'password'}
                      value={form.current}
                      onChange={handleChange}
                      placeholder="Your current password"
                      autoFocus
                      className="input-field border-b border-obsidian-700 text-ivory-100 placeholder-obsidian-600 pr-10"
                    />
                    <button type="button" onClick={() => toggleShow('current')} tabIndex={-1}
                      className="absolute right-0 bottom-3 text-obsidian-500 hover:text-gold-400 transition-colors">
                      <EyeIcon visible={show.current} />
                    </button>
                  </div>
                  <FieldError msg={errors.current} />
                  <div className="mt-2">
                    <Link
                      to="/forgot-password"
                      className="font-sans text-xs text-gold-600 hover:text-gold-400 transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-obsidian-800" />
                  <p className="font-sans text-xs text-obsidian-600 uppercase tracking-widest">New Password</p>
                  <div className="flex-1 h-px bg-obsidian-800" />
                </div>

                {/* New password */}
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest text-obsidian-400 block mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={show.password ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className="input-field border-b border-obsidian-700 text-ivory-100 placeholder-obsidian-600 pr-10"
                    />
                    <button type="button" onClick={() => toggleShow('password')} tabIndex={-1}
                      className="absolute right-0 bottom-3 text-obsidian-500 hover:text-gold-400 transition-colors">
                      <EyeIcon visible={show.password} />
                    </button>
                  </div>

                  {/* Strength segments */}
                  {form.password && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex gap-1 h-1">
                        {[0, 1, 2, 3].map(i => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              i <= strength ? SEGMENT_COLORS[strength] : 'bg-obsidian-700'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`font-sans text-xs ${STRENGTH_META[strength].textColor}`}>
                        {STRENGTH_META[strength].label}
                      </p>
                    </div>
                  )}
                  <FieldError msg={errors.password} />
                </div>

                {/* Confirm password */}
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest text-obsidian-400 block mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      name="confirm"
                      type={show.confirm ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={handleChange}
                      placeholder="Repeat your new password"
                      className="input-field border-b border-obsidian-700 text-ivory-100 placeholder-obsidian-600 pr-10"
                    />
                    <button type="button" onClick={() => toggleShow('confirm')} tabIndex={-1}
                      className="absolute right-0 bottom-3 text-obsidian-500 hover:text-gold-400 transition-colors">
                      <EyeIcon visible={show.confirm} />
                    </button>
                    {/* Match icon */}
                    {form.confirm && form.password && (
                      <div className="absolute right-8 bottom-3">
                        {form.password === form.confirm ? (
                          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                  <FieldError msg={errors.confirm} />
                </div>

                {/* Requirements */}
                <div className="p-4 border border-obsidian-700/50 bg-obsidian-900/30 space-y-2">
                  <p className="font-sans text-xs text-obsidian-500 uppercase tracking-wider mb-3">Requirements</p>
                  {[
                    { label: 'At least 8 characters',     check: form.password.length >= 8            },
                    { label: 'One uppercase letter',       check: /[A-Z]/.test(form.password)          },
                    { label: 'One lowercase letter',       check: /[a-z]/.test(form.password)          },
                    { label: 'One number',                 check: /[0-9]/.test(form.password)          },
                    { label: 'Different from current',     check: form.password !== form.current && form.password.length > 0 },
                  ].map(({ label, check }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-300 ${check ? 'bg-green-500' : 'border border-obsidian-600'}`}>
                        {check && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <p className={`font-sans text-xs transition-colors duration-300 ${check ? 'text-green-400' : 'text-obsidian-500'}`}>
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 border border-gold-800/30 bg-gold-900/10">
                  <svg className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="font-sans text-xs text-gold-400/80 leading-relaxed">
                    You will be automatically signed out on all devices after changing your password.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-obsidian-700 border-t-obsidian-900 rounded-full animate-spin" />
                      Changing Password…
                    </span>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Change Password
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/dashboard" className="font-sans text-xs text-obsidian-500 hover:text-gold-400 transition-colors flex items-center justify-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Dashboard
                </Link>
              </div>
            </>
          ) : (
            /* Success */
            <div className="text-center animate-fade-up">
              <div className="w-20 h-20 bg-gold-gradient mx-auto mb-8 flex items-center justify-center">
                <svg className="w-10 h-10 text-obsidian-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-3xl text-ivory-100 mb-4">Password Changed</h2>
              <p className="font-body text-obsidian-400 leading-relaxed mb-8">
                Your password has been updated. You are being signed out for security — please sign in with your new password.
              </p>
              <div className="flex gap-1 justify-center mb-8">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
              <Link to="/login" className="btn-primary inline-flex">
                Sign In Again
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}