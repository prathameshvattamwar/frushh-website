import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

function ProfilePage() {
  const navigate = useNavigate()
  const { user, updateProfile, logout } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // Profile data
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedGym, setSelectedGym] = useState('')
  const [birthday, setBirthday] = useState('')

  // Additional data
  const [gyms, setGyms] = useState([])
  const [addresses, setAddresses] = useState([])
  const [loyaltyPoints, setLoyaltyPoints] = useState(null)
  const [referralCode, setReferralCode] = useState('')
  const [stats, setStats] = useState({ orders: 0, totalSpent: 0 })

  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/profile' } })
      return
    }
    fetchData()
  }, [user])

  async function fetchData() {
    try {
      // Set user data
      setName(user.name || '')
      setPhone(user.phone?.replace('91', '') || '')
      setSelectedGym(user.preferred_gym || '')
      setBirthday(user.birthday || '')

      // Fetch gyms
      const { data: gymsData } = await supabase
        .from('gyms')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      if (gymsData) setGyms(gymsData)

      // Fetch addresses
      const { data: addressData } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
      if (addressData) setAddresses(addressData)

      // Fetch loyalty points
      const { data: pointsData } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (pointsData) setLoyaltyPoints(pointsData)

      // Fetch referral code
      const { data: referralData } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user.id)
        .single()
      if (referralData) setReferralCode(referralData.code)

      // Fetch order stats
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total')
        .eq('user_id', user.id)
        .eq('status', 'delivered')
      if (ordersData) {
        setStats({
          orders: ordersData.length,
          totalSpent: ordersData.reduce((sum, o) => sum + o.total, 0)
        })
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching profile data:', error)
      setLoading(false)
    }
  }

  async function handleSaveProfile() {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' })
      return
    }

    setSaving(true)
    setMessage({ type: '', text: '' })

    const result = await updateProfile({
      name: name.trim(),
      phone: phone ? `91${phone}` : null,
      preferred_gym: selectedGym,
      birthday: birthday || null
    })

    setSaving(false)

    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
    }
  }

  async function handleDeleteAddress(addressId) {
    if (!confirm('Delete this address?')) return

    await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId)

    setAddresses(prev => prev.filter(a => a.id !== addressId))
  }

  function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/')
    }
  }

  function getTierInfo(tier) {
    const tiers = {
      'bronze': { color: 'from-amber-600 to-amber-700', icon: 'fa-medal', next: 'Silver', pointsNeeded: 300 },
      'silver': { color: 'from-gray-400 to-gray-500', icon: 'fa-award', next: 'Gold', pointsNeeded: 700 },
      'gold': { color: 'from-yellow-400 to-yellow-500', icon: 'fa-crown', next: 'Platinum', pointsNeeded: 1500 },
      'platinum': { color: 'from-purple-400 to-purple-600', icon: 'fa-gem', next: null, pointsNeeded: null }
    }
    return tiers[tier] || tiers['bronze']
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-green-500 mb-4"></i>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  const tierInfo = getTierInfo(loyaltyPoints?.tier || 'bronze')

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 px-4 py-8 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{name || 'User'}</h1>
              <p className="text-green-100">{user.email}</p>
              {phone && <p className="text-green-100">+91 {phone}</p>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stats.orders}</p>
              <p className="text-xs text-green-100">Orders</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">₹{stats.totalSpent}</p>
              <p className="text-xs text-green-100">Spent</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{loyaltyPoints?.points_balance || 0}</p>
              <p className="text-xs text-green-100">Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-[60px] z-30">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'profile', label: 'Profile', icon: 'fa-user' },
              { id: 'addresses', label: 'Addresses', icon: 'fa-location-dot' },
              { id: 'rewards', label: 'Rewards', icon: 'fa-star' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {message.text && (
              <div className={`p-3 rounded-xl flex items-center gap-2 ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                {message.text}
              </div>
            )}

            <div className="bg-white rounded-2xl p-4">
              <h2 className="font-bold text-gray-900 mb-4">Personal Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-14 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Gym</label>
                  <select
                    value={selectedGym}
                    onChange={(e) => setSelectedGym(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white"
                  >
                    <option value="">Select your gym</option>
                    {gyms.map((gym) => (
                      <option key={gym.id} value={gym.name}>{gym.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Get 100 bonus points on your birthday!</p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition disabled:opacity-50"
                >
                  {saving ? (
                    <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Saving...</>
                  ) : (
                    <><i className="fa-solid fa-check mr-2"></i>Save Changes</>
                  )}
                </button>
              </div>
            </div>

            {/* Referral Code */}
            {referralCode && (
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Your Referral Code</p>
                    <p className="text-2xl font-bold">{referralCode}</p>
                  </div>
                  <Link to="/refer" className="px-4 py-2 bg-white text-purple-600 font-medium rounded-lg">
                    Share
                  </Link>
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-location-dot text-2xl text-gray-300"></i>
                </div>
                <p className="text-gray-500 mb-4">No saved addresses</p>
                <Link
                  to="/checkout"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-medium rounded-lg"
                >
                  <i className="fa-solid fa-plus"></i>
                  Add Address
                </Link>
              </div>
            ) : (
              <>
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-white rounded-2xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-location-dot text-green-600"></i>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{addr.label}</span>
                            {addr.is_default && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-gray-600">{addr.full_address}</p>
                          {addr.landmark && <p className="text-sm text-gray-400">{addr.landmark}</p>}
                          <p className="text-sm text-gray-400">{addr.area}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-red-500 hover:text-red-600 p-2"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-400 text-center">Add new addresses during checkout</p>
              </>
            )}
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="space-y-4">
            {/* Loyalty Card */}
            <div className={`bg-gradient-to-br ${tierInfo.color} rounded-2xl p-6 text-white`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-white/80">Your Tier</p>
                  <p className="text-2xl font-bold capitalize">{loyaltyPoints?.tier || 'Bronze'}</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <i className={`fa-solid ${tierInfo.icon} text-2xl`}></i>
                </div>
              </div>

              <div className="bg-white/20 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Points Balance</span>
                  <span className="text-2xl font-bold">{loyaltyPoints?.points_balance || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-white/80">
                  <span>Total Earned</span>
                  <span>{loyaltyPoints?.total_earned || 0} pts</span>
                </div>
              </div>

              {tierInfo.next && (
                <p className="text-sm text-white/80 mt-4 text-center">
                  {tierInfo.pointsNeeded - (loyaltyPoints?.total_earned || 0)} more points to {tierInfo.next}
                </p>
              )}
            </div>

            {/* How to Earn */}
            <div className="bg-white rounded-2xl p-4">
              <h3 className="font-bold text-gray-900 mb-4">How to Earn Points</h3>
              <div className="space-y-3">
                {[
                  { action: 'Sign up', points: 50, icon: 'fa-user-plus' },
                  { action: 'Complete profile', points: 25, icon: 'fa-user-check' },
                  { action: 'Each order', points: 10, icon: 'fa-bag-shopping' },
                  { action: 'Rate an order', points: 5, icon: 'fa-star' },
                  { action: 'Write a review', points: 10, icon: 'fa-pen' },
                  { action: 'Photo review', points: 15, icon: 'fa-camera' },
                  { action: 'Successful referral', points: 75, icon: 'fa-users' },
                  { action: 'Birthday bonus', points: 100, icon: 'fa-cake-candles' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <i className={`fa-solid ${item.icon} text-green-600 text-sm`}></i>
                      </div>
                      <span className="text-gray-700">{item.action}</span>
                    </div>
                    <span className="font-bold text-green-600">+{item.points}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* View Rewards */}
            <Link
              to="/rewards"
              className="block w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition text-center"
            >
              <i className="fa-solid fa-gift mr-2"></i>
              View Redeemable Rewards
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
