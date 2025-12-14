import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('frushh_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem('frushh_user')
      }
    }
    setLoading(false)
  }, [])

  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  async function sendOTP(email) {
    try {
      const otp = generateOTP()
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

      await supabase
        .from('otp_verifications')
        .delete()
        .eq('email', email)

      const { error: insertError } = await supabase
        .from('otp_verifications')
        .insert({ email, otp, expires_at: expiresAt })

      if (insertError) throw insertError

      // Send real email via API
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Email send failed:', result)
        // Fallback: show OTP on screen for testing
        return { success: true, otp, emailSent: false }
      }

      return { success: true, emailSent: true }
    } catch (error) {
      console.error('Error sending OTP:', error)
      return { success: false, error: error.message }
    }
  }

  async function verifyOTP(email, otp) {
    try {
      const { data, error } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('email', email)
        .eq('otp', otp)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error || !data) {
        return { success: false, error: 'Invalid or expired OTP' }
      }

      await supabase
        .from('otp_verifications')
        .delete()
        .eq('email', email)

      let { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (existingUser) {
        setUser(existingUser)
        localStorage.setItem('frushh_user', JSON.stringify(existingUser))
        return { success: true, isNewUser: false, user: existingUser }
      }

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ email, is_verified: true })
        .select()
        .single()

      if (createError) throw createError

      await supabase
        .from('loyalty_points')
        .insert({
          user_id: newUser.id,
          points_balance: 50,
          total_earned: 50,
          tier: 'bronze',
          tier_multiplier: 1
        })

      await supabase
        .from('points_transactions')
        .insert({
          user_id: newUser.id,
          points: 50,
          type: 'signup',
          description: 'Welcome bonus for signing up!'
        })

      const emailPrefix = email.split('@')[0].substring(0, 6).toUpperCase()
      const randomNum = Math.floor(Math.random() * 100)
      const referralCode = `${emailPrefix}${randomNum}`

      await supabase
        .from('referral_codes')
        .insert({
          user_id: newUser.id,
          code: referralCode,
          discount_percent: 20,
          max_discount: 25
        })

      setUser(newUser)
      localStorage.setItem('frushh_user', JSON.stringify(newUser))
      return { success: true, isNewUser: true, user: newUser }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      return { success: false, error: error.message }
    }
  }

  async function updateProfile(data) {
    if (!user) return { success: false, error: 'Not logged in' }

    try {
      const isFirstProfileUpdate = !user.profile_complete && data.name && data.phone

      const updateData = { ...data }
      if (isFirstProfileUpdate) {
        updateData.profile_complete = true
      }

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      if (isFirstProfileUpdate) {
        const { data: pointsData } = await supabase
          .from('loyalty_points')
          .select('points_balance, total_earned')
          .eq('user_id', user.id)
          .single()

        if (pointsData) {
          await supabase
            .from('loyalty_points')
            .update({
              points_balance: pointsData.points_balance + 25,
              total_earned: pointsData.total_earned + 25
            })
            .eq('user_id', user.id)

          await supabase
            .from('points_transactions')
            .insert({
              user_id: user.id,
              points: 25,
              type: 'profile',
              description: 'Profile completion bonus!'
            })
        }
      }

      setUser(updatedUser)
      localStorage.setItem('frushh_user', JSON.stringify(updatedUser))
      return { success: true }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }
  }

  async function isFirstTimeCustomer() {
    if (!user) return true

    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (orders && orders.length > 0) return false

      const { data: tracking } = await supabase
        .from('first_order_tracking')
        .select('id')
        .or(`email.eq.${user.email},phone.eq.${user.phone}`)
        .limit(1)

      if (tracking && tracking.length > 0) return false

      return true
    } catch (error) {
      return true
    }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('frushh_user')
    localStorage.removeItem('frushh_cart')
  }

  async function refreshUser() {
    if (!user) return

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setUser(data)
      localStorage.setItem('frushh_user', JSON.stringify(data))
    }
  }

  const value = {
    user,
    loading,
    sendOTP,
    verifyOTP,
    updateProfile,
    isFirstTimeCustomer,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export default AuthContext
