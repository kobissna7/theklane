import React from 'react'
import { useToastStore } from '../../features/toast/toastStore'
import { cn } from '../../lib/utils'

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 shadow-lg pointer-events-auto animate-slide-in-up',
            toast.type === 'success' && 'bg-brand-black text-white',
            toast.type === 'error' && 'bg-red-600 text-white',
            toast.type === 'info' && 'bg-brand-charcoal text-white',
          )}
        >
          <span className="text-sm font-body">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 text-white/60 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
