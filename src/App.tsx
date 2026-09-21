import React from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import { AnnouncementBar } from './components/layout/AnnouncementBar'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { CartDrawer } from './components/layout/CartDrawer'
import { ToastContainer as Toast } from './components/ui/Toast'

// Storefront Pages
import Home from './pages/storefront/Home'
import Shop from './pages/storefront/Shop'
import CategoryPage from './pages/storefront/CategoryPage'
import ProductDetail from './pages/storefront/ProductDetail'
import Checkout from './pages/storefront/Checkout'
import Login from './pages/storefront/Login'
import Account from './pages/storefront/Account'
import Welcome from './pages/storefront/Welcome'

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminContent from './pages/admin/AdminContent'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminCollections from './pages/admin/AdminCollections'
import AdminDrops from './pages/admin/AdminDrops'
import AdminWaitlist from './pages/admin/AdminWaitlist'
function StorefrontLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Storefront */}
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/collections/:slug" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account/login" element={<Login />} />
            <Route path="/account" element={<Account />} />
            <Route path="/welcome" element={<Welcome />} />
          </Route>

          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="drops" element={<AdminDrops />} />
            <Route path="waitlist" element={<AdminWaitlist />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
