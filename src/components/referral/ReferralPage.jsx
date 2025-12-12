import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

function ReferralPage({ isOpen, onClose }) {
  const { user } = useAuth()
  const [referralCode, setReferralCode] = useState('')
  const [referralStats, setReferralStats] = useState({ count: 0, points: 0 })
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && isOpen) {
      generateOrFetchReferralCode()
      fetchReferralStats()
    }
  }, [user, isOpen])

  async function generateOrFetchReferralCode() {
    try {
      // Check if user already has a referral code
      const { data: existingCode } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (existingCode) {
        setReferralCode(existingCode.code)
      } else {
        // Generate new code based on name or phone
        const baseName = user.name ? user.name.replace(/\s+/g, '').toUpperCase().slice(0, 8) : 'FRUSHH'
        const randomNum = Math.floor(Math.random() * 100)
        const newCode = `${baseName}${randomNum}`

        const { data: newCodeData, error } = await supabase
          .from('referral_codes')
          .insert({
            user_id: user.id,
            code: newCode,
            discount_percent: 20,
            referrer_points: 100
          })
          .select()
          .single()

        if (!error && newCodeData) {
          setReferralCode(newCodeData.code)
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Error with referral code:', error)
      setLoading(false)
    }
  }

  async function fetchReferralStats() {
    try {
      const { data: referrals } = await supabase
        .from('referral_tracking')
        .select('*')
        .eq('referrer_user_id', user.id)
        .eq('status', 'completed')

      if (referrals) {
        const totalPoints = referrals.reduce((sum, r) => sum + (r.points_awarded || 0), 0)
        setReferralStats({
          count: referrals.length,
          points: totalPoints
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareOnWhatsApp() {
    const message = `Hey! 👋

I've been ordering fresh protein shakes from FRUSHH - they're amazing! 🥤💪

✅ Under Rs.99 for 22g protein
✅ No whey powder, 100% natural
✅ Delivered fresh to your gym

Use my code *${referralCode}* to get 20% OFF your first order!

Order here: frushh.in`

    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappLink, '_blank')
  }

  function copyLink() {
    const link = `frushh.in?ref=${referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white relative">
          <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30">
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-gift text-4xl"></i>
            </div>
            <h2 className="text-2xl font-black">Refer & Earn</h2>
            <p className="text-white/80 text-sm mt-1">Share FRUSHH with friends!</p>
          </div>
        </div>

        <div className="p-6">
          {/* How it works */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">How it works:</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">1</div>
                <p className="text-sm text-gray-600">Share your code with friends</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">2</div>
                <p className="text-sm text-gray-600">Friend gets <span className="font-bold text-green-600">20% OFF</span> first order</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">3</div>
                <p className="text-sm text-gray-600">You get <span className="font-bold text-green-600">100 points</span> when they order!</p>
              </div>
            </div>
          </div>

          {/* Referral Code */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2 text-center">Your Referral Code</p>
            {loading ? (
              <div className="text-center py-2">
                <i className="fa-solid fa-spinner fa-spin text-green-500 text-xl"></i>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-black text-green-600 tracking-wider">{referralCode}</span>
                <button 
                  onClick={copyCode}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${copied ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                >
                  {copied ? <><i className="fa-solid fa-check mr-1"></i>Copied!</> : <><i className="fa-solid fa-copy mr-1"></i>Copy</>}
                </button>
              </div>
            )}
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={shareOnWhatsApp}
              className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition"
            >
              <i className="fa-brands fa-whatsapp text-xl"></i>
              WhatsApp
            </button>
            <button
              onClick={copyLink}
              className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
            >
              <i className="fa-solid fa-link"></i>
              Copy Link
            </button>
          </div>

          {/* Stats */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-3 text-center">Your Referrals</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fa-solid fa-users text-blue-600 text-xl"></i>
                </div>
                <p className="text-2xl font-black text-gray-900">{referralStats.count}</p>
                <p className="text-xs text-gray-500">Friends Joined</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fa-solid fa-coins text-yellow-600 text-xl"></i>
                </div>
                <p className="text-2xl font-black text-gray-900">{referralStats.points}</p>
                <p className="text-xs text-gray-500">Points Earned</p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 text-gray-500 font-medium hover:text-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReferralPage
