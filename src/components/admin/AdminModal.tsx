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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm px-4 py-10">
      <div className={`w-full ${width} bg-white shadow-2xl rounded-2xl overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-heading uppercase tracking-widest text-sm text-brand-dark">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-brand-dark/30 hover:text-brand-dark hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
      <label className="block font-heading text-2xs uppercase tracking-wider text-brand-dark/50 mb-1.5">
        {label}{required && <span className="text-brand-secondary ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-brand-dark/30 font-body">{hint}</p>}
    </div>
  )
}

export const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:border-brand-secondary bg-white text-brand-dark transition-colors"
export const textareaClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:border-brand-secondary bg-white resize-none text-brand-dark transition-colors"
export const selectClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:border-brand-secondary bg-white text-brand-dark transition-colors"
