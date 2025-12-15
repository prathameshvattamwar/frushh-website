import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

function Layout({ children }) {
  const { user } = useAuth()
  const { cartCount } = useCart()
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')

  if (isAdminPage) return children

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
              <NavLink to="/" className={({ isActive }) => `px-4 py-2 rounded-lg font-medium ${isActive ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}>Home</NavLink>
              <NavLink to="/menu" className={({ isActive }) => `px-4 py-2 rounded-lg font-medium ${isActive ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}>Menu</NavLink>
              <NavLink to="/orders" className={({ isActive }) => `px-4 py-2 rounded-lg font-medium ${isActive ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}>Orders</NavLink>
              <NavLink to="/rewards" className={({ isActive }) => `px-4 py-2 rounded-lg font-medium ${isActive ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}>Rewards</NavLink>
              <NavLink to="/refer" className={({ isActive }) => `px-4 py-2 rounded-lg font-medium ${isActive ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-100'}`}>Refer</NavLink>
            </nav>

            <div className="flex items-center gap-2">
              <NavLink to="/cart" className="relative flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                <i className="fa-solid fa-cart-shopping"></i>
                <span className="hidden md:inline">Cart</span>
                {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{cartCount}</span>}
              </NavLink>
              {user ? (
                <NavLink to="/profile" className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                  <span className="hidden md:inline max-w-20 truncate">{user.name || 'Profile'}</span>
                </NavLink>
              ) : (
                <NavLink to="/login" className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium">Login</NavLink>
              )}
              {user?.is_admin && (
                <NavLink to="/admin" className="hidden md:flex px-3 py-2 bg-purple-100 text-purple-700 rounded-lg">
                  <i className="fa-solid fa-shield-halved"></i>
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around py-2">
          <NavLink to="/" className={`flex flex-col items-center py-1 ${location.pathname === '/' ? 'text-green-600' : 'text-gray-500'}`}>
            <i className="fa-solid fa-house text-xl"></i>
            <span className="text-xs mt-1">Home</span>
          </NavLink>
          <NavLink to="/menu" className={`flex flex-col items-center py-1 ${location.pathname.startsWith('/menu') || location.pathname.startsWith('/product') ? 'text-green-600' : 'text-gray-500'}`}>
            <i className="fa-solid fa-utensils text-xl"></i>
            <span className="text-xs mt-1">Menu</span>
          </NavLink>
          <NavLink to="/orders" className={`flex flex-col items-center py-1 ${location.pathname === '/orders' ? 'text-green-600' : 'text-gray-500'}`}>
            <i className="fa-solid fa-receipt text-xl"></i>
            <span className="text-xs mt-1">Orders</span>
          </NavLink>
          <NavLink to="/rewards" className={`flex flex-col items-center py-1 ${location.pathname === '/rewards' ? 'text-green-600' : 'text-gray-500'}`}>
            <i className="fa-solid fa-gift text-xl"></i>
            <span className="text-xs mt-1">Rewards</span>
          </NavLink>
          <NavLink to="/profile" className={`flex flex-col items-center py-1 ${location.pathname === '/profile' ? 'text-green-600' : 'text-gray-500'}`}>
            <i className="fa-solid fa-user text-xl"></i>
            <span className="text-xs mt-1">Profile</span>
          </NavLink>
        </div>
      </nav>

      {user?.is_admin && <NavLink to="/admin" className="md:hidden fixed bottom-24 left-4 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg z-40"><i className="fa-solid fa-shield-halved text-white text-xl"></i></NavLink>}

      <a href="https://wa.me/919271981229" target="_blank" rel="noopener noreferrer" className="fixed bottom-24 md:bottom-6 right-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-40"><i className="fa-brands fa-whatsapp text-white text-2xl"></i></a>
    </div>
  )
}

export default Layout
