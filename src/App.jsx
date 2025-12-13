import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layout
import Layout from './components/layout/Layout'

// Pages
import HomePage from './components/pages/HomePage'
import LoginPage from './components/pages/LoginPage'
import MenuPage from './components/pages/MenuPage'
import ProductDetailPage from './components/pages/ProductDetailPage'
import CartPage from './components/pages/CartPage'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-glass-water text-5xl text-green-500 animate-pulse mb-4"></i>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Routes with Layout */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/menu" element={<Layout><MenuPage /></Layout>} />
      
      {/* Protected Routes */}
      <Route path="/product/:slug" element={
        <Layout>
          <ProtectedRoute>
            <ProductDetailPage />
          </ProtectedRoute>
        </Layout>
      } />
      
      <Route path="/cart" element={
        <Layout>
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        </Layout>
      } />

      {/* Placeholder Routes - Will create tomorrow */}
      <Route path="/checkout" element={
        <Layout>
          <ProtectedRoute>
            <ComingSoon title="Checkout" />
          </ProtectedRoute>
        </Layout>
      } />

      <Route path="/orders" element={
        <Layout>
          <ProtectedRoute>
            <ComingSoon title="My Orders" />
          </ProtectedRoute>
        </Layout>
      } />

      <Route path="/rewards" element={
        <Layout>
          <ProtectedRoute>
            <ComingSoon title="Rewards" />
          </ProtectedRoute>
        </Layout>
      } />

      <Route path="/refer" element={
        <Layout>
          <ProtectedRoute>
            <ComingSoon title="Refer & Earn" />
          </ProtectedRoute>
        </Layout>
      } />

      <Route path="/subscriptions" element={
        <Layout>
          <ProtectedRoute>
            <ComingSoon title="Subscriptions" />
          </ProtectedRoute>
        </Layout>
      } />

      <Route path="/profile" element={
        <Layout>
          <ProtectedRoute>
            <ComingSoon title="Profile" />
          </ProtectedRoute>
        </Layout>
      } />

      <Route path="/admin/*" element={
        <ProtectedRoute>
          <ComingSoon title="Admin Panel" isAdmin />
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  )
}

// Coming Soon Component (Temporary)
function ComingSoon({ title, isAdmin }) {
  return (
    <div className={`min-h-[70vh] flex items-center justify-center px-4 ${isAdmin ? 'bg-gray-100' : ''}`}>
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-hammer text-3xl text-green-500"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 mb-4">This page is coming soon!</p>
        <a href="/" className="text-green-600 font-medium hover:text-green-700">
          <i className="fa-solid fa-arrow-left mr-2"></i>
          Back to Home
        </a>
      </div>
    </div>
  )
}

// 404 Component
function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-exclamation-triangle text-3xl text-red-500"></i>
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">404</h1>
        <p className="text-gray-500 mb-4">Page not found</p>
        <a href="/" className="text-green-600 font-medium hover:text-green-700">
          <i className="fa-solid fa-arrow-left mr-2"></i>
          Back to Home
        </a>
      </div>
    </div>
  )
}

export default App
