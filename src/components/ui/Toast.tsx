import { useEffect } from 'react'
import { CheckIcon } from '../icons/Icons'

interface ToastProps {
  message: string
  visible: boolean
  onClose: () => void
  duration?: number
  type?: 'success' | 'error'
}

export default function Toast({ message, visible, onClose, duration = 3000, type = 'success' }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [visible, duration, onClose])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up" dir="ltr">
      <div
        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg border text-sm font-heading font-medium ${
          type === 'success'
            ? 'bg-emerald text-white border-emerald'
            : 'bg-red text-white border-red'
        }`}
        style={{
          direction: 'rtl',
        }}
      >
        <CheckIcon size={18} />
        <span>{message}</span>
      </div>
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out both;
        }
      `}</style>
    </div>
  )
}
