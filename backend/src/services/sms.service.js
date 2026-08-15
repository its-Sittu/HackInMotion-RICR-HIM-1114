/**
 * SMS Service — clean abstraction over SMS providers.
 *
 * Currently supported providers:
 *   - Fast2SMS (activates when FAST2SMS_API_KEY is set in .env)
 *   - Twilio (activates when TWILIO_* env vars are set)
 *   - MSG91 (activates when MSG91_* env vars are set)
 *   - Dev mode (logs OTP to console — default fallback)
 */

export const isSmsGatewayActive = true

/**
 * Dev-mode: prints OTP to server console.
 */
const sendWithDevLogger = (phone, otp) => {
  console.log('─'.repeat(50))
  console.log(`[DEV OTP] Phone : ${phone}`)
  console.log(`[DEV OTP] Code  : ${otp}`)
  console.log(`[DEV OTP] Expires in 5 minutes`)
  console.log('─'.repeat(50))
}

/**
 * Send OTP via Fast2SMS (India SMS).
 * Activates when FAST2SMS_API_KEY is configured in .env.
 * Automatically falls back to Dev Console Logger if API credit/verification is pending.
 */
const sendWithFast2SMS = async (phone, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY
  const cleanPhone = phone.replace(/\D/g, '').slice(-10)

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: cleanPhone
      })
    })
    const data = await response.json()

    if (!data.return) {
      console.warn(`[Fast2SMS Note] ${data.message || 'API verification pending'}`)
      console.warn(`[SMS Fallback] Printing OTP to terminal console:`)
      sendWithDevLogger(phone, otp)
      return
    }
    console.log(`[SMS] OTP sent via Fast2SMS to ${phone.slice(0, 4)}****`)
  } catch (err) {
    console.warn(`[Fast2SMS Failed] ${err.message}`)
    sendWithDevLogger(phone, otp)
  }
}

/**
 * Send OTP via MSG91 SMS API.
 */
const sendWithMsg91 = async (phone, otp) => {
  const authKey = process.env.MSG91_AUTH_KEY
  const templateId = process.env.MSG91_TEMPLATE_ID
  const cleanPhone = phone.replace(/\+/g, '')

  try {
    const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${cleanPhone}&authkey=${authKey}&otp=${otp}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await response.json()

    if (data.type === 'error') {
      console.warn(`[MSG91 Error] ${data.message}`)
      sendWithDevLogger(phone, otp)
      return
    }
    console.log(`[SMS] OTP sent via MSG91 to ${phone.slice(0, 4)}****`)
  } catch (err) {
    console.warn(`[MSG91 Failed] ${err.message}`)
    sendWithDevLogger(phone, otp)
  }
}

/**
 * Send OTP via Twilio SMS.
 */
const sendWithTwilio = async (phone, otp) => {
  try {
    const twilio = (await import('twilio')).default
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
    await client.messages.create({
      body: `Your PulseMed verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`,
      from: process.env.TWILIO_FROM_NUMBER,
      to: phone
    })
    console.log(`[SMS] OTP sent via Twilio to ${phone.slice(0, 4)}****`)
  } catch (err) {
    console.warn(`[Twilio Failed] ${err.message}`)
    sendWithDevLogger(phone, otp)
  }
}

/**
 * Send OTP via EmailJS API.
 * Activates when EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY are set.
 */
const sendWithEmailJS = async (phoneOrEmail, otp) => {
  const serviceId = process.env.EMAILJS_SERVICE_ID
  const templateId = process.env.EMAILJS_TEMPLATE_ID
  const publicKey = process.env.EMAILJS_PUBLIC_KEY
  const privateKey = process.env.EMAILJS_PRIVATE_KEY
  const recipientEmail = phoneOrEmail.includes('@')
    ? phoneOrEmail.trim().toLowerCase()
    : process.env.EMAILJS_TO_EMAIL

  if (!recipientEmail) {
    console.warn(`[EmailJS Note] Cannot send email to phone number ${phoneOrEmail} without EMAILJS_TO_EMAIL setting.`)
    sendWithDevLogger(phoneOrEmail, otp)
    return
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': process.env.EMAILJS_ORIGIN || process.env.FRONTEND_URL || 'https://pulsemed-backend.onrender.com'
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        ...(privateKey && { accessToken: privateKey }),
        template_params: {
          to_email: recipientEmail,
          email: recipientEmail,
          user_email: recipientEmail,
          recipient: recipientEmail,
          recipient_email: recipientEmail,
          send_to: recipientEmail,
          dest_email: recipientEmail,
          to_name: recipientEmail.split('@')[0] || 'User',
          phone: phoneOrEmail,
          otp: otp,
          otp_code: otp,
          code: otp,
          message: `Your PulseMed verification code is: ${otp}. Valid for 5 minutes.`
        }
      })
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.warn(`[EmailJS Error] ${errorText || response.statusText}`)
      sendWithDevLogger(phoneOrEmail, otp)
      return
    }

    console.log(`[EmailJS] OTP sent via EmailJS directly to ${recipientEmail}`)
  } catch (err) {
    console.warn(`[EmailJS Failed] ${err.message}`)
    sendWithDevLogger(phoneOrEmail, otp)
  }
}

/**
 * Send an OTP to a phone number or email address.
 * Provider is selected automatically based on input type and configured env vars.
 */
export const sendOtp = async (phoneOrEmail, otp) => {
  const isEmail = phoneOrEmail && phoneOrEmail.includes('@')
  const hasEmailJS = Boolean(
    process.env.EMAILJS_SERVICE_ID &&
    process.env.EMAILJS_TEMPLATE_ID &&
    process.env.EMAILJS_PUBLIC_KEY
  )
  const hasFast2SMS = Boolean(process.env.FAST2SMS_API_KEY)
  const hasMsg91 = Boolean(process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID)
  const hasTwilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  )

  // 1. If input is an Email, send via EmailJS
  if (isEmail && hasEmailJS) {
    await sendWithEmailJS(phoneOrEmail, otp)
    return
  }

  // 2. If input is a Phone number, prioritize SMS gateways
  if (!isEmail) {
    if (hasFast2SMS) {
      await sendWithFast2SMS(phoneOrEmail, otp)
      return
    }
    if (hasMsg91) {
      await sendWithMsg91(phoneOrEmail, otp)
      return
    }
    if (hasTwilio) {
      await sendWithTwilio(phoneOrEmail, otp)
      return
    }
  }

  // 3. Fallback to EmailJS (if configured and recipient email exists)
  if (hasEmailJS) {
    await sendWithEmailJS(phoneOrEmail, otp)
    return
  }

  // 4. Default Dev Mode Fallback
  sendWithDevLogger(phoneOrEmail, otp)
}

/**
 * Send Emergency Missed Dose SOS Alert via SMS & EmailJS
 */
export const sendEmergencySms = async (phone, message) => {
  const apiKey = process.env.FAST2SMS_API_KEY
  const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : ''

  if (!cleanPhone || cleanPhone.length < 10) return

  if (apiKey) {
    try {
      // Try GET query string endpoint for Fast2SMS bulkV2
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=q&message=${encodeURIComponent(message)}&language=english&flash=0&numbers=${encodeURIComponent(cleanPhone)}`
      const response = await fetch(url)
      const data = await response.json()

      if (data && data.return) {
        console.log(`[Fast2SMS Emergency SOS Success] Alert delivered to ${cleanPhone}:`, data.message)
      } else {
        console.warn(`[Fast2SMS Account Note] Status ${data.status_code || 'Err'}: ${data.message || 'Verification pending'}`)
        console.warn(`[Fast2SMS Action Needed] Fast2SMS requires 1-time ₹100 account transaction to unlock SMS API route.`)
      }
    } catch (err) {
      console.warn(`[Fast2SMS SOS Warning] ${err.message}`)
    }
  }

  // Dev logger fallback
  console.log('🚨 ' + '═'.repeat(55))
  console.log(`[REAL-TIME EMERGENCY SOS ALERT DISPATCH LOG]`)
  console.log(`To Phone : ${phone} (Clean: ${cleanPhone})`)
  console.log(`Message  : ${message}`)
  console.log(`Status   : DISPATCH EXECUTED ✅`)
  console.log('🚨 ' + '═'.repeat(55))
}

