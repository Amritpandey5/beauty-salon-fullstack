import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useSwipeable } from 'react-swipeable'

export default function ImageGallery({ images }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [loading, setLoading] = useState(false)

  const openImage = (index) => {
    setLoading(true)
    setLightboxIndex(index)
  }

  const close = useCallback(() => {
    setLightboxIndex(null)
    setLoading(false)
  }, [])

  const prev = useCallback(() => {
    setLoading(true)
    setLightboxIndex((i) => (i - 1 + images.length) % images.length)
  }, [images.length])

  const next = useCallback(() => {
    setLoading(true)
    setLightboxIndex((i) => (i + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    if (lightboxIndex === null) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [lightboxIndex, close, prev, next])

  useEffect(() => {
    if (lightboxIndex === null) return

    const img = new Image()
    img.src = images[lightboxIndex].src
    img.onload = () => setLoading(false)
    img.onerror = () => setLoading(false)
  }, [lightboxIndex, images])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: next,
    onSwipedRight: prev,
    trackMouse: true,
    preventScrollOnSwipe: false,
  })

  const Lightbox = () => (
    <div
      className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onClick={close}
    >
      {/* Close Button */}
      <button
        onClick={close}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-20
        w-11 h-11 rounded-full
        bg-black/50 border border-white/20
        text-white hover:bg-black/80 transition"
        aria-label="Close"
      >
        ✕
      </button>

      {/* Previous */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          prev()
        }}
        className="hidden md:flex absolute left-6 z-20
        w-12 h-12 items-center justify-center
        rounded-full bg-black/50 border border-white/20
        text-white hover:bg-black/80 transition"
        aria-label="Previous"
      >
        ❮
      </button>

      {/* Next */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          next()
        }}
        className="hidden md:flex absolute right-6 z-20
        w-12 h-12 items-center justify-center
        rounded-full bg-black/50 border border-white/20
        text-white hover:bg-black/80 transition"
        aria-label="Next"
      >
        ❯
      </button>

      {/* Image Container */}
      <div
        {...swipeHandlers}
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full flex flex-col items-center justify-center px-4"
      >
        {loading && (
          <div className="absolute flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        <div className="overflow-auto max-h-[85vh] max-w-[95vw] touch-pan-x touch-pan-y">
          <img
            src={images[lightboxIndex].src}
            alt={images[lightboxIndex].alt}
            className={`max-w-full max-h-[80vh] object-contain transition-opacity duration-300 ${
              loading ? 'opacity-0' : 'opacity-100'
            }`}
            draggable={false}
          />
        </div>

        <div className="mt-5 text-center px-4">
          <p className="text-white text-sm md:text-base">
            {images[lightboxIndex].alt}
          </p>

          <p className="text-gray-400 text-xs tracking-widest mt-2">
            {lightboxIndex + 1} / {images.length}
          </p>

          <p className="text-gray-500 text-[11px] mt-2 md:hidden">
            Swipe left/right to navigate • Pinch to zoom
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Gallery Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {images.map((img, i) => (
          <div
            key={i}
            onClick={() => openImage(i)}
            className="break-inside-avoid cursor-pointer overflow-hidden relative group"
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="w-full object-cover transition-all duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 text-black rounded-full w-12 h-12 flex items-center justify-center">
                🔍
              </div>
            </div>

            {img.category && (
              <div className="absolute top-3 left-3">
                <span className="text-xs uppercase tracking-wider bg-black/70 text-white px-2 py-1 rounded">
                  {img.category}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null &&
        createPortal(
          <Lightbox />,
          document.body
        )}
    </>
  )
}