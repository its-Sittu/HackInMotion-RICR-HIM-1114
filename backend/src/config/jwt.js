import jwt from 'jsonwebtoken'

const getSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables.')
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
