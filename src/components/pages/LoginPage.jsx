import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, sendOTP, verifyOTP, updateProfile } = useAuth()

  const [step, setStep] = useState(1) // 1: email, 2: otp, 3: profile setup
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Profile setup
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedGym, setSelectedGym] = useState('')
  const [gyms, setGyms] = useState([])

  // Redirect if already logged in
  useEffect(() => {
    if (user && step !== 3) {
      const from = location.state?.from || '/'
      navigate(from, { replace: true })
    }
  }, [user, step, navigate, location])

  // Fetch gyms list
  useEffect(() => {
    async function fetchGyms() {
      const { data } = await supabase
        .from('gyms')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      if (data) setGyms(data)
    }
    fetchGyms()
  }, [])

  async function handleSendOTP(e) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email')
      return
    }

    setLoading(true)
    setError('')

    const result = await sendOTP(email)
    
    setLoading(false)

    if (result.success) {
      setGeneratedOtp(result.otp) // For testing - remove in production
      setStep(2)
    } else {
      setError(result.error || 'Failed to send OTP')
    }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Please enter 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')

    const result = await verifyOTP(email, otp)
    
    setLoading(false)

    if (result.success) {
      if (result.isNewUser) {
        setStep(3) // Go to profile setup
      } else {
        const from = location.state?.from || '/'
        navigate(from, { replace: true })
      }
    } else {
      setError(result.error || 'Invalid OTP')
    }
  }

  async function handleProfileSetup(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (!phone.trim() || phone.length !== 10) {
      setError('Please enter valid 10-digit phone number')
      return
    }

    setLoading(true)
    setError('')

    const result = await updateProfile({
      name: name.trim(),
      phone: `91${phone}`,
      preferred_gym: selectedGym,
      birthday: null
    })

    setLoading(false)

    if (result.success) {
      const from = location.state?.from || '/'
      navigate(from, { replace: true })
    } else {
      setError(result.error || 'Failed to update profile')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i className="fa-solid fa-glass-water text-white text-3xl"></i>
          </div>
          <h1 className="text-2xl font-black text-gray-900">FRUSHH</h1>
          <p className="text-gray-500 text-sm">Fresh Protein Shakes</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Step 1: Email Input */}
          {step === 1 && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome!</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your email to continue</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSendOTP}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-lg"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      Get OTP
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                By continuing, you agree to our Terms & Privacy Policy
              </p>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="p-6">
              <button 
                onClick={() => { setStep(1); setOtp(''); setError(''); }}
                className="flex items-center gap-2 text-gray-500 text-sm mb-4 hover:text-gray-700"
              >
                <i className="fa-solid fa-arrow-left"></i>
                Change email
              </button>

              <h2 className="text-xl font-bold text-gray-900 mb-2">Verify OTP</h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter the 6-digit code sent to<br/>
                <span className="font-medium text-gray-700">{email}</span>
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {error}
                </div>
              )}

              {/* Testing OTP Display - Remove in production */}
              {generatedOtp && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
                  <i className="fa-solid fa-info-circle mr-2"></i>
                  Test OTP: <span className="font-bold font-mono">{generatedOtp}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOTP}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-2xl text-center font-mono tracking-[0.5em]"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i>
                      Verify OTP
                    </>
                  )}
                </button>
              </form>

              <button 
                onClick={handleSendOTP}
                className="w-full py-3 text-green-600 font-medium mt-4 hover:text-green-700"
              >
                <i className="fa-solid fa-rotate-right mr-2"></i>
                Resend OTP
              </button>
            </div>
          )}

          {/* Step 3: Profile Setup (New Users) */}
          {step === 3 && (
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fa-solid fa-party-horn text-3xl text-green-600"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Welcome to FRUSHH!</h2>
                <p className="text-gray-500 text-sm">
                  You earned <span className="font-bold text-green-600">50 points</span> signup bonus! 🎉
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleProfileSetup}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    autoFocus
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="w-full pl-14 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Gym (Optional)
                  </label>
                  <select
                    value={selectedGym}
                    onChange={(e) => setSelectedGym(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                  >
                    <option value="">Select your gym</option>
                    {gyms.map((gym) => (
                      <option key={gym.id} value={gym.name}>
                        {gym.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i>
                      Complete Setup & Get 25 Bonus Points
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white/50 rounded-xl p-3 text-center">
            <i className="fa-solid fa-gift text-green-500 text-xl mb-1"></i>
            <p className="text-xs text-gray-600">50 Points<br/>Signup Bonus</p>
          </div>
          <div className="bg-white/50 rounded-xl p-3 text-center">
            <i className="fa-solid fa-percent text-green-500 text-xl mb-1"></i>
            <p className="text-xs text-gray-600">₹25 Off<br/>First Order</p>
          </div>
          <div className="bg-white/50 rounded-xl p-3 text-center">
            <i className="fa-solid fa-users text-green-500 text-xl mb-1"></i>
            <p className="text-xs text-gray-600">Refer & Earn<br/>Rewards</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
