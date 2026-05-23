export  function FormField({ label, required, error, hint, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="font-sans text-xs uppercase tracking-widest text-obsidian-500 dark:text-obsidian-400">
          {label}
          {required && <span className="text-gold-500 ml-1">*</span>}
        </label>
        {hint && <span className="font-sans text-xs text-obsidian-500">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="font-sans text-xs text-red-400 mt-1.5 flex items-center gap-1.5">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export  function FormSection({ title, subtitle, children }) {
  return (
    <div className="border border-obsidian-200 dark:border-obsidian-700/50 bg-white dark:bg-obsidian-900/40 p-6 md:p-8 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gold-gradient opacity-50" />
      {(title || subtitle) && (
        <div className="mb-6 pb-5 border-b border-obsidian-100 dark:border-obsidian-800">
          {title && <h3 className="font-display text-lg text-obsidian-900 dark:text-ivory-100">{title}</h3>}
          {subtitle && <p className="font-sans text-xs text-obsidian-500 dark:text-obsidian-400 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="space-y-6">{children}</div>
    </div>
  )
}

export  function TagInput({ value = [], onChange, placeholder = 'Add tag and press Enter' }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = e.target.value.trim().replace(/,$/, '')
      if (tag && !value.includes(tag)) {
        onChange([...value, tag])
      }
      e.target.value = ''
    }
  }

  const remove = (tag) => onChange(value.filter(t => t !== tag))

  return (
    <div className="border-b border-obsidian-300 dark:border-obsidian-600 pb-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/30 text-gold-400 font-sans text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="text-gold-600 hover:text-red-400 transition-colors leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : 'Add another…'}
        className="w-full bg-transparent font-sans text-sm text-obsidian-900 dark:text-ivory-100 placeholder-obsidian-400 dark:placeholder-obsidian-600 focus:outline-none py-1"
      />
    </div>
  )
}

export  function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
        <div className={`w-11 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-gold-500' : 'bg-obsidian-600'}`} />
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${checked ? 'translate-x-5' : ''}`} />
      </div>
      <span className="font-sans text-sm text-obsidian-700 dark:text-ivory-300 group-hover:text-obsidian-900 dark:group-hover:text-ivory-100 transition-colors">
        {label}
      </span>
    </label>
  )
}