import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function OrderSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { orderNumber, total, whatsappUrl, pointsEarned } = location.state || {}

  useEffect(() => {
    if (!orderNumber) {
      navigate('/')
    }
  }, [orderNumber, navigate])

  if (!orderNumber) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <i className="fa-solid fa-check text-white text-5xl"></i>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500">Your fresh protein shake is on its way</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="text-2xl font-black text-gray-900">#{orderNumber}</p>
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl mb-4">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-black text-green-600">₹{total}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Payment</p>
              <p className="font-medium text-gray-900">Cash on Delivery</p>
            </div>
          </div>

          {/* Points Earned */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-star text-white"></i>
              </div>
              <div>
                <p className="font-bold text-yellow-800">+{pointsEarned} Points Earned!</p>
                <p className="text-sm text-yellow-600">Added to your rewards balance</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Confirm Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2 text-lg mb-3"
          >
            <i className="fa-brands fa-whatsapp text-2xl"></i>
            Confirm on WhatsApp
          </a>
          <p className="text-xs text-gray-400 text-center">
            Click above to send your order details to us on WhatsApp
          </p>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
          <h3 className="font-bold text-gray-900 mb-4">What's Next?</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Order Confirmation</p>
                <p className="text-sm text-gray-500">We'll confirm your order on WhatsApp</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Fresh Preparation</p>
                <p className="text-sm text-gray-500">Your shake will be made fresh on delivery day</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Delivery</p>
                <p className="text-sm text-gray-500">We'll deliver to your location in your selected slot</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/orders"
            className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-receipt"></i>
            View My Orders
          </Link>
          
          <Link
            to="/menu"
            className="w-full py-3 bg-white text-green-600 font-medium rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 border border-green-200"
          >
            <i className="fa-solid fa-utensils"></i>
            Order More
          </Link>
        </div>

        {/* Refer & Earn CTA */}
        <div className="mt-6 p-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-white text-center">
          <p className="font-bold mb-1">Share & Earn ₹25!</p>
          <p className="text-sm text-white/80 mb-3">Invite friends, both get ₹25 off</p>
          <Link
            to="/refer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-100 transition"
          >
            <i className="fa-solid fa-gift"></i>
            Refer Now
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage
