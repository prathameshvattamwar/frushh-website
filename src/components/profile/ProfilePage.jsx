import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

function ProfilePage({ isOpen, onClose }) {
  const { user, updateProfile, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [points, setPoints] = useState(null)
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [gym, setGym] = useState('')
  const [birthday, setBirthday] = useState('')

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '')
      setEmail(user.email || '')
      setAddress(user.default_address || '')
      setGym(user.preferred_gym || '')
      setBirthday(user.birthday || '')
      fetchPoints()
    }
  }, [user, isOpen])

  async function fetchPoints() {
    if (!user) return
    const { data } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (data) setPoints(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const result = await updateProfile({
      name: name.trim(),
      email: email.trim(),
      default_address: address.trim(),
      preferred_gym: gym.trim(),
      birthday: birthday || null
    })

    setLoading(false)

    if (result.success) {
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error || 'Failed to update profile')
    }
  }

  function handleLogout() {
    logout()
    onClose()
  }

  function getTierInfo(tier) {
    const tiers = {
      bronze: { icon: 'fa-solid fa-award', color: 'text-orange-600', bg: 'bg-orange-100', name: 'Bronze' },
      silver: { icon: 'fa-solid fa-award', color: 'text-gray-500', bg: 'bg-gray-100', name: 'Silver' },
      gold: { icon: 'fa-solid fa-award', color: 'text-yellow-500', bg: 'bg-yellow-100', name: 'Gold' },
      platinum: { icon: 'fa-solid fa-gem', color: 'text-purple-600', bg: 'bg-purple-100', name: 'Platinum' }
    }
    return tiers[tier] || tiers.bronze
  }

  if (!isOpen) return null

  const tierInfo = getTierInfo(points?.tier || 'bronze')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-green-500 p-4 text-white relative">
          <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30">
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-4xl font-bold">{name ? name.charAt(0).toUpperCase() : 'U'}</span>
            </div>
            <h2 className="text-xl font-bold">{name || 'Complete Your Profile'}</h2>
            <p className="text-green-100 text-sm">{user?.phone ? `+${user.phone}` : ''}</p>
          </div>
        </div>

        {/* Points Card */}
        {points && (
          <div className="p-4 border-b">
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${tierInfo.bg} rounded-full flex items-center justify-center`}>
                    <i className={`${tierInfo.icon} text-2xl ${tierInfo.color}`}></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loyalty Points</p>
                    <p className="text-2xl font-black text-gray-900">{points.points_balance}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 ${tierInfo.bg} ${tierInfo.color} text-sm font-bold rounded-full`}>
                    {tierInfo.name}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Total: {points.total_earned} earned</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
              <i className="fa-solid fa-circle-check"></i>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="fa-solid fa-user mr-2 text-gray-400"></i>Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="fa-solid fa-envelope mr-2 text-gray-400"></i>Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="fa-solid fa-dumbbell mr-2 text-gray-400"></i>Your Gym
              </label>
              <input
                type="text"
                value={gym}
                onChange={(e) => setGym(e.target.value)}
                placeholder="e.g., Gold's Gym Hadapsar"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="fa-solid fa-location-dot mr-2 text-gray-400"></i>Delivery Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address for delivery"
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="fa-solid fa-cake-candles mr-2 text-gray-400"></i>Birthday
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Get 200 bonus points on your birthday!</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i>Saving...</>
              ) : (
                <><i className="fa-solid fa-check"></i>Save Changes</>
              )}
            </button>
          </form>

          <button
            onClick={handleLogout}
            className="w-full mt-4 py-3 text-red-500 font-medium hover:bg-red-50 rounded-lg transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
