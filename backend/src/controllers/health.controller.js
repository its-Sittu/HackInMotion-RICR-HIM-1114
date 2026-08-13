import * as healthService from '../services/health.service.js'

/**
 * Health check controller
 * @route GET /api/health
 */
export const checkHealth = (req, res, next) => {
  try {
    const healthStatus = healthService.getHealthStatus()
    return res.status(200).json(healthStatus)
  } catch (error) {
    next(error)
  }
}
