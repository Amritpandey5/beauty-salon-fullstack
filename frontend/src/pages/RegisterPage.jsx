import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { PrimaryButton } from '../components/Buttons'

export default function RegisterPage() {
  const navigate    = useNavigate()
  const { register } = useAuth()
  const { addToast } = useToast()

  const [form,    setForm]    = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name || form.name.length < 2)  errs.name    = 'Name must be at least 2 characters'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email'
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) errs.password = 'Must include uppercase, lowercase, and a number'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.phone, form.password)
      addToast('Account created! Welcome to Lumière.', 'success')
      navigate('/dashboard')
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name',     label: 'Full Name',        type: 'text',     placeholder: 'Your full name' },
    { key: 'email',    label: 'Email',             type: 'email',    placeholder: 'your@email.com' },
    { key: 'phone',    label: 'Phone (optional)',  type: 'tel',      placeholder: '+965 XXXX XXXX' },
    { key: 'password', label: 'Password',          type: 'password', placeholder: 'Min. 8 characters' },
    { key: 'confirm',  label: 'Confirm Password',  type: 'password', placeholder: 'Repeat your password' },
  ]

  return (
    <div className="min-h-screen bg-obsidian-950 pattern-bg flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="flex flex-col items-center mb-10">
          <span className="font-display text-3xl gold-text">Lumière</span>
          <span className="font-arabic text-xs text-gold-500/70">لوميير</span>
        </Link>

        <div className="border border-gold-800/30 bg-obsidian-900/80 backdrop-blur-sm p-8 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gold-gradient" />
          <h1 className="font-display text-3xl text-ivory-100 mb-2">Create Account</h1>
          <p className="font-body text-obsidian-400 mb-8">Join Kuwait's premier beauty community</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map(field => (
              <div key={field.key}>
                <label className="font-sans text-xs uppercase tracking-widest text-obsidian-400 block mb-2">{field.label}</label>
                <input
                  name={field.key} type={field.type}
                  value={form[field.key]} onChange={handleChange}
                  placeholder={field.placeholder}
                  className="input-field border-b border-obsidian-700 text-ivory-100 placeholder-obsidian-600"
                />
                {errors[field.key] && <p className="font-sans text-xs text-red-400 mt-1">{errors[field.key]}</p>}
              </div>
            ))}

            <p className="font-sans text-xs text-obsidian-500 leading-relaxed pt-2">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-gold-500 hover:text-gold-400">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-gold-500 hover:text-gold-400">Privacy Policy</a>.
            </p>

            <PrimaryButton type="submit" loading={loading} className="w-full justify-center mt-2">
              Create Account
            </PrimaryButton>
          </form>

          <p className="font-sans text-sm text-obsidian-500 text-center mt-6 px-2">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-400 hover:text-gold-300 transition-colors">Sign in</Link>
          </p>
        </div>

        <Link to="/" className="flex items-center justify-center gap-2 mt-6 text-xs text-obsidian-600 hover:text-obsidian-400 transition-colors font-sans">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to website
        </Link>
      </div>
    </div>
  )
}
