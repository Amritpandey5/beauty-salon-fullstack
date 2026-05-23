export function ServiceCard({ icon, title, subtitle, price, duration, onBook }) {
  return (
    <div className="group relative overflow-hidden border border-obsidian-200 dark:border-obsidian-700/50 bg-white dark:bg-obsidian-900/50 hover:border-gold-400/50 transition-all duration-500 hover:shadow-gold">
      <div className="absolute top-0 left-0 w-full h-px bg-gold-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      <div className="p-8">
        <div className="w-12 h-12 mb-6 text-gold-500 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="font-display text-xl text-obsidian-900 dark:text-ivory-100 mb-2">{title}</h3>
        <p className="font-body text-sm text-obsidian-500 dark:text-obsidian-400 leading-relaxed mb-6">{subtitle}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-sans text-xs text-obsidian-400 dark:text-obsidian-500 uppercase tracking-wider">{duration}</p>
            <p className="font-display text-xl text-gold-500 mt-0.5">{price}</p>
          </div>
          <button
            onClick={onBook}
            className="px-5 py-2.5 border border-gold-500/50 text-gold-500 text-xs font-sans tracking-widest uppercase hover:bg-gold-500 hover:text-obsidian-950 transition-all duration-300"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  )
}

export function TeamCard({ name, role, image, specialties }) {
  return (
    <div className="group text-center">
      <div className="relative mb-6 inline-block">
        <div className="w-48 h-48 mx-auto overflow-hidden bg-obsidian-200 dark:bg-obsidian-800">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3c342f&color=c9a227&size=192`
            }}
          />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gold-gradient" />
      </div>
      <h3 className="font-display text-lg text-obsidian-900 dark:text-ivory-100">{name}</h3>
      <p className="font-sans text-xs text-gold-500 uppercase tracking-widest mt-1 mb-3">{role}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {specialties.map(s => (
          <span key={s} className="font-sans text-xs px-2 py-1 border border-obsidian-200 dark:border-obsidian-700 text-obsidian-500 dark:text-obsidian-400">
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

export function TestimonialCard({ quote, author, location, rating }) {
  return (
    <div className="glass-card p-8 relative">
      <div className="absolute top-6 right-8 font-display text-6xl text-gold-800/30 leading-none select-none">"</div>
      <div className="flex gap-1 mb-5">
        {[...Array(rating)].map((_, i) => (
          <svg key={i} className="w-3.5 h-3.5 text-gold-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
      <p className="font-body text-obsidian-700 dark:text-ivory-300 leading-relaxed text-sm mb-6 italic">
        "{quote}"
      </p>
      <div className="flex items-center gap-3">
        <div className="w-8 h-px bg-gold-gradient" />
        <div>
          <p className="font-sans text-sm font-500 text-obsidian-900 dark:text-ivory-100">{author}</p>
          <p className="font-sans text-xs text-obsidian-400">{location}</p>
        </div>
      </div>
    </div>
  )
}

export function StatCard({ number, label, suffix = '' }) {
  return (
    <div className="text-center group">
      <p className="font-display text-5xl md:text-6xl gold-text mb-2 group-hover:scale-110 transition-transform duration-300 inline-block">
        {number}{suffix}
      </p>
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-obsidian-500 dark:text-obsidian-400">{label}</p>
    </div>
  )
}
