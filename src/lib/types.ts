// ─── Database Types ───────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'customer' | 'admin'
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  children?: Category[]
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  thumb_url: string | null
  position: number
  is_primary: boolean
}

export interface ProductVariant {
  id: string
  product_id: string
  sku: string
  size: string | null
  color: string | null
  price_override: number | null
  stock_quantity: number
  low_stock_threshold: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  materials: string | null
  care_instructions: string | null
  category_id: string | null
  base_price: number
  sale_price: number | null
  is_active: boolean
  is_featured: boolean
  is_new_arrival: boolean
  is_on_sale: boolean
  track_inventory: boolean
  created_at: string
  // Joined
  product_images?: ProductImage[]
  product_variants?: ProductVariant[]
  category?: Category
}

export interface DiscountCode {
  id: string
  code: string
  type: 'percent' | 'fixed'
  value: number
  min_order_value: number
  usage_limit: number | null
  times_used: number
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
}

export interface CartItem {
  id: string
  variant_id: string
  quantity: number
  // Denormalized for display
  product: Product
  variant: ProductVariant
}

export interface Order {
  id: string
  user_id: string
  stripe_session_id: string | null
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  discount_amount: number
  discount_code: string | null
  shipping_amount: number
  total: number
  shipping_address: ShippingAddress | null
  tracking_number: string | null
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  variant_id: string
  product_name: string
  variant_label: string
  unit_price: number
  quantity: number
}

export interface ShippingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface SiteSettings {
  id: string
  key: string
  is_enabled: boolean
  message: string | null
  link_url: string | null
  starts_at: string | null
  expires_at: string | null
  updated_at: string
}

// ─── Cart Store Types ─────────────────────────────────────────────────────────

export interface LocalCartItem {
  variantId: string
  quantity: number
  product: Product
  variant: ProductVariant
}

// ─── UI / Helper Types ────────────────────────────────────────────────────────

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'best-selling'

export interface FilterState {
  categories: string[]
  sizes: string[]
  colors: string[]
  priceMin: number | null
  priceMax: number | null
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

export interface Review {
  id: string
  author: string
  rating: number
  body: string
  created_at: string
}
