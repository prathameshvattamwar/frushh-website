import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Quiz from '../Quiz'

function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .eq('is_featured', true)
      .order('display_order')
      .limit(4)
    if (data) setProducts(data)
    setLoading(false)
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-white px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-6">
            <i className="fa-solid fa-leaf"></i>
            <span>100% Natural - No Whey Powder</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
            Fresh Protein Shakes
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-green-600 mb-6">Under ₹99!</p>
          <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
            Real ingredients. Real protein. Made fresh daily and delivered to your gym. No artificial supplements!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu" className="px-8 py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2">
              <i className="fa-solid fa-utensils"></i>
              View Menu
            </Link>
            <a href="#quiz" className="px-8 py-4 bg-white border-2 border-green-500 text-green-600 font-bold rounded-xl hover:bg-green-50 transition flex items-center justify-center gap-2">
              <i className="fa-solid fa-brain"></i>
              Daily Quiz
            </a>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="px-4 py-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fa-solid fa-certificate text-green-600 text-xl"></i>
              </div>
              <p className="font-bold text-gray-900">FSSAI Certified</p>
              <p className="text-sm text-gray-500">100% Safe</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fa-solid fa-clock text-green-600 text-xl"></i>
              </div>
              <p className="font-bold text-gray-900">Same Day</p>
              <p className="text-sm text-gray-500">Delivery</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fa-solid fa-leaf text-green-600 text-xl"></i>
              </div>
              <p className="font-bold text-gray-900">100% Natural</p>
              <p className="text-sm text-gray-500">No Whey</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fa-solid fa-dumbbell text-green-600 text-xl"></i>
              </div>
              <p className="font-bold text-gray-900">Up to 28g</p>
              <p className="text-sm text-gray-500">Protein</p>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Quiz Section */}
      <Quiz />

      {/* Featured Products */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Popular Shakes</h2>
            <Link to="/menu" className="text-green-600 font-medium hover:text-green-700">
              View All <i className="fa-solid fa-arrow-right ml-1"></i>
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <i className="fa-solid fa-spinner fa-spin text-3xl text-green-500"></i>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map(product => (
                <Link key={product.id} to={`/product/${product.slug}`} className="bg-white rounded-2xl p-4 hover:shadow-lg transition">
                  <div className="w-full aspect-square bg-green-50 rounded-xl flex items-center justify-center mb-3">
                    <i className={`fa-solid ${product.icon || 'fa-glass-water'} text-4xl text-green-500`}></i>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-green-600 font-bold">₹{product.price_250ml}</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {product.protein_250ml || 0}g protein
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subscription CTA */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs bg-green-500 px-2 py-1 rounded-full font-bold">SAVE UP TO ₹775</span>
                <h2 className="text-2xl font-bold mt-2 mb-2">Subscribe & Save</h2>
                <p className="text-gray-400">Get fresh shakes delivered daily to your gym</p>
              </div>
              <Link to="/subscriptions" className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition flex items-center gap-2">
                <i className="fa-solid fa-repeat"></i>
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-black text-green-600">1</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Choose Your Shake</h3>
              <p className="text-gray-500 text-sm">Pick from 10+ delicious flavors with real nutrition</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-black text-green-600">2</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Select Time & Gym</h3>
              <p className="text-gray-500 text-sm">Morning or evening delivery at your gym</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-black text-green-600">3</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Fresh Delivery</h3>
              <p className="text-gray-500 text-sm">Made fresh on delivery day, never stored</p>
            </div>
          </div>
        </div>
      </section>

      {/* Refer CTA */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 md:p-8 text-white text-center">
            <i className="fa-solid fa-gift text-4xl mb-4"></i>
            <h2 className="text-2xl font-bold mb-2">Refer & Earn ₹25!</h2>
            <p className="text-pink-100 mb-4">Share with friends. They save, you earn!</p>
            <Link to="/refer" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition">
              <i className="fa-solid fa-share-nodes"></i>
              Start Referring
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-glass-water text-white"></i>
                </div>
                <span className="text-xl font-black">FRUSHH</span>
              </div>
              <p className="text-gray-400 text-sm">Fresh protein shakes made with 100% natural ingredients. Delivered to your gym.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <Link to="/menu" className="block hover:text-white">Menu</Link>
                <Link to="/subscriptions" className="block hover:text-white">Subscriptions</Link>
                <Link to="/rewards" className="block hover:text-white">Rewards</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="https://wa.me/919271981229" className="block hover:text-white">WhatsApp Support</a>
                <Link to="/orders" className="block hover:text-white">Track Order</Link>
                <Link to="/refer" className="block hover:text-white">Refer & Earn</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Delivery Areas</h4>
              <p className="text-sm text-gray-400">Hadapsar, Pune</p>
              <p className="text-sm text-gray-400">Magarpatta, Amanora</p>
              <p className="text-sm text-gray-400 mt-4">More areas coming soon!</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 FRUSHH. Made with ❤️ in Pune</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
