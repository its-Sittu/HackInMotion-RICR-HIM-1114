/**
 * SMS Service — clean abstraction over SMS providers.
 *
 * Currently supported providers:
 *   - Fast2SMS (activates when FAST2SMS_API_KEY is set in .env)
 *   - Twilio (activates when TWILIO_* env vars are set)
 *   - MSG91 (activates when MSG91_* env vars are set)
 *   - Dev mode (logs OTP to console — default fallback)
 */

const isProduction = process.env.NODE_ENV === 'production'

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
      body: `Your MediGuard verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`,
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
 * Send an OTP to a phone number.
 * Provider is selected automatically based on env vars.
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

  sendWithDevLogger(phone, otp)
}
