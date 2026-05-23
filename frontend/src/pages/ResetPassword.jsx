import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/auth.api'
import { useToast } from '../components/Toast'
import { useTheme } from '../App'

const STRENGTH_LEVELS = [
  { label: 'Too short',  color: 'bg-red-500',    width: 'w-1/4' },
  { label: 'Weak',       color: 'bg-orange-500',  width: 'w-2/4' },
  { label: 'Fair',       color: 'bg-yellow-500',  width: 'w-3/4' },
  { label: 'Strong',     color: 'bg-green-500',   width: 'w-full' },
]

function getStrength(pw) {
  if (!pw || pw.length < 8) return 0
  let score = 1
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 3)
}

export default function ResetPasswordPage() {
  const [searchParams]    = useSearchParams()
  const navigate          = useNavigate()
  const { addToast }      = useToast()
  const { isDark, toggleTheme } = useTheme()

  const token = searchParams.get('token')

  const [form,      setForm]      = useState({ password: '', confirm: '' })
  const [errors,    setErrors]    = useState({})
  const [loading,   setLoading]   = useState(false)
  const [showPw,    setShowPw]    = useState(false)
  const [showCf,    setShowCf]    = useState(false)
  const [success,   setSuccess]   = useState(false)

  const strength = getStrength(form.password)
  const strengthInfo = STRENGTH_LEVELS[strength]

  // If no token in URL, the link is invalid
  const noToken = !token

  const validate = () => {
    const errs = {}
    if (!form.password) {
      errs.password = 'Password is required'
    } else if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      errs.password = 'Must include uppercase, lowercase, and a number'
    }
    if (!form.confirm) {
      errs.confirm = 'Please confirm your password'
    } else if (form.password !== form.confirm) {
      errs.confirm = 'Passwords do not match'
    }
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await authApi.resetPassword(token, form.password)
      setSuccess(true)
      addToast('Password reset successfully!', 'success')
    } catch (err) {
      addToast(err?.message || 'Reset failed. The link may have expired.', 'error')
      setErrors({ password: err?.message || 'Reset link is invalid or has expired.' })
    } finally {
      setLoading(false)
    }
  }

  // Auto-redirect after success
  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => navigate('/login'), 4000)
    return () => clearTimeout(t)
  }, [success, navigate])

  return (
    <div className="min-h-screen bg-obsidian-950 pattern-bg flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80"
          alt="Lumière Salon"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950 to-obsidian-950/20" />
        <div className="absolute bottom-16 left-12 max-w-xs">
          <p className="font-display text-5xl gold-text mb-3">Lumière</p>
          <p className="font-arabic text-gold-400/70 text-base mb-6">لوميير — الكويت</p>
          <p className="font-body text-ivory-500 text-sm leading-relaxed">
            Create a strong new password and return to your luxury beauty sanctuary.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 relative">
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center border border-gold-700/50 text-gold-400 hover:border-gold-400 hover:bg-gold-400/10 transition-all duration-300 rounded-full"
        >
          {isDark ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <div className="w-full max-w-md">
          <Link to="/" className="flex flex-col items-center mb-12">
            <span className="font-display text-3xl gold-text">Lumière</span>
            <span className="font-arabic text-xs text-gold-500/70 mt-1">لوميير</span>
          </Link>

          {/* Invalid token state */}
          {noToken && (
            <div className="text-center animate-fade-up">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-8">
                <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="font-display text-3xl text-ivory-100 mb-4">Invalid Reset Link</h2>
              <p className="font-body text-obsidian-400 leading-relaxed mb-8">
                This password reset link is missing or invalid. Please request a new one.
              </p>
              <Link to="/forgot-password" className="btn-primary inline-flex">
                Request New Link
              </Link>
              <div className="mt-6">
                <Link to="/login" className="font-sans text-xs text-obsidian-500 hover:text-gold-400 transition-colors">
                  Back to Login
                </Link>
              </div>
            </div>
          )}

          {/* Success state */}
          {!noToken && success && (
            <div className="text-center animate-fade-up">
              <div className="w-20 h-20 bg-gold-gradient mx-auto mb-8 flex items-center justify-center">
                <svg className="w-10 h-10 text-obsidian-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-3xl text-ivory-100 mb-4">Password Reset!</h2>
              <p className="font-body text-obsidian-400 leading-relaxed mb-10">
                Your password has been updated successfully. You'll be redirected to the login page in a moment.
              </p>
              <Link to="/login" className="btn-primary inline-flex">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In Now
              </Link>
              <p className="font-sans text-xs text-obsidian-600 mt-4">Redirecting automatically…</p>
            </div>
          )}

          {/* Form state */}
          {!noToken && !success && (
            <>
              <div className="w-16 h-16 bg-gold-gradient/10 border border-gold-700/40 flex items-center justify-center mx-auto mb-8">
                <svg className="w-7 h-7 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>

              <h1 className="font-display text-3xl text-ivory-100 mb-2 text-center">Set New Password</h1>
              <p className="font-body text-obsidian-400 text-center mb-10 leading-relaxed">
                Choose a strong password for your Lumière account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* New password */}
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest text-obsidian-400 block mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      autoFocus
                      className="input-field border-b border-obsidian-700 text-ivory-100 placeholder-obsidian-600 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => !p)}
                      className="absolute right-0 bottom-3 text-obsidian-500 hover:text-gold-400 transition-colors"
                      tabIndex={-1}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {showPw ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        ) : (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>

                  {/* Strength meter */}
                  {form.password && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex gap-1 h-1">
                        {[0, 1, 2, 3].map(i => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              i <= strength
                                ? ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][strength]
                                : 'bg-obsidian-700'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`font-sans text-xs ${
                        strength === 0 ? 'text-red-400'
                        : strength === 1 ? 'text-orange-400'
                        : strength === 2 ? 'text-yellow-400'
                        : 'text-green-400'
                      }`}>
                        {strengthInfo.label}
                      </p>
                    </div>
                  )}

                  {errors.password && (
                    <p className="font-sans text-xs text-red-400 mt-2 flex items-center gap-1.5">
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest text-obsidian-400 block mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      name="confirm"
                      type={showCf ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      className="input-field border-b border-obsidian-700 text-ivory-100 placeholder-obsidian-600 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCf(p => !p)}
                      className="absolute right-0 bottom-3 text-obsidian-500 hover:text-gold-400 transition-colors"
                      tabIndex={-1}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {showCf ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        ) : (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </>
                        )}
                      </svg>
                    </button>
                    {/* Match indicator */}
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
                  {errors.confirm && (
                    <p className="font-sans text-xs text-red-400 mt-2 flex items-center gap-1.5">
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.confirm}
                    </p>
                  )}
                </div>

                {/* Requirements checklist */}
                <div className="p-4 border border-obsidian-700/50 bg-obsidian-900/30 space-y-2">
                  <p className="font-sans text-xs text-obsidian-500 uppercase tracking-wider mb-3">Password Requirements</p>
                  {[
                    { label: 'At least 8 characters',          check: form.password.length >= 8 },
                    { label: 'One uppercase letter (A–Z)',      check: /[A-Z]/.test(form.password) },
                    { label: 'One lowercase letter (a–z)',      check: /[a-z]/.test(form.password) },
                    { label: 'One number (0–9)',                check: /[0-9]/.test(form.password) },
                  ].map(({ label, check }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 flex items-center justify-center rounded-full flex-shrink-0 transition-colors duration-300 ${check ? 'bg-green-500' : 'border border-obsidian-600'}`}>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-obsidian-700 border-t-obsidian-900 rounded-full animate-spin" />
                      Resetting Password…
                    </span>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Reset Password
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link to="/login" className="font-sans text-xs text-obsidian-500 hover:text-gold-400 transition-colors flex items-center justify-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}