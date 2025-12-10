import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useAuth } from './context/AuthContext'
import Quiz from './components/Quiz'
import LoginModal from './components/auth/LoginModal'

function App() {
  const [products, setProducts] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [addons, setAddons] = useState([])
  const [showUserMenu, setShowUserMenu] = useState(false)

  const { user, openLogin, logout } = useAuth()

  const whatsapp = "https://wa.me/919271638630?text=Hi!%20I%20want%20to%20order%20FRUSHH%20protein%20shake"

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .order('display_order', { ascending: true })

        if (productsData) setProducts(productsData)

        const { data: testimonialsData } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_featured', true)
          .order('display_order', { ascending: true })

        if (testimonialsData) setTestimonials(testimonialsData)

        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })

        if (categoriesData) setCategories(categoriesData)

        const { data: addonsData } = await supabase
          .from('addons')
          .select('*')
          .eq('is_available', true)
          .order('display_order', { ascending: true })

        if (addonsData) setAddons(addonsData)

        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [testimonials])

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  const productIcons = {
    'peanut-power': 'fa-solid fa-jar',
    'chocolate-muscle': 'fa-solid fa-mug-hot',
    'dry-fruit-deluxe': 'fa-solid fa-bowl-food',
    'muesli-energy': 'fa-solid fa-wheat-awn',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <i className="fa-solid fa-glass-water text-6xl text-green-500 mb-4 animate-pulse"></i>
          <p className="text-xl text-gray-600 font-medium">Loading FRUSHH...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      
      <LoginModal />

      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-glass-water text-2xl text-green-500"></i>
            <span className="text-xl font-black text-gray-800">FRUSHH</span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <i className="fa-solid fa-coins text-yellow-500"></i>
                  <span className="font-medium">50 pts</span>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user.name || 'Profile'}
                    </span>
                    <i className="fa-solid fa-chevron-down text-xs text-gray-400"></i>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-50">
                      <div className="p-2">
                        <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg w-full text-left">
                          <i className="fa-solid fa-user w-4"></i>
                          My Profile
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg w-full text-left">
                          <i className="fa-solid fa-receipt w-4"></i>
                          My Orders
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg w-full text-left">
                          <i className="fa-solid fa-coins w-4 text-yellow-500"></i>
                          Rewards
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg w-full text-left">
                          <i className="fa-solid fa-gift w-4 text-pink-500"></i>
                          Refer and Earn
                        </button>
                        <hr className="my-2" />
                        <button 
                          onClick={() => { logout(); setShowUserMenu(false); }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full text-left"
                        >
                          <i className="fa-solid fa-right-from-bracket w-4"></i>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={openLogin}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition"
              >
                <i className="fa-solid fa-user"></i>
                <span className="hidden sm:inline">Login</span>
              </button>
            )}

            
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
            >
              <i className="fa-brands fa-whatsapp"></i>
              <span className="hidden sm:inline">Order Now</span>
            </a>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-green-50 to-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            <i className="fa-solid fa-leaf mr-2"></i>
            100% Natural - No Whey Powder
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Fresh Protein Shakes</h1>
          <p className="text-3xl md:text-4xl font-black text-green-500 mb-6">Under Rs.99!</p>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Real ingredients. Real protein. Made fresh daily and delivered to your gym. No artificial supplements!
          </p>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white text-lg font-bold rounded-xl hover:bg-green-600 transition shadow-lg">
            <i className="fa-solid fa-glass-water"></i>
            Try First Shake @ Rs.49
          </a>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fa-solid fa-certificate text-green-600 text-xl"></i>
              </div>
              <p className="text-sm font-medium text-gray-700">FSSAI Certified</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fa-solid fa-clock text-green-600 text-xl"></i>
              </div>
              <p className="text-sm font-medium text-gray-700">Same Day Delivery</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fa-solid fa-leaf text-green-600 text-xl"></i>
              </div>
              <p className="text-sm font-medium text-gray-700">100% Natural</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fa-solid fa-dumbbell text-green-600 text-xl"></i>
              </div>
              <p className="text-sm font-medium text-gray-700">Up to 24g Protein</p>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-6 px-4 bg-white border-b">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${selectedCategory === category.slug ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <i className={category.icon}></i>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-8">Our Fresh Shakes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className={`${productIcons[product.slug] || 'fa-solid fa-glass-water'} text-3xl text-green-600`}></i>
                </div>
                <h3 className="text-lg font-bold text-center text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-500 text-center mb-4">{product.description}</p>
                <div className="flex justify-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">250ml</p>
                    <p className="font-bold text-green-600">Rs.{product.price_250ml}</p>
                    <p className="text-xs text-gray-500">{product.protein_250ml}g protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">350ml</p>
                    <p className="font-bold text-green-600">Rs.{product.price_350ml}</p>
                    <p className="text-xs text-gray-500">{product.protein_350ml}g protein</p>
                  </div>
                </div>
                <button onClick={() => { if (!user) { openLogin() } else { window.open(whatsapp, '_blank') } }} className="w-full py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2">
                  <i className="fa-solid fa-cart-plus"></i>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {addons.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-center text-gray-900 mb-2">Customize Your Shake</h2>
            <p className="text-center text-gray-500 mb-8">Add natural boosters to your shake</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {addons.map((addon) => (
                <div key={addon.id} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-green-50 transition cursor-pointer border-2 border-transparent hover:border-green-300">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <i className={`${addon.icon} text-green-600`}></i>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{addon.name}</p>
                  <p className="text-green-600 font-bold">+Rs.{addon.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-8">Subscription Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-2xl p-6">
              <div className="text-center mb-4">
                <i className="fa-solid fa-bolt text-yellow-400 text-3xl mb-2"></i>
                <h3 className="text-xl font-bold">Weekly Pack</h3>
                <p className="text-gray-400 text-sm">6 shakes per week</p>
              </div>
              <div className="text-center mb-4">
                <span className="text-4xl font-black">Rs.449</span>
                <span className="text-gray-400">/week</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm"><i className="fa-solid fa-check text-green-400"></i>250ml shakes (Mon-Sat)</li>
                <li className="flex items-center gap-2 text-sm"><i className="fa-solid fa-check text-green-400"></i>Change flavor daily</li>
                <li className="flex items-center gap-2 text-sm"><i className="fa-solid fa-check text-green-400"></i>1 skip day allowed</li>
              </ul>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-green-500 text-center font-bold rounded-lg hover:bg-green-600 transition">Subscribe Now</a>
            </div>
            <div className="bg-green-500 rounded-2xl p-6 transform md:-translate-y-4">
              <div className="text-center mb-4">
                <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full mb-2">MOST POPULAR</span>
                <i className="fa-solid fa-crown text-yellow-300 text-3xl mb-2 block"></i>
                <h3 className="text-xl font-bold">Monthly Pack</h3>
                <p className="text-green-100 text-sm">26 shakes per month</p>
              </div>
              <div className="text-center mb-4">
                <span className="text-4xl font-black">Rs.1799</span>
                <span className="text-green-100">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm"><i className="fa-solid fa-check text-yellow-300"></i>350ml shakes</li>
                <li className="flex items-center gap-2 text-sm"><i className="fa-solid fa-check text-yellow-300"></i>4 skip days per month</li>
                <li className="flex items-center gap-2 text-sm"><i className="fa-solid fa-check text-yellow-300"></i>5-day pause option</li>
                <li className="flex items-center gap-2 text-sm"><i className="fa-solid fa-check text-yellow-300"></i>Priority delivery</li>
              </ul>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-white text-green-600 text-center font-bold rounded-lg hover:bg-gray-100 transition">Subscribe Now</a>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6">
              <div className="text-center mb-4">
                <i className="fa-solid fa-glass-water text-blue-400 text-3xl mb-2"></i>
                <h3 className="text-xl font-bold">Try First</h3>
                <p className="text-gray-400 text-sm">Single shake trial</p>
              </div>
              <div className="text-center mb-4">
                <span className="text-4xl font-black">Rs.49</span>
                <span className="text-gray-400">/shake</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm"><i className="fa-solid fa-check text-green-400"></i>Any flavor</li>
                <li className="flex items-center gap-2 text-sm"><i className="fa-solid fa-check text-green-400"></i>250ml size</li>
                <li className="flex items-center gap-2 text-sm"><i className="fa-solid fa-check text-green-400"></i>No commitment</li>
              </ul>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-green-500 text-center font-bold rounded-lg hover:bg-green-600 transition">Order Now</a>
            </div>
          </div>
        </div>
      </section>

      <Quiz whatsapp={whatsapp} />

      {testimonials.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-8">What People Say</h2>
            <div className="max-w-2xl mx-auto">
              <div className="bg-green-50 rounded-2xl p-8 text-center">
                <div className="text-3xl mb-4">
                  <i className="fa-solid fa-star text-yellow-400"></i>
                  <i className="fa-solid fa-star text-yellow-400"></i>
                  <i className="fa-solid fa-star text-yellow-400"></i>
                  <i className="fa-solid fa-star text-yellow-400"></i>
                  <i className="fa-solid fa-star text-yellow-400"></i>
                </div>
                <p className="text-xl text-gray-700 italic mb-6">{testimonials[currentTestimonial] ? `"${testimonials[currentTestimonial].text}"` : ''}</p>
                <p className="font-bold text-gray-900">{testimonials[currentTestimonial]?.name}</p>
                <p className="text-sm text-gray-500">{testimonials[currentTestimonial]?.location}</p>
                <div className="flex justify-center gap-2 mt-6">
                  {testimonials.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentTestimonial(idx)} className={`w-2 h-2 rounded-full transition ${idx === currentTestimonial ? 'bg-green-500 w-6' : 'bg-gray-300'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-glass-water text-2xl text-green-400"></i>
                <span className="text-xl font-black">FRUSHH</span>
              </div>
              <p className="text-gray-400 text-sm">Fresh natural protein shakes delivered to your gym. 100% natural, no whey powder!</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="hover:text-white transition cursor-pointer">Menu</span></li>
                <li><span className="hover:text-white transition cursor-pointer">Subscription Plans</span></li>
                <li><span className="hover:text-white transition cursor-pointer">Rewards</span></li>
                <li><span className="hover:text-white transition cursor-pointer">Refer and Earn</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Delivery Areas</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Hadapsar</li>
                <li>Magarpatta</li>
                <li>Kharadi</li>
                <li>Viman Nagar</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact Us</h4>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition">
                <i className="fa-brands fa-whatsapp text-xl"></i>
                Chat on WhatsApp
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>2024 FRUSHH. Made with <i className="fa-solid fa-heart text-red-500"></i> in Pune</p>
          </div>
        </div>
      </footer>

      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition z-50">
        <i className="fa-brands fa-whatsapp text-white text-3xl"></i>
      </a>

      {showUserMenu && <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />}
    </div>
  )
}

export default App
