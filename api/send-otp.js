export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, otp } = req.body

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP required' })
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'FRUSHH <onboarding@resend.dev>',
        to: email,
        subject: `${otp} is your FRUSHH verification code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: #22c55e; color: white; width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px;">
                🥤
              </div>
              <h1 style="color: #111; margin-top: 15px; font-size: 24px;">FRUSHH</h1>
            </div>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              Your verification code is:
            </p>
            
            <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #22c55e;">
                ${otp}
              </span>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              This code expires in 30 minutes. Don't share it with anyone.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Fresh Protein Shakes Under ₹99 | Delivered to your gym
              <br>
              © 2026 FRUSHH. Made with ❤️ in Pune
            </p>
          </div>
        `
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Resend error:', data)
      return res.status(500).json({ error: 'Failed to send email', details: data })
    }

    return res.status(200).json({ success: true, messageId: data.id })
  } catch (error) {
    console.error('Error sending email:', error)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
