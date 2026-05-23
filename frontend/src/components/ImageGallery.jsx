import { useState, useEffect, useCallback } from 'react'

export default function ImageGallery({ images }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const close = useCallback(() => setLightboxIndex(null), [])
  const prev = useCallback(() => setLightboxIndex(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setLightboxIndex(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, close, prev, next])

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {images.map((img, i) => (
          <div
            key={i}
            className="break-inside-avoid overflow-hidden cursor-pointer group relative"
            onClick={() => setLightboxIndex(i)}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full object-cover transition-all duration-700 group-hover:scale-105 grayscale-[20%] group-hover:grayscale-0"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-obsidian-950/0 group-hover:bg-obsidian-950/30 transition-all duration-300 flex items-center justify-center">
              <div className="w-10 h-10 bg-gold-gradient flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                <svg className="w-4 h-4 text-obsidian-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
            {img.category && (
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="font-sans text-xs px-2 py-1 bg-obsidian-950/80 text-gold-400 tracking-wider uppercase">
                  {img.category}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-obsidian-950/98 backdrop-blur-sm">
          <button
            onClick={close}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center border border-gold-700/50 text-gold-400 hover:border-gold-400 hover:bg-gold-400/10 transition-all"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={prev}
            className="absolute left-4 md:left-8 w-10 h-10 flex items-center justify-center border border-gold-700/50 text-gold-400 hover:border-gold-400 hover:bg-gold-400/10 transition-all"
            aria-label="Previous"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="max-w-4xl max-h-[85vh] mx-16 md:mx-24 flex flex-col items-center gap-4">
            <img
              src={images[lightboxIndex].src}
              alt={images[lightboxIndex].alt}
              className="max-h-[75vh] max-w-full object-contain animate-fade-in"
            />
            <div className="flex items-center gap-4">
              <div className="w-8 h-px bg-gold-gradient" />
              <p className="font-body text-ivory-300 text-sm italic">{images[lightboxIndex].alt}</p>
              <div className="w-8 h-px bg-gold-gradient" />
            </div>
            <p className="font-sans text-xs text-obsidian-500 tracking-widest">
              {lightboxIndex + 1} / {images.length}
            </p>
          </div>

          <button
            onClick={next}
            className="absolute right-4 md:right-8 w-10 h-10 flex items-center justify-center border border-gold-700/50 text-gold-400 hover:border-gold-400 hover:bg-gold-400/10 transition-all"
            aria-label="Next"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}
