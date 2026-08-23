import React, { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: string
}

export function Modal({ isOpen, onClose, title, children, width = 'max-w-2xl' }: ModalProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm px-4 py-10">
      <div className={`w-full ${width} bg-white shadow-2xl`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-dark/10">
          <h3 className="font-heading uppercase tracking-widest text-sm text-brand-dark">{title}</h3>
          <button onClick={onClose} className="text-brand-dark/40 hover:text-brand-dark transition-colors text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

interface FieldProps {
  label: string
  required?: boolean
  children: ReactNode
  hint?: string
}

export function Field({ label, required, children, hint }: FieldProps) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-brand-dark/60 mb-1">
        {label}{required && <span className="text-brand-secondary ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-brand-dark/40">{hint}</p>}
    </div>
  )
}

export const inputClass = "w-full border border-brand-dark/20 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-secondary bg-white"
export const textareaClass = "w-full border border-brand-dark/20 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-secondary bg-white resize-none"
export const selectClass = "w-full border border-brand-dark/20 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-secondary bg-white"
