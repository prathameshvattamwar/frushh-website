import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

function CartPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cartItems, cartCount, cartSubtotal, cartTotalProtein, removeFromCart, updateQuantity, clearCart } = useCart()

  if (!user) {
    navigate('/login', { state: { from: '/cart' } })
    return null
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-cart-shopping text-4xl text-gray-300"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some delicious protein shakes!</p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition"
          >
            <i className="fa-solid fa-utensils"></i>
            Browse Menu
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-40">
      {/* Header */}
      <div className="bg-white border-b sticky top-[60px] z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-gray-900">Your Cart</h1>
              <p className="text-sm text-gray-500">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
            </div>
            <button
              onClick={clearCart}
              className="text-red-500 text-sm font-medium hover:text-red-600 flex items-center gap-1"
            >
              <i className="fa-solid fa-trash"></i>
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4">
              <div className="flex gap-4">
                {/* Icon */}
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className={`fa-solid ${item.icon || 'fa-glass-water'} text-2xl text-green-600`}></i>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.size} • {item.protein}g protein</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition p-1"
                    >
                      <i className="fa-solid fa-trash text-sm"></i>
                    </button>
                  </div>

                  {/* Add-ons */}
                  {item.addons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.addons.map((addon, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full"
                        >
                          +{addon.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                      >
                        <i className="fa-solid fa-minus text-xs"></i>
                      </button>
                      <span className="font-bold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition"
                      >
                        <i className="fa-solid fa-plus text-xs"></i>
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-green-600">₹{item.itemPrice * item.quantity}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-400">₹{item.itemPrice} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add More */}
        <Link
          to="/menu"
          className="block mt-4 p-4 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center hover:border-green-300 hover:bg-green-50 transition"
        >
          <i className="fa-solid fa-plus text-green-500 mr-2"></i>
          <span className="text-gray-600 font-medium">Add more items</span>
        </Link>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl p-4 mt-4">
          <h3 className="font-bold text-gray-900 mb-3">Order Summary</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal ({cartCount} items)</span>
              <span className="font-medium">₹{cartSubtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Protein</span>
              <span className="font-medium text-green-600">{cartTotalProtein}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span className="font-medium text-green-600">FREE</span>
            </div>
          </div>

          <div className="border-t mt-3 pt-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-2xl font-black text-green-600">₹{cartSubtotal}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Coupons can be applied at checkout</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <i className="fa-solid fa-truck text-green-500 text-lg mb-1"></i>
            <p className="text-xs text-gray-600">Free Delivery</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <i className="fa-solid fa-money-bill text-blue-500 text-lg mb-1"></i>
            <p className="text-xs text-gray-600">Cash on Delivery</p>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-black text-gray-900">₹{cartSubtotal}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600 font-medium">
                <i className="fa-solid fa-dumbbell mr-1"></i>
                {cartTotalProtein}g protein
              </p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2 text-lg"
          >
            <i className="fa-solid fa-arrow-right"></i>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartPage
