/**
 * SMS Service — clean abstraction over SMS providers.
 *
 * Currently supported providers (No DLT required for Twilio or Fast2SMS):
 *   - Fast2SMS (activates when FAST2SMS_API_KEY is set — NO DLT required for India)
 *   - Twilio (activates when TWILIO_* env vars are set — NO DLT required)
 *   - MSG91 (activates when MSG91_* env vars are set)
 *   - Dev mode (logs OTP to console — default when no provider is configured)
 */

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Send OTP via Fast2SMS (No DLT required for Quick SMS/OTP API in India).
 * Activates when FAST2SMS_API_KEY is configured in .env.
 * Sign up free at https://www.fast2sms.com
 */
const sendWithFast2SMS = async (phone, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY
  // Extract 10-digit Indian mobile number
  const cleanPhone = phone.replace(/\D/g, '').slice(-10)

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
    throw new Error(`Fast2SMS Error: ${data.message || 'SMS delivery failed'}`)
  }
  console.log(`[SMS] OTP sent via Fast2SMS to ${phone.slice(0, 4)}****`)
}

/**
 * Send OTP via MSG91 SMS API (India SMS Service).
 * Activates when MSG91_AUTH_KEY and MSG91_TEMPLATE_ID are configured in .env.
 */
const sendWithMsg91 = async (phone, otp) => {
  const authKey = process.env.MSG91_AUTH_KEY
  const templateId = process.env.MSG91_TEMPLATE_ID
  const cleanPhone = phone.replace(/\+/g, '')

  const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${cleanPhone}&authkey=${authKey}&otp=${otp}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  const data = await response.json()

  if (data.type === 'error') {
    throw new Error(`MSG91 SMS Error: ${data.message}`)
  }
  console.log(`[SMS] OTP sent via MSG91 to ${phone.slice(0, 4)}****`)
}

/**
 * Send OTP via Twilio SMS (No DLT required).
 * Twilio SDK is imported dynamically so it's only required when configured.
 */
const sendWithTwilio = async (phone, otp) => {
  const twilio = (await import('twilio')).default
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )
  await client.messages.create({
    body: `Your MediGuard verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`,
    from: process.env.TWILIO_FROM_NUMBER,
    to: phone
  })
  console.log(`[SMS] OTP sent via Twilio to ${phone.slice(0, 4)}****`)
}

/**
 * Dev-mode: prints OTP to server console.
 * NEVER runs in production.
 */
const sendWithDevLogger = (phone, otp) => {
  console.log('─'.repeat(50))
  console.log(`[DEV OTP] Phone : ${phone}`)
  console.log(`[DEV OTP] Code  : ${otp}`)
  console.log(`[DEV OTP] Expires in 5 minutes`)
  console.log('─'.repeat(50))
}

/**
 * Send an OTP to a phone number.
 * Provider is selected automatically based on env vars.
 *
 * @param {string} phone  - E.164 format e.g. +919876543210
 * @param {string} otp    - plaintext OTP
 */
export const sendOtp = async (phone, otp) => {
  const hasFast2SMS = Boolean(process.env.FAST2SMS_API_KEY)
  const hasMsg91 = Boolean(process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID)
  const hasTwilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  )

  if (hasFast2SMS) {
    await sendWithFast2SMS(phone, otp)
    return
  }

  if (hasMsg91) {
    await sendWithMsg91(phone, otp)
    return
  }

  if (hasTwilio) {
    await sendWithTwilio(phone, otp)
    return
  }

  if (isProduction) {
    throw new Error(
      'No SMS provider configured. Set FAST2SMS_API_KEY, TWILIO_ACCOUNT_SID, or MSG91 credentials.'
    )
  }

  // Development fallback — log to server console
  sendWithDevLogger(phone, otp)
}
