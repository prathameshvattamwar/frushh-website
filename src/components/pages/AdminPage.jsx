import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

function AdminPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ orders: 0, revenue: 0, users: 0, pending: 0 })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!user.is_admin) {
      navigate('/')
      return
    }
    fetchData()
  }, [user])

  async function fetchData() {
    try {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (ordersData) {
        setOrders(ordersData)
        const pending = ordersData.filter(o => o.status === 'pending').length
        const revenue = ordersData.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0)
        setStats(prev => ({ ...prev, orders: ordersData.length, pending, revenue }))
      }

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('display_order', { ascending: true })
      if (productsData) setProducts(productsData)

      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (usersData) {
        setUsers(usersData)
        setStats(prev => ({ ...prev, users: usersData.length }))
      }

      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    setUpdatingStatus(true)
    try {
      await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      await supabase
        .from('order_status_history')
        .insert({ order_id: orderId, status: newStatus, notes: `Status updated to ${newStatus}` })

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }))
      }
      
      // Update pending count
      const newPending = orders.filter(o => {
        if (o.id === orderId) return newStatus === 'pending'
        return o.status === 'pending'
      }).length
      setStats(prev => ({ ...prev, pending: newPending }))
      
      alert('Status updated!')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to update status')
    }
    setUpdatingStatus(false)
  }

  async function toggleProductAvailability(productId, currentStatus) {
    try {
      await supabase
        .from('products')
        .update({ is_available: !currentStatus })
        .eq('id', productId)

      setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_available: !currentStatus } : p))
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to update product')
    }
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

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    })
  }

  function formatDeliveryDate(dateString) {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short'
    })
  }

  if (!user || !user.is_admin) return null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-green-500"></i>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <h1 className="font-bold">FRUSHH Admin</h1>
              <p className="text-xs text-gray-400">Welcome, {user.name}</p>
            </div>
          </div>
          <a href="/" className="text-gray-400 hover:text-white">
            <i className="fa-solid fa-home text-xl"></i>
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-receipt text-blue-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.orders}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-clock text-yellow-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-indian-rupee-sign text-green-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">₹{stats.revenue}</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-users text-purple-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.users}</p>
                <p className="text-xs text-gray-500">Users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          <div className="flex border-b">
            <button onClick={() => setActiveTab('orders')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'orders' ? 'bg-green-50 text-green-600 border-b-2 border-green-500' : 'text-gray-500'}`}>
              <i className="fa-solid fa-receipt mr-2"></i>Orders
            </button>
            <button onClick={() => setActiveTab('products')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'products' ? 'bg-green-50 text-green-600 border-b-2 border-green-500' : 'text-gray-500'}`}>
              <i className="fa-solid fa-glass-water mr-2"></i>Products
            </button>
            <button onClick={() => setActiveTab('users')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'users' ? 'bg-green-50 text-green-600 border-b-2 border-green-500' : 'text-gray-500'}`}>
              <i className="fa-solid fa-users mr-2"></i>Users
            </button>
          </div>

          <div className="p-4">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                {selectedOrder ? (
                  <div>
                    <button onClick={() => setSelectedOrder(null)} className="text-green-600 font-medium mb-4 hover:text-green-700">
                      <i className="fa-solid fa-arrow-left mr-2"></i>Back to Orders
                    </button>
                    
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-4 border-b">
                        <div>
                          <p className="font-bold text-lg text-gray-900">#{selectedOrder.order_number}</p>
                          <p className="text-sm text-gray-500">{formatDate(selectedOrder.created_at)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status?.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pb-4 border-b">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Customer</p>
                          <p className="font-medium">{selectedOrder.customer_name}</p>
                          <p className="text-sm text-gray-600">{selectedOrder.customer_phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Delivery</p>
                          <p className="font-medium">{formatDeliveryDate(selectedOrder.delivery_date)}</p>
                          <p className="text-sm text-gray-600">{selectedOrder.delivery_slot}</p>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="mb-4 pb-4 border-b">
                        <p className="text-xs text-gray-500 mb-1">Delivery Address</p>
                        <p className="text-sm">{selectedOrder.delivery_address || 'N/A'}</p>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4 pb-4 border-b">
                        <p className="text-xs text-gray-500 mb-2">Order Items</p>
                        <div className="space-y-3">
                          {selectedOrder.items?.map((item, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {item.name} 
                                    <span className="text-gray-500 font-normal"> ({item.size})</span>
                                  </p>
                                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                  
                                  {/* Add-ons Display */}
                                  {item.addOns && item.addOns.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs text-gray-500 mb-1">Add-ons:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {item.addOns.map((addon, addonIdx) => (
                                          <span key={addonIdx} className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                                            <i className="fa-solid fa-plus text-[8px] mr-1"></i>
                                            {addon.name} (+₹{addon.price})
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <p className="font-bold text-gray-900">₹{item.itemPrice * item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Notes */}
                      {selectedOrder.order_notes && (
                        <div className="mb-4 pb-4 border-b">
                          <p className="text-xs text-gray-500 mb-1">Special Instructions</p>
                          <p className="text-sm bg-yellow-50 p-2 rounded">{selectedOrder.order_notes}</p>
                        </div>
                      )}

                      {/* Payment Summary */}
                      <div className="mb-4 pb-4 border-b">
                        <p className="text-xs text-gray-500 mb-2">Payment Summary</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>₹{selectedOrder.subtotal || selectedOrder.total}</span>
                          </div>
                          {selectedOrder.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount {selectedOrder.coupon_code && `(${selectedOrder.coupon_code})`}</span>
                              <span>-₹{selectedOrder.discount}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery</span>
                            <span className="text-green-600">FREE</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg pt-2 border-t">
                            <span>Total</span>
                            <span className="text-green-600">₹{selectedOrder.total}</span>
                          </div>
                        </div>
                      </div>

                      {/* Update Status */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                          {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map(status => (
                            <button
                              key={status}
                              onClick={() => updateOrderStatus(selectedOrder.id, status)}
                              disabled={updatingStatus || selectedOrder.status === status}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                selectedOrder.status === status
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              } disabled:opacity-50`}
                            >
                              {status.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Button */}
                    
                      href={`https://wa.me/91${selectedOrder.customer_phone?.replace(/\D/g, '')}?text=Hi ${selectedOrder.customer_name}, your FRUSHH order %23${selectedOrder.order_number} status: ${selectedOrder.status?.replace('_', ' ')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 bg-green-500 text-white font-bold rounded-xl text-center hover:bg-green-600 transition"
                    >
                      <i className="fa-brands fa-whatsapp mr-2"></i>Message Customer on WhatsApp
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No orders yet</p>
                    ) : (
                      orders.map(order => (
                        <button
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className="w-full bg-gray-50 rounded-xl p-4 text-left hover:bg-gray-100 transition"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-900">#{order.order_number}</p>
                              <p className="text-sm text-gray-500">{order.customer_name} • {formatDate(order.created_at)}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {order.items?.length || 0} items • {order.items?.reduce((sum, i) => sum + (i.addOns?.length || 0), 0) || 0} add-ons
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status?.replace('_', ' ')}
                              </span>
                              <p className="font-bold text-green-600 mt-1">₹{order.total}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-2">
                {products.map(product => (
                  <div key={product.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${product.is_available ? 'bg-green-100' : 'bg-gray-200'}`}>
                        <i className={`fa-solid ${product.icon || 'fa-glass-water'} ${product.is_available ? 'text-green-600' : 'text-gray-400'}`}></i>
                      </div>
                      <div>
                        <p className={`font-medium ${!product.is_available && 'text-gray-400'}`}>{product.name}</p>
                        <p className="text-sm text-gray-500">₹{product.price_250ml} / ₹{product.price_350ml}</p>
                        <p className="text-xs text-gray-400">{product.protein_250ml || 0}g protein</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleProductAvailability(product.id, product.is_available)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        product.is_available
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {product.is_available ? 'Available' : 'Unavailable'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-green-600">{u.name?.charAt(0) || 'U'}</span>
                      </div>
                      <div>
                        <p className="font-medium">{u.name || 'No name'}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{u.phone || 'No phone'}</p>
                      <p className="text-xs">{formatDate(u.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
