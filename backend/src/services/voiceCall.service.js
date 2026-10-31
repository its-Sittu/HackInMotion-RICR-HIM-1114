/* cspell:disable */
import twilio from 'twilio'

/**
 * Pharmx AI - Ultra-Human Direct Conversational Voice Call Service
 * Powered by Twilio Programmable Voice + Amazon Polly Kajal Neural Engine (Hindi)
 */

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (accountSid && authToken) {
    return twilio(accountSid, authToken)
  }
  return null
}

/**
 * Format phone number to international E.164 (+91 for India by default)
 */
export const formatToE164 = (phone) => {
  if (!phone) return ''
  const cleaned = String(phone).replace(/[^\d+]/g, '')
  if (cleaned.startsWith('+')) return cleaned
  if (cleaned.length === 10) return `+91${cleaned}`
  if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`
  return `+${cleaned}`
}

/**
 * Convert technical/medical terms to Natural Conversational Hindi Phrasing
 */
const convertToConversationalHindi = (text) => {
  if (!text) return ''
  return text
    .replace(/\bmg\b/gi, 'मिलीग्राम')
    .replace(/\b(tab|tablets?)\b/gi, 'गोली')
    .replace(/\b(caps?|capsules?)\b/gi, 'कैप्सूल')
    .replace(/\bDolo 650\b/gi, 'डोलो 650 मिलीग्राम')
    .replace(/\bPantocid 40\b/gi, 'पेंटोसिड 40 मिलीग्राम')
    .replace(/\bCrocin\b/gi, 'क्रोसिन')
    .replace(/\bCombiflam\b/gi, 'कॉम्बीफ़्लाम')
    .replace(/\bAzithral\b/gi, 'एज़िथ्रल')
    .replace(/\bMetformin\b/gi, 'मेटफ़ॉर्मिन')
    .replace(/\bParacetamol\b/gi, 'पैरासिटामोल')
    .replace(/\bAfter Food\b/gi, 'खाना खाने के बाद')
    .replace(/\bBefore Food\b/gi, 'खाली पेट')
    .replace(/\bWith Dinner\b/gi, 'रात के खाने के साथ')
    .replace(/\bPost-Meals?\b/gi, 'खाना खाने के बाद')
    .replace(/\bPre-Breakfast\b/gi, 'सुबह खाली पेट')
}

/**
 * Medical purpose directly tied to the patient's condition
 */
const getMedicineReasonInHindi = (medName) => {
  if (!medName) return 'आपकी सेहत के लिए'
  const lower = medName.toLowerCase()
  if (lower.includes('dolo') || lower.includes('crocin') || lower.includes('paracetamol')) {
    return 'बुखार और दर्द से आराम के लिए'
  }
  if (lower.includes('panto') || lower.includes('pan') || lower.includes('acid') || lower.includes('omepra') || lower.includes('rabepra')) {
    return 'गैस और एसिडिटी से राहत के लिए'
  }
  if (lower.includes('combiflam') || lower.includes('ibuprofen')) {
    return 'दर्द और सूजन को कम करने के लिए'
  }
  if (lower.includes('glycomet') || lower.includes('metformin') || lower.includes('sugar')) {
    return 'ब्लड शुगर कंट्रोल में रखने के लिए'
  }
  if (lower.includes('azithral') || lower.includes('amoxicillin') || lower.includes('antibiotic')) {
    return 'इन्फेक्शन को खत्म करने के लिए'
  }
  if (lower.includes('cetirizine') || lower.includes('allegra') || lower.includes('cold')) {
    return 'एलर्जी और सर्दी से राहत के लिए'
  }
  if (lower.includes('ecosprin') || lower.includes('aspirin') || lower.includes('cardio')) {
    return 'दिल को सुरक्षित रखने के लिए'
  }
  return 'आपकी तबियत ठीक रखने के लिए'
}

/**
 * Check Voice Gateway Connection Status
 */
export const getVoiceGatewayStatus = async () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const fromNumber = process.env.TWILIO_FROM_NUMBER || '+16203495094'
  const client = getTwilioClient()

  if (!client) {
    return {
      isConfigured: false,
      provider: 'Twilio Programmable Voice',
      message: 'Twilio credentials not configured in backend/.env'
    }
  }

  try {
    const account = await client.api.v2010.accounts(accountSid).fetch()
    return {
      isConfigured: true,
      provider: 'Twilio Programmable Voice',
      accountName: account.friendlyName,
      status: account.status,
      fromNumber,
      voiceEngine: 'Amazon Polly Kajal Neural (Real Human Hindi Conversational Voice)'
    }
  } catch (err) {
    return {
      isConfigured: false,
      provider: 'Twilio Programmable Voice',
      error: err.message
    }
  }
}

/**
 * Generate Direct, Problem-Only Human Hindi Voice Script
 * Zero unnecessary introductions or robot menus - only the medicine and health issue!
 */
export const generateCallTwiML = ({
  patientName = '',
  medicine = 'दवाई',
  instruction = 'समय पर',
  _time = 'अभी',
  isEmergency = false
}) => {
  const hindiMed = convertToConversationalHindi(medicine)
  const hindiInst = convertToConversationalHindi(instruction)
  const reason = getMedicineReasonInHindi(medicine)
  const cleanName = patientName && patientName !== 'Patient' ? patientName : ''

  if (isEmergency) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Kajal-Neural" language="hi-IN">
    नमस्ते! ${cleanName ? cleanName + ' जी' : 'मरीज़'} ने अपनी ${hindiMed} अभी तक नहीं ली है। यह दवाई ${reason} ज़रूरी है। कृपया तुरंत उनसे बात करके चेक करें।
  </Say>
</Response>`
  }

  // Pure direct Hindi - directly about medicine and health problem
  const greeting = cleanName ? `नमस्ते ${cleanName} जी!` : `नमस्ते!`

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech dtmf" numDigits="1" timeout="5" speechTimeout="auto">
    <Say voice="Polly.Kajal-Neural" language="hi-IN">
      ${greeting} आपकी ${hindiMed} का समय हो गया है। ${reason}, इसे ${hindiInst || 'समय पर'} ले लीजिए। क्या आपने दवाई ले ली है?
    </Say>
  </Gather>
  <Say voice="Polly.Kajal-Neural" language="hi-IN">
    कृपया दवाई समय पर ले लीजिए। अपना ख्याल रखें।
  </Say>
</Response>`
}

/**
 * Trigger Real Outbound Automated Phone Call via Twilio
 */
export const triggerOutboundCall = async ({ toPhone, patientName, medicine, instruction, time, isEmergency = false }) => {
  const client = getTwilioClient()
  if (!client) {
    throw new Error('Twilio Voice Client is not configured. Please check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.')
  }

  const fromNumber = process.env.TWILIO_FROM_NUMBER || '+16203495094'
  const formattedTo = formatToE164(toPhone)

  if (!formattedTo || formattedTo.length < 10) {
    throw new Error(`Invalid recipient phone number: "${toPhone}". Must be a valid phone number.`)
  }

  const twiml = generateCallTwiML({
    patientName: patientName || 'Sittu',
    medicine: medicine || 'डोलो 650 मिलीग्राम',
    instruction: instruction || 'खाना खाने के बाद',
    time: time || 'अभी',
    isEmergency
  })

  console.log(`[📞 TWILIO REAL HUMAN HINDI VOICE CALL TRIGGERED]`)
  console.log(`  ➔ Calling: ${formattedTo}`)
  console.log(`  ➔ From   : ${fromNumber}`)
  console.log(`  ➔ Mode   : Pure Medical Problem Focus`)

  try {
    const call = await client.calls.create({
      to: formattedTo,
      from: fromNumber,
      twiml
    })

    console.log(`[Twilio Call Placed Successfully ✅] Call SID: ${call.sid} | Status: ${call.status}`)

    return {
      success: true,
      callSid: call.sid,
      status: call.status,
      to: formattedTo,
      from: fromNumber,
      dispatchedAt: new Date().toISOString()
    }
  } catch (err) {
    console.error(`[Twilio Voice Call Failed ❌] ${err.message}`)
    throw err
  }
}
