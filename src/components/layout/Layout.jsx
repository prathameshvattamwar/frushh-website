import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

function Layout({ children }) {
  const { user } = useAuth()
  const { cartCount } = useCart()
  const location = useLocation()

  const isAdminPage = location.pathname.startsWith('/admin')

  if (isAdminPage) {
    return children
  }

  const navItems = [
    { path: '/', icon: 'fa-house', label: 'Home' },
    { path: '/menu', icon: 'fa-utensils', label: 'Menu' },
    { path: '/cart', icon: 'fa-cart-shopping', label: 'Cart', badge: cartCount },
    { path: '/rewards', icon: 'fa-gift', label: 'Rewards' },
    { path: '/profile', icon: 'fa-user', label: 'Profile' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-glass-water text-white text-xl"></i>
              </div>
              <span className="text-xl font-black text-gray-900">FRUSHH</span>
            </NavLink>

            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/" className={({ isActive }) => `px-4 py-2 rounded-lg font-medium transition ${isActive ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}>Home</NavLink>
              <NavLink to="/menu" className={({ isActive }) => `px-4 py-2 rounded-lg font-medium transition ${isActive ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}>Menu</NavLink>
              <NavLink to="/orders" className={({ isActive }) => `px-4 py-2 rounded-lg font-medium transition ${isActive ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}>Orders</NavLink>
              <NavLink to="/rewards" className={({ isActive }) => `px-4 py-2 rounded-lg font-medium transition ${isActive ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}>Rewards</NavLink>
              <NavLink to="/refer" className={({ isActive }) => `px-4 py-2 rounded-lg font-medium transition ${isActive ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-100'}`}>Refer</NavLink>
            </nav>

            <div className="flex items-center gap-3">
              <NavLink to="/cart" className="hidden md:flex relative items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition">
                <i className="fa-solid fa-cart-shopping"></i>
                <span>Cart</span>
                {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{cartCount}</span>}
              </NavLink>

              {user ? (
                <NavLink to="/profile" className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition">
                  <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                  <span className="hidden md:inline max-w-24 truncate">{user.name || 'Profile'}</span>
                </NavLink>
              ) : (
                <NavLink to="/login" className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition">
                  <i className="fa-solid fa-user"></i>
                  <span>Login</span>
                </NavLink>
              )}

              {user?.is_admin && (
                <NavLink to="/admin" className="hidden md:flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 font-medium rounded-lg hover:bg-purple-200 transition">
                  <i className="fa-solid fa-shield-halved"></i>
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-140px)]">{children}</main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <NavLink key={item.path} to={item.path} className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition relative ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                <div className="relative">
                  <i className={`fa-solid ${item.icon} text-xl`}></i>
                  {item.badge > 0 && <span className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{item.badge > 9 ? '9+' : item.badge}</span>}
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>{item.label}</span>
                {isActive && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-green-500 rounded-full"></div>}
              </NavLink>
            )
          })}
        </div>
      </nav>

      <a href="https://wa.me/919271981229" target="_blank" rel="noopener noreferrer" className="fixed bottom-24 md:bottom-6 right-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition z-40">
        <i className="fa-brands fa-whatsapp text-white text-2xl"></i>
      </a>
    </div>
  )
}

export default Layout
