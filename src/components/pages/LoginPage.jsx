import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, sendOTP, verifyOTP, updateProfile } = useAuth()

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [testOtp, setTestOtp] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const from = location.state?.from || '/'

  useEffect(() => {
    if (user && user.name && user.phone) {
      navigate(from, { replace: true })
    }
  }, [user])

  async function handleSendOTP(e) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email')
      return
    }

    setLoading(true)
    setError('')

    const result = await sendOTP(email.trim().toLowerCase())

    setLoading(false)

    if (result.success) {
      setEmailSent(result.emailSent)
      if (!result.emailSent && result.otp) {
        setTestOtp(result.otp)
      }
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

    const result = await verifyOTP(email.trim().toLowerCase(), otp)

    setLoading(false)

    if (result.success) {
      if (result.isNewUser) {
        setStep(3)
      } else {
        navigate(from, { replace: true })
      }
    } else {
      setError(result.error || 'Invalid OTP')
    }
  }

  async function handleCompleteProfile(e) {
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
      phone: '91' + phone
    })

    setLoading(false)

    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.error || 'Failed to update profile')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-glass-water text-white text-3xl"></i>
          </div>
          <h1 className="text-2xl font-black text-gray-900">FRUSHH</h1>
          <p className="text-gray-500">Fresh Protein Shakes</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          {step === 1 && (
            <form onSubmit={handleSendOTP}>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Login / Sign Up</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your email to continue</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <i className="fa-solid fa-exclamation-circle mr-2"></i>{error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition disabled:opacity-50"
              >
                {loading ? (
                  <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Sending OTP...</>
                ) : (
                  <><i className="fa-solid fa-paper-plane mr-2"></i>Get OTP</>
                )}
              </button>

              <div className="mt-6 p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-green-800 font-medium mb-2">Why join FRUSHH?</p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li><i className="fa-solid fa-check mr-2"></i>Get 50 welcome points</li>
                  <li><i className="fa-solid fa-check mr-2"></i>₹25 off on first order</li>
                  <li><i className="fa-solid fa-check mr-2"></i>Refer friends & earn more</li>
                </ul>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verify OTP</h2>
              <p className="text-gray-500 text-sm mb-6">
                {emailSent ? (
                  <>Enter the 6-digit code sent to <strong>{email}</strong></>
                ) : (
                  <>Enter the OTP shown below</>
                )}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <i className="fa-solid fa-exclamation-circle mr-2"></i>{error}
                </div>
              )}

              {emailSent ? (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                  <i className="fa-solid fa-envelope-circle-check mr-2"></i>
                  OTP sent to your email! Check inbox & spam folder.
                </div>
              ) : testOtp && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
                  <i className="fa-solid fa-flask mr-2"></i>
                  <strong>Test Mode OTP:</strong> <span className="font-mono text-lg">{testOtp}</span>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-center text-2xl font-bold tracking-widest"
                  autoFocus
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition disabled:opacity-50"
              >
                {loading ? (
                  <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Verifying...</>
                ) : (
                  <><i className="fa-solid fa-check mr-2"></i>Verify & Continue</>
                )}
              </button>

              <div className="mt-4 flex justify-between items-center text-sm">
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); setError(''); setTestOtp(''); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fa-solid fa-arrow-left mr-1"></i>Change email
                </button>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  <i className="fa-solid fa-rotate-right mr-1"></i>Resend OTP
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleCompleteProfile}>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fa-solid fa-star text-yellow-500 text-2xl"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Welcome to FRUSHH!</h2>
                <p className="text-green-600 font-medium">+50 points credited!</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <i className="fa-solid fa-exclamation-circle mr-2"></i>{error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="flex">
                  <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-green-500 outline-none"
                    maxLength={10}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition disabled:opacity-50"
              >
                {loading ? (
                  <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Saving...</>
                ) : (
                  <><i className="fa-solid fa-check mr-2"></i>Complete & Get 25 Bonus Points</>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default LoginPage
