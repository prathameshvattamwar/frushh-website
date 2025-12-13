import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

function SubscriptionsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState([])
  const [userSub, setUserSub] = useState(null)
  const [products, setProducts] = useState([])
  const [activeTab, setActiveTab] = useState('plans')

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/subscriptions' } })
      return
    }
    fetchData()
  }, [user])

  async function fetchData() {
    try {
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })
      if (plansData) setPlans(plansData)

      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()
      if (subData) setUserSub(subData)

      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, icon')
        .eq('is_available', true)
      if (productsData) setProducts(productsData)

      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  function getPlanIcon(name) {
    if (name.includes('Weekly Starter')) return 'fa-bolt'
    if (name.includes('Monthly')) return 'fa-crown'
    if (name.includes('Pro')) return 'fa-star'
    return 'fa-repeat'
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-green-500"></i>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 px-4 py-8 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-repeat text-2xl"></i>
          </div>
          <h1 className="text-3xl font-black mb-2">Subscriptions</h1>
          <p className="text-gray-400">Save more with daily fresh shakes</p>
        </div>
      </div>

      <div className="bg-white border-b sticky top-[60px] z-30">
        <div className="max-w-2xl mx-auto px-4 flex">
          <button onClick={() => setActiveTab('plans')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'plans' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'}`}>
            <i className="fa-solid fa-tags mr-2"></i>Plans
          </button>
          <button onClick={() => setActiveTab('my-sub')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'my-sub' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'}`}>
            <i className="fa-solid fa-user-check mr-2"></i>My Subscription
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'plans' && (
          <div className="space-y-4">
            {plans.map((plan, idx) => {
              const isPopular = plan.name.includes('Monthly')
              return (
                <div key={plan.id} className={`bg-white rounded-2xl overflow-hidden ${isPopular ? 'ring-2 ring-green-500' : 'border border-gray-200'}`}>
                  {isPopular && (
                    <div className="bg-green-500 text-white text-center py-1 text-sm font-bold">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <i className={`fa-solid ${getPlanIcon(plan.name)} ${isPopular ? 'text-green-500' : 'text-gray-400'}`}></i>
                          <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500">{plan.shakes_count} shakes / {plan.duration_days} days</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-green-600">₹{plan.price}</p>
                        {plan.savings > 0 && (
                          <p className="text-sm text-green-600 font-medium">Save ₹{plan.savings}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {plan.features && plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <i className="fa-solid fa-check text-green-500"></i>
                          <span className="text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => alert('Subscription checkout coming soon! Contact us on WhatsApp to subscribe.')}
                      className={`w-full py-3 font-bold rounded-xl transition ${
                        isPopular
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Subscribe Now
                    </button>
                  </div>
                </div>
              )
            })}

            <div className="bg-green-50 rounded-2xl p-4 mt-6">
              <h3 className="font-bold text-gray-900 mb-3">Subscription Benefits</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-indian-rupee-sign text-green-500"></i>
                  <span>Save up to ₹775</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-shuffle text-green-500"></i>
                  <span>Change flavor daily</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-pause text-green-500"></i>
                  <span>Pause anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-calendar-xmark text-green-500"></i>
                  <span>Skip days allowed</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4">
              <h3 className="font-bold text-gray-900 mb-3">How It Works</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-green-600 text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Choose a Plan</p>
                    <p className="text-sm text-gray-500">Select weekly or monthly based on your needs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-green-600 text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Set Your Preferences</p>
                    <p className="text-sm text-gray-500">Pick delivery time and your favorite flavors</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-green-600 text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Get Daily Deliveries</p>
                    <p className="text-sm text-gray-500">Fresh shake delivered to your gym every day</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'my-sub' && (
          <div>
            {userSub ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-white/80">Active Plan</p>
                      <p className="text-2xl font-bold">{userSub.plan?.name}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-check text-2xl"></i>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/80">Started</p>
                      <p className="font-medium">{formatDate(userSub.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-white/80">Ends</p>
                      <p className="font-medium">{formatDate(userSub.end_date)}</p>
                    </div>
                    <div>
                      <p className="text-white/80">Remaining</p>
                      <p className="font-medium">{userSub.remaining_shakes} shakes</p>
                    </div>
                    <div>
                      <p className="text-white/80">Status</p>
                      <p className="font-medium capitalize">{userSub.status}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-3 bg-gray-100 rounded-xl text-center hover:bg-gray-200 transition">
                      <i className="fa-solid fa-pause text-gray-600 mb-1"></i>
                      <p className="text-sm font-medium">Pause</p>
                    </button>
                    <button className="p-3 bg-gray-100 rounded-xl text-center hover:bg-gray-200 transition">
                      <i className="fa-solid fa-calendar-xmark text-gray-600 mb-1"></i>
                      <p className="text-sm font-medium">Skip Day</p>
                    </button>
                    <button className="p-3 bg-gray-100 rounded-xl text-center hover:bg-gray-200 transition">
                      <i className="fa-solid fa-shuffle text-gray-600 mb-1"></i>
                      <p className="text-sm font-medium">Change Flavor</p>
                    </button>
                    <button className="p-3 bg-gray-100 rounded-xl text-center hover:bg-gray-200 transition">
                      <i className="fa-solid fa-headset text-gray-600 mb-1"></i>
                      <p className="text-sm font-medium">Support</p>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-repeat text-3xl text-gray-300"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Subscription</h2>
                <p className="text-gray-500 mb-6">Subscribe to get daily fresh shakes at the best prices!</p>
                <button
                  onClick={() => setActiveTab('plans')}
                  className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition"
                >
                  <i className="fa-solid fa-tags mr-2"></i>
                  View Plans
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionsPage
