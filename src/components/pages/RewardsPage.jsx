import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

function RewardsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [loyaltyPoints, setLoyaltyPoints] = useState(null)
  const [rewards, setRewards] = useState([])
  const [transactions, setTransactions] = useState([])
  const [activeTab, setActiveTab] = useState('rewards')
  const [redeeming, setRedeeming] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/rewards' } })
      return
    }
    fetchData()
  }, [user])

  async function fetchData() {
    try {
      const { data: pointsData } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (pointsData) setLoyaltyPoints(pointsData)

      const { data: rewardsData } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true })
      if (rewardsData) setRewards(rewardsData)

      const { data: transData } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (transData) setTransactions(transData)

      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  async function handleRedeem(reward) {
    if (!loyaltyPoints || loyaltyPoints.points_balance < reward.points_required) {
      alert('Not enough points!')
      return
    }

    if (!confirm(`Redeem ${reward.name} for ${reward.points_required} points?`)) return

    setRedeeming(reward.id)

    try {
      await supabase
        .from('reward_redemptions')
        .insert({
          user_id: user.id,
          reward_id: reward.id,
          points_spent: reward.points_required,
          status: 'pending'
        })

      const newBalance = loyaltyPoints.points_balance - reward.points_required
      await supabase
        .from('loyalty_points')
        .update({ points_balance: newBalance })
        .eq('user_id', user.id)

      await supabase
        .from('points_transactions')
        .insert({
          user_id: user.id,
          points: -reward.points_required,
          type: 'redemption',
          description: `Redeemed: ${reward.name}`
        })

      setLoyaltyPoints(prev => ({ ...prev, points_balance: newBalance }))
      alert(`${reward.name} redeemed successfully! We'll apply it to your next order.`)
      fetchData()
    } catch (error) {
      console.error('Error redeeming:', error)
      alert('Failed to redeem. Please try again.')
    }
    setRedeeming(null)
  }

  function getTierInfo(tier) {
    const tiers = {
      'bronze': { color: 'from-amber-600 to-amber-700', icon: 'fa-medal', label: 'Bronze', multiplier: '1x' },
      'silver': { color: 'from-gray-400 to-gray-500', icon: 'fa-award', label: 'Silver', multiplier: '1.25x' },
      'gold': { color: 'from-yellow-400 to-yellow-500', icon: 'fa-crown', label: 'Gold', multiplier: '1.5x' },
      'platinum': { color: 'from-purple-400 to-purple-600', icon: 'fa-gem', label: 'Platinum', multiplier: '2x' }
    }
    return tiers[tier] || tiers['bronze']
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-green-500"></i>
      </div>
    )
  }

  const tierInfo = getTierInfo(loyaltyPoints?.tier || 'bronze')
  const balance = loyaltyPoints?.points_balance || 0

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className={`bg-gradient-to-br ${tierInfo.color} px-4 py-8 text-white`}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-white/80">Your Tier</p>
              <p className="text-2xl font-bold">{tierInfo.label}</p>
              <p className="text-sm text-white/80">{tierInfo.multiplier} points on orders</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <i className={`fa-solid ${tierInfo.icon} text-3xl`}></i>
            </div>
          </div>

          <div className="bg-white/20 rounded-2xl p-6 text-center">
            <p className="text-sm text-white/80 mb-1">Points Balance</p>
            <p className="text-5xl font-black">{balance}</p>
            <p className="text-sm text-white/80 mt-2">Total Earned: {loyaltyPoints?.total_earned || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border-b sticky top-[60px] z-30">
        <div className="max-w-2xl mx-auto px-4 flex">
          <button onClick={() => setActiveTab('rewards')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'rewards' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'}`}>
            <i className="fa-solid fa-gift mr-2"></i>Rewards
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'history' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'}`}>
            <i className="fa-solid fa-clock-rotate-left mr-2"></i>History
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {activeTab === 'rewards' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">Redeem your points for rewards</p>
            {rewards.length === 0 ? (
              <div className="text-center py-12">
                <i className="fa-solid fa-gift text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No rewards available</p>
              </div>
            ) : (
              rewards.map((reward) => {
                const canRedeem = balance >= reward.points_required
                const isRedeeming = redeeming === reward.id
                return (
                  <div key={reward.id} className={`bg-white rounded-2xl p-4 border-2 ${canRedeem ? 'border-green-200' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${canRedeem ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <i className={`fa-solid ${reward.icon || 'fa-gift'} text-2xl ${canRedeem ? 'text-green-600' : 'text-gray-400'}`}></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{reward.name}</h3>
                        <p className="text-sm text-gray-500">{reward.description}</p>
                        <p className={`text-sm font-bold mt-1 ${canRedeem ? 'text-green-600' : 'text-gray-400'}`}>
                          <i className="fa-solid fa-star mr-1"></i>{reward.points_required} points
                        </p>
                      </div>
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canRedeem || isRedeeming}
                        className={`px-4 py-2 rounded-xl font-medium transition ${
                          canRedeem
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isRedeeming ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Redeem'}
                      </button>
                    </div>
                    {!canRedeem && (
                      <p className="text-xs text-gray-400 mt-2 text-right">
                        Need {reward.points_required - balance} more points
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-4">Your points activity</p>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <i className="fa-solid fa-clock-rotate-left text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No transactions yet</p>
              </div>
            ) : (
              transactions.map((trans) => (
                <div key={trans.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${trans.points > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      <i className={`fa-solid ${trans.points > 0 ? 'fa-plus' : 'fa-minus'} ${trans.points > 0 ? 'text-green-600' : 'text-red-600'}`}></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{trans.description}</p>
                      <p className="text-xs text-gray-400">{formatDate(trans.created_at)}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${trans.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trans.points > 0 ? '+' : ''}{trans.points}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-green-50 rounded-2xl">
          <h3 className="font-bold text-gray-900 mb-3">How to Earn More</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2"><i className="fa-solid fa-bag-shopping text-green-500"></i> Order +10 pts</div>
            <div className="flex items-center gap-2"><i className="fa-solid fa-star text-green-500"></i> Rate +5 pts</div>
            <div className="flex items-center gap-2"><i className="fa-solid fa-pen text-green-500"></i> Review +10 pts</div>
            <div className="flex items-center gap-2"><i className="fa-solid fa-users text-green-500"></i> Refer +75 pts</div>
          </div>
          <Link to="/refer" className="block mt-4 text-center py-2 bg-green-500 text-white font-medium rounded-xl">
            <i className="fa-solid fa-gift mr-2"></i>Refer & Earn 75 Points
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RewardsPage
