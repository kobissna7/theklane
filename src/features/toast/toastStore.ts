import { create } from 'zustand'
import { generateId } from '../../lib/utils'
import type { ToastMessage } from '../../lib/types'

interface ToastState {
  toasts: ToastMessage[]
  addToast: (message: string, type?: ToastMessage['type']) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = generateId()
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })), 4000)
  },
  removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}))
