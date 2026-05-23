import { Link } from 'react-router-dom'

const footerLinks = {
  Explore: [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/about' },
    { label: 'Our Services', to: '/services' },
    { label: 'Gallery', to: '/gallery' },
    { label: 'Contact', to: '/contact' },
  ],
  Services: [
    { label: 'Hair Styling', to: '/services' },
    { label: 'Nail Art', to: '/services' },
    { label: 'Facial Treatments', to: '/services' },
    { label: 'Bridal Packages', to: '/services' },
    { label: 'Hammam Ritual', to: '/services' },
  ],
  Connect: [
    { label: 'Instagram', href: 'https://instagram.com/lumierekuwait' },
    { label: 'Snapchat', href: '#' },
    { label: 'WhatsApp', href: 'https://wa.me/96512345678' },
    { label: 'TikTok', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-obsidian-950 dark:bg-black border-t border-gold-900/30">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link to="/" className="flex flex-col leading-none mb-6">
              <span className="font-display text-3xl gold-text tracking-wide">Lumière</span>
              <span className="font-arabic text-sm text-gold-400/70 tracking-widest">لوميير — الكويت</span>
            </Link>
            <p className="font-body text-obsidian-400 text-sm leading-relaxed max-w-xs mb-6">
              Kuwait's most distinguished beauty sanctuary. Where every visit is a journey into refined elegance and personal transformation.
            </p>
            <Link to="/book" className="btn-primary text-xs py-2.5 px-5 inline-flex">
              Book Appointment
            </Link>
            <div className="mt-8">
              <p className="font-arabic text-gold-500 text-sm mb-1">وقت العمل</p>
              <p className="font-sans text-obsidian-400 text-xs tracking-wide">Sun – Thu: 9:00 AM – 10:00 PM</p>
              <p className="font-sans text-obsidian-400 text-xs tracking-wide">Fri – Sat: 10:00 AM – 11:00 PM</p>
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-sans text-xs tracking-[0.2em] uppercase text-gold-500 mb-6">{section}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="font-body text-obsidian-400 hover:text-gold-400 transition-colors duration-300 text-sm"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-obsidian-400 hover:text-gold-400 transition-colors duration-300 text-sm"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-obsidian-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-obsidian-600 text-xs tracking-wide">
            © 2025 Lumière Salon, Kuwait. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-gold-800" />
            <p className="font-arabic text-gold-700 text-xs">صُنع بشغف في الكويت</p>
            <div className="w-8 h-px bg-gold-800" />
          </div>
          <div className="flex gap-6">
            <Link to="/login" className="font-sans text-obsidian-600 hover:text-gold-500 text-xs tracking-wide transition-colors">Login</Link>
            <Link to="/register" className="font-sans text-obsidian-600 hover:text-gold-500 text-xs tracking-wide transition-colors">Register</Link>
            <a href="#" className="font-sans text-obsidian-600 hover:text-gold-500 text-xs tracking-wide transition-colors">Privacy</a>
            <a href="#" className="font-sans text-obsidian-600 hover:text-gold-500 text-xs tracking-wide transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
