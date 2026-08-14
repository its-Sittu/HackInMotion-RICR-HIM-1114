import bcrypt from 'bcryptjs'
import validator from 'validator'
import User from '../models/User.js'
import { signToken } from '../config/jwt.js'
import {
  generateOtp,
  buildOtpFields,
  canResendOtp,
  isOtpExpired,
  isMaxAttemptsExceeded,
  compareOtp
} from '../services/otp.service.js'
import { sendOtp } from '../services/sms.service.js'

const BCRYPT_ROUNDS = 12

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizeInput = (input) => {
  if (!input) return ''
  if (validator.isEmail(input)) return input.trim().toLowerCase()
  return input.startsWith('+') ? input : `+${input}`
}

const validatePhoneOrEmail = (input) => {
  if (!input) return 'Phone number or Email address is required.'
  if (validator.isEmail(input)) return null
  const normalized = input.startsWith('+') ? input : `+${input}`
  if (validator.isMobilePhone(normalized, 'any', { strictMode: false })) {
    return null
  }
  return 'Please enter a valid phone number or email address.'
}

const validatePassword = (password) => {
  if (!password) return 'Password is required.'
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.'
  return null
}

// Generic error for OTP flows — avoid enumeration attacks
const OTP_GENERIC_ERROR = 'Invalid or expired OTP. Please request a new one.'

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/send-otp
 * Send a 6-digit OTP to the given phone number or email.
 * Works for both signup and forgot-password flows.
 */
export const sendOtpHandler = async (req, res, next) => {
  try {
    const { phone, purpose = 'signup' } = req.body

    const inputErr = validatePhoneOrEmail(phone)
    if (inputErr) return res.status(400).json({ success: false, message: inputErr })

    if (!['signup', 'reset'].includes(purpose)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP purpose.' })
    }

    const normalized = normalizeInput(phone)

    // Find or create a user record
    let user = await User.findOne({ phone: normalized }).select(
      '+otpHash +otpExpiry +otpAttempts +otpLastSentAt +otpPurpose +passwordHash'
    )

    if (purpose === 'reset' && !user) {
      // Don't reveal that the account doesn't exist
      return res.status(200).json({
        success: true,
        message: 'If an account with this number exists, an OTP has been sent.'
      })
    }

    if (purpose === 'signup' && user?.isPhoneVerified && user?.passwordHash) {
      return res.status(409).json({
        success: false,
        message: 'An account with this phone number already exists. Please log in.'
      })
    }

    // Resend cooldown check
    if (user && !canResendOtp(user)) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 60 seconds before requesting a new OTP.'
      })
    }

    const otp = generateOtp()
    const otpFields = await buildOtpFields(otp, purpose)

    if (!user) {
      user = await User.create({ phone: normalized, ...otpFields })
    } else {
      Object.assign(user, otpFields)
      await user.save()
    }

    // Dispatch OTP dispatch asynchronously so browser gets instant response
    sendOtp(normalized, otp).catch(err => {
      console.warn('[OTP Dispatch Background Warning]:', err.message)
    })

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully. It expires in 5 minutes.'
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/verify-otp
 * Verify the OTP sent to a phone number.
 * Returns a short-lived session token to authorize signup / reset-password.
 */
export const verifyOtpHandler = async (req, res, next) => {
  try {
    const { phone, otp, purpose = 'signup' } = req.body

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required.' })
    }

    const normalized = normalizeInput(phone)

    const user = await User.findOne({ phone: normalized }).select(
      '+otpHash +otpExpiry +otpAttempts +otpPurpose'
    )

    if (!user) {
      return res.status(400).json({ success: false, message: OTP_GENERIC_ERROR })
    }

    if (isMaxAttemptsExceeded(user)) {
      // Wipe OTP — must request a new one
      user.otpHash = undefined
      user.otpExpiry = undefined
      user.otpAttempts = 0
      await user.save()
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.'
      })
    }

    if (isOtpExpired(user)) {
      return res.status(400).json({ success: false, message: OTP_GENERIC_ERROR })
    }

    if (user.otpPurpose !== purpose) {
      return res.status(400).json({ success: false, message: OTP_GENERIC_ERROR })
    }

    const isMatch = await compareOtp(otp, user.otpHash)

    if (!isMatch) {
      user.otpAttempts = (user.otpAttempts || 0) + 1
      await user.save()
      return res.status(400).json({
        success: false,
        message: `Incorrect OTP. ${5 - user.otpAttempts} attempts remaining.`
      })
    }

    // OTP valid — mark phone as verified and clear OTP fields
    user.isPhoneVerified = true
    user.otpHash = undefined
    user.otpExpiry = undefined
    user.otpAttempts = 0
    user.otpLastSentAt = undefined
    await user.save()

    // Issue a short-lived token to authorize the next step (signup/reset)
    const sessionToken = signToken(user._id.toString())

    return res.status(200).json({
      success: true,
      message: 'Phone number verified successfully.',
      sessionToken
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/signup
 * Complete account creation after OTP verification.
 * Requires a valid sessionToken from verify-otp.
 */
export const signupHandler = async (req, res, next) => {
  try {
    const { phone, password, sessionToken } = req.body

    if (!phone || !password || !sessionToken) {
      return res.status(400).json({
        success: false,
        message: 'Phone, password, and session token are required.'
      })
    }

    const passErr = validatePassword(password)
    if (passErr) return res.status(400).json({ success: false, message: passErr })

    const normalized = normalizeInput(phone)

    // Verify the session token (issued after OTP verification)
    let decoded
    try {
      const { verifyToken } = await import('../config/jwt.js')
      decoded = verifyToken(sessionToken)
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid. Please verify your phone again.'
      })
    }

    const user = await User.findOne({ phone: normalized, _id: decoded.userId }).select(
      '+passwordHash'
    )

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' })
    }

    if (!user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be verified before setting a password.'
      })
    }

    if (user.passwordHash) {
      return res.status(409).json({
        success: false,
        message: 'Account already exists. Please log in.'
      })
    }

    user.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    await user.save()

    const token = signToken(user._id.toString())

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: user.toSafeObject()
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/login
 * Authenticate with phone + password. Returns JWT on success.
 */
export const loginHandler = async (req, res, next) => {
  try {
    const { phone, password } = req.body

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and password are required.'
      })
    }

    const normalized = normalizeInput(phone)

    const user = await User.findOne({ phone: normalized }).select('+passwordHash')

    // Use generic message to prevent account enumeration
    const INVALID_CREDS = 'Invalid phone number or password.'

    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: INVALID_CREDS })
    }

    if (!user.isPhoneVerified) {
      return res.status(401).json({
        success: false,
        message: 'Phone number is not verified. Please complete signup.'
      })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: INVALID_CREDS })
    }

    const token = signToken(user._id.toString())

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: user.toSafeObject()
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/forgot-password
 * Send OTP to phone for password reset.
 */
export const forgotPasswordHandler = async (req, res, next) => {
  // Reuse send-otp handler with purpose='reset'
  req.body.purpose = 'reset'
  return sendOtpHandler(req, res, next)
}

/**
 * POST /api/auth/reset-password
 * Reset password after OTP verification (sessionToken from verify-otp).
 */
export const resetPasswordHandler = async (req, res, next) => {
  try {
    const { phone, password, sessionToken } = req.body

    if (!phone || !password || !sessionToken) {
      return res.status(400).json({
        success: false,
        message: 'Phone, new password, and session token are required.'
      })
    }

    const passErr = validatePassword(password)
    if (passErr) return res.status(400).json({ success: false, message: passErr })

    let decoded
    try {
      const { verifyToken } = await import('../config/jwt.js')
      decoded = verifyToken(sessionToken)
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid. Please verify your phone again.'
      })
    }

    const normalized = normalizeInput(phone)
    const user = await User.findOne({ phone: normalized, _id: decoded.userId }).select(
      '+passwordHash'
    )

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' })
    }

    user.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/logout
 * Stateless JWT — client discards token. Server acknowledges.
 */
export const logoutHandler = (_req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  })
}

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile. Protected by authMiddleware.
 */
export const getMeHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    return res.status(200).json({
      success: true,
      user: user.toSafeObject()
    })
  } catch (err) {
    next(err)
  }
}
