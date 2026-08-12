import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price)
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '…'
}

export function generateId(): string {
  return Math.random().toString(36).slice(2)
}

export function getStockStatus(variant: { stock_quantity: number; low_stock_threshold: number }, trackInventory: boolean): 'in-stock' | 'low-stock' | 'out-of-stock' {
  if (!trackInventory) return 'in-stock'
  if (variant.stock_quantity <= 0) return 'out-of-stock'
  if (variant.stock_quantity <= variant.low_stock_threshold) return 'low-stock'
  return 'in-stock'
}
