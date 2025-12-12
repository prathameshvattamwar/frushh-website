import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const savedUser = localStorage.getItem('frushh_user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.id)
          .single()
        
        if (data) {
          setUser(data)
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.id)
        } else {
          localStorage.removeItem('frushh_user')
        }
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  async function sendOTP(email) {
    try {
      const otp = generateOTP()
      const normalizedEmail = email.toLowerCase().trim()

      // Mark all previous OTPs as used
      await supabase
        .from('otp_verifications')
        .update({ is_used: true })
        .eq('email', normalizedEmail)

      // Save new OTP (30 min expiry)
      const { error } = await supabase
        .from('otp_verifications')
        .insert({
          email: normalizedEmail,
          otp: otp,
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          is_used: false
        })

      if (error) throw error

      // TODO: In production, integrate email service (Resend/SendGrid)
      // For now, we'll show OTP on screen for testing
      console.log(`OTP for ${normalizedEmail}: ${otp}`)

      return { success: true, otp, email: normalizedEmail }
    } catch (error) {
      console.error('Error sending OTP:', error)
      return { success: false, error: error.message }
    }
  }

  async function verifyOTP(email, enteredOTP) {
    try {
      const normalizedEmail = email.toLowerCase().trim()

      // Get latest unused OTP
      const { data: otpData, error: otpError } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('email', normalizedEmail)
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (otpError || !otpData) {
        return { success: false, error: 'OTP not found. Please request a new one.' }
      }

      // Check OTP match
      if (otpData.otp !== enteredOTP) {
        return { success: false, error: 'Invalid OTP. Please try again.' }
      }

      // Mark OTP as used
      await supabase
        .from('otp_verifications')
        .update({ is_used: true })
        .eq('id', otpData.id)

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .single()

      if (existingUser) {
        // Existing user - login
        setUser(existingUser)
        localStorage.setItem('frushh_user', JSON.stringify(existingUser))
        
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', existingUser.id)

        return { success: true, isNewUser: false, user: existingUser }
      } else {
        // New user - create account
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: normalizedEmail,
            is_verified: true,
            last_login: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) throw createError

        // Create loyalty points with signup bonus
        await supabase
          .from('loyalty_points')
          .insert({
            user_id: newUser.id,
            points_balance: 50,
            total_earned: 50,
            tier: 'bronze',
            tier_multiplier: 1.00
          })

        // Record signup bonus transaction
        await supabase
          .from('points_transactions')
          .insert({
            user_id: newUser.id,
            points: 50,
            type: 'signup',
            description: 'Welcome bonus for signing up!'
          })

        // Create referral code for new user
        const referralCode = generateReferralCode(newUser.email)
        await supabase
          .from('referral_codes')
          .insert({
            user_id: newUser.id,
            code: referralCode,
            discount_percent: 20,
            max_discount: 25,
            referrer_points: 75
          })

        setUser(newUser)
        localStorage.setItem('frushh_user', JSON.stringify(newUser))

        return { success: true, isNewUser: true, user: newUser }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      return { success: false, error: error.message }
    }
  }

  function generateReferralCode(email) {
    const baseName = email.split('@')[0].replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6)
    const randomNum = Math.floor(Math.random() * 100)
    return `${baseName}${randomNum}`
  }

  async function updateProfile(profileData) {
    try {
      const wasIncomplete = !user.name || !user.phone
      
      const { data, error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          phone: profileData.phone,
          preferred_gym: profileData.preferred_gym,
          birthday: profileData.birthday,
          profile_complete: !!(profileData.name && profileData.phone),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      // Award profile completion bonus if first time
      const isNowComplete = profileData.name && profileData.phone
      if (wasIncomplete && isNowComplete) {
        const { data: existingBonus } = await supabase
          .from('points_transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'profile_complete')
          .single()

        if (!existingBonus) {
          // Update points
          const { data: pointsData } = await supabase
            .from('loyalty_points')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (pointsData) {
            await supabase
              .from('loyalty_points')
              .update({
                points_balance: pointsData.points_balance + 25,
                total_earned: pointsData.total_earned + 25,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id)

            await supabase
              .from('points_transactions')
              .insert({
                user_id: user.id,
                points: 25,
                type: 'profile_complete',
                description: 'Profile completion bonus!'
              })
          }
        }
      }

      setUser(data)
      localStorage.setItem('frushh_user', JSON.stringify(data))

      return { success: true, user: data }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }
  }

  async function addAddress(addressData) {
    try {
      // If this is the first address or marked as default, unset other defaults
      if (addressData.is_default) {
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
      }

      const { data, error } = await supabase
        .from('user_addresses')
        .insert({
          user_id: user.id,
          ...addressData
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, address: data }
    } catch (error) {
      console.error('Error adding address:', error)
      return { success: false, error: error.message }
    }
  }

  async function getAddresses() {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })

      if (error) throw error

      return { success: true, addresses: data || [] }
    } catch (error) {
      console.error('Error fetching addresses:', error)
      return { success: false, addresses: [] }
    }
  }

  async function deleteAddress(addressId) {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error deleting address:', error)
      return { success: false, error: error.message }
    }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('frushh_user')
  }

  // Check if user is first-time customer (for WELCOME25 coupon)
  async function isFirstTimeCustomer() {
    if (!user) return false
    
    try {
      // Check orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (orders && orders.length > 0) return false

      // Check first_order_tracking
      const { data: tracking } = await supabase
        .from('first_order_tracking')
        .select('id')
        .or(`email.eq.${user.email},phone.eq.${user.phone}`)
        .limit(1)

      return !tracking || tracking.length === 0
    } catch (error) {
      console.error('Error checking first-time customer:', error)
      return false
    }
  }

  const value = {
    user,
    loading,
    sendOTP,
    verifyOTP,
    updateProfile,
    addAddress,
    getAddresses,
    deleteAddress,
    logout,
    isFirstTimeCustomer
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
