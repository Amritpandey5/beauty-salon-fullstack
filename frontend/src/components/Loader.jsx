export default function Loader({ size = 'md', fullScreen = false }) {
  const sizeClass = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }[size]

  const spinner = (
    <div className={`relative ${sizeClass}`}>
      <div className={`absolute inset-0 border-2 border-gold-800/30 rounded-full`} />
      <div className={`absolute inset-0 border-2 border-transparent border-t-gold-400 rounded-full animate-spin`} />
      <div className="absolute inset-2 bg-gold-gradient opacity-20 rounded-full animate-pulse" />
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-obsidian-950/95 backdrop-blur-md">
        {spinner}
        <p className="font-sans text-xs text-gold-500 tracking-[0.3em] uppercase mt-6">Loading</p>
      </div>
    )
  }

  return spinner
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader size="lg" />
    </div>
  )
}
