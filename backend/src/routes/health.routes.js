import { Router } from 'express'
import {
  checkHealth,
  sendEmergencySosHandler,
  sendWhatsAppSosHandler,
  getWhatsAppGatewayStatusHandler,
  disconnectWhatsAppGatewayHandler,
  triggerVoiceCallHandler,
  getVoiceGatewayStatusHandler,
  getVoiceCallTwiMLHandler
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


/**
 * @route POST /api/health/trigger-voice-call
 * @desc  Trigger automated AI voice call to patient or caregiver
 * @access Public
 */
router.post('/trigger-voice-call', triggerVoiceCallHandler)

/**
 * @route GET /api/health/voice-gateway/status
 * @desc  Get Twilio Voice Gateway status & caller phone number
 * @access Public
 */
router.get('/voice-gateway/status', getVoiceGatewayStatusHandler)

/**
 * @route POST /api/health/voice-twiml
 * @desc  Dynamic TwiML endpoint for incoming/outbound voice responses
 * @access Public
 */
router.post('/voice-twiml', getVoiceCallTwiMLHandler)

export default router


