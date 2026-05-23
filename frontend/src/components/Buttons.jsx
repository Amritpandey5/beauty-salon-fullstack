export function PrimaryButton({ children, onClick, type = 'button', disabled = false, loading = false, className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 border border-obsidian-700 border-t-obsidian-900 rounded-full animate-spin" />
          Loading...
        </span>
      ) : children}
    </button>
  )
}

export function SecondaryButton({ children, onClick, type = 'button', disabled = false, className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-secondary disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}

export function IconButton({ children, onClick, label, className = '' }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`w-10 h-10 flex items-center justify-center border border-obsidian-200 dark:border-obsidian-700 text-obsidian-500 dark:text-obsidian-400 hover:border-gold-500 hover:text-gold-500 transition-all duration-300 ${className}`}
    >
      {children}
    </button>
  )
}
