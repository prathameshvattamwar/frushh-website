import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Quiz from './components/Quiz'

function App() {
  const [products, setProducts] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [loading, setLoading] = useState(true)

  const whatsapp = "https://wa.me/919271981229?text=Hi!%20I%20want%20to%20order%20FRUSHH%20protein%20shake"

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .order('display_order')
        
        if (productsData) setProducts(productsData)

        // Fetch Testimonials
        const { data: testimonialsData } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_active', true)
          .order('display_order')
        
        if (testimonialsData) setTestimonials(testimonialsData)

        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Testimonial rotation
  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [testimonials])

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🥤</div>
          <div className="text-2xl font-bold text-green-600">Loading FRUSHH...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50">
      
      {/* Header */}
      <nav className="bg-white shadow-md p-4 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-green-600">🥤 FRUSHH</div>
          <div className="hidden md:flex gap-6">
            <a href="#menu" className="text-gray-600 hover:text-green-600 font-medium">Menu</a>
            <a href="#pricing" className="text-gray-600 hover:text-green-600 font-medium">Pricing</a>
            <a href="#contact" className="text-gray-600 hover:text-green-600 font-medium">Contact</a>
          </div>
          <a href={whatsapp} target="_blank" className="bg-green-500 text-white px-4 py-2 rounded-full font-bold hover:bg-green-600 transition">
            Order Now
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            ✨ 100% Natural • No Whey Powder
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
            Fresh Protein Shakes
          </h1>
          <h2 className="text-4xl md:text-6xl font-black text-green-600 mb-6">
            Under ₹99!
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Real ingredients. Real protein. Made fresh daily and delivered to your gym. No artificial supplements!
          </p>
          
          <a href={whatsapp} target="_blank" className="inline-block bg-green-500 text-white px-8 py-4 rounded-2xl text-xl font-bold hover:bg-green-600 hover:scale-105 transition-all shadow-lg">
            🥤 Try First Shake @ ₹49
          </a>

          <div className="flex flex-wrap justify-center gap-8 mt-12">
            <div className="text-center">
              <div className="text-4xl mb-2">🏅</div>
              <div className="text-sm text-gray-600 font-medium">FSSAI Certified</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">⏰</div>
              <div className="text-sm text-gray-600 font-medium">Same Day Delivery</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🌿</div>
              <div className="text-sm text-gray-600 font-medium">100% Natural</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💪</div>
              <div className="text-sm text-gray-600 font-medium">Up to 24g Protein</div>
            </div>
          </div>
        </div>
      </section>

      {/* USP Bar */}
      <section className="bg-green-600 py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-12 text-white text-sm md:text-base">
          <span className="font-semibold">💪 Up to 24g Protein</span>
          <span className="font-semibold">🚫 No Whey Powder</span>
          <span className="font-semibold">🏠 Homemade Fresh</span>
          <span className="font-semibold">💰 Under ₹99 Always</span>
        </div>
      </section>

      {/* Menu - FROM DATABASE */}
      <section id="menu" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-4">
            {products.length} Signature Flavors
          </h2>
          <p className="text-center text-gray-600 mb-12">Each shake made fresh with premium ingredients!</p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition">
                <div className="text-6xl mb-4">
                  {product.slug === 'peanut-power' && '🥜'}
                  {product.slug === 'chocolate-muscle' && '🍫'}
                  {product.slug === 'dry-fruit-deluxe' && '🌰'}
                  {product.slug === 'muesli-energy' && '🥣'}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{product.description}</p>
                <div className="flex justify-around border-t pt-4">
                  <div>
                    <div className="text-xs text-gray-400">250ml LITE</div>
                    <div className="font-bold text-green-600 text-lg">₹{product.price_250ml}</div>
                    <div className="text-xs text-gray-500">{product.protein_250ml}g protein</div>
                  </div>
                  <div className="w-px bg-gray-200"></div>
                  <div>
                    <div className="text-xs text-gray-400">350ml POWER</div>
                    <div className="font-bold text-green-600 text-lg">₹{product.price_350ml}</div>
                    <div className="text-xs text-gray-500">{product.protein_350ml}g protein</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">📱</div>
              <h3 className="text-xl font-bold text-green-600 mb-2">1. Order via WhatsApp</h3>
              <p className="text-gray-600">Send us a message with your shake choice and location</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">🥤</div>
              <h3 className="text-xl font-bold text-green-600 mb-2">2. We Prepare Fresh</h3>
              <p className="text-gray-600">Made in premium glass just before delivery</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">🏃</div>
              <h3 className="text-xl font-bold text-green-600 mb-2">3. Delivered to Gym</h3>
              <p className="text-gray-600">Get it between 7:30-9:00 PM after workout!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-4 bg-green-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-4">Subscription Plans</h2>
          <p className="text-center text-gray-600 mb-12">Subscribe and save up to ₹364 per month!</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Trial */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-2">Trial</h3>
              <p className="text-gray-500 text-sm mb-4">Try before you commit</p>
              <div className="text-5xl font-black text-green-600 mb-2">₹49</div>
              <p className="text-gray-500 mb-6">for first shake</p>
              <ul className="text-left text-gray-600 space-y-2 mb-6">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Any flavor</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Any size</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> No commitment</li>
              </ul>
              <a href={whatsapp} target="_blank" className="block w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition">
                Try Now
              </a>
            </div>

            {/* Weekly */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-xl border-4 border-green-400 transform md:scale-105">
              <div className="bg-green-500 text-white text-sm font-bold px-4 py-1 rounded-full inline-block mb-4">POPULAR</div>
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-2">Weekly Pack</h3>
              <p className="text-gray-500 text-sm mb-4">6 shakes per week</p>
              <div className="text-5xl font-black text-green-600 mb-2">₹569</div>
              <p className="text-gray-500 mb-2">for 350ml size</p>
              <p className="text-green-600 text-sm font-medium mb-6">Save ₹25 per shake!</p>
              <ul className="text-left text-gray-600 space-y-2 mb-6">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Daily flavor choice</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 1 skip day allowed</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> WhatsApp ordering</li>
              </ul>
              <a href={whatsapp} target="_blank" className="block w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition">
                Subscribe Now
              </a>
            </div>

            {/* Monthly */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="bg-amber-500 text-white text-sm font-bold px-4 py-1 rounded-full inline-block mb-4">BEST VALUE</div>
              <div className="text-5xl mb-4">👑</div>
              <h3 className="text-2xl font-bold mb-2">Monthly Pack</h3>
              <p className="text-gray-500 text-sm mb-4">26 shakes per month</p>
              <div className="text-5xl font-black text-green-600 mb-2">₹2199</div>
              <p className="text-gray-500 mb-2">for 350ml size</p>
              <p className="text-green-600 text-sm font-medium mb-6">Just ₹85 per shake!</p>
              <ul className="text-left text-gray-600 space-y-2 mb-6">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> FREE shaker bottle</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 3 skip days allowed</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 5-day pause option</li>
              </ul>
              <a href={whatsapp} target="_blank" className="block w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition">
                Subscribe Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Quiz */}
      <Quiz whatsapp={whatsapp} />
      
      {/* Testimonials - FROM DATABASE */}
      {testimonials.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-12">What People Say</h2>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-green-50 rounded-2xl p-8 text-center">
                <div className="text-3xl mb-4">⭐⭐⭐⭐⭐</div>
                <p className="text-xl text-gray-700 italic mb-6">"{testimonials[currentTestimonial]?.text}"</p>
                <p className="font-bold text-gray-900">{testimonials[currentTestimonial]?.name}</p>
                <p className="text-sm text-gray-500">{testimonials[currentTestimonial]?.location}</p>
                
                <div className="flex justify-center gap-2 mt-6">
                  {testimonials.map((_, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setCurrentTestimonial(idx)}
                      className={`h-2 rounded-full transition-all ${idx === currentTestimonial ? 'bg-green-500 w-6' : 'bg-gray-300 w-2'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 bg-green-50 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Ready to Get Fit?</h2>
        <p className="text-xl text-gray-600 mb-8">Try your first FRUSHH shake at just ₹49!</p>
        <a href={whatsapp} target="_blank" className="inline-block bg-green-500 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-green-600 hover:scale-105 transition-all shadow-lg">
          📱 Order on WhatsApp
        </a>
        <p className="text-gray-500 mt-4">Or call: +91 9271981229</p>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center md:text-left">
            <div>
              <div className="text-2xl font-bold mb-4">🥤 FRUSHH</div>
              <p className="text-gray-400 text-sm">Fresh natural protein shakes delivered to your gym. Made with love in Pune!</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#menu" className="hover:text-white">Menu</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>📱 +91 9271981229</li>
                <li>📧 hello@frushh.in</li>
                <li>📍 Hadapsar, Pune</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Delivery Areas</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Hadapsar</li>
                <li>Magarpatta</li>
                <li>Amanora</li>
                <li>Kharadi</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>FSSAI License: XXXXXXXXXX</p>
            <p className="mt-2">© 2026 FRUSHH. Made with 💚 in Pune</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href={whatsapp} 
        target="_blank" 
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-3xl shadow-lg hover:scale-110 hover:bg-green-600 transition-all z-50"
      >
        💬
      </a>
    </div>
  )
}

export default App
