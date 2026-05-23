import { createPortal } from 'react-dom'
import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => (document.body.style.overflow = '')
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
      
      <div
        className="fixed inset-0 bg-black/60"
        onClick={onClose}
      />

      <div className="relative z-[1000000] bg-white p-6 rounded-lg">
        {children}
      </div>

    </div>,
    document.body
  )
}