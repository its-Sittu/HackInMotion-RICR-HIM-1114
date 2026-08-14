import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  sendOtpHandler,
  verifyOtpHandler,
  signupHandler,
  loginHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  logoutHandler,
  getMeHandler
} from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

// ─── Rate Limiters ────────────────────────────────────────────────────────────

const isTest = () => process.env.NODE_ENV === 'test'

/** OTP send: max 3 requests per 10 minutes per IP */
const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  skip: isTest,
  message: { success: false, message: 'Too many OTP requests. Please try again in 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
})

/** OTP verify: max 10 attempts per 10 minutes per IP */
const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  skip: isTest,
  message: { success: false, message: 'Too many verification attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
})

/** Login: max 10 attempts per 15 minutes per IP */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: isTest,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
})

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * @route  POST /api/auth/send-otp
 * @desc   Send OTP to phone (signup or password-reset)
 * @access Public
 */
router.post('/send-otp', otpSendLimiter, sendOtpHandler)

/**
 * @route  POST /api/auth/verify-otp
 * @desc   Verify OTP, returns sessionToken
 * @access Public
 */
router.post('/verify-otp', otpVerifyLimiter, verifyOtpHandler)

/**
 * @route  POST /api/auth/signup
 * @desc   Complete registration (phone verified, set password)
 * @access Public (requires valid sessionToken from verify-otp)
 */
router.post('/signup', signupHandler)

/**
 * @route  POST /api/auth/login
 * @desc   Authenticate with phone + password, returns JWT
 * @access Public
 */
router.post('/login', loginLimiter, loginHandler)

/**
 * @route  POST /api/auth/forgot-password
 * @desc   Send reset OTP to phone
 * @access Public
 */
router.post('/forgot-password', otpSendLimiter, forgotPasswordHandler)

/**
 * @route  POST /api/auth/reset-password
 * @desc   Reset password with sessionToken from verify-otp
 * @access Public (requires valid sessionToken from verify-otp)
 */
router.post('/reset-password', resetPasswordHandler)

/**
 * @route  POST /api/auth/logout
 * @desc   Client-side token discard acknowledgement
 * @access Public
 */
router.post('/logout', logoutHandler)

/**
 * @route  GET /api/auth/me
 * @desc   Get authenticated user profile
 * @access Protected (Bearer JWT)
 */
router.get('/me', authMiddleware, getMeHandler)

export default router
