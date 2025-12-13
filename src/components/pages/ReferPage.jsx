import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

function ReferPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [referralCode, setReferralCode] = useState('')
  const [referrals, setReferrals] = useState([])
  const [stats, setStats] = useState({ total: 0, successful: 0, earned: 0 })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/refer' } })
      return
    }
    fetchData()
  }, [user])

  async function fetchData() {
    try {
      const { data: codeData } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (codeData) {
        setReferralCode(codeData.code)
        setStats({
          total: codeData.times_used || 0,
          successful: codeData.successful_referrals || 0,
          earned: (codeData.successful_referrals || 0) * 25
        })
      }

      const { data: referralData } = await supabase
        .from('referral_tracking')
        .select('*, referred_user:referred_user_id(name, email)')
        .eq('referrer_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (referralData) setReferrals(referralData)

      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleShare() {
    const message = `Hey! Use my FRUSHH referral code "${referralCode}" and get 20% off (max ₹25) on your first protein shake order! 🥤💪\n\nOrder here: https://frushh-website.vercel.app`
    
    if (navigator.share) {
      navigator.share({
        title: 'FRUSHH Referral',
        text: message
      })
    } else {
      navigator.clipboard.writeText(message)
      alert('Referral message copied!')
    }
  }

  function handleWhatsAppShare() {
    const message = `Hey! Use my FRUSHH referral code "${referralCode}" and get 20% off (max ₹25) on your first protein shake order! 🥤💪\n\nOrder here: https://frushh-website.vercel.app`
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
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
      <div className="bg-gradient-to-br from-pink-500 to-purple-600 px-4 py-8 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-gift text-4xl"></i>
          </div>
          <h1 className="text-3xl font-black mb-2">Refer & Earn</h1>
          <p className="text-white/80">Share FRUSHH with friends and both of you get rewarded!</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
          <p className="text-sm text-gray-500 text-center mb-2">Your Referral Code</p>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl font-black text-gray-900 tracking-wider">{referralCode}</span>
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg transition ${copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleWhatsAppShare}
              className="py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2"
            >
              <i className="fa-brands fa-whatsapp text-xl"></i>
              WhatsApp
            </button>
            <button
              onClick={handleShare}
              className="py-3 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-600 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-share-nodes"></i>
              Share
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Code Used</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
            <p className="text-xs text-gray-500">Successful</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">₹{stats.earned}</p>
            <p className="text-xs text-gray-500">Earned</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-pink-600">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Share Your Code</p>
                <p className="text-sm text-gray-500">Send your referral code to friends via WhatsApp or any app</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-purple-600">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Friend Orders</p>
                <p className="text-sm text-gray-500">They get 20% off (max ₹25) on their first order</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-green-600">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">You Earn</p>
                <p className="text-sm text-gray-500">Get ₹25 off + 75 bonus points on your next order!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 mb-4 border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-coins text-white text-xl"></i>
            </div>
            <div>
              <p className="font-bold text-gray-900">Earn 75 Points per Referral!</p>
              <p className="text-sm text-gray-600">Plus ₹25 credit when your friend orders</p>
            </div>
          </div>
        </div>

        {referrals.length > 0 && (
          <div className="bg-white rounded-2xl p-4">
            <h2 className="font-bold text-gray-900 mb-3">Recent Referrals</h2>
            <div className="space-y-2">
              {referrals.map((ref) => (
                <div key={ref.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-user text-purple-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{ref.referred_user?.name || 'Friend'}</p>
                      <p className="text-xs text-gray-400">{formatDate(ref.created_at)}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ref.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {ref.status === 'completed' ? 'Ordered' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReferPage
