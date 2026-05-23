import { useState } from 'react'
import { useToast } from '../components/Toast'
import { PrimaryButton } from '../components/Buttons'
import { contactApi } from '../api/contact.api'

export default function ContactPage() {
  const { addToast } = useToast()
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [whatsappOpen, setWhatsappOpen] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email'
    if (!form.message.trim() || form.message.length < 10) e.message = 'Message must be at least 10 characters'
    return e
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
      await contactApi.submit(form)
      addToast('Your message has been sent. We\'ll respond within 24 hours.', 'success')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      addToast(err.message || 'Failed to send message. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative pt-40 pb-24 bg-obsidian-950 pattern-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-obsidian-950" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-gold-gradient" />
            <p className="font-sans text-xs tracking-[0.25em] uppercase text-gold-500">Get In Touch</p>
            <div className="w-8 h-px bg-gold-gradient" />
          </div>
          <h1 className="section-title text-ivory-100 mb-6">We'd Love to <em className="gold-text">Hear From You</em></h1>
          <p className="font-body text-ivory-400 text-lg">Whether you have a question, wish to make a special request, or simply want to say hello — our team is here.</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 bg-ivory-50 dark:bg-obsidian-950">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-16">

          {/* Info */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl text-obsidian-900 dark:text-ivory-100 mb-8">Visit Our Salon</h2>
            <div className="space-y-8">
              {[
                {
                  icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
                  label: 'Address', value: 'Block 7, Al-Salmiya\nKuwait City, Kuwait',
                },
                {
                  icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
                  label: 'Phone', value: '+965 1234 5678',
                },
                {
                  icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
                  label: 'Email', value: 'hello@lumierekuwait.com',
                },
                {
                  icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                  label: 'Hours', value: 'Sun – Thu: 9AM – 10PM\nFri – Sat: 10AM – 11PM',
                },
              ].map(item => (
                <div key={item.label} className="flex gap-4">
                  <div className="w-10 h-10 bg-gold-gradient/10 border border-gold-700/30 flex items-center justify-center text-gold-500 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-sans text-xs uppercase tracking-widest text-obsidian-400 dark:text-obsidian-500 mb-1">{item.label}</p>
                    <p className="font-body text-obsidian-700 dark:text-ivory-300 whitespace-pre-line">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* whatApp feature is temporarily removed due to API issues. Please contact us via email or phone for any inquiries. */}
              {/* <div className="mt-12 p-6 bg-obsidian-950 border border-gold-800/30">
                <p className="font-arabic text-gold-400 text-sm mb-2">تواصل معنا عبر واتساب</p>
                <p className="font-sans text-xs text-ivory-500 mb-4">For faster responses, reach us on WhatsApp</p>
                <a href="https://wa.me/96512345678" className="btn-primary text-xs py-2.5 inline-flex">
                  Open WhatsApp
                </a>
              </div> */}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="border border-obsidian-200 dark:border-obsidian-700/50 p-8 md:p-12 relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gold-gradient" />
              <h3 className="font-display text-2xl text-obsidian-900 dark:text-ivory-100 mb-8">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400 block mb-2">Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className="input-field" />
                    {errors.name && <p className="font-sans text-xs text-red-400 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400 block mb-2">Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className="input-field" />
                    {errors.email && <p className="font-sans text-xs text-red-400 mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400 block mb-2">Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="+965 XXXX XXXX" className="input-field" />
                  </div>
                  <div>
                    <label className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400 block mb-2">Subject</label>
                    <select name="subject" value={form.subject} onChange={handleChange} className="input-field appearance-none cursor-pointer">
                      <option value="">Select a subject</option>
                      {['Booking Inquiry', 'Bridal Package', 'General Question', 'Feedback', 'Other'].map(s => (
                        <option  className=' text-obsidian-900 dark:text-obsidian-800' key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400 block mb-2">Message *</label>
                  <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us how we can help you..." rows={5} className="input-field resize-none border border-obsidian-300 dark:border-obsidian-600 px-4 py-3" />
                  {errors.message && <p className="font-sans text-xs text-red-400 mt-1">{errors.message}</p>}
                </div>
                <PrimaryButton type="submit" loading={loading} className="w-full sm:w-auto justify-center">
                  Send Message
                </PrimaryButton>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
