import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

function AdminPanel({ isOpen, onClose }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ orders: 0, revenue: 0, users: 0, products: 0 })
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    if (user?.is_admin && isOpen) {
      fetchAllData()
    }
  }, [user, isOpen])

  async function fetchAllData() {
    setLoading(true)
    await Promise.all([fetchStats(), fetchOrders(), fetchUsers(), fetchProducts()])
    setLoading(false)
  }

  async function fetchStats() {
    const { data: ordersData } = await supabase.from('orders').select('total, status')
    const { data: usersData } = await supabase.from('users').select('id')
    const { data: productsData } = await supabase.from('products').select('id')

    const revenue = ordersData?.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0) || 0

    setStats({
      orders: ordersData?.length || 0,
      revenue: revenue,
      users: usersData?.length || 0,
      products: productsData?.length || 0
    })
  }

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, users(name, phone)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setOrders(data)
  }

  async function fetchUsers() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setUsers(data)
  }

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('display_order', { ascending: true })
    if (data) setProducts(data)
  }

  async function updateOrderStatus(orderId, newStatus) {
    await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
    fetchOrders()
    fetchStats()
  }

  async function toggleProductAvailability(productId, currentStatus) {
    await supabase
      .from('products')
      .update({ is_available: !currentStatus })
      .eq('id', productId)
    fetchProducts()
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
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

  if (!isOpen) return null

  if (!user?.is_admin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <i className="fa-solid fa-lock text-5xl text-red-500 mb-4"></i>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-4">You don't have admin access.</p>
          <button onClick={onClose} className="px-6 py-2 bg-gray-100 rounded-lg font-medium">Close</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-shield-halved text-white text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">FRUSHH Admin</h1>
            <p className="text-xs text-gray-500">Manage your business</p>
          </div>
        </div>
        <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition">
          <i className="fa-solid fa-xmark mr-2"></i>Exit Admin
        </button>
      </div>

      <div className="flex h-[calc(100vh-60px)]">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm p-4">
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
              { id: 'orders', icon: 'fa-receipt', label: 'Orders' },
              { id: 'products', icon: 'fa-glass-water', label: 'Products' },
              { id: 'users', icon: 'fa-users', label: 'Users' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === tab.id ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <i className="fa-solid fa-spinner fa-spin text-4xl text-green-500"></i>
            </div>
          ) : (
            <>
              {/* Dashboard */}
              {activeTab === 'dashboard' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className="fa-solid fa-receipt text-blue-600 text-xl"></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Orders</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.orders}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <i className="fa-solid fa-indian-rupee-sign text-green-600 text-xl"></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Revenue</p>
                          <p className="text-2xl font-bold text-gray-900">₹{stats.revenue}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <i className="fa-solid fa-users text-purple-600 text-xl"></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Users</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <i className="fa-solid fa-glass-water text-orange-600 text-xl"></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Products</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Recent Orders</h3>
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">#{order.order_number}</p>
                            <p className="text-sm text-gray-500">{order.users?.name || 'Unknown'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₹{order.total}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Orders */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders ({orders.length})</h2>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Order</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Items</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <p className="font-medium">#{order.order_number}</p>
                              <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium">{order.users?.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{order.users?.phone}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm">{order.items?.length || 0} items</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-green-600">₹{order.total}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className="text-sm border rounded-lg px-2 py-1"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="preparing">Preparing</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Products */}
              {activeTab === 'products' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Products ({products.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div key={product.id} className={`bg-white rounded-xl p-4 shadow-sm ${!product.is_available ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-gray-900">{product.name}</h3>
                          <button
                            onClick={() => toggleProductAvailability(product.id, product.is_available)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${product.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {product.is_available ? 'Available' : 'Unavailable'}
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{product.description}</p>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-xs text-gray-400">250ml</p>
                            <p className="font-bold text-green-600">₹{product.price_250ml}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">350ml</p>
                            <p className="font-bold text-green-600">₹{product.price_350ml}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {activeTab === 'users' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Users ({users.length})</h2>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Phone</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Gym</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Joined</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                                  {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                  <p className="font-medium">{u.name || 'No name'}</p>
                                  <p className="text-xs text-gray-500">{u.email || 'No email'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">{u.phone}</td>
                            <td className="px-4 py-3 text-sm">{u.preferred_gym || '-'}</td>
                            <td className="px-4 py-3 text-sm">{u.created_at ? formatDate(u.created_at) : '-'}</td>
                            <td className="px-4 py-3">
                              {u.is_admin ? (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Admin</span>
                              ) : u.is_verified ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Verified</span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Pending</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
