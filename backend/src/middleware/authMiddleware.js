import { verifyToken } from '../config/jwt.js'

export const jwtRouteGuardActive = true

/**
 * Authentication middleware.
 * Reads Bearer token from Authorization header, verifies JWT,
 * and attaches req.userId for downstream handlers.
 *
 * Rejects with 401 on missing, invalid, or expired tokens.
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is missing.'
      })
    }

    const decoded = verifyToken(token)
    req.userId = decoded.userId
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again.'
      })
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.'
      })
    }
    next(err)
  }
}
