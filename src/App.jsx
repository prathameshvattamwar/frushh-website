import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Layout from './components/layout/Layout'
import HomePage from './components/pages/HomePage'
import LoginPage from './components/pages/LoginPage'
import MenuPage from './components/pages/MenuPage'
import ProductDetailPage from './components/pages/ProductDetailPage'
import CartPage from './components/pages/CartPage'
import CheckoutPage from './components/pages/CheckoutPage'
import OrderSuccessPage from './components/pages/OrderSuccessPage'
import OrdersPage from './components/pages/OrdersPage'
import ProfilePage from './components/pages/ProfilePage'
import RewardsPage from './components/pages/RewardsPage'
import ReferPage from './components/pages/ReferPage'
import SubscriptionsPage from './components/pages/SubscriptionsPage'
import QuizPage from './components/pages/QuizPage'
import AdminPage from './components/pages/AdminPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <i className="fa-solid fa-glass-water text-5xl text-green-500 animate-pulse"></i>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/menu" element={<Layout><MenuPage /></Layout>} />
      <Route path="/quiz" element={<Layout><QuizPage /></Layout>} />
      <Route path="/product/:slug" element={<Layout><ProtectedRoute><ProductDetailPage /></ProtectedRoute></Layout>} />
      <Route path="/cart" element={<Layout><ProtectedRoute><CartPage /></ProtectedRoute></Layout>} />
      <Route path="/checkout" element={<Layout><ProtectedRoute><CheckoutPage /></ProtectedRoute></Layout>} />
      <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
      <Route path="/orders" element={<Layout><ProtectedRoute><OrdersPage /></ProtectedRoute></Layout>} />
      <Route path="/profile" element={<Layout><ProtectedRoute><ProfilePage /></ProtectedRoute></Layout>} />
      <Route path="/rewards" element={<Layout><ProtectedRoute><RewardsPage /></ProtectedRoute></Layout>} />
      <Route path="/refer" element={<Layout><ProtectedRoute><ReferPage /></ProtectedRoute></Layout>} />
      <Route path="/subscriptions" element={<Layout><ProtectedRoute><SubscriptionsPage /></ProtectedRoute></Layout>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  )
}

function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-2">404</h1>
        <p className="text-gray-500 mb-4">Page not found</p>
        <a href="/" className="text-green-600 font-medium">Back to Home</a>
      </div>
    </div>
  )
}

export default App
