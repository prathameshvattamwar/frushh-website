import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

function OrderHistoryPage({ isOpen, onClose }) {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    if (user && isOpen) {
      fetchOrders()
    }
  }, [user, isOpen])

  async function fetchOrders() {
    setLoading(true)
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

  function getStatusColor(status) {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'confirmed': 'bg-blue-100 text-blue-700',
      'preparing': 'bg-purple-100 text-purple-700',
      'out_for_delivery': 'bg-orange-100 text-orange-700',
      'delivered': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  function getStatusIcon(status) {
    const icons = {
      'pending': 'fa-clock',
      'confirmed': 'fa-check',
      'preparing': 'fa-blender',
      'out_for_delivery': 'fa-motorcycle',
      'delivered': 'fa-circle-check',
      'cancelled': 'fa-times-circle'
    }
    return icons[status] || 'fa-circle'
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatStatus(status) {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white relative">
          <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30">
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-receipt text-2xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold">My Orders</h2>
              <p className="text-blue-100 text-sm">{orders.length} orders</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="text-center py-12">
              <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
              <p className="text-gray-500">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-bag-shopping text-4xl text-gray-300"></i>
              </div>
              <p className="text-gray-500 font-medium">No orders yet</p>
              <p className="text-gray-400 text-sm mt-1">Your orders will appear here</p>
              <button onClick={onClose} className="mt-4 px-6 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition">
                Order Now
              </button>
            </div>
          ) : selectedOrder ? (
            /* Order Details View */
            <div>
              <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-blue-500 font-medium mb-4 hover:text-blue-600">
                <i className="fa-solid fa-arrow-left"></i>
                Back to Orders
              </button>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-900">#{selectedOrder.order_number}</p>
                    <p className="text-sm text-gray-500">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    <i className={`fa-solid ${getStatusIcon(selectedOrder.status)} mr-1`}></i>
                    {formatStatus(selectedOrder.status)}
                  </span>
                </div>

                <div className="border-t pt-3 mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.size} x{item.quantity}</p>
                        {item.addons && item.addons.length > 0 && (
                          <p className="text-xs text-green-600">+{item.addons.join(', ')}</p>
                        )}
                      </div>
                      <p className="font-bold text-gray-900">Rs.{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>Rs.{selectedOrder.subtotal}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-Rs.{selectedOrder.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-green-600">Rs.{selectedOrder.total}</span>
                  </div>
                </div>

                {selectedOrder.delivery_address && (
                  <div className="border-t pt-3 mt-3">
                    <p className="text-sm text-gray-500 mb-1">
                      <i className="fa-solid fa-location-dot mr-2"></i>Delivery Address
                    </p>
                    <p className="text-gray-700">{selectedOrder.delivery_address}</p>
                  </div>
                )}

                {selectedOrder.delivery_slot && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">
                      <i className="fa-solid fa-clock mr-2"></i>Delivery Slot
                    </p>
                    <p className="text-gray-700">{selectedOrder.delivery_slot}</p>
                  </div>
                )}
              </div>

              {selectedOrder.status === 'delivered' && (
                <button className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition">
                  <i className="fa-solid fa-redo mr-2"></i>
                  Reorder
                </button>
              )}
            </div>
          ) : (
            /* Orders List View */
            <div className="space-y-3">
              {orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="w-full bg-gray-50 rounded-xl p-4 text-left hover:bg-gray-100 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-900">#{order.order_number}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      <i className={`fa-solid ${getStatusIcon(order.status)} mr-1`}></i>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {order.items ? order.items.length : 0} item(s)
                    </p>
                    <p className="font-bold text-green-600">Rs.{order.total}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderHistoryPage
