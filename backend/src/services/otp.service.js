import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const OTP_EXPIRY_MS = 5 * 60 * 1000       // 5 minutes
const OTP_RESEND_COOLDOWN_MS = 60 * 1000  // 60 seconds
const OTP_MAX_ATTEMPTS = 5                 // max wrong attempts before invalidation
const OTP_LENGTH = 6
const BCRYPT_ROUNDS = 10

/**
 * Generate a cryptographically random 6-digit OTP.
 * Uses crypto.randomInt for uniform distribution.
 */
export const generateOtp = () => {
  const min = Math.pow(10, OTP_LENGTH - 1)   // 100000
  const max = Math.pow(10, OTP_LENGTH) - 1   // 999999
  return String(crypto.randomInt(min, max + 1))
}

/**
 * Hash an OTP using bcrypt (so plaintext is never stored).
 */
export const hashOtp = async (otp) => {
  return bcrypt.hash(otp, BCRYPT_ROUNDS)
}

/**
 * Compare a plaintext OTP against a stored bcrypt hash.
 */
export const compareOtp = async (otp, hash) => {
  return bcrypt.compare(otp, hash)
}

/**
 * Build OTP fields to merge into user document.
 * @param {string} otp - plaintext OTP (not stored)
 * @param {'signup'|'reset'} purpose
 */
export const buildOtpFields = async (otp, purpose) => {
  const otpHash = await hashOtp(otp)
  return {
    otpHash,
    otpExpiry: new Date(Date.now() + OTP_EXPIRY_MS),
    otpAttempts: 0,
    otpLastSentAt: new Date(),
    otpPurpose: purpose
  }
}

/**
 * Check whether the user is within the resend cooldown window.
 * Returns true if a new OTP CAN be sent.
 */
export const canResendOtp = (user) => {
  if (!user.otpLastSentAt) return true
  return Date.now() - new Date(user.otpLastSentAt).getTime() >= OTP_RESEND_COOLDOWN_MS
}

/**
 * Check if the stored OTP has expired.
 */
export const isOtpExpired = (user) => {
  if (!user.otpExpiry) return true
  return Date.now() > new Date(user.otpExpiry).getTime()
}

/**
 * Check if max attempts have been exceeded.
 */
export const isMaxAttemptsExceeded = (user) => {
  return (user.otpAttempts || 0) >= OTP_MAX_ATTEMPTS
}

export { OTP_MAX_ATTEMPTS, OTP_RESEND_COOLDOWN_MS }
