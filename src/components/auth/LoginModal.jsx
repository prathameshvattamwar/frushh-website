import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function LoginModal() {
  const { showLogin, closeLogin, sendOTP, verifyOTP, updateProfile } = useAuth()
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [whatsappLink, setWhatsappLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedOTP, setGeneratedOTP] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [gym, setGym] = useState('')

  if (!showLogin) return null

  async function handlePhoneSubmit(e) {
    e.preventDefault()
    setError('')
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      setError('Please enter valid 10-digit phone number')
      return
    }
    setLoading(true)
    const result = await sendOTP('91' + cleanPhone)
    setLoading(false)
    if (result.success) {
      setGeneratedOTP(result.otp)
      setWhatsappLink(result.whatsappLink)
      setStep('otp')
    } else {
      setError(result.error || 'Failed to send OTP')
    }
  }

  async function handleOTPSubmit(e) {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) {
      setError('Please enter 6-digit OTP')
      return
    }
    setLoading(true)
    const result = await verifyOTP('91' + phone.replace(/\D/g, ''), otp)
    setLoading(false)
    if (result.success) {
      if (result.isNewUser) {
        setStep('profile')
      } else {
        handleClose()
      }
    } else {
      setError(result.error || 'Invalid OTP')
    }
  }

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    setLoading(true)
    const result = await updateProfile({
      name: name.trim(),
      default_address: address.trim(),
      preferred_gym: gym.trim()
    })
    setLoading(false)
    if (result.success) {
      handleClose()
    } else {
      setError(result.error || 'Failed to save profile')
    }
  }

  function handleClose() {
    setStep('phone')
    setPhone('')
    setOtp('')
    setName('')
    setAddress('')
    setGym('')
    setError('')
    setWhatsappLink('')
    setGeneratedOTP('')
    closeLogin()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="bg-green-500 p-4 text-white relative">
          <button onClick={handleClose} className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30">
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="text-center">
            <i className="fa-solid fa-glass-water text-4xl mb-2"></i>
            <h2 className="text-xl font-bold">
              {step === 'phone' && 'Login / Sign Up'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'profile' && 'Complete Profile'}
            </h2>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">+91</span>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" maxLength={10} className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" autoFocus />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><i className="fa-solid fa-spinner fa-spin"></i>Sending...</> : <><i className="fa-brands fa-whatsapp"></i>Get OTP via WhatsApp</>}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <div>
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-700 mb-3">Click below to send OTP via WhatsApp:</p>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition">
                  <i className="fa-brands fa-whatsapp text-xl"></i>
                  Send OTP on WhatsApp
                </a>
                <p className="text-xs text-gray-500 mt-2 text-center">Your OTP: <span className="font-mono font-bold text-green-600">{generatedOTP}</span></p>
              </div>
              <form onSubmit={handleOTPSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-digit OTP</label>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="123456" maxLength={6} className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" autoFocus />
                </div>
                <button type="submit" disabled={loading || otp.length !== 6} className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><i className="fa-solid fa-spinner fa-spin"></i>Verifying...</> : <><i className="fa-solid fa-check"></i>Verify OTP</>}
                </button>
                <button type="button" onClick={() => setStep('phone')} className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800 text-sm">
                  <i className="fa-solid fa-arrow-left mr-2"></i>Change phone number
                </button>
              </form>
            </div>
          )}

          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit}>
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                <i className="fa-solid fa-gift text-green-500 text-2xl mb-1"></i>
                <p className="text-green-700 font-medium">Welcome! You earned 50 points!</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" autoFocus />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Gym</label>
                <input type="text" value={gym} onChange={(e) => setGym(e.target.value)} placeholder="e.g., Gold's Gym Hadapsar" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address for delivery" rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><i className="fa-solid fa-spinner fa-spin"></i>Saving...</> : <><i className="fa-solid fa-check"></i>Complete Setup</>}
              </button>
              <button type="button" onClick={handleClose} className="w-full mt-3 py-2 text-gray-500 hover:text-gray-700 text-sm">Skip for now</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginModal
