import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)

  // Check for existing session on load
  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const savedUser = localStorage.getItem('frushh_user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        // Verify user still exists in database
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.id)
          .single()
        
        if (data) {
          setUser(data)
          // Update last login
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

  // Generate 6-digit OTP
  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Send OTP (via WhatsApp)
  async function sendOTP(phone) {
    try {
      const otp = generateOTP()
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

      // Save OTP to database
      const { error } = await supabase
        .from('otp_verifications')
        .insert({
          phone: phone,
          otp: otp,
          expires_at: expiresAt.toISOString()
        })

      if (error) throw error

      // Return OTP and WhatsApp link
      const whatsappNumber = '919271638630' // FRUSHH WhatsApp number
      const message = `My FRUSHH login OTP is: ${otp}`
      const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

      return { success: true, otp, whatsappLink }
    } catch (error) {
      console.error('Error sending OTP:', error)
      return { success: false, error: error.message }
    }
  }

  // Verify OTP
  async function verifyOTP(phone, enteredOTP) {
    try {
      // Get latest OTP for this phone
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

      // Check if expired
      if (new Date(otpData.expires_at) < new Date()) {
        return { success: false, error: 'OTP expired. Please request a new one.' }
      }

      // Check if OTP matches
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
        // Existing user - login
        setUser(existingUser)
        localStorage.setItem('frushh_user', JSON.stringify(existingUser))
        
        // Update last login
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
            phone: phone,
            is_verified: true,
            last_login: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) throw createError

        // Create loyalty points entry
        await supabase
          .from('loyalty_points')
          .insert({
            user_id: newUser.id,
            points_balance: 50, // Signup bonus
            total_earned: 50
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

        setUser(newUser)
        localStorage.setItem('frushh_user', JSON.stringify(newUser))

        return { success: true, isNewUser: true, user: newUser }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      return { success: false, error: error.message }
    }
  }

  // Update user profile
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

      // Check if profile was incomplete before
      const wasIncomplete = !user.name || !user.default_address
      const isNowComplete = profileData.name && profileData.default_address

      // Award profile completion bonus if first time completing
      if (wasIncomplete && isNowComplete) {
        // Get current points
        const { data: pointsData } = await supabase
          .from('loyalty_points')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (pointsData) {
          // Check if bonus already given
          const { data: existingBonus } = await supabase
            .from('points_transactions')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'profile_complete')
            .single()

          if (!existingBonus) {
            // Award 25 points for profile completion
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

  // Logout
  function logout() {
    setUser(null)
    localStorage.removeItem('frushh_user')
  }

  // Open login modal
  function openLogin() {
    setShowLogin(true)
  }

  // Close login modal
  function closeLogin() {
    setShowLogin(false)
  }

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
