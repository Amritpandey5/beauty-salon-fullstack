import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { PrimaryButton } from '../components/Buttons'
import { useTheme } from '../App'
// import { set } from 'react-datepicker/dist/dist/date_utils.js'

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuth()
  const { forgotPassword } = useAuth()
  const { addToast } = useToast()
  const { isDark, toggleTheme } = useTheme()

  const from = location.state?.from?.pathname || '/dashboard'

  const [form,   setForm]   = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email'
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }))
  }

  const handleforget = async(e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword(form.email)
      addToast('Password reset link sent to your email', 'success')
    } catch (error) {
      addToast(error.message || 'Failed to send reset link', 'error')
    }
    finally{
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      addToast('Welcome back to Lumière!', 'success')
      navigate(from, { replace: true })
    } catch (err) {
      addToast(err.message || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-obsidian-950 pattern-bg flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80"
          alt="Lumière Salon"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950 to-transparent" />
        <div className="absolute bottom-16 left-12">
          <p className="font-display text-5xl gold-text mb-3">Lumière</p>
          <p className="font-arabic text-gold-400/70 text-base">لوميير — الكويت</p>
          <p className="font-body text-ivory-500 text-sm mt-4 max-w-xs leading-relaxed">
            Your personal beauty sanctuary awaits. Sign in to manage your appointments.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 relative">
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center border border-gold-700/50 text-gold-400 hover:border-gold-400 transition-all rounded-full"
        >
          {isDark
            ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          }
        </button>

        <div className="w-full max-w-md">
          <Link to="/" className="flex flex-col items-center mb-12">
            <span className="font-display text-3xl gold-text">Lumière</span>
            <span className="font-arabic text-xs text-gold-500/70">لوميير</span>
          </Link>

          <h1 className="font-display text-3xl text-ivory-100 mb-2">Welcome Back</h1>
          <p className="font-body text-obsidian-400 mb-10">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-sans text-xs uppercase tracking-widest text-obsidian-400 block mb-2">Email</label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="your@email.com"
                className="input-field border-b border-obsidian-700 text-ivory-100 placeholder-obsidian-600"
              />
              {errors.email && <p className="font-sans text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-sans text-xs uppercase tracking-widest text-obsidian-400">Password</label>
                <a href="#" onClick={handleforget} className="font-sans text-xs text-gold-500 hover:text-gold-400 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  name="password" type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field border-b border-obsidian-700 text-ivory-100 placeholder-obsidian-600 pr-10"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-0 bottom-3 text-obsidian-500 hover:text-gold-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPw
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                    }
                  </svg>
                </button>
              </div>
              {errors.password && <p className="font-sans text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            <PrimaryButton type="submit" loading={loading} className="w-full justify-center mt-2">
              Sign In
            </PrimaryButton>
          </form>

          <div className="mt-4 p-3 border border-gold-800/30 bg-gold-900/10">
            <p className="font-sans text-xs text-gold-500 text-center">
              Demo: <span className="font-600">maryam@example.com</span> / <span className="font-600">Client@1234</span>
            </p>
          </div>

          <p className="font-sans text-sm text-obsidian-500 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold-400 hover:text-gold-300 transition-colors">Create one</Link>
          </p>
          <Link to="/" className="flex items-center justify-center gap-2 mt-6 text-xs text-obsidian-600 hover:text-obsidian-400 transition-colors font-sans">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to website
          </Link>
        </div>
      </div>
    </div>
  )
}
