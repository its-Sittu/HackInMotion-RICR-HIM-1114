import { Router } from 'express'
import { checkHealth, sendEmergencySosHandler } from '../controllers/health.controller.js'

const router = Router()

/**
 * @route GET /api/health
 * @desc  Health check endpoint
 * @access Public
 */
router.get('/', checkHealth)

/**
 * @route POST /api/health/send-emergency-sos
 * @desc  Send Emergency SOS alert to priority family contacts
 * @access Public
 */
router.post('/send-emergency-sos', sendEmergencySosHandler)

export default router
