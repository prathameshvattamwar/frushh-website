import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()

  const [featuredProducts, setFeaturedProducts] = useState([])
  const [subscriptionPlans, setSubscriptionPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      // Fetch featured products
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .limit(4)

      if (products) setFeaturedProducts(products)

      // Fetch subscription plans
      const { data: plans } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (plans) setSubscriptionPlans(plans)

      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  function handleAction(action) {
    if (!user) {
      navigate('/login', { state: { from: '/' } })
      return
    }
    action()
  }

  const usps = [
    { icon: 'fa-certificate', title: 'FSSAI Certified', desc: '100% Safe' },
    { icon: 'fa-clock', title: 'Same Day', desc: 'Delivery' },
    { icon: 'fa-leaf', title: '100% Natural', desc: 'No Whey' },
    { icon: 'fa-dumbbell', title: 'Up to 28g', desc: 'Protein' },
  ]

  const howItWorks = [
    { icon: 'fa-mobile-screen', title: 'Choose', desc: 'Pick your favorite shake' },
    { icon: 'fa-plus-circle', title: 'Customize', desc: 'Add natural boosters' },
    { icon: 'fa-motorcycle', title: 'Deliver', desc: 'Fresh to your gym' },
    { icon: 'fa-face-smile', title: 'Enjoy', desc: 'Fuel your workout' },
  ]

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-glass-water text-5xl text-green-500 animate-pulse mb-4"></i>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-green-50 py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
              <i className="fa-solid fa-leaf"></i>
              100% Natural - No Whey Powder
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4">
              Fresh Protein Shakes
            </h1>
            
            <p className="text-3xl md:text-4xl font-black text-green-500 mb-6">
              Under ₹99!
            </p>
            
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
              Real ingredients. Real protein. Made fresh daily and delivered to your gym. No artificial supplements!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleAction(() => navigate('/menu'))}
                className="w-full sm:w-auto px-8 py-4 bg-green-500 text-white text-lg font-bold rounded-xl hover:bg-green-600 transition shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-utensils"></i>
                View Menu
              </button>
              <button
                onClick={() => handleAction(() => navigate('/menu'))}
                className="w-full sm:w-auto px-8 py-4 bg-white text-green-600 text-lg font-bold rounded-xl hover:bg-gray-50 transition border-2 border-green-500 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-glass-water"></i>
                Try @ ₹49
              </button>
            </div>
          </div>

          {/* USPs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
            {usps.map((usp, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <i className={`fa-solid ${usp.icon} text-green-600 text-xl`}></i>
                </div>
                <p className="font-bold text-gray-900 text-sm">{usp.title}</p>
                <p className="text-xs text-gray-500">{usp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Popular Shakes</h2>
              <p className="text-gray-500">Our customer favorites</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-gray-50 rounded-2xl p-4 hover:shadow-lg transition">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <i className={`fa-solid ${product.icon || 'fa-glass-water'} text-2xl text-green-600`}></i>
                  </div>
                  <h3 className="font-bold text-gray-900 text-center text-sm mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 text-center mb-3 line-clamp-2">{product.description}</p>
                  <div className="text-center mb-3">
                    <span className="text-lg font-black text-green-600">₹{product.price_250ml}</span>
                    <span className="text-xs text-gray-400 ml-1">/ 250ml</span>
                  </div>
                  <button
                    onClick={() => handleAction(() => navigate(`/product/${product.slug}`))}
                    className="w-full py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition"
                  >
                    <i className="fa-solid fa-plus mr-1"></i>
                    Add
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-6 py-3 text-green-600 font-medium hover:text-green-700 transition"
              >
                View All Products
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">How It Works</h2>
            <p className="text-gray-500">Simple. Fresh. Delivered.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {howItWorks.map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="relative inline-block">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/30">
                    <i className={`fa-solid ${step.icon} text-white text-2xl`}></i>
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-green-600 shadow">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      {subscriptionPlans.length > 0 && (
        <section className="py-12 px-4 bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black mb-2">Save More with Subscription</h2>
              <p className="text-gray-400">Daily fresh shakes at best prices</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {subscriptionPlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`rounded-2xl p-6 relative ${plan.is_popular ? 'bg-green-500 transform md:-translate-y-4' : 'bg-gray-800'}`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-4 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <i className={`fa-solid ${plan.icon || 'fa-star'} text-3xl mb-2 ${plan.is_popular ? 'text-yellow-300' : 'text-green-400'}`}></i>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className={`text-sm ${plan.is_popular ? 'text-green-100' : 'text-gray-400'}`}>
                      {plan.total_deliveries} shakes / {plan.duration_days} days
                    </p>
                  </div>

                  <div className="text-center mb-4">
                    <span className="text-4xl font-black">₹{plan.price}</span>
                    {plan.savings > 0 && (
                      <span className={`block text-sm ${plan.is_popular ? 'text-green-100' : 'text-green-400'}`}>
                        Save ₹{plan.savings}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features && plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <i className={`fa-solid fa-check ${plan.is_popular ? 'text-yellow-300' : 'text-green-400'}`}></i>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleAction(() => navigate('/subscriptions'))}
                    className={`w-full py-3 font-bold rounded-xl transition ${
                      plan.is_popular 
                        ? 'bg-white text-green-600 hover:bg-gray-100' 
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    Subscribe Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Refer & Earn */}
      <section className="py-12 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-gift text-3xl"></i>
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-2">Refer & Earn</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Share FRUSHH with friends. They get ₹25 off, you get ₹25 off on your next order!
          </p>
          <button
            onClick={() => handleAction(() => navigate('/refer'))}
            className="px-8 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition"
          >
            Start Referring
          </button>
        </div>
      </section>

      {/* Delivery Areas */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Delivery Areas</h2>
          <p className="text-gray-500 mb-6">Currently serving Hadapsar & Fursungi, Pune</p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {['Hadapsar', 'Fursungi', 'Magarpatta', 'Amanora'].map((area) => (
              <span key={area} className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium">
                <i className="fa-solid fa-location-dot mr-2"></i>
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-glass-water text-white"></i>
                </div>
                <span className="text-xl font-black">FRUSHH</span>
              </div>
              <p className="text-gray-400 text-sm">
                Fresh protein shakes delivered to your gym. 100% natural!
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/menu" className="hover:text-white transition">Menu</Link></li>
                <li><Link to="/subscriptions" className="hover:text-white transition">Subscriptions</Link></li>
                <li><Link to="/rewards" className="hover:text-white transition">Rewards</Link></li>
                <li><Link to="/refer" className="hover:text-white transition">Refer & Earn</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="hover:text-white transition cursor-pointer">FAQs</span></li>
                <li><span className="hover:text-white transition cursor-pointer">Contact Us</span></li>
                <li><span className="hover:text-white transition cursor-pointer">Terms</span></li>
                <li><span className="hover:text-white transition cursor-pointer">Privacy</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <a 
                href="https://wa.me/919271981229" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 rounded-lg text-sm font-medium hover:bg-green-600 transition"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i>
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>© 2026 FRUSHH. Made with <i className="fa-solid fa-heart text-red-500"></i> in Pune</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
