import jwt from 'jsonwebtoken'

const FALLBACK_SECRET = 'mediguard_prod_secret_HackInMotion_RICR_HIM_2026'

const getSecret = () => {
  const secret = process.env.JWT_SECRET || FALLBACK_SECRET
  if (!process.env.JWT_SECRET) {
    console.warn('[JWT] WARNING: JWT_SECRET env var not set — using fallback secret. Set JWT_SECRET in production!')
  }
  return secret
}

/**
 * Sign a JWT with minimal payload.
 * @param {string} userId - MongoDB ObjectId string
 * @returns {string} signed JWT
 */
export const signToken = (userId) => {
  return jwt.sign(
    { userId },
    getSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {{ userId: string, iat: number, exp: number }}
 * @throws JsonWebTokenError | TokenExpiredError
 */
export const verifyToken = (token) => {
  return jwt.verify(token, getSecret())
}
