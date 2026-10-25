import { Router } from 'express'
import {
  checkHealth,
  sendEmergencySosHandler,
  sendWhatsAppSosHandler,
  getWhatsAppGatewayStatusHandler,
  disconnectWhatsAppGatewayHandler
} from '../controllers/health.controller.js'

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

/**
 * @route POST /api/health/send-whatsapp-sos
 * @desc  Send WhatsApp Emergency SOS alert to family caregiver
 * @access Public
 */
router.post('/send-whatsapp-sos', sendWhatsAppSosHandler)

/**
 * @route GET /api/health/whatsapp-gateway/status
 * @desc  Stream real WhatsApp Web QR code and connection status
 * @access Public
 */
router.get('/whatsapp-gateway/status', getWhatsAppGatewayStatusHandler)

/**
 * @route POST /api/health/whatsapp-gateway/disconnect
 * @desc  Unlink active WhatsApp Web multi-device session
 * @access Public
 */
router.post('/whatsapp-gateway/disconnect', disconnectWhatsAppGatewayHandler)

export default router


