import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)

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

  async function sendOTP(phone) {
    try {
      const otp = generateOTP()

      // Mark all previous OTPs as used
      await supabase
        .from('otp_verifications')
        .update({ is_used: true })
        .eq('phone', phone)

      // Save new OTP
      const { error } = await supabase
        .from('otp_verifications')
        .insert({
          phone: phone,
          otp: otp,
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          is_used: false
        })

      if (error) throw error

      const whatsappNumber = '919271981229'
      const message = `My FRUSHH login OTP is: ${otp}`
      const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

      return { success: true, otp, whatsappLink }
    } catch (error) {
      console.error('Error sending OTP:', error)
      return { success: false, error: error.message }
    }
  }

  async function verifyOTP(phone, enteredOTP) {
    try {
      // Get latest unused OTP for this phone
      const { data: otpData, error: otpError } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone', phone)
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (otpError || !otpData) {
        return { success: false, error: 'OTP not found. Please request a new one.' }
      }

      // Check if OTP matches (skip expiry check for now)
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
        .eq('phone', phone)
        .single()

      if (existingUser) {
        setUser(existingUser)
        localStorage.setItem('frushh_user', JSON.stringify(existingUser))
        
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', existingUser.id)

        return { success: true, isNewUser: false, user: existingUser }
      } else {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            phone: phone,
            is_verified: true,
            last_login: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) throw createError

        await supabase
          .from('loyalty_points')
          .insert({
            user_id: newUser.id,
            points_balance: 50,
            total_earned: 50
          })

        await supabase
          .from('points_transactions')
          .insert({
            user_id: newUser.id,
            points: 50,
            type: 'signup',
            description: 'Welcome bonus for signing up!'
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

  async function updateProfile(profileData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          email: profileData.email,
          default_address: profileData.default_address,
          preferred_gym: profileData.preferred_gym,
          birthday: profileData.birthday,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      const wasIncomplete = !user.name || !user.default_address
      const isNowComplete = profileData.name && profileData.default_address

      if (wasIncomplete && isNowComplete) {
        const { data: pointsData } = await supabase
          .from('loyalty_points')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (pointsData) {
          const { data: existingBonus } = await supabase
            .from('points_transactions')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'profile_complete')
            .single()

          if (!existingBonus) {
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

  function logout() {
    setUser(null)
    localStorage.removeItem('frushh_user')
  }

  function openLogin() { setShowLogin(true) }
  function closeLogin() { setShowLogin(false) }

  const value = {
    user,
    loading,
    showLogin,
    sendOTP,
    verifyOTP,
    updateProfile,
    logout,
    openLogin,
    closeLogin
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
