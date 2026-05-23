import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function PageTransition({ children }) {
  const ref = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(16px)'
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.45s ease, transform 0.45s ease'
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [pathname])

  return (
    <div ref={ref} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}
