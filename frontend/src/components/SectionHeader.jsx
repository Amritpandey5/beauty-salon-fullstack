export default function SectionHeader({ eyebrow, title, subtitle, center = true, light = false }) {
  return (
    <div className={`mb-16 ${center ? 'text-center' : ''}`}>
      {eyebrow && (
        <div className={`flex items-center gap-3 mb-4 ${center ? 'justify-center' : ''}`}>
          <div className="w-8 h-px bg-gold-gradient" />
          <p className={`font-sans text-xs tracking-[0.25em] uppercase ${light ? 'text-gold-300' : 'text-gold-600 dark:text-gold-400'}`}>
            {eyebrow}
          </p>
          <div className="w-8 h-px bg-gold-gradient" />
        </div>
      )}
      <h2 className={`section-title ${light ? 'text-ivory-100' : 'text-obsidian-900 dark:text-ivory-100'} mb-4`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`font-body text-base md:text-lg leading-relaxed max-w-2xl ${center ? 'mx-auto' : ''} ${light ? 'text-ivory-400' : 'text-obsidian-500 dark:text-obsidian-400'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
