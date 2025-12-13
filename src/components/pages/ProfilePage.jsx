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
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedGym, setSelectedGym] = useState('')
  const [birthday, setBirthday] = useState('')
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
      setName(user.name || '')
      setPhone(user.phone ? user.phone.replace('91', '') : '')
      setSelectedGym(user.preferred_gym || '')
      setBirthday(user.birthday || '')

      const { data: gymsData } = await supabase.from('gyms').select('*').eq('is_active', true).order('display_order')
      if (gymsData) setGyms(gymsData)

      const { data: addressData } = await supabase.from('user_addresses').select('*').eq('user_id', user.id)
      if (addressData) setAddresses(addressData)

      const { data: pointsData } = await supabase.from('loyalty_points').select('*').eq('user_id', user.id).single()
      if (pointsData) setLoyaltyPoints(pointsData)

      const { data: referralData } = await supabase.from('referral_codes').select('code').eq('user_id', user.id).single()
      if (referralData) setReferralCode(referralData.code)

      const { data: ordersData } = await supabase.from('orders').select('total').eq('user_id', user.id).eq('status', 'delivered')
      if (ordersData) {
        setStats({ orders: ordersData.length, totalSpent: ordersData.reduce((sum, o) => sum + o.total, 0) })
      }
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  async function handleSaveProfile() {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' })
      return
    }
    setSaving(true)
    const result = await updateProfile({
      name: name.trim(),
      phone: phone ? '91' + phone : null,
      preferred_gym: selectedGym,
      birthday: birthday || null
    })
    setSaving(false)
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update' })
    }
  }

  async function handleDeleteAddress(addressId) {
    if (!confirm('Delete this address?')) return
    await supabase.from('user_addresses').delete().eq('id', addressId)
    setAddresses(prev => prev.filter(a => a.id !== addressId))
  }

  function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/')
    }
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
      <div className="bg-gradient-to-br from-green-500 to-green-600 px-4 py-8 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{name || 'User'}</h1>
              <p className="text-green-100">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stats.orders}</p>
              <p className="text-xs text-green-100">Orders</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stats.totalSpent}</p>
              <p className="text-xs text-green-100">Spent</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{loyaltyPoints?.points_balance || 0}</p>
              <p className="text-xs text-green-100">Points</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b sticky top-[60px] z-30">
        <div className="max-w-2xl mx-auto px-4 flex">
          <button onClick={() => setActiveTab('profile')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'profile' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'}`}>Profile</button>
          <button onClick={() => setActiveTab('addresses')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'addresses' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'}`}>Addresses</button>
          <button onClick={() => setActiveTab('rewards')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'rewards' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'}`}>Rewards</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {message.text && (
              <div className={`p-3 rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message.text}</div>
            )}
            <div className="bg-white rounded-2xl p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={user.email} disabled className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Gym</label>
                <select value={selectedGym} onChange={(e) => setSelectedGym(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-white">
                  <option value="">Select gym</option>
                  {gyms.map((gym) => (<option key={gym.id} value={gym.name}>{gym.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
                <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none" />
              </div>
              <button onClick={handleSaveProfile} disabled={saving} className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            {referralCode && (
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-4 text-white flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Your Referral Code</p>
                  <p className="text-2xl font-bold">{referralCode}</p>
                </div>
                <Link to="/refer" className="px-4 py-2 bg-white text-purple-600 font-medium rounded-lg">Share</Link>
              </div>
            )}
            <button onClick={handleLogout} className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100">Logout</button>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No saved addresses</p>
                <Link to="/checkout" className="px-4 py-2 bg-green-500 text-white font-medium rounded-lg">Add Address</Link>
              </div>
            ) : (
              addresses.map((addr) => (
                <div key={addr.id} className="bg-white rounded-2xl p-4 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{addr.label}</p>
                    <p className="text-gray-600">{addr.full_address}</p>
                    <p className="text-sm text-gray-400">{addr.area}</p>
                  </div>
                  <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 p-2">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-white/80">Your Tier</p>
                  <p className="text-2xl font-bold capitalize">{loyaltyPoints?.tier || 'Bronze'}</p>
                </div>
                <i className="fa-solid fa-medal text-3xl"></i>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span>Points Balance</span>
                  <span className="text-2xl font-bold">{loyaltyPoints?.points_balance || 0}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4">
              <h3 className="font-bold text-gray-900 mb-4">How to Earn Points</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Sign up</span><span className="text-green-600 font-bold">+50</span></div>
                <div className="flex justify-between"><span>Complete profile</span><span className="text-green-600 font-bold">+25</span></div>
                <div className="flex justify-between"><span>Each order</span><span className="text-green-600 font-bold">+10</span></div>
                <div className="flex justify-between"><span>Rate an order</span><span className="text-green-600 font-bold">+5</span></div>
                <div className="flex justify-between"><span>Successful referral</span><span className="text-green-600 font-bold">+75</span></div>
                <div className="flex justify-between"><span>Birthday bonus</span><span className="text-green-600 font-bold">+100</span></div>
              </div>
            </div>
            <Link to="/rewards" className="block w-full py-3 bg-green-500 text-white font-bold rounded-xl text-center">View Rewards</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
