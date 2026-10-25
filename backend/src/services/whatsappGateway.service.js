import makeWASocket, { DisconnectReason, useMultiFileAuthState as loadAuthState } from '@whiskeysockets/baileys'
import QRCode from 'qrcode'
import pino from 'pino'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const AUTH_DIR = path.resolve(__dirname, '../../.baileys_auth')

let waSocket = null
let currentStatus = 'DISCONNECTED' // 'DISCONNECTED' | 'INITIALIZING' | 'QR_READY' | 'CONNECTED'
let latestQrDataUrl = null
let connectedUser = null
let isStarting = false

/**
 * Start or retrieve the Baileys WhatsApp Gateway session.
 * Generates an authentic cryptographic QR code that pairs with WhatsApp mobile app.
 */
export const startWhatsAppGateway = async () => {
  if (waSocket && currentStatus === 'CONNECTED') {
    return { status: currentStatus, user: connectedUser }
  }
  if (isStarting) {
    return { status: currentStatus, qr: latestQrDataUrl, user: connectedUser }
  }

  isStarting = true
  currentStatus = 'INITIALIZING'

  try {
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true })
    }

    const { state, saveCreds } = await loadAuthState(AUTH_DIR)

    waSocket = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: true,
      browser: ['Pharmx AI Gateway', 'Chrome', '120.0.0']
    })

    waSocket.ev.on('creds.update', saveCreds)

    waSocket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        try {
          latestQrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 6 })
          currentStatus = 'QR_READY'
          console.log('[WhatsApp Real Gateway] 📸 Live QR Code generated! Ready to scan.')
        } catch (qrErr) {
          console.warn('[WhatsApp Gateway QR Error]', qrErr.message)
        }
      }

      if (connection === 'open') {
        currentStatus = 'CONNECTED'
        connectedUser = waSocket.user?.id ? waSocket.user.id.split(':')[0] : 'Linked Caregiver'
        latestQrDataUrl = null
        isStarting = false
        console.log(`[WhatsApp Real Gateway] ✅ Device Linked! User: +${connectedUser}`)
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut

        console.log(`[WhatsApp Gateway Connection Closed] StatusCode: ${statusCode}, Reconnect: ${shouldReconnect}`)
        isStarting = false

        if (shouldReconnect) {
          currentStatus = 'INITIALIZING'
          setTimeout(() => {
            startWhatsAppGateway().catch((err) => console.warn('[WhatsApp Reconnect Error]', err.message))
          }, 3000)
        } else {
          currentStatus = 'DISCONNECTED'
          connectedUser = null
          latestQrDataUrl = null
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true })
          } catch {
            // ignore
          }
        }
      }
    })

    return { status: currentStatus, qr: latestQrDataUrl, user: connectedUser }
  } catch (err) {
    isStarting = false
    currentStatus = 'DISCONNECTED'
    console.warn('[WhatsApp Gateway Start Error]', err.message)
    return { status: currentStatus, error: err.message }
  }
}

/**
 * Get the current live status and QR code of the gateway.
 */
export const getWhatsAppGatewayStatus = () => {
  return {
    status: currentStatus,
    qr: latestQrDataUrl,
    user: connectedUser
  }
}

/**
 * Unlink / Disconnect the active WhatsApp session.
 */
export const disconnectWhatsAppGateway = async () => {
  try {
    if (waSocket) {
      await waSocket.logout().catch(() => {})
      waSocket = null
    }
    currentStatus = 'DISCONNECTED'
    latestQrDataUrl = null
    connectedUser = null
    isStarting = false
    try {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true })
    } catch {
      // ignore
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Send an authentic WhatsApp message to any phone number via linked session.
 */
export const sendRealWhatsAppAlert = async (toPhone, message) => {
  if (!waSocket || currentStatus !== 'CONNECTED') {
    return {
      success: false,
      error: 'WhatsApp Gateway is not connected. Please scan the QR code first.'
    }
  }

  try {
    const clean = toPhone.replace(/\D/g, '')
    const target = (clean.length === 10 ? `91${clean}` : clean) + '@s.whatsapp.net'

    const sent = await waSocket.sendMessage(target, { text: message })
    console.log(`[WhatsApp Real Gateway] Message delivered to ${target} (ID: ${sent.key.id})`)
    return {
      success: true,
      messageId: sent.key.id,
      recipient: target
    }
  } catch (err) {
    console.warn('[WhatsApp Real Gateway Send Error]', err.message)
    return {
      success: false,
      error: err.message
    }
  }
}
