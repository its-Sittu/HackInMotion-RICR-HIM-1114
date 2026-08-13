/**
 * SMS Service — clean abstraction over any SMS provider.
 *
 * Currently supported providers:
 *   - Twilio (activates when TWILIO_* env vars are set)
 *   - Dev mode (logs OTP to console — default when no provider is configured)
 *
 * To add a new provider (e.g. AWS SNS, MSG91):
 *   1. Add a new sendWith<Provider> function below
 *   2. Add its env-var detection in sendOtp()
 *
 * REQUIRED env vars for Twilio:
 *   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
 *   TWILIO_AUTH_TOKEN=your_auth_token
 *   TWILIO_FROM_NUMBER=+1xxxxxxxxxx
 */

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Send OTP via Twilio SMS.
 * Twilio SDK is imported dynamically so it's only required when configured.
 */
const sendWithTwilio = async (phone, otp) => {
  // Dynamic import — avoids hard dep if Twilio not installed
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
 * @param {string} otp    - plaintext OTP (never logged in production)
 */
export const sendOtp = async (phone, otp) => {
  const hasTwilio =
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER

  if (hasTwilio) {
    await sendWithTwilio(phone, otp)
    return
  }

  if (isProduction) {
    // Production with no SMS provider configured — fail loudly
    throw new Error(
      'No SMS provider configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.'
    )
  }

  // Development / test — safe log only
  sendWithDevLogger(phone, otp)
}
