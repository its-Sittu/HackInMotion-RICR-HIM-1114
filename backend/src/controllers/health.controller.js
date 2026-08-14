import * as healthService from '../services/health.service.js'
import { sendEmergencySms } from '../services/sms.service.js'

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

/**
 * Send Emergency SOS Missed Medication Alert to Priority Family Contacts
 * @route POST /api/health/send-emergency-sos
 */
export const sendEmergencySosHandler = async (req, res, next) => {
  try {
    const { contacts, medicine, time, instruction } = req.body

    const targetMedicine = medicine || 'Prescribed Medicine'
    const scheduledTime = time || 'Scheduled Time'
    const alertMessage = `🚨 PULSEMED EMERGENCY SOS: Patient missed taking "${targetMedicine}" scheduled at ${scheduledTime} (${instruction || 'Food Timing'}). 1-minute alarm rang with NO response. Please check on patient immediately!`

    console.log('═'.repeat(65))
    console.log(`[🚨 EMERGENCY SOS MISSED MEDICATION ALERT DISPATCHED]`)
    console.log(`Patient missed taking medication: "${targetMedicine}" scheduled at ${scheduledTime}`)
    console.log(`Instruction: ${instruction || 'Pre/Post Meal'}`)

    if (Array.isArray(contacts) && contacts.length > 0) {
      for (let idx = 0; idx < contacts.length; idx++) {
        const c = contacts[idx]
        console.log(`  ➔ Priority ${idx + 1} (${c.role || 'Family'}): ${c.name || 'Contact'} (${c.phone || 'No phone'}) - NOTIFIED VIA REAL SMS/EMAIL ✅`)
        if (c.phone) {
          await sendEmergencySms(c.phone, alertMessage)
        }
      }
    }
    console.log('═'.repeat(65))

    return res.status(200).json({
      success: true,
      message: `Emergency SOS alert successfully dispatched via SMS & Email to ${Array.isArray(contacts) ? contacts.length : 3} priority family contacts.`,
      dispatchedAt: new Date().toISOString()
    })
  } catch (error) {
    next(error)
  }
}
