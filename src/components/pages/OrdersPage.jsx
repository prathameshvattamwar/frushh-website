import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

function OrdersPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/orders' } })
      return
    }
    fetchOrders()
  }, [user])

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
    setLoading(false)
  }

  function getStatusConfig(status) {
    const config = {
      'pending': { color: 'bg-yellow-100 text-yellow-700', icon: 'fa-clock', label: 'Pending' },
      'confirmed': { color: 'bg-blue-100 text-blue-700', icon: 'fa-check', label: 'Confirmed' },
      'preparing': { color: 'bg-purple-100 text-purple-700', icon: 'fa-blender', label: 'Preparing' },
      'out_for_delivery': { color: 'bg-orange-100 text-orange-700', icon: 'fa-motorcycle', label: 'Out for Delivery' },
      'delivered': { color: 'bg-green-100 text-green-700', icon: 'fa-circle-check', label: 'Delivered' },
      'cancelled': { color: 'bg-red-100 text-red-700', icon: 'fa-times-circle', label: 'Cancelled' }
    }
    return config[status] || config['pending']
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatDeliveryDate(dateString) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-green-500 mb-4"></i>
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky top-[60px] z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-black text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {orders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-receipt text-4xl text-gray-300"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Your order history will appear here</p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition"
            >
              <i className="fa-solid fa-utensils"></i>
              Browse Menu
            </Link>
          </div>
        ) : selectedOrder ? (
          /* Order Detail View */
          <div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="flex items-center gap-2 text-green-600 font-medium mb-4 hover:text-green-700"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Back to Orders
            </button>

            {/* Order Header */}
            <div className="bg-white rounded-2xl p-4 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="text-xl font-black text-gray-900">#{selectedOrder.order_number}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusConfig(selectedOrder.status).color}`}>
                  <i className={`fa-solid ${getStatusConfig(selectedOrder.status).icon}`}></i>
                  {getStatusConfig(selectedOrder.status).label}
                </span>
              </div>

              {/* Status Timeline */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Order Status</p>
                <div className="flex items-center justify-between">
                  {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].map((status, idx) => {
                    const isCompleted = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']
                      .indexOf(selectedOrder.status) >= idx
                    const isCurrent = selectedOrder.status === status
                    
                    return (
                      <div key={status} className="flex flex-col items-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                          <i className={`fa-solid ${getStatusConfig(status).icon} text-xs`}></i>
                        </div>
                        <p className={`text-[10px] mt-1 text-center ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                          {getStatusConfig(status).label.split(' ')[0]}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-2xl p-4 mb-4">
              <h3 className="font-bold text-gray-900 mb-3">Delivery Details</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-location-dot text-green-500 mt-1"></i>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-900">{selectedOrder.delivery_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-clock text-green-500 mt-1"></i>
                  <div>
                    <p className="text-sm text-gray-500">Delivery Slot</p>
                    <p className="text-gray-900">{selectedOrder.delivery_slot}</p>
                  </div>
                </div>
                {selectedOrder.delivery_date && (
                  <div className="flex items-start gap-3">
                    <i className="fa-solid fa-calendar text-green-500 mt-1"></i>
                    <div>
                      <p className="text-sm text-gray-500">Delivery Date</p>
                      <p className="text-gray-900">{formatDeliveryDate(selectedOrder.delivery_date)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl p-4 mb-4">
              <h3 className="font-bold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <i className={`fa-solid ${item.icon || 'fa-glass-water'} text-green-600`}></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.size} × {item.quantity}</p>
                        {item.addons && item.addons.length > 0 && (
                          <p className="text-xs text-green-600">+{item.addons.map(a => a.name).join(', ')}</p>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">₹{item.itemPrice * item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl p-4 mb-4">
              <h3 className="font-bold text-gray-900 mb-3">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({selectedOrder.discount_code})</span>
                    <span>-₹{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-green-600">₹{selectedOrder.total}</span>
                </div>
              </div>
              
              {selectedOrder.points_earned > 0 && (
                <div className="mt-3 p-2 bg-yellow-50 rounded-lg flex items-center gap-2">
                  <i className="fa-solid fa-star text-yellow-500"></i>
                  <span className="text-sm text-yellow-700">+{selectedOrder.points_earned} points earned</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedOrder.status === 'delivered' && (
              <div className="space-y-2">
                <button
                  className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-rotate"></i>
                  Reorder
                </button>
                <button className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2">
                  <i className="fa-solid fa-star"></i>
                  Rate Order
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-3">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status)
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="w-full bg-white rounded-2xl p-4 text-left hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-900">#{order.order_number}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                      <i className={`fa-solid ${statusConfig.icon}`}></i>
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {order.items && order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center border-2 border-white">
                            <i className={`fa-solid ${item.icon || 'fa-glass-water'} text-green-600 text-xs`}></i>
                          </div>
                        ))}
                        {order.items && order.items.length > 3 && (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white">
                            <span className="text-xs text-gray-500">+{order.items.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0} items
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{order.total}</p>
                      <i className="fa-solid fa-chevron-right text-gray-400 text-sm"></i>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage
