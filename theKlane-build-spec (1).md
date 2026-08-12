# theKlane — Build Spec (AI IDE Prompt + Wireframe + Architecture)

Reference inspiration: fumithelabel.com (Shopify) — editorial fashion e‑commerce with full-bleed hero video, bestseller/collection grids, sale badges, testimonials, email capture w/ discount incentive.

Stack: **React + TypeScript + Vite + Supabase (DB/Auth/Storage) + Stripe (Payments)**

---

## 1. THE PROMPT (paste into your AI IDE — Cursor / Windsurf / Claude Code / etc.)

```
You are building "theKlane" — a premium women's fashion e-commerce storefront + 
lightweight admin panel. Build it production-grade, not a demo.

STACK
- React 18 + TypeScript + Vite
- Tailwind CSS (utility-first, custom design tokens — no default Tailwind look)
- React Router v6
- Supabase: Postgres DB, Auth (email/password + magic link), Storage (product images), 
  Row Level Security enabled on every table
- Stripe: Checkout Sessions (redirect flow) + Stripe Webhooks for order confirmation
- Zustand (or React Context) for cart state, persisted to localStorage for guests and 
  synced to Supabase for logged-in users
- React Query (TanStack Query) for all Supabase data fetching/caching
- Zod for form + API payload validation
- react-hook-form for forms

BRAND / DESIGN DIRECTION
- Name: theKlane. Tone: minimal, editorial, confident, high-contrast fashion-forward — 
  similar aesthetic register to Fumi The Label (fumithelabel.com): full-bleed imagery, 
  generous whitespace, thin serif or refined sans headings, uppercase tracked nav labels, 
  muted neutral palette (off-white/black/one accent color), large hero video or lookbook 
  imagery, small elegant "Sale" badges.
- Mobile-first, fully responsive.
- No generic Bootstrap/shadcn "default" look — treat typography, spacing rhythm, and 
  color as brand decisions, not defaults.

CORE FEATURES
1. Public storefront
   - Home: hero (video or image), "New Arrivals" / "Best Sellers" rails, featured 
     collections, testimonials, email signup (10% off first order), footer.
   - Shop All / Category pages with filtering (category, size, color, price range) 
     and sorting (newest, price, best selling), pagination or infinite scroll.
   - Collection pages (curated product groups, e.g. seasonal drops).
   - Product Detail Page (PDP): image gallery, variant selector (size/color), 
     price + strikethrough sale price, stock/low-stock indicator, quantity, 
     add to cart, size chart link, product description/materials/care, 
     related products, reviews.
   - Search (typeahead, product name + description).
   - Cart drawer (slide-over) + full cart page: line items, qty edit, remove, 
     discount code field, subtotal, shipping note, checkout CTA.
   - Checkout: collect shipping address + email (or use logged-in profile) → 
     create Stripe Checkout Session server-side → redirect to Stripe → 
     on success, Stripe webhook creates the Order in Supabase and decrements 
     inventory atomically.
   - Auth: sign up / log in / log out / password reset (Supabase Auth), 
     account dashboard (order history, saved addresses, wishlist).
   - Wishlist (logged-in users, saved to Supabase).
   - Static pages: Brand/About, FAQ, Size Chart, Shipping, Returns, Privacy, 
     Terms, Contact (form → stores submission in Supabase + optional email).

2. Admin panel (role-gated route, admin role in Supabase)
   - Dashboard: revenue, orders today, low-stock alerts.
   - Products: CRUD, multi-image upload to Supabase Storage, variants 
     (size/color) each with independent SKU + stock count + price override.
     Every product has admin-facing toggles (simple switches, not just a form 
     field buried in a dropdown):
       • Active/Published — controls whether it's visible on the storefront at all
       • Featured / Best Seller — controls "Best Sellers" rail placement
       • New Arrival — controls "New Arrivals" placement
       • On Sale — reveals the sale_price field when on; storefront shows 
         strikethrough pricing + "Sale" badge only when this is on
       • Track Inventory — if off, item is treated as always-in-stock 
         (useful for made-to-order or gift cards) and stock count is ignored
     Toggling any of these should take effect immediately on the storefront, 
     no redeploy or rebuild.
   - Categories: full CRUD, not a hardcoded list. Admin can create/edit/delete 
     categories, set a display name, slug, image, and sort order. Support 
     nested categories (a category can have a parent, e.g. "Tops" > "Bodysuits") 
     so the storefront mega-menu structure is admin-driven, not hardcoded in 
     the nav component. Same CRUD pattern for Collections (curated groups like 
     "New Arrivals" / seasonal drops) — admin assigns products to one or more 
     collections and can reorder collection membership.
   - Inventory: stock levels per variant, manual adjustment log, low-stock 
     threshold alerts.
   - Discounts: create % or fixed discount codes, usage limits, expiry dates, 
     min order value, per-product or storewide.
   - Orders: list, filter by status, view detail, update fulfillment status, 
     add tracking number (triggers "shipped" email/notification hook).
   - Customers: list, view order history per customer.
   - Site Settings → Announcement Bar: admin can edit the announcement bar 
     message text, an optional link URL, and toggle it ON/OFF with a simple 
     switch. When OFF, the bar must not render at all on the storefront (not 
     just hidden via CSS — skip it in the layout). Support scheduling 
     (optional start/end date) so a promo can auto-expire. Storefront should 
     fetch this on load (small, cached, public-read query) so toggling is 
     reflected without a redeploy.

IMAGE UPLOAD PIPELINE (applies everywhere images are uploaded: product images, 
collection/category images, brand/about page imagery)
- Every image, regardless of source format (jpg/png/heic/etc.), MUST be 
  converted to WebP before it lands in Supabase Storage. Do this client-side 
  at upload time: read the file, draw it to an offscreen <canvas> (or use 
  createImageBitmap), and export via canvas.toBlob(..., 'image/webp', quality) 
  — this avoids needing a server-side image library that won't run in a Deno 
  Edge Function. Fall back gracefully (upload original) only if the browser 
  doesn't support WebP export, and log/flag that case for the admin.
- Generate and upload a couple of sizes if practical (e.g. a ~1600px "full" 
  version for PDP and a ~600px "thumb" version for grid cards) to keep the 
  storefront fast — store both URLs on product_images, or store one URL and 
  rely on Supabase Storage image transformations for resizing if available 
  on the project's plan.
- Reject non-image files client-side before conversion; cap upload size 
  (e.g. 15MB pre-conversion) with a clear error toast.
- Show upload progress + a preview grid with drag-to-reorder (position field 
  on product_images) and a "set as primary" action.

DATA / BACKEND RULES
- All product/inventory/order data lives in Supabase Postgres — schema below.
- Inventory MUST be decremented atomically inside a Postgres function/RPC 
  triggered by the Stripe webhook (never decrement client-side) to prevent 
  overselling under concurrent checkouts.
- Stripe secret key and webhook signing secret live only in a server 
  environment (Supabase Edge Function) — NEVER expose in client code.
- Use a Supabase Edge Function for: 
   (a) POST /create-checkout-session — builds Stripe line items from cart, 
       applies discount code validation server-side, returns session URL.
   (b) POST /stripe-webhook — verifies signature, on checkout.session.completed 
       creates order + order_items rows, decrements stock via RPC, marks 
       discount code as used, sends confirmation.
- RLS: customers can only read/write their own rows (cart, wishlist, orders, 
  addresses); products/collections public read; admin-only tables gated by a 
  `profiles.role = 'admin'` check.

DELIVERABLES
- Fully typed TypeScript throughout (generate types from Supabase schema).
- .env.example with all required keys (Supabase URL/anon key, Stripe publishable 
  key; secret keys documented as Edge Function secrets, not in the client env).
- README with setup steps: Supabase project setup, running the SQL schema, 
  Stripe webhook setup (CLI forwarding for local dev), seeding sample products.
- Reusable component library: Button, Badge, PriceDisplay, ProductCard, 
  VariantSelector, QuantityStepper, Modal/Drawer, Toast, Skeleton loaders.

Build this iteratively: 
1. Scaffold Vite+TS+Tailwind+Router project structure.
2. Set up Supabase client, auth context, schema/migrations.
3. Build storefront UI with mock data first (component-driven).
4. Wire storefront to live Supabase data via React Query.
5. Build cart + Stripe checkout flow + webhook Edge Function.
6. Build admin panel.
7. Polish: loading/empty/error states, accessibility, SEO meta tags per page, 
   responsive QA.

Ask me clarifying questions before starting only if something is genuinely 
ambiguous (e.g. exact accent color, payment currency, shipping regions) — 
otherwise make reasonable brand-appropriate decisions and note assumptions 
in the README.
```

---

## 2. SITE MAP / WIREFRAME

### Public storefront

```
/                         Home
/shop                     Shop All (filter: category, size, color, price / sort)
/collections/:slug        Curated collection (e.g. /collections/new-arrivals)
/category/:slug           Category page (dresses, tops, sets, etc.)
/product/:slug            Product Detail Page
/search?q=                Search results
/cart                     Full cart page
/checkout/success         Post-Stripe redirect (order confirmation)
/checkout/cancel          Stripe cancelled redirect
/account                  Account dashboard (orders, addresses, wishlist)
/account/login
/account/register
/account/reset-password
/wishlist
/brand                    About / brand story
/faqs
/size-chart
/pages/shipping
/pages/returns
/pages/privacy
/pages/terms
/contact
```

### Admin (role-gated, e.g. `/admin/*`)

```
/admin                    Dashboard (KPIs, low stock alerts, recent orders)
/admin/products           Product list
/admin/products/new
/admin/products/:id/edit  (variants, images, pricing, stock)
/admin/categories         Category CRUD (nested structure, sort order, images)
/admin/collections        Collection CRUD (curated groups, product assignment)
/admin/inventory          Stock table + adjustment log
/admin/discounts          Discount code list + create/edit
/admin/orders             Order list (filter by status)
/admin/orders/:id         Order detail (fulfillment, tracking)
/admin/customers          Customer list
/admin/customers/:id      Customer detail + order history
/admin/settings           Site settings (announcement bar toggle + text/link/schedule)
```

### Home page wireframe (top → bottom)

```
┌─────────────────────────────────────────────┐
│ Announcement bar: "Free shipping over $150"  │
├─────────────────────────────────────────────┤
│ Logo   Home  Shop▾  Collections▾  Brand      │  Search  Account  Cart(n)
├─────────────────────────────────────────────┤
│                                               │
│         FULL-BLEED HERO (video/image)        │
│         Headline + CTA → Shop the Drop        │
│                                               │
├─────────────────────────────────────────────┤
│  BEST SELLERS                    [Shop All →]│
│  [card][card][card][card]  (horizontal rail) │
├─────────────────────────────────────────────┤
│  FEATURED COLLECTION banner (image + CTA)     │
├─────────────────────────────────────────────┤
│  NEW ARRIVALS                    [Shop All →]│
│  [card][card][card][card]                    │
├─────────────────────────────────────────────┤
│  CUSTOMER REVIEWS (carousel of 5★ quotes)     │
├─────────────────────────────────────────────┤
│  Full-bleed lifestyle image + "SHOP ALL" CTA  │
├─────────────────────────────────────────────┤
│  Follow @theklane — IG grid tease             │
├─────────────────────────────────────────────┤
│  JOIN THE CLUB — email signup (10% off)       │
├─────────────────────────────────────────────┤
│  Footer: Company | Help | Legal | Payment     │
│  icons | Social icons | © theKlane            │
└─────────────────────────────────────────────┘
```

Product card = image (hover swaps to 2nd image) → title → star rating (optional) →
price (strike + sale price if discounted) → "Choose Options" / "Add to Cart" on hover.

### PDP wireframe

```
┌───────────────┬───────────────────────────┐
│               │ Product Title              │
│  Image        │ ★★★★★ (12 reviews)         │
│  gallery      │ $XXX  ~~$XXX~~ (if sale)   │
│  (thumbnails  │ Color: [swatches]          │
│   + main)     │ Size: [S][M][L] Size Chart │
│               │ Qty: [-1+]                 │
│               │ [ ADD TO CART ]            │
│               │ ⚠ Only 3 left (low stock)  │
│               │ ▾ Description               │
│               │ ▾ Materials & Care          │
│               │ ▾ Shipping & Returns        │
└───────────────┴───────────────────────────┘
  Reviews section
  Related products rail
```

### Cart drawer

```
┌─────────────────────────────┐
│ Your Cart (n)            [x]│
├─────────────────────────────┤
│ [img] Title                 │
│       Size/Color   Qty[-1+] │
│       $XX.XX          [rm]  │
├─────────────────────────────┤
│ Discount code [______][Apply]│
│ Subtotal          $XXX.XX   │
│ [   CHECKOUT   ]            │
│ Continue shopping           │
└─────────────────────────────┘
```

---

## 3. SUPABASE SCHEMA (core tables)

```sql
-- profiles (extends auth.users)
profiles (
  id uuid primary key references auth.users(id),
  email text,
  full_name text,
  role text default 'customer', -- 'customer' | 'admin'
  created_at timestamptz default now()
)

categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references categories(id),  -- null = top-level, enables nesting
  image_url text,
  sort_order int default 0,
  is_active boolean default true
)

collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  sort_order int default 0,
  is_active boolean default true
)

products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  materials text,
  care_instructions text,
  category_id uuid references categories(id),
  base_price numeric(10,2) not null,
  sale_price numeric(10,2),        -- null if not on sale
  is_active boolean default true,       -- toggle: visible on storefront
  is_featured boolean default false,    -- toggle: best sellers rail
  is_new_arrival boolean default false, -- toggle: new arrivals rail
  is_on_sale boolean default false,     -- toggle: show sale_price + badge
  track_inventory boolean default true, -- toggle: off = always in stock
  created_at timestamptz default now()
)

product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  url text not null,        -- webp, full-size (~1600px)
  thumb_url text,           -- webp, grid-size (~600px)
  position int default 0,
  is_primary boolean default false
)

product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  sku text unique not null,
  size text,
  color text,
  price_override numeric(10,2),
  stock_quantity int not null default 0,
  low_stock_threshold int default 5
)

product_collections (               -- many-to-many
  product_id uuid references products(id) on delete cascade,
  collection_id uuid references collections(id) on delete cascade,
  primary key (product_id, collection_id)
)

discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null,               -- 'percent' | 'fixed'
  value numeric(10,2) not null,
  min_order_value numeric(10,2) default 0,
  usage_limit int,
  times_used int default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean default true
)

carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
)

cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references carts(id) on delete cascade,
  variant_id uuid references product_variants(id),
  quantity int not null default 1
)

orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  stripe_session_id text unique,
  status text default 'pending',    -- pending|paid|shipped|delivered|cancelled
  subtotal numeric(10,2),
  discount_amount numeric(10,2) default 0,
  discount_code text,
  shipping_amount numeric(10,2) default 0,
  total numeric(10,2),
  shipping_address jsonb,
  tracking_number text,
  created_at timestamptz default now()
)

order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  variant_id uuid references product_variants(id),
  product_name text,      -- snapshot at time of purchase
  variant_label text,     -- e.g. "M / Black" snapshot
  unit_price numeric(10,2),
  quantity int
)

wishlists (
  user_id uuid references auth.users(id),
  product_id uuid references products(id),
  created_at timestamptz default now(),
  primary key (user_id, product_id)
)

inventory_adjustments (   -- audit log
  id uuid primary key default gen_random_uuid(),
  variant_id uuid references product_variants(id),
  change int not null,     -- +/- 
  reason text,             -- 'order', 'manual', 'restock'
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
)

site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,        -- e.g. 'announcement_bar'
  is_enabled boolean default false,
  message text,                    -- "Free shipping over $150"
  link_url text,                   -- optional, makes the bar clickable
  starts_at timestamptz,           -- optional scheduling
  expires_at timestamptz,
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id)
)
```

RLS for `site_settings`: public `SELECT`; `INSERT`/`UPDATE`/`DELETE` restricted to `role = 'admin'`.

Storefront logic: fetch the `announcement_bar` row on layout mount (React Query, short `staleTime` e.g. 60s so toggling reflects quickly without needing a hard refresh). Render the bar only if `is_enabled = true` AND (no `starts_at`/`expires_at` set, or current time is within that window). If disabled, don't render the layout slot at all — avoid a layout-shift placeholder.

Key RLS rules:
- `products`, `product_images`, `product_variants`, `categories`, `collections`, `product_collections` → public `SELECT`; write restricted to `role = 'admin'`. Public storefront queries should additionally filter `is_active = true` in application code (RLS allows read of inactive rows only to admins, or filter client-side — either works, but keep inactive products out of public listing queries).
- `carts`, `cart_items`, `wishlists`, `orders`, `order_items` → user can only access rows where `user_id = auth.uid()`; admin can read all orders.
- `discount_codes` → public SELECT only on `code` lookup (validate via Edge Function, not raw client update); writes admin-only.
- Stock decrements happen via a `SECURITY DEFINER` Postgres function called only from the Stripe webhook Edge Function (service role), never from client.

---

## 4. STRIPE FLOW

```
Client cart → POST /functions/v1/create-checkout-session
   (Edge Function: validates stock, validates discount code server-side,
    builds Stripe line_items, creates Checkout Session, returns session.url)
Client → redirect to Stripe Checkout
Stripe → on completion → webhook POST /functions/v1/stripe-webhook
   - verify signature (STRIPE_WEBHOOK_SECRET)
   - on checkout.session.completed:
       - insert into orders + order_items
       - call decrement_stock(variant_id, qty) RPC for each item
       - increment discount_codes.times_used if code applied
       - (optional) trigger email via Resend/Postmark
Client → redirected to /checkout/success?session_id=...
   - fetch order by stripe_session_id to render confirmation
```

---

## 5. SUGGESTED FOLDER STRUCTURE

```
src/
  app/               # router setup, layouts
  components/
    ui/              # Button, Badge, Modal, Skeleton, Toast...
    product/         # ProductCard, VariantSelector, Gallery
    cart/            # CartDrawer, CartLineItem
    layout/          # Header, Footer, AnnouncementBar
  pages/
    storefront/      # Home, Shop, Collection, PDP, Cart, Search, Static pages
    account/         # Login, Register, Dashboard, Orders, Wishlist
    admin/           # Dashboard, Products, Categories, Collections, Inventory,
                     # Discounts, Orders, Customers, Settings
  features/
    cart/            # zustand store, hooks
    auth/            # supabase auth context/hooks
    products/        # queries (React Query hooks)
    categories/      # category tree CRUD hooks
    orders/
    discounts/
  lib/
    supabase.ts      # client init
    stripe.ts        # client-side Stripe.js loader
    types.ts         # generated Supabase types
    image.ts         # convertToWebp(file, quality, maxDimension) — canvas-based
                      # conversion util used by every admin upload flow
  supabase/
    migrations/      # SQL schema files
    functions/
      create-checkout-session/
      stripe-webhook/
  styles/
    tailwind.css
```

---

## Next steps
1. Confirm brand palette/accent color and target shipping regions/currency (US only vs international like Fumi's multi-currency).
2. Paste the Section 1 prompt into your AI IDE and let it scaffold — feed it Section 3's SQL directly for the Supabase migration.
3. I can generate the actual Supabase SQL migration file, the Stripe Edge Functions, or starter React components next if you want to go further right now.
