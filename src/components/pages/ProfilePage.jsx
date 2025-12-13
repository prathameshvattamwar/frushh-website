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
    loadProfileData()
    // eslint-disable-next-line
  }, [user])

  const loadProfileData = async () => {
    try {
      setLoading(true)

      setName(user?.name || user?.user_metadata?.name || '')
      setPhone(user?.phone ? user.phone.replace(/^91/, '') : '')
      setSelectedGym(user?.preferred_gym || '')
      setBirthday(user?.birthday || '')

      const [{ data: gymsData }, { data: addressData }, { data: pointsData }, { data: referralData }, { data: ordersData }] =
        await Promise.all([
          supabase.from('gyms').select('*').eq('is_active', true).order('display_order'),
          supabase.from('user_addresses').select('*').eq('user_id', user.id),
          supabase.from('loyalty_points').select('*').eq('user_id', user.id).single(),
          supabase.from('referral_codes').select('code').eq('user_id', user.id).single(),
          supabase.from('orders').select('total').eq('user_id', user.id).eq('status', 'delivered')
        ])

      setGyms(gymsData || [])
      setAddresses(addressData || [])
      setLoyaltyPoints(pointsData || null)
      setReferralCode(referralData?.code || '')

      const totalSpent = (ordersData || []).reduce((sum, o) => sum + (o.total || 0), 0)
      setStats({ orders: ordersData?.length || 0, totalSpent })

    } catch (err) {
      console.error('Profile load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' })
      return
    }

    try {
      setSaving(true)

      const result = await updateProfile({
        name: name.trim(),
        phone: phone ? `91${phone}` : null,
        preferred_gym: selectedGym || null,
        birthday: birthday || null
      })

      if (result?.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      } else {
        setMessage({ type: 'error', text: result?.error || 'Update failed' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return
    await supabase.from('user_addresses').delete().eq('id', id)
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to logout?')) return
    logout()
    navigate('/')
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-green-500" />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 px-4 py-8 text-white">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            {name ? name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{name || 'User'}</h1>
            <p className="text-green-100">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white border-b sticky top-[60px] z-30">
        <div className="max-w-2xl mx-auto px-4 flex">
          {['profile', 'addresses', 'rewards'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                activeTab === tab ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {activeTab === 'profile' && (
          <>
            {message.text && (
              <div className={`mb-4 p-3 rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <div className="bg-white rounded-2xl p-4 space-y-4">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="input" />
              <input value={user?.email || ''} disabled className="input bg-gray-100" />
              <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Phone" className="input" />
              <select value={selectedGym} onChange={e => setSelectedGym(e.target.value)} className="input">
                <option value="">Select Gym</option>
                {gyms.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
              <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className="input" />

              <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <button onClick={handleLogout} className="mt-4 w-full py-3 bg-red-50 text-red-600 rounded-xl">
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
