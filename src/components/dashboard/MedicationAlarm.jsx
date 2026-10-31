import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { saveActivityToMedicalHistory } from '../../utils/activityLogger'
import { getApiUrl } from '../../utils/apiConfig'

const INITIAL_ALARMS = [
  {
    id: 'alarm-1',
    medicine: 'Pantocid 40mg (Pantoprazole)',
    time: '08:00',
    instruction: 'Pre-Breakfast (Khali Pet 30 mins before food)',
    status: 'ACTIVE', // 'ACTIVE' | 'TAKEN' | 'SNOOZED' | 'MISSED'
    color: '#6366f1'
  },
  {
    id: 'alarm-2',
    medicine: 'Dolo 650mg (Paracetamol)',
    time: '14:00',
    instruction: 'After Food (Khane Ke Baad)',
    status: 'ACTIVE',
    color: '#059669'
  },
  {
    id: 'alarm-3',
    medicine: 'Metformin 500mg',
    time: '21:30',
    instruction: 'With Dinner (Khane Ke Sath)',
    status: 'ACTIVE',
    color: '#d97706'
  }
]

const INITIAL_MEALS = [
  {
    id: 'meal-1',
    mealType: 'Breakfast (Subah Ka Nashta)',
    time: '08:30',
    foodItems: 'Oatmeal with Almonds & Banana + Warm Lemon Water',
    calories: '350 kcal',
    tag: 'High Fiber',
    tagBg: '#ecfdf5',
    tagColor: '#047857',
    medSync: 'Sync: Pre-Breakfast Pantocid 40mg',
    status: 'SCHEDULED',
    icon: '🥣'
  },
  {
    id: 'meal-2',
    mealType: 'Lunch (Dopahar Ka Khana)',
    time: '13:30',
    foodItems: 'Multigrain Roti (2), Arhar Dal, Spinach Sabzi, Fresh Curd & Green Salad',
    calories: '550 kcal',
    tag: 'Balanced Diet',
    tagBg: '#eff6ff',
    tagColor: '#1d4ed8',
    medSync: 'Sync: Post-Lunch Dolo 650mg',
    status: 'SCHEDULED',
    icon: '🥗'
  },
  {
    id: 'meal-3',
    mealType: 'Evening Snack (Shaam Ka Nashta)',
    time: '17:00',
    foodItems: 'Green Tea / Herbal Infusion + Roasted Makhana & Soaked Walnuts (4)',
    calories: '180 kcal',
    tag: 'Antioxidant',
    tagBg: '#fef3c7',
    tagColor: '#b45309',
    medSync: 'Light Snack Energy Booster',
    status: 'SCHEDULED',
    icon: '🍵'
  },
  {
    id: 'meal-4',
    mealType: 'Dinner (Raat Ka Khana)',
    time: '20:30',
    foodItems: 'Moong Dal Khichdi / Vegetable Soup + Steamed Broccoli',
    calories: '400 kcal',
    tag: 'Light Digestible',
    tagBg: '#f3e8ff',
    tagColor: '#6b21a8',
    medSync: 'Sync: With Dinner Metformin 500mg',
    status: 'SCHEDULED',
    icon: '🍲'
  }
]

export default function MedicationAlarm({ section = 'all' } = {}) {
  const [alarms, setAlarms] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsemed_medication_alarms')
      return saved ? JSON.parse(saved) : INITIAL_ALARMS
    } catch {
      return INITIAL_ALARMS
    }
  })

  const [meals, setMeals] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsemed_healthy_meals')
      return saved ? JSON.parse(saved) : INITIAL_MEALS
    } catch {
      return INITIAL_MEALS
    }
  })

  const [activeRingingAlarm, setActiveRingingAlarm] = useState(null)
  const [ringingTimer, setRingingTimer] = useState(10)
  const [familyCareSyncEnabled, setFamilyCareSyncEnabled] = useState(true)

  // Family WhatsApp Caregiver Contact state with Multi-Caregiver Directory (Add, Update, Delete)
  const [caregivers, setCaregivers] = useState(() => {
    try {
      const savedList = localStorage.getItem('pulsemed_caregivers_list')
      if (savedList) {
        const parsed = JSON.parse(savedList)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      const savedSingle = localStorage.getItem('pulsemed_family_whatsapp_contact')
      if (savedSingle) {
        const single = JSON.parse(savedSingle)
        if (single && single.phone) {
          return [{
            id: single.id || 'cg-1',
            name: single.name || 'Family Caregiver',
            relation: single.relation || 'Primary Caregiver',
            phone: single.phone,
            isPrimary: true,
            autoAlertEnabled: single.autoAlertEnabled !== false
          }]
        }
      }
    } catch {
      // fallback
    }
    return []
  })

  const primaryCaregiver = useMemo(() => {
    return caregivers.find(c => c.isPrimary) || caregivers[0] || null
  }, [caregivers])

  const familyContact = useMemo(() => {
    return primaryCaregiver || {
      id: 'cg-none',
      name: 'No Caregiver Configured',
      relation: 'None',
      phone: '',
      isPrimary: false,
      autoAlertEnabled: false
    }
  }, [primaryCaregiver])

  const caregiversRef = useRef(caregivers)
  const familyContactRef = useRef(familyContact)

  // Caregiver Modal States (Add, Edit, Delete Confirm)
  const [showAddCaregiverModal, setShowAddCaregiverModal] = useState(false)
  const [newCgName, setNewCgName] = useState('')
  const [newCgRelation, setNewCgRelation] = useState('')
  const [newCgPhone, setNewCgPhone] = useState('')
  const [newCgIsPrimary, setNewCgIsPrimary] = useState(false)
  const [newCgAutoAlert, setNewCgAutoAlert] = useState(true)

  const [editingCaregiver, setEditingCaregiver] = useState(null)
  const [editCgName, setEditCgName] = useState('')
  const [editCgRelation, setEditCgRelation] = useState('')
  const [editCgPhone, setEditCgPhone] = useState('')
  const [editCgIsPrimary, setEditCgIsPrimary] = useState(false)
  const [editCgAutoAlert, setEditCgAutoAlert] = useState(true)

  const [deleteConfirmCaregiver, setDeleteConfirmCaregiver] = useState(null)
  const [caregiverToast, setCaregiverToast] = useState('')

  // Twilio Automated AI Voice Call System State
  const [autoVoiceCallEnabled, setAutoVoiceCallEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsemed_auto_voice_call_enabled')
      return saved !== null ? saved === 'true' : true
    } catch {
      return true
    }
  })
// direct real phone call mode (no on-screen popup modal)

  // WhatsApp Alert Dispatch History
  const [whatsappAlertHistory, setWhatsappAlertHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsemed_whatsapp_alerts_history')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Modals for WhatsApp gateway
  const [dispatchedAlertModal, setDispatchedAlertModal] = useState(null)
  const [copiedAlert, setCopiedAlert] = useState(false)

  // WhatsApp Web QR Code Pairing Session State
  const [gatewaySession, setGatewaySession] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsemed_whatsapp_gateway_session')
      return saved ? JSON.parse(saved) : {
        isConnected: false, // Default to disconnected so user must scan QR code
        linkedPhone: '+919876543210',
        linkedName: 'Patient Primary WhatsApp',
        linkedAt: null,
        sessionId: 'PHARMX-WSS-784912',
        deviceInfo: 'WhatsApp Web Protocol (Multi-Device Active)'
      }
    } catch {
      return {
        isConnected: false,
        linkedPhone: '+919876543210',
        linkedName: 'Patient Primary WhatsApp',
        linkedAt: null,
        sessionId: 'PHARMX-WSS-784912',
        deviceInfo: 'WhatsApp Web Protocol (Multi-Device Active)'
      }
    }
  })

  const [showQrModal, setShowQrModal] = useState(false)
  const [pairingStatus, setPairingStatus] = useState('IDLE') // 'IDLE' | 'PAIRING' | 'SUCCESS'
  const [qrCountdown, setQrCountdown] = useState(45)
  const [notConnectedWarningModal, setNotConnectedWarningModal] = useState(false)
  const [realBackendQr, setRealBackendQr] = useState(null)
  const [isLiveBaileysActive, setIsLiveBaileysActive] = useState(false)
  const gatewaySessionRef = useRef(gatewaySession)

  useEffect(() => {
    gatewaySessionRef.current = gatewaySession
  }, [gatewaySession])

  useEffect(() => {
    try {
      localStorage.setItem('pulsemed_whatsapp_gateway_session', JSON.stringify(gatewaySession))
    } catch {
      // optional
    }
  }, [gatewaySession])

  // QR Countdown Timer
  useEffect(() => {
    let timer = null
    if (showQrModal && pairingStatus === 'IDLE') {
      timer = setInterval(() => {
        setQrCountdown(prev => (prev <= 1 ? 45 : prev - 1))
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [showQrModal, pairingStatus])

  useEffect(() => {
    caregiversRef.current = caregivers
    familyContactRef.current = familyContact
    try {
      localStorage.setItem('pulsemed_caregivers_list', JSON.stringify(caregivers))
      if (primaryCaregiver) {
        localStorage.setItem('pulsemed_family_whatsapp_contact', JSON.stringify(primaryCaregiver))
      }
    } catch {
      // localStorage optional
    }
  }, [caregivers, primaryCaregiver, familyContact])

  // Phone-Style Alarm Time Picker Modal state
  const [modifyModalAlarm, setModifyModalAlarm] = useState(null)
  const [pickerHour, setPickerHour] = useState('08')
  const [pickerMinute, setPickerMinute] = useState('00')

  // Add new alarm modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMedName, setNewMedName] = useState('')
  const [newMedTime, setNewMedTime] = useState('08:00')
  const [newMedInstruction, setNewMedInstruction] = useState('After Food')

  // Add new meal modal state
  const [showAddMealModal, setShowAddMealModal] = useState(false)
  const [newMealName, setNewMealName] = useState('')
  const [newMealTime, setNewMealTime] = useState('12:00')
  const [newMealItems, setNewMealItems] = useState('')
  const [newMealCal, setNewMealCal] = useState('300 kcal')
  const [newMealTag, setNewMealTag] = useState('Healthy Nutrients')

  const audioCtxRef = useRef(null)
  const soundIntervalRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem('pulsemed_medication_alarms', JSON.stringify(alarms))
    } catch {
      // localStorage optional
    }
  }, [alarms])

  useEffect(() => {
    try {
      localStorage.setItem('pulsemed_healthy_meals', JSON.stringify(meals))
    } catch {
      // localStorage optional
    }
  }, [meals])

// sync handled by multi-caregivers effect

  useEffect(() => {
    try {
      localStorage.setItem('pulsemed_whatsapp_alerts_history', JSON.stringify(whatsappAlertHistory))
    } catch {
      // localStorage optional
    }
  }, [whatsappAlertHistory])

  // Open Phone-Style Alarm Time Picker Modal for an alarm
  const openTimePickerModal = (alarm) => {
    setModifyModalAlarm(alarm)

    try {
      // Parse existing 24h time string e.g. "14:30" or "08:00 AM"
      const parts = alarm.time.split(' ')
      let hStr = '08'
      let mStr = '00'

      if (parts.length === 2) {
        // 12h legacy format e.g. "02:30 PM"
        const [h, m] = parts[0].split(':')
        let hNum = parseInt(h, 10)
        if (parts[1].toUpperCase() === 'PM' && hNum < 12) hNum += 12
        if (parts[1].toUpperCase() === 'AM' && hNum === 12) hNum = 0
        hStr = String(hNum).padStart(2, '0')
        mStr = String(m).padStart(2, '0')
      } else {
        const [h, m] = alarm.time.split(':')
        if (h && m) {
          hStr = String(parseInt(h, 10)).padStart(2, '0')
          mStr = String(parseInt(m, 10)).padStart(2, '0')
        } else {
          const now = new Date()
          hStr = String(now.getHours()).padStart(2, '0')
          mStr = String(now.getMinutes()).padStart(2, '0')
        }
      }

      setPickerHour(hStr)
      setPickerMinute(mStr)
    } catch {
      const now = new Date()
      setPickerHour(String(now.getHours()).padStart(2, '0'))
      setPickerMinute(String(now.getMinutes()).padStart(2, '0'))
    }
  }

  // Save selected phone alarm time (Pure 24-Hour Format: 00 to 23)
  const handleSavePickerTime = () => {
    if (!modifyModalAlarm) return

    const formatted24h = `${pickerHour}:${pickerMinute}`

    setAlarms(prev => prev.map(item => {
      if (item.id === modifyModalAlarm.id) {
        return {
          ...item,
          time: formatted24h,
          status: 'ACTIVE', // Re-activate so sound triggers at exact new time!
          takenTime: null
        }
      }
      return item
    }))

    setModifyModalAlarm(null)
  }

  // Play premium crystal glass melodic health chime arpeggio (E5 -> G#5 -> B5 -> E6)
  const playSoundBeep = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const notes = [659.25, 830.61, 987.77, 1318.51]
      const startTime = ctx.currentTime

      notes.forEach((freq, idx) => {
        const noteTime = startTime + (idx * 0.12)
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, noteTime)

        // Soft glass attack and crystal bell decay
        gain.gain.setValueAtTime(0.001, noteTime)
        gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.55)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(noteTime)
        osc.stop(noteTime + 0.6)
      })
    } catch {
      // Audio synth optional
    }
  }

  // Real-time clock interval checking scheduled alarms every 1 second
  useEffect(() => {
    const checkClock = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const formatted24h = `${hours}:${minutes}`

      // Also 12h format for legacy items
      const h12 = now.getHours() % 12 === 0 ? 12 : now.getHours() % 12
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM'
      const formatted12h = `${String(h12).padStart(2, '0')}:${minutes} ${ampm}`

      alarms.forEach(alarm => {
        const isMatch = alarm.status === 'ACTIVE' && (
          alarm.time === formatted24h ||
          alarm.time.toUpperCase() === formatted12h.toUpperCase() ||
          (alarm.time24 && alarm.time24 === formatted24h)
        )

        if (isMatch) {
          if (!activeRingingAlarm || activeRingingAlarm.id !== alarm.id) {
            setRingingTimer(10)
            setActiveRingingAlarm(alarm)
          }
        }
      })
    }

    checkClock()
    const interval = setInterval(checkClock, 1000)
    return () => clearInterval(interval)
  }, [alarms, activeRingingAlarm])

  // Sound loop when activeRingingAlarm is set
  useEffect(() => {
    if (activeRingingAlarm) {
      playSoundBeep()
      soundIntervalRef.current = setInterval(playSoundBeep, 1200)
    } else {
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current)
        soundIntervalRef.current = null
      }
    }
    return () => {
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current)
      }
    }
  }, [activeRingingAlarm])

  // Poll real Baileys WhatsApp Gateway for live QR code and real phone pairing
  useEffect(() => {
    let pollInterval = null

    if (showQrModal && pairingStatus !== 'SUCCESS') {
      const fetchGatewayStatus = async () => {
        try {
          const res = await fetch(getApiUrl('/api/health/whatsapp-gateway/status'))
          if (!res.ok) return
          const data = await res.json()

          if (data && data.success) {
            setIsLiveBaileysActive(true)
            if (data.qr) {
              setRealBackendQr(data.qr)
            }
            if (data.status === 'CONNECTED') {
              const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              setGatewaySession({
                isConnected: true,
                linkedPhone: data.user ? `+${data.user}` : (familyContact.phone || '+919876543210'),
                linkedName: 'Linked WhatsApp Device',
                linkedAt: `Today, ${now}`,
                sessionId: `PHARMX-LIVE-${Math.floor(100000 + Math.random() * 900000)}`,
                deviceInfo: 'Real WhatsApp Multi-Device Session (Live Baileys Engine)'
              })
              setPairingStatus('SUCCESS')
              playSoundBeep()
              setTimeout(() => {
                setShowQrModal(false)
                setPairingStatus('IDLE')
              }, 1500)
            }
          }
        } catch {
          // Backend offline or local fallback
        }
      }

      fetchGatewayStatus()
      pollInterval = setInterval(fetchGatewayStatus, 2500)
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [showQrModal, pairingStatus, familyContact.phone])

  const generateFamilyWhatsAppMessage = useCallback((alarm, contact) => {
    const timeStr = alarm?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const medName = alarm?.medicine || 'Prescribed Medicine'
    const instruction = alarm?.instruction || 'As advised by doctor'
    const caregiverName = contact?.name || 'Family Caregiver'

    return `🚨 *[PHARMX AI - PATIENT CRITICAL MEDICATION ALERT]* 🚨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n⚠️ *URGENT: MISSED DOSE NOTIFICATION FOR CAREGIVER*\n\nDear *${caregiverName}*,\nThis is an automated safety alert from the *Pharmx AI Clinical Monitoring Gateway*.\n\nYour family member (*Patient*) did *NOT* acknowledge or take their scheduled medication within the alarm window, and the dose is currently recorded as *MISSED*.\n\n📋 *MEDICATION DETAILS:*\n• 💊 *Medicine:* *${medName}*\n• ⏰ *Scheduled Time:* *${timeStr}* (Today)\n• 📌 *Food Protocol:* ${instruction}\n• ⚠️ *Current Status:* *MISSED / UNANSWERED DOSE*\n• 🏥 *Surveillance Node:* Pharmx AI Bhopal Clinical Radar\n\n🚨 *RECOMMENDED IMMEDIATE CAREGIVER ACTION:*\n1. Please call or contact the patient immediately to confirm if they have taken their medicine.\n2. If taken, ask them to confirm on the Pharmx AI Patient Safety Dashboard.\n3. If feeling dizzy, unwell, or in distress, please consult an emergency doctor or hospital immediately.\n\n🔗 *Emergency Patient Medical Portal:*\nhttps://hack-in-motion-ricr-him-1114.vercel.app\n\nStay safe,\n*Pharmx AI Patient Safety & Emergency Hospital Gateway*\n━━━━━━━━━━━━━━━━━━━━━━━━━━`
  }, [])

  const sendFamilyWhatsAppAlert = useCallback((alarm, isManual = false, targetContact = null) => {
    if (!alarm) return

    // Determine target recipient(s)
    let recipients = []
    if (targetContact) {
      recipients = [targetContact]
    } else {
      recipients = caregiversRef.current.filter(c => c.autoAlertEnabled)
      if (recipients.length === 0 && caregiversRef.current.length > 0) {
        recipients = [caregiversRef.current[0]]
      }
    }

    if (recipients.length === 0) {
      return
    }

    recipients.forEach((contact, idx) => {
      const rawDigits = (contact.phone || '').replace(/\D/g, '')
      const targetPhone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits
      const message = generateFamilyWhatsAppMessage(alarm, contact)
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(message)}`

      const newLog = {
        id: `wa-alert-${Date.now()}-${idx}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        medicine: alarm.medicine,
        recipient: `${contact.name} (${contact.phone})`,
        status: 'DELIVERED',
        trigger: isManual ? 'Manual Caregiver SOS Button' : 'Auto 10s Ringing Timeout',
        gateway: `Linked Account (${gatewaySessionRef.current.linkedPhone})`
      }

      setWhatsappAlertHistory(prev => [newLog, ...prev.slice(0, 9)])

      saveActivityToMedicalHistory({
        title: `Family WhatsApp Alert: ${alarm.medicine}`,
        category: 'Emergency SOS',
        typeIcon: '📲',
        status: 'WHATSAPP ALERT SENT 📲',
        statusBg: '#ecfdf5',
        statusColor: '#047857',
        summary: `Automated WhatsApp SOS alert sent via linked gateway (${gatewaySessionRef.current.linkedPhone}) to caregiver ${contact.name} (${contact.phone}) regarding missed ${alarm.medicine}.`,
        doctorNote: `Caregiver notified via Connected WhatsApp Gateway Session ${gatewaySessionRef.current.sessionId}. Immediate patient well-being check recommended.`,
        details: [
          `Recipient: ${contact.name} (${contact.phone})`,
          `Medicine: ${alarm.medicine}`,
          `Gateway Session: ${gatewaySessionRef.current.sessionId} (Linked Device Active)`,
          `Trigger: ${isManual ? 'Manual SOS Button' : '10-Sec Unanswered Ringing Timeout'}`,
          `Gateway Protocol: WhatsApp Web Protocol`
        ]
      })

      // Backend sync
      try {
        fetch(getApiUrl('/api/health/send-whatsapp-sos'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientPhone: targetPhone,
            recipientName: contact.name,
            medicine: alarm.medicine,
            time: alarm.time,
            instruction: alarm.instruction,
            message,
            sessionId: gatewaySessionRef.current.sessionId
          })
        }).catch(() => {})
      } catch {
        // background gateway sync optional
      }

      if (isManual && idx === 0) {
        try {
          window.open(whatsappUrl, '_blank')
        } catch {
          // Browser popup blocker fallback
        }
      }
    })
  }, [generateFamilyWhatsAppMessage])

  const showCgToast = (msg) => {
    setCaregiverToast(msg)
    setTimeout(() => setCaregiverToast(''), 3500)
  }

  // Trigger Outbound AI Voice Call Directly to Real Phone (Twilio Programmable Voice)
  const triggerAiVoiceCall = useCallback((alarm, isManual = false, targetContact = null) => {
    if (!alarm) return

    const recipient = targetContact || primaryCaregiver || (caregiversRef.current && caregiversRef.current.length > 0 ? caregiversRef.current[0] : null)

    if (!recipient || !recipient.phone) {
      showCgToast('⚠️ No caregiver phone number saved. Please save a caregiver to receive calls.')
      return
    }

    const targetPhone = recipient.phone
    playSoundBeep()
    showCgToast(`📞 Direct AI phone call placed to ${recipient.name} (${targetPhone})...`)

    // Dispatch real phone call to Twilio Programmable Voice Backend API
    try {
      fetch(getApiUrl('/api/health/trigger-voice-call'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPhone: targetPhone,
          patientName: recipient.name || '',
          medicine: alarm.medicine,
          instruction: alarm.instruction,
          time: alarm.time,
          isEmergency: !isManual
        })
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            showCgToast(`📞 Call placed to ${targetPhone}! Ringing now...`)
          } else {
            console.warn('[Twilio Call Notice]', data.message)
            showCgToast(`⚠️ ${data.message}`)
          }
        })
        .catch(err => {
          console.warn('[Twilio Background Dispatch Note]', err.message)
        })
    } catch {
      // background
    }
  }, [primaryCaregiver])

  // Handle 1-Minute Unanswered Alarm Ringing Timeout -> Mark as Missed
  const handleUnansweredAlarm = useCallback((alarm) => {
    if (!alarm) return

    setAlarms(prev => prev.map(item => {
      if (item.id === alarm.id) {
        return { ...item, status: 'MISSED' }
      }
      return item
    }))

    setActiveRingingAlarm(null)

    saveActivityToMedicalHistory({
      title: `Missed Medication: ${alarm.medicine}`,
      category: 'Medicines',
      typeIcon: '⚠️',
      status: 'MISSED ⚠️',
      statusBg: '#ffe4e6',
      statusColor: '#be123c',
      summary: `10-second alarm rang with no response for "${alarm.medicine}" (${alarm.time}). Marked as Missed.`,
      doctorNote: `Dose missed by patient. Instruction: ${alarm.instruction}`,
      details: [
        `Medicine Missed: ${alarm.medicine}`,
        `Scheduled Time: ${alarm.time}`,
        `Status: Missed Dose ⚠️`
      ]
    })

    // 🚨 AUTOMATIC FAMILY WHATSAPP & SMS GATEWAY TRIGGER
    if (familyCareSyncEnabled && familyContactRef.current?.autoAlertEnabled) {
      sendFamilyWhatsAppAlert(alarm, false)
    }

    // 📞 AUTOMATIC AI VOICE CALL TRIGGER (TWILIO PROGRAMMABLE VOICE)
    if (autoVoiceCallEnabled) {
      triggerAiVoiceCall(alarm, false)
    }
  }, [familyCareSyncEnabled, sendFamilyWhatsAppAlert, autoVoiceCallEnabled, triggerAiVoiceCall])

  // Simulate QR Code Camera Scan & Device Pairing
  const handleSimulateQrPairing = () => {
    setPairingStatus('PAIRING')
    setTimeout(() => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const newSession = {
        isConnected: true,
        linkedPhone: familyContact.phone || '+919876543210',
        linkedName: 'Patient Primary WhatsApp',
        linkedAt: `Today, ${now}`,
        sessionId: `PHARMX-WSS-${Math.floor(100000 + Math.random() * 900000)}`,
        deviceInfo: 'WhatsApp Web Protocol (Multi-Device Active)'
      }
      setGatewaySession(newSession)
      setPairingStatus('SUCCESS')
      playSoundBeep()

      setTimeout(() => {
        setShowQrModal(false)
        setPairingStatus('IDLE')
      }, 1500)
    }, 1600)
  }

  // Save autoVoiceCallEnabled in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pulsemed_auto_voice_call_enabled', String(autoVoiceCallEnabled))
    } catch {
      // localStorage
    }
  }, [autoVoiceCallEnabled])

// triggerAiVoiceCall hoisted above

  // Disconnect / Unlink WhatsApp Gateway
  const handleDisconnectGateway = async () => {
    setGatewaySession(prev => ({
      ...prev,
      isConnected: false,
      linkedAt: null
    }))
    setRealBackendQr(null)
    try {
      await fetch(getApiUrl('/api/health/whatsapp-gateway/disconnect'), { method: 'POST' })
    } catch {
      // ignore
    }
  }

  const handleTestWhatsAppGateway = () => {
    const testAlarm = alarms[0] || {
      medicine: 'Dolo 650mg (Paracetamol)',
      time: '14:00',
      instruction: 'After Food (Khane Ke Baad)'
    }
    sendFamilyWhatsAppAlert(testAlarm, true)
  }

// showCgToast hoisted above

  // Add Caregiver Handler
  const handleAddCaregiver = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!newCgName.trim()) {
      alert('Please enter caregiver name.')
      return
    }
    if (!newCgPhone.trim()) {
      alert('Please enter caregiver WhatsApp phone number.')
      return
    }

    const newId = `cg-${Date.now()}`
    const shouldBePrimary = newCgIsPrimary || caregivers.length === 0

    const newEntry = {
      id: newId,
      name: newCgName.trim(),
      relation: newCgRelation.trim() || 'Family Caregiver',
      phone: newCgPhone.trim(),
      isPrimary: shouldBePrimary,
      autoAlertEnabled: newCgAutoAlert
    }

    setCaregivers(prev => {
      const updated = shouldBePrimary ? prev.map(c => ({ ...c, isPrimary: false })) : [...prev]
      return [...updated, newEntry]
    })

    setShowAddCaregiverModal(false)
    setNewCgName('')
    setNewCgRelation('')
    setNewCgPhone('')
    setNewCgIsPrimary(false)
    setNewCgAutoAlert(true)
    showCgToast(`✓ Caregiver "${newEntry.name}" added successfully!`)
  }

  // Open Edit Caregiver Modal
  const openEditCaregiver = (cg) => {
    setEditingCaregiver(cg)
    setEditCgName(cg.name)
    setEditCgRelation(cg.relation)
    setEditCgPhone(cg.phone)
    setEditCgIsPrimary(!!cg.isPrimary)
    setEditCgAutoAlert(cg.autoAlertEnabled !== false)
  }

  // Update Caregiver Handler
  const handleUpdateCaregiver = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!editingCaregiver) return
    if (!editCgName.trim() || !editCgPhone.trim()) {
      alert('Name and Phone are required.')
      return
    }

    setCaregivers(prev => {
      return prev.map(item => {
        if (item.id === editingCaregiver.id) {
          return {
            ...item,
            name: editCgName.trim(),
            relation: editCgRelation.trim() || 'Family Caregiver',
            phone: editCgPhone.trim(),
            isPrimary: editCgIsPrimary,
            autoAlertEnabled: editCgAutoAlert
          }
        }
        if (editCgIsPrimary) {
          return { ...item, isPrimary: false }
        }
        return item
      })
    })

    showCgToast(`✓ Caregiver "${editCgName.trim()}" updated successfully!`)
    setEditingCaregiver(null)
  }

  // Delete Caregiver Handler
  const handleDeleteCaregiver = (id) => {
    const target = caregivers.find(c => c.id === id)
    setCaregivers(prev => {
      const filtered = prev.filter(c => c.id !== id)
      if (filtered.length > 0 && !filtered.some(c => c.isPrimary)) {
        filtered[0].isPrimary = true
      }
      return filtered
    })

    setDeleteConfirmCaregiver(null)
    if (editingCaregiver?.id === id) {
      setEditingCaregiver(null)
    }
    showCgToast(`🗑️ Caregiver "${target?.name || 'Contact'}" removed.`)
  }

  // Set as Primary Caregiver
  const handleSetPrimary = (id) => {
    setCaregivers(prev => prev.map(c => ({
      ...c,
      isPrimary: c.id === id
    })))
    const target = caregivers.find(c => c.id === id)
    showCgToast(`⭐ "${target?.name || 'Caregiver'}" set as Primary Contact.`)
  }

  // Toggle Auto Alert for a single caregiver
  const handleToggleCgAlert = (id, checked) => {
    setCaregivers(prev => prev.map(c => c.id === id ? { ...c, autoAlertEnabled: checked } : c))
  }

  const handleCopyAlertMessage = (text) => {
    try {
      navigator.clipboard.writeText(text)
      setCopiedAlert(true)
      setTimeout(() => setCopiedAlert(false), 2000)
    } catch {
      // fallback
    }
  }

  // 10-Second Ringing Countdown Effect
  useEffect(() => {
    let timer = null
    if (activeRingingAlarm) {
      timer = setInterval(() => {
        setRingingTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            handleUnansweredAlarm(activeRingingAlarm)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [activeRingingAlarm, handleUnansweredAlarm])

  // Mark medicine as TAKEN ✅
  const handleMarkTaken = (alarmId) => {
    const targetMed = alarms.find(a => a.id === alarmId)
    const takenTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

    setAlarms(prev => prev.map(item => {
      if (item.id === alarmId) {
        return { ...item, status: 'TAKEN', takenTime }
      }
      return item
    }))

    if (targetMed) {
      saveActivityToMedicalHistory({
        title: `Medicine Taken: ${targetMed.medicine}`,
        category: 'Medicines',
        typeIcon: '💊',
        status: 'TAKEN ✅',
        statusBg: '#d1fae5',
        statusColor: '#059669',
        summary: `Confirmed dose taken at ${takenTime}. Medicine: ${targetMed.medicine}`,
        doctorNote: `Dose confirmed by patient. Instruction: ${targetMed.instruction}`,
        details: [
          `Medicine: ${targetMed.medicine}`,
          `Time Scheduled: ${targetMed.time}`,
          `Food Instruction: ${targetMed.instruction}`,
          `Status: Dose Taken & Logged ✅`
        ]
      })
    }

    if (activeRingingAlarm && activeRingingAlarm.id === alarmId) {
      setActiveRingingAlarm(null)
    }
  }

  // Snooze alarm for 5 mins
  const handleSnoozeAlarm = (alarmId) => {
    setAlarms(prev => prev.map(item => {
      if (item.id === alarmId) {
        return { ...item, status: 'SNOOZED' }
      }
      return item
    }))
    if (activeRingingAlarm && activeRingingAlarm.id === alarmId) {
      setActiveRingingAlarm(null)
    }
  }

  // Add new medicine alarm (24-Hour Format)
  const handleAddNewAlarm = () => {
    if (!newMedName.trim()) return

    const [h, m] = newMedTime.split(':')
    const formatted24h = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

    const newAlarm = {
      id: `alarm-${Date.now()}`,
      medicine: newMedName.trim(),
      time: formatted24h,
      instruction: newMedInstruction,
      status: 'ACTIVE',
      color: '#818cf8'
    }

    setAlarms(prev => [...prev, newAlarm])
    setNewMedName('')
    setShowAddModal(false)
  }

  // Delete alarm
  const handleDeleteAlarm = (alarmId) => {
    setAlarms(prev => prev.filter(item => item.id !== alarmId))
    if (activeRingingAlarm && activeRingingAlarm.id === alarmId) {
      setActiveRingingAlarm(null)
    }
  }

  // Test trigger alarm sound manually
  const triggerTestAlarm = (alarm) => {
    setRingingTimer(10)
    setActiveRingingAlarm(alarm)
  }

  // Mark Meal as CONSUMED ✅
  const handleMarkMealConsumed = (mealId) => {
    const targetMeal = meals.find(m => m.id === mealId)
    const consumedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

    setMeals(prev => prev.map(item => {
      if (item.id === mealId) {
        return { ...item, status: 'CONSUMED', consumedTime }
      }
      return item
    }))

    if (targetMeal) {
      saveActivityToMedicalHistory({
        title: `Healthy Meal Consumed: ${targetMeal.mealType}`,
        category: 'Diet & Food',
        typeIcon: targetMeal.icon || '🥗',
        status: 'MEAL CONSUMED ✅',
        statusBg: '#ecfdf5',
        statusColor: '#047857',
        summary: `Healthy meal consumed at ${consumedTime}. Items: ${targetMeal.foodItems} (${targetMeal.calories}).`,
        doctorNote: `Dietary Log: ${targetMeal.tag} meal intake recorded. ${targetMeal.medSync || ''}`,
        details: [
          `Meal Type: ${targetMeal.mealType}`,
          `Time Scheduled: ${targetMeal.time}`,
          `Food Items: ${targetMeal.foodItems}`,
          `Energy / Calories: ${targetMeal.calories}`,
          `Status: Consumed & Logged ✅`
        ]
      })
    }
  }

  // Delete Meal Plan
  const handleDeleteMeal = (mealId) => {
    setMeals(prev => prev.filter(item => item.id !== mealId))
  }

  // Add New Custom Meal Plan
  const handleAddNewMeal = () => {
    if (!newMealName.trim()) return

    const newMeal = {
      id: `meal-${Date.now()}`,
      mealType: newMealName.trim(),
      time: newMealTime,
      foodItems: newMealItems.trim() || 'Custom Healthy Meal & Salad',
      calories: newMealCal || '300 kcal',
      tag: newMealTag || 'Healthy Nutrients',
      tagBg: '#ecfdf5',
      tagColor: '#047857',
      medSync: 'Custom Diet Plan',
      status: 'SCHEDULED',
      icon: '🥗'
    }

    setMeals(prev => [...prev, newMeal])
    setNewMealName('')
    setNewMealItems('')
    setShowAddMealModal(false)
  }

  const showAlarms = section === 'all' || section === 'alarms'
  const showCaregiver = section === 'all' || section === 'caregiver'
  const showMeals = section === 'all' || section === 'meals'

  return (
    <>
      {showAlarms && (
        <div className="myhealth-card myhealth-alarm-card" style={{
          borderRadius: '20px',
          padding: '1.25rem 1.4rem',
          boxSizing: 'border-box'
        }}>
      <style>{`
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.4); }
          70% { box-shadow: 0 0 0 16px rgba(225, 29, 72, 0); }
          100% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); }
        }
        @keyframes qrScanBeam {
          0% { top: 6px; opacity: 0.9; }
          50% { top: 92%; opacity: 1; }
          100% { top: 6px; opacity: 0.9; }
        }
      `}</style>

      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', paddingBottom: '0.65rem', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>⏰</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
              Medication Alarm & SOS System
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              24h Sound Reminders & 1-Min Family SOS
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{
            backgroundColor: '#EEF2FF',
            color: '#4F46E5',
            border: '1px solid #C7D2FE',
            borderRadius: '8px',
            padding: '0.35rem 0.75rem',
            fontSize: '0.76rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          ➕ Add Alarm
        </button>
      </div>

      {/* ── ACTIVE RINGING ALARM BANNER (TRIGGERED WHEN CLOCK MATCHES ALARM) ── */}
      {activeRingingAlarm && (
        <div style={{
          backgroundColor: '#ffe4e6',
          border: '2px solid #e11d48',
          borderRadius: '18px',
          padding: '1.1rem 1.2rem',
          marginBottom: '1.4rem',
          animation: 'pulseRing 1.5s infinite',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '2rem' }}>🔔</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', color: '#be123c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  🔊 ALARM RINGING NOW! ({activeRingingAlarm.time})
                </span>
                <span style={{
                  backgroundColor: '#e11d48',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px'
                }}>
                  ⏱️ {ringingTimer}s until Family WhatsApp Alert
                </span>
              </div>

              <h4 style={{ margin: '0.1rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#881337' }}>
                {activeRingingAlarm.medicine}
              </h4>
              <span style={{ fontSize: '0.78rem', color: '#9f1239', fontWeight: 600, display: 'block' }}>
                📌 {activeRingingAlarm.instruction}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#be123c', fontWeight: 700, marginTop: '0.2rem', display: 'block' }}>
                {gatewaySession.isConnected
                  ? `⚠️ If unanswered in ${ringingTimer}s, automated WhatsApp alert will dispatch via Linked Device (${gatewaySession.linkedPhone}) to ${familyContact.name}.`
                  : `⚠️ WhatsApp Gateway not connected! Scan QR code to link your device before automated alerts can dispatch.`}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleMarkTaken(activeRingingAlarm.id)}
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.6rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
              }}
            >
              ✅ Dawa Le Li (Taken)
            </button>

            <button
              type="button"
              onClick={() => handleSnoozeAlarm(activeRingingAlarm.id)}
              style={{
                backgroundColor: '#ffffff',
                color: '#be123c',
                border: '1px solid #fecdd3',
                borderRadius: '12px',
                padding: '0.6rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔕 Snooze 5M
            </button>

            {gatewaySession.isConnected ? (
              <button
                type="button"
                onClick={() => sendFamilyWhatsAppAlert(activeRingingAlarm, true)}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)'
                }}
                title="Immediately dispatch WhatsApp alert to family caregiver"
              >
                📲 Send WhatsApp Alert Now
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                style={{
                  backgroundColor: '#d97706',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)'
                }}
                title="Scan QR Code to link your WhatsApp account"
              >
                📸 Scan QR to Link WhatsApp
              </button>
            )}
          </div>
        </div>
      )}

      {/* Alarms List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {alarms.map(item => (
          <div
            key={item.id}
            style={{
              backgroundColor: item.status === 'TAKEN' ? '#f0fdf4' : '#f8fafc',
              border: item.status === 'TAKEN' ? '1.5px solid #86efac' : '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '0.9rem 1.1rem',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.8rem',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Left Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              {/* Checkbox Tick Button */}
              <button
                type="button"
                onClick={() => handleMarkTaken(item.id)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  border: item.status === 'TAKEN' ? 'none' : '2px solid #cbd5e1',
                  backgroundColor: item.status === 'TAKEN' ? '#10b981' : '#ffffff',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                title={item.status === 'TAKEN' ? 'Medicine Taken ✅' : 'Click to mark as Taken'}
              >
                {item.status === 'TAKEN' ? '✓' : ''}
              </button>

              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: item.status === 'TAKEN' ? '#15803d' : '#0f172a' }}>
                  {item.medicine}
                </h4>

                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '0.15rem' }}>
                  📋 {item.instruction}
                </span>

                {item.status === 'TAKEN' && item.takenTime && (
                  <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700, display: 'block', marginTop: '0.1rem' }}>
                    ✓ Taken today at {item.takenTime}
                  </span>
                )}
              </div>
            </div>

            {/* Right Controls: Alarm Time Badge & Modify Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              {/* Alarm Time Badge */}
              <button
                type="button"
                onClick={() => openTimePickerModal(item)}
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: '#4f46e5',
                  backgroundColor: '#eef2ff',
                  border: '1px solid #c7d2fe',
                  padding: '0.35rem 0.7rem',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Click to change alarm time"
              >
                🔔 {item.time}
              </button>

              {/* Modify Time Button */}
              <button
                type="button"
                onClick={() => openTimePickerModal(item)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#334155',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                ✏️ Modify Time
              </button>

              {/* Test Alarm Sound Trigger */}
              <button
                type="button"
                onClick={() => triggerTestAlarm(item)}
                style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '10px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#b45309',
                  cursor: 'pointer'
                }}
                title="Test 10-second alarm"
              >
                🔔 Test 10s Ring
              </button>

              {/* Delete Icon */}
              <button
                type="button"
                onClick={() => handleDeleteAlarm(item.id)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
                title="Delete alarm"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

      )}

      {/* ── FAMILY WHATSAPP CAREGIVER PROTECTION GATEWAY ────────────────── */}
      {showCaregiver && (
        <div className="myhealth-card myhealth-caregiver-card" style={{
          borderRadius: '24px',
          border: '1.5px solid rgba(16, 185, 129, 0.35)',
          padding: '1.35rem 1.5rem',
          boxSizing: 'border-box'
        }}>
        {/* Gateway Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem', paddingBottom: '0.8rem', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.5rem', backgroundColor: '#ecfdf5', padding: '0.45rem', borderRadius: '14px', border: '1px solid #a7f3d0' }}>
              👨‍👩‍👧
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Family WhatsApp Caregiver Alert Gateway
                </h3>
                <span style={{
                  backgroundColor: gatewaySession.isConnected ? '#dcfce7' : '#fef3c7',
                  color: gatewaySession.isConnected ? '#15803d' : '#b45309',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: gatewaySession.isConnected ? '#22c55e' : '#f59e0b',
                    display: 'inline-block'
                  }}></span>
                  {gatewaySession.isConnected ? 'WHATSAPP LINKED & ACTIVE 🟢' : 'QR SCAN REQUIRED ⚪'}
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 500 }}>
                {gatewaySession.isConnected
                  ? `Linked Account: ${gatewaySession.linkedPhone} • Session ID: ${gatewaySession.sessionId} • Auto-SOS Armed`
                  : 'Scan the QR code to link your WhatsApp account before automated alerts can be dispatched.'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {gatewaySession.isConnected ? (
              <>
                <button
                  type="button"
                  onClick={handleTestWhatsAppGateway}
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: '0 3px 10px rgba(5, 150, 105, 0.25)'
                  }}
                  title="Send a sample WhatsApp clinical alert to caregiver"
                >
                  📲 Test WhatsApp Gateway
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                  title="Re-scan QR code to link another phone"
                >
                  🔄 Re-scan QR
                </button>

                <button
                  type="button"
                  onClick={handleDisconnectGateway}
                  style={{
                    backgroundColor: '#fff1f2',
                    color: '#be123c',
                    border: '1px solid #fecdd3',
                    borderRadius: '10px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                  title="Disconnect WhatsApp gateway session"
                >
                  Unlink
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)'
                }}
              >
                📸 Scan QR Code to Link WhatsApp
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const testAlarm = {
                  medicine: alarms[0]?.medicine || 'Dolo 650mg',
                  time: alarms[0]?.time || '14:00',
                  instruction: alarms[0]?.instruction || 'After Food'
                }
                triggerAiVoiceCall(testAlarm, true)
              }}
              style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 3px 10px rgba(59, 130, 246, 0.25)'
              }}
              title="Test Automated AI Phone Call (Twilio Outbound + Voice AI)"
            >
              📞 Test AI Voice Call
            </button>

            <button
              type="button"
              onClick={() => setShowAddCaregiverModal(true)}
              style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 3px 10px rgba(5, 150, 105, 0.25)'
              }}
            >
              ➕ Add Caregiver
            </button>
          </div>
        </div>

        {/* Not Connected Amber Banner (If Disconnected) */}
        {!gatewaySession.isConnected && (
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: '16px',
            padding: '0.9rem 1.15rem',
            marginBottom: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.6rem' }}>📸</span>
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#92400e', display: 'block' }}>
                  Action Required: WhatsApp Web Gateway is not linked yet!
                </strong>
                <span style={{ fontSize: '0.76rem', color: '#b45309', fontWeight: 500 }}>
                  Automated emergency alerts will only be dispatched to your family caregiver after you connect your WhatsApp by scanning the QR code.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              style={{
                backgroundColor: '#d97706',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 3px 10px rgba(217, 119, 6, 0.3)'
              }}
            >
              📸 Scan QR Code Now
            </button>
          </div>
        )}

        {/* Toast Feedback Notice */}
        {caregiverToast && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.25s ease'
          }}>
            <span>✨</span>
            <span>{caregiverToast}</span>
          </div>
        )}

        {/* ── TWILIO PROGRAMMABLE VOICE AI GATEWAY STATUS CARD ─────────── */}
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1.5px solid #bfdbfe',
          borderRadius: '16px',
          padding: '0.95rem 1.25rem',
          marginBottom: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.8rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.6rem', backgroundColor: '#dbeafe', padding: '0.4rem', borderRadius: '12px' }}>
              📞
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '0.92rem', color: '#1e3a8a' }}>
                  Twilio Programmable Voice AI Engine Active
                </strong>
                <span style={{
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
                  CALLER ID: +1 (620) 349-5094 🟢
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>
                Amazon Polly Aditi Bilingual Engine • Auto-Calls patient & caregivers when dose is missed
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={autoVoiceCallEnabled}
                onChange={(e) => setAutoVoiceCallEnabled(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 700 }}>
                Auto-Call on Missed Alarm
              </span>
            </label>

            <button
              type="button"
              onClick={() => {
                const testAlarm = {
                  medicine: alarms[0]?.medicine || 'Dolo 650mg',
                  time: alarms[0]?.time || '14:00',
                  instruction: alarms[0]?.instruction || 'After Food'
                }
                triggerAiVoiceCall(testAlarm, true)
              }}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
              }}
            >
              📞 Test Call Now
            </button>
          </div>
        </div>

        {/* Caregiver Directory Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
              👨‍👩‍👧 Family Caregivers Directory ({caregivers.length})
            </h4>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
              Contacts who receive instant automated WhatsApp notifications if medication doses are missed.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddCaregiverModal(true)}
            style={{
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              borderRadius: '10px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            ➕ Add Caregiver
          </button>
        </div>

        {/* Empty Caregivers Directory State */}
        {caregivers.length === 0 && (
          <div style={{
            backgroundColor: '#f8fafc',
            border: '2px dashed #cbd5e1',
            borderRadius: '16px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            marginBottom: '1.2rem'
          }}>
            <span style={{ fontSize: '2.4rem', display: 'block', marginBottom: '0.5rem' }}>👨‍👩‍👧</span>
            <h4 style={{ margin: '0 0 0.35rem 0', color: '#1e293b', fontSize: '1.05rem', fontWeight: 800 }}>
              No Caregivers Configured Yet
            </h4>
            <p style={{ margin: '0 auto 1.2rem auto', color: '#64748b', fontSize: '0.82rem', maxWidth: '440px', lineHeight: 1.5 }}>
              Add a trusted family member (e.g. Daughter, Son, Spouse, or Attendant) so they automatically receive WhatsApp safety alerts if you ever miss a dose.
            </p>
            <button
              type="button"
              onClick={() => setShowAddCaregiverModal(true)}
              style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.6rem 1.2rem',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)'
              }}
            >
              ➕ Add Primary Caregiver Now
            </button>
          </div>
        )}

        {/* Gateway Main Grid: Caregiver Cards + Message Protocol Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(295px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
          {/* Caregiver Cards */}
          {caregivers.map((cg) => (
            <div
              key={cg.id}
              style={{
                backgroundColor: cg.isPrimary ? '#ffffff' : '#f8fafc',
                border: cg.isPrimary ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '1.1rem 1.2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: cg.isPrimary ? '0 4px 16px rgba(16, 185, 129, 0.08)' : 'none',
                position: 'relative'
              }}
            >
              <div>
                {/* Card Top Row: Relationship Badge + Primary Pill */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: cg.isPrimary ? '#047857' : '#64748b',
                    backgroundColor: cg.isPrimary ? '#ecfdf5' : '#e2e8f0',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px'
                  }}>
                    {cg.relation || 'Caregiver'}
                  </span>

                  {cg.isPrimary ? (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#b45309',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fde68a',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      ⭐ PRIMARY CONTACT
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(cg.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6366f1',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0
                      }}
                      title="Set as primary alert recipient"
                    >
                      ☆ Make Primary
                    </button>
                  )}
                </div>

                {/* Name */}
                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {cg.name}
                </h4>

                {/* Phone Box */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.55rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '1rem' }}>📱</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px' }}>
                      {cg.phone}
                    </span>
                  </div>
                  <span style={{
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '6px'
                  }}>
                    ✓ WhatsApp
                  </span>
                </div>

                {/* Auto Alert Toggle */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  cursor: 'pointer',
                  userSelect: 'none',
                  marginBottom: '0.95rem'
                }}>
                  <input
                    type="checkbox"
                    checked={familyCareSyncEnabled && cg.autoAlertEnabled}
                    onChange={(e) => handleToggleCgAlert(cg.id, e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#059669', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#334155', fontWeight: 700 }}>
                    Auto-Dispatch WhatsApp Alert (10s timeout)
                  </span>
                </label>
              </div>

              {/* Action Buttons Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '0.75rem',
                flexWrap: 'wrap'
              }}>
                <button
                  type="button"
                  onClick={() => openEditCaregiver(cg)}
                  style={{
                    flex: 1,
                    backgroundColor: '#f1f5f9',
                    color: '#1e293b',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.4rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem'
                  }}
                  title="Update caregiver details"
                >
                  ✏️ Edit
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirmCaregiver(cg)}
                  style={{
                    backgroundColor: '#fff1f2',
                    color: '#be123c',
                    border: '1px solid #fecdd3',
                    borderRadius: '8px',
                    padding: '0.4rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem'
                  }}
                  title="Delete caregiver"
                >
                  🗑️ Delete
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const testAlarm = {
                      medicine: alarms[0]?.medicine || 'Dolo 650mg (Paracetamol)',
                      time: alarms[0]?.time || '14:00',
                      instruction: alarms[0]?.instruction || 'After Food'
                    }
                    sendFamilyWhatsAppAlert(testAlarm, true, cg)
                  }}
                  style={{
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                  title="Test WhatsApp Alert to this caregiver"
                >
                  📲 WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const testAlarm = {
                      medicine: alarms[0]?.medicine || 'Dolo 650mg',
                      time: alarms[0]?.time || '14:00',
                      instruction: alarms[0]?.instruction || 'After Food'
                    }
                    triggerAiVoiceCall(testAlarm, true, cg)
                  }}
                  style={{
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                  title="Test AI Voice Call to this caregiver"
                >
                  📞 Call
                </button>
              </div>
            </div>
          ))}

          {/* Clinical Message Protocol Preview */}
          <div style={{
            backgroundColor: '#064e3b',
            color: '#ecfdf5',
            borderRadius: '16px',
            padding: '1rem 1.15rem',
            fontFamily: 'monospace',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#a7f3d0', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                📲 WhatsApp Gateway Message Payload
              </span>
              <span style={{ fontSize: '0.68rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                End-to-End Encrypted
              </span>
            </div>

            <p style={{
              fontSize: '0.73rem',
              lineHeight: '1.45',
              margin: 0,
              whiteSpace: 'pre-line',
              color: '#d1fae5',
              maxHeight: '135px',
              overflowY: 'auto'
            }}>
              {`🚨 *[PHARMX AI - PATIENT CRITICAL MEDICATION ALERT]*
⚠️ *URGENT:* Missed Dose Notification for Family Caregiver

Dear *${familyContact.name}*,
Patient did NOT respond to medication alarm within 10 seconds.
• 💊 Medicine: ${alarms[0]?.medicine || 'Prescribed Medicine'}
• ⏰ Time: ${alarms[0]?.time || '08:00'} (Today)
• ⚠️ Status: MISSED / UNANSWERED DOSE
• 📞 Caregiver Action: Please contact patient immediately to verify safety.
🔗 Portal: https://hack-in-motion-ricr-him-1114.vercel.app`}
            </p>
          </div>
        </div>

        {/* Dispatch History Audit Log */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Recent WhatsApp Caregiver Dispatch Audit ({whatsappAlertHistory.length})
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Real-time Caregiver Surveillance
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {whatsappAlertHistory.slice(0, 3).map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.5rem 0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  fontSize: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem' }}>📲</span>
                  <div>
                    <strong style={{ color: '#0f172a' }}>{item.medicine}</strong>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}>
                      To: {item.recipient} • {item.trigger}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.7rem' }}>
                    {item.time}
                  </span>
                  <span style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontWeight: 800,
                    fontSize: '0.66rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '6px'
                  }}>
                    ✓ {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      )}

      {/* ── HEALTHY FOOD PLANNING & SCHEDULE BOARD (ALARM KE NICHE) ────────── */}
      {showMeals && (
        <div className="myhealth-card myhealth-meals-card" style={{
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1.35rem 1.5rem',
          boxSizing: 'border-box'
        }}>
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem', backgroundColor: '#ecfdf5', padding: '0.4rem', borderRadius: '12px' }}>🥗</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Healthy Food Planning & Schedule Board
                <span style={{ fontSize: '0.68rem', backgroundColor: '#059669', color: '#ffffff', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                  Clinical Diet Routine
                </span>
              </h3>
              <span style={{ fontSize: '0.73rem', color: '#047857', fontWeight: 600 }}>
                Synchronized with Medication Time & Dietary Guidelines • Daily Energy Target: 1,800 kcal
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddMealModal(true)}
            style={{
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              borderRadius: '10px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 2px 6px rgba(4, 120, 87, 0.15)'
            }}
          >
            ➕ Add Meal Plan
          </button>
        </div>

        {/* Schedule Board Meals Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {meals.map((meal) => (
            <div
              key={meal.id}
              style={{
                backgroundColor: meal.status === 'CONSUMED' ? '#f0fdf4' : '#fafafa',
                border: meal.status === 'CONSUMED' ? '1.5px solid #bbf7d0' : '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '0.9rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Left Info: Icon, Meal Type, Food Items, Med Sync */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: '280px' }}>
                <span style={{ fontSize: '1.6rem', backgroundColor: '#ffffff', padding: '0.45rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  {meal.icon || '🥗'}
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 800 }}>
                      {meal.mealType}
                    </strong>
                    <span style={{
                      backgroundColor: meal.tagBg || '#ecfdf5',
                      color: meal.tagColor || '#047857',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '6px'
                    }}>
                      {meal.tag}
                    </span>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 700, padding: '0.12rem 0.45rem', borderRadius: '6px' }}>
                      🔥 {meal.calories}
                    </span>
                  </div>

                  <p style={{ margin: '0.25rem 0 0.2rem 0', fontSize: '0.8rem', color: '#334155', fontWeight: 600, lineHeight: '1.3' }}>
                    {meal.foodItems}
                  </p>

                  <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    ⚡ {meal.medSync}
                  </span>
                </div>
              </div>

              {/* Right Controls: Time Badge, Status, Consume Button & Delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '10px'
                }}>
                  🕒 {meal.time}
                </span>

                {meal.status === 'CONSUMED' ? (
                  <span style={{
                    backgroundColor: '#d1fae5',
                    color: '#047857',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    padding: '0.4rem 0.75rem',
                    borderRadius: '10px',
                    border: '1px solid #a7f3d0'
                  }}>
                    ✓ Consumed Today
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleMarkMealConsumed(meal.id)}
                    style={{
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    ✓ Mark Consumed
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteMeal(meal.id)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    padding: '0.2rem'
                  }}
                  title="Delete meal plan"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      )}

      {/* ── PHONE-STYLE ALARM TIME PICKER MODAL ─────────────────────────── */}
      {modifyModalAlarm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'grid',
          placeItems: 'center',
          padding: '1.5rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '26px',
            maxWidth: '440px',
            width: '100%',
            padding: '1.8rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
            margin: 'auto'
          }}>
            {/* Modal Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  ⏰ Set Alarm Time
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#6366f1', fontWeight: 700 }}>
                  Medicine: {modifyModalAlarm.medicine}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setModifyModalAlarm(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Phone Clock Time Picker Wheel Box */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '20px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.2rem',
              marginBottom: '1.4rem'
            }}>
              {/* Hour Scroll Wheel */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
                  Hour (00 - 23)
                </span>
                <div style={{
                  width: '100%',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '14px',
                  padding: '0.4rem',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  scrollBehavior: 'smooth'
                }}>
                  {Array.from({ length: 24 }).map((_, i) => {
                    const val = String(i).padStart(2, '0')
                    const isSelected = pickerHour === val
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPickerHour(val)}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: isSelected ? '#6366f1' : 'transparent',
                          color: isSelected ? '#ffffff' : '#0f172a',
                          fontSize: '1.1rem',
                          fontWeight: isSelected ? 900 : 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {val}
                      </button>
                    )
                  })}
                </div>
              </div>

              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#6366f1', marginTop: '1.2rem' }}>:</span>

              {/* Minute Scroll Wheel */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
                  Minute (00 - 59)
                </span>
                <div style={{
                  width: '100%',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '14px',
                  padding: '0.4rem',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  scrollBehavior: 'smooth'
                }}>
                  {Array.from({ length: 60 }).map((_, i) => {
                    const val = String(i).padStart(2, '0')
                    const isSelected = pickerMinute === val
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPickerMinute(val)}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: isSelected ? '#6366f1' : 'transparent',
                          color: isSelected ? '#ffffff' : '#0f172a',
                          fontSize: '1.1rem',
                          fontWeight: isSelected ? 900 : 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {val}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setModifyModalAlarm(null)}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSavePickerTime}
                style={{
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  flex: 2,
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                }}
              >
                ✓ Set Alarm Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD NEW ALARM MODAL ─────────────────────────────────────────── */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'grid',
          placeItems: 'center',
          padding: '1.5rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '440px',
            width: '100%',
            padding: '1.6rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
            margin: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.65rem', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                ➕ Add Medicine Alarm
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.4rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Medicine Name & Dosage:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol 650mg, Pantocid 40mg..."
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.6rem 0.85rem', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Reminder Time (Subah / Shaam Time):
                </label>
                <input
                  type="time"
                  value={newMedTime}
                  onChange={(e) => setNewMedTime(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.6rem 0.85rem', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Food Timing / Instruction:
                </label>
                <select
                  value={newMedInstruction}
                  onChange={(e) => setNewMedInstruction(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.6rem 0.85rem', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', backgroundColor: '#ffffff' }}
                >
                  <option value="Pre-Breakfast (Khali Pet)">Pre-Breakfast (Khali Pet 30 mins before food)</option>
                  <option value="After Food (Khane Ke Baad)">After Food (Khane Ke Baad)</option>
                  <option value="With Meal (Khane Ke Sath)">With Meal (Khane Ke Sath)</option>
                  <option value="Before Sleep (Soone Se Pehle)">Before Sleep (Soone Se Pehle)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', padding: '0.65rem 1rem', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', flex: 1 }}>
                Cancel
              </button>
              <button type="button" onClick={handleAddNewAlarm} style={{ backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0.65rem 1rem', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', flex: 2, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)' }}>
                ✓ Save Alarm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD NEW HEALTHY MEAL PLAN MODAL ──────────────────────────────── */}
      {showAddMealModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'grid',
          placeItems: 'center',
          padding: '1.5rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '460px',
            width: '100%',
            padding: '1.6rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
            margin: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.65rem', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                🥗 Add Healthy Meal Plan
              </h3>
              <button type="button" onClick={() => setShowAddMealModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.4rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                  Meal Name / Time Window:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mid-Morning Fruit Snack, Post-Workout Protein..."
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.55rem 0.8rem', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                    Scheduled Time:
                  </label>
                  <input
                    type="time"
                    value={newMealTime}
                    onChange={(e) => setNewMealTime(e.target.value)}
                    style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.55rem 0.8rem', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                    Est. Calories:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 350 kcal"
                    value={newMealCal}
                    onChange={(e) => setNewMealCal(e.target.value)}
                    style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.55rem 0.8rem', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                  Food Items & Ingredients:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apple slices with 1 tsp Peanut butter + Green Tea"
                  value={newMealItems}
                  onChange={(e) => setNewMealItems(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.55rem 0.8rem', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                  Diet Tag / Nutritional Highlight:
                </label>
                <input
                  type="text"
                  placeholder="e.g. High Fiber, Low Glycemic Index, Protein Rich"
                  value={newMealTag}
                  onChange={(e) => setNewMealTag(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.55rem 0.8rem', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={() => setShowAddMealModal(false)} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', padding: '0.65rem 1rem', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', flex: 1 }}>
                Cancel
              </button>
              <button type="button" onClick={handleAddNewMeal} style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0.65rem 1rem', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', flex: 2, boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)' }}>
                ✓ Save Meal Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DISPATCHED WHATSAPP ALERT MODAL ─────────────────────────────── */}
      {dispatchedAlertModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'grid',
          placeItems: 'center',
          padding: '1.5rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '520px',
            width: '100%',
            padding: '1.6rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
            margin: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.65rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', backgroundColor: '#ecfdf5', padding: '0.35rem', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                  📲
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    Family WhatsApp Alert Dispatched!
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                    Gateway Protocol: WhatsApp Webhook & Direct Chat API
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDispatchedAlertModal(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '1.1rem' }}>
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '0.75rem 0.9rem',
                marginBottom: '0.9rem'
              }}>
                <span style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                  ⚠️ Reason: Unanswered Medication Alarm
                </span>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#7f1d1d', fontWeight: 600 }}>
                  Patient did not respond within the 10-second window for <strong>{dispatchedAlertModal.alarm.medicine}</strong> ({dispatchedAlertModal.alarm.time}).
                </p>
                <span style={{ fontSize: '0.72rem', color: '#b91c1c', display: 'block', marginTop: '0.3rem' }}>
                  Recipient: <strong>{dispatchedAlertModal.recipient}</strong>
                </span>
              </div>

              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                WhatsApp Clinical Message Payload:
              </label>
              <div style={{
                backgroundColor: '#0f172a',
                color: '#e2e8f0',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                fontSize: '0.74rem',
                lineHeight: '1.5',
                maxHeight: '180px',
                overflowY: 'auto',
                whiteSpace: 'pre-line',
                fontFamily: 'monospace'
              }}>
                {dispatchedAlertModal.message}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleCopyAlertMessage(dispatchedAlertModal.message)}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '0.65rem 0.95rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                {copiedAlert ? '✓ Copied!' : '📋 Copy Message'}
              </button>

              <button
                type="button"
                onClick={() => {
                  try {
                    window.open(dispatchedAlertModal.whatsappUrl, '_blank')
                  } catch {
                    // ignore
                  }
                }}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  flex: 2,
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)'
                }}
              >
                📲 Open WhatsApp Chat Directly
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD NEW CAREGIVER MODAL ─────────────────────────────────────── */}
      {showAddCaregiverModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'grid',
          placeItems: 'center',
          padding: '1.5rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '460px',
            width: '100%',
            padding: '1.6rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
            margin: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem', paddingBottom: '0.65rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>➕</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Add Family Caregiver
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCaregiverModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCaregiver} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem', marginBottom: '1.3rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Caregiver Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma, Sneha Patel, Dr. Verma..."
                  value={newCgName}
                  onChange={(e) => setNewCgName(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.6rem 0.85rem', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Relationship to Patient:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Daughter, Son, Spouse, Sister, Attendant..."
                  value={newCgRelation}
                  onChange={(e) => setNewCgRelation(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.6rem 0.85rem', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
                {/* Quick Relationship Chips */}
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  {['Daughter', 'Son', 'Spouse', 'Mother', 'Father', 'Attendant'].map(rel => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setNewCgRelation(rel)}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  WhatsApp Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210 or 9876543210"
                  value={newCgPhone}
                  onChange={(e) => setNewCgPhone(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.6rem 0.85rem', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  WhatsApp emergency SOS alerts will be dispatched directly to this phone number.
                </span>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={newCgIsPrimary}
                    onChange={(e) => setNewCgIsPrimary(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#059669', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 700 }}>
                    ⭐ Set as Primary Contact
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={newCgAutoAlert}
                    onChange={(e) => setNewCgAutoAlert(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#059669', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 700 }}>
                    📲 Enable Automated WhatsApp Emergency SOS Alerts
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCaregiverModal(false)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.65rem 1rem',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.65rem 1rem',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    flex: 2,
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)'
                  }}
                >
                  ✓ Add Caregiver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── UPDATE / EDIT CAREGIVER DETAILS MODAL ───────────────────────── */}
      {editingCaregiver && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'grid',
          placeItems: 'center',
          padding: '1.5rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '460px',
            width: '100%',
            padding: '1.6rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
            margin: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem', paddingBottom: '0.65rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>✏️</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Update Caregiver Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCaregiver(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCaregiver} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem', marginBottom: '1.3rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Caregiver Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Caregiver Name"
                  value={editCgName}
                  onChange={(e) => setEditCgName(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.6rem 0.85rem', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Relationship to Patient:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Daughter / Primary Caregiver, Son, Spouse..."
                  value={editCgRelation}
                  onChange={(e) => setEditCgRelation(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.6rem 0.85rem', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  WhatsApp Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210 or 9876543210"
                  value={editCgPhone}
                  onChange={(e) => setEditCgPhone(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.6rem 0.85rem', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={editCgIsPrimary}
                    onChange={(e) => setEditCgIsPrimary(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#059669', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 700 }}>
                    ⭐ Primary Caregiver Contact
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={editCgAutoAlert}
                    onChange={(e) => setEditCgAutoAlert(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#059669', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 700 }}>
                    📲 Auto-Dispatch Missed-Dose WhatsApp Alert
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    const target = editingCaregiver
                    setEditingCaregiver(null)
                    setDeleteConfirmCaregiver(target)
                  }}
                  style={{
                    backgroundColor: '#fff1f2',
                    color: '#be123c',
                    border: '1px solid #fecdd3',
                    borderRadius: '12px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Delete
                </button>

                <button
                  type="button"
                  onClick={() => setEditingCaregiver(null)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.65rem 1.1rem',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    flex: 1.5,
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)'
                  }}
                >
                  ✓ Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CAREGIVER CONFIRMATION MODAL ─────────────────────────── */}
      {deleteConfirmCaregiver && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 999999,
          display: 'grid',
          placeItems: 'center',
          padding: '1.5rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '430px',
            width: '100%',
            padding: '1.6rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
            textAlign: 'center',
            margin: 'auto'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              margin: '0 auto 1rem auto'
            }}>
              🗑️
            </div>

            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              Delete Caregiver?
            </h3>

            <p style={{ margin: '0 0 1.3rem 0', fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5 }}>
              Are you sure you want to remove <strong>{deleteConfirmCaregiver.name}</strong> ({deleteConfirmCaregiver.phone}) from your family emergency alerts?
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmCaregiver(null)}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Keep Caregiver
              </button>

              <button
                type="button"
                onClick={() => handleDeleteCaregiver(deleteConfirmCaregiver.id)}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  flex: 1.4,
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)'
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WHATSAPP WEB QR CODE PAIRING MODAL ───────────────────────── */}
      {showQrModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 999999,
          display: 'grid',
          placeItems: 'center',
          padding: '1.5rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '680px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 30px 70px rgba(0,0,0,0.4)',
            boxSizing: 'border-box'
          }}>
            {/* WhatsApp Teal Header */}
            <div style={{
              backgroundColor: '#075e54',
              color: '#ffffff',
              padding: '1.2rem 1.6rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.8rem', backgroundColor: '#25D366', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  💬
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Link WhatsApp Web Gateway
                    {isLiveBaileysActive && (
                      <span style={{ fontSize: '0.65rem', backgroundColor: '#22c55e', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                        ● Live Node Engine
                      </span>
                    )}
                  </h3>
                  <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                    Pharmx AI Automated Caregiver Surveillance Node
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false)
                  setPairingStatus('IDLE')
                }}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content Grid */}
            <div style={{
              padding: '1.6rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              alignItems: 'center'
            }}>
              {/* Instructions */}
              <div>
                <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '0.4rem' }}>
                  SIMPLE 3-STEP QR PAIRING
                </span>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>
                  To send automated alerts, connect WhatsApp:
                </h4>

                <ol style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', color: '#334155', lineHeight: '1.45', fontWeight: 600 }}>
                  <li>
                    Open <strong>WhatsApp</strong> on your mobile phone.
                  </li>
                  <li>
                    Tap <strong>Menu (⋮)</strong> on Android or <strong>Settings (⚙️)</strong> on iPhone.
                  </li>
                  <li>
                    Select <strong>Linked Devices</strong>, tap <strong>Link a Device</strong>, and point camera to this screen.
                  </li>
                </ol>

                <div style={{
                  marginTop: '1.3rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.75rem 0.9rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>
                    <span>🔒</span> End-to-End Encrypted Session
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '0.2rem' }}>
                    Messages will be sent directly to family caregiver <strong>{familyContact.name} ({familyContact.phone})</strong>.
                  </span>
                </div>
              </div>

              {/* QR Code Container */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                {pairingStatus === 'IDLE' && (
                  <>
                    <div style={{
                      position: 'relative',
                      padding: '12px',
                      backgroundColor: '#ffffff',
                      borderRadius: '18px',
                      border: '2px solid #e2e8f0',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                      overflow: 'hidden'
                    }}>
                      {/* Animated Green Laser Scan Beam */}
                      <div style={{
                        position: 'absolute',
                        left: '8px',
                        right: '8px',
                        height: '3px',
                        background: 'linear-gradient(90deg, transparent, #22c55e, #10b981, transparent)',
                        boxShadow: '0 0 14px #22c55e',
                        zIndex: 10,
                        animation: 'qrScanBeam 2.5s infinite ease-in-out'
                      }} />

                      {realBackendQr ? (
                        <img
                          src={realBackendQr}
                          alt="WhatsApp Web Live Cryptographic QR Code"
                          style={{
                            width: '200px',
                            height: '200px',
                            borderRadius: '10px',
                            display: 'block'
                          }}
                        />
                      ) : (
                        /* Authentic High-Resolution SVG QR Code Fallback */
                        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="200" height="200" rx="14" fill="#ffffff" />
                          
                          {/* Finder Patterns Top-Left */}
                          <rect x="16" y="16" width="48" height="48" rx="8" fill="#0f172a" />
                          <rect x="22" y="22" width="36" height="36" rx="5" fill="#ffffff" />
                          <rect x="28" y="28" width="24" height="24" rx="4" fill="#0f172a" />
                          
                          {/* Finder Patterns Top-Right */}
                          <rect x="136" y="16" width="48" height="48" rx="8" fill="#0f172a" />
                          <rect x="142" y="22" width="36" height="36" rx="5" fill="#ffffff" />
                          <rect x="148" y="28" width="24" height="24" rx="4" fill="#0f172a" />
                          
                          {/* Finder Patterns Bottom-Left */}
                          <rect x="16" y="136" width="48" height="48" rx="8" fill="#0f172a" />
                          <rect x="22" y="142" width="36" height="36" rx="5" fill="#ffffff" />
                          <rect x="28" y="148" width="24" height="24" rx="4" fill="#0f172a" />
                          
                          {/* Alignment Pattern */}
                          <rect x="144" y="144" width="28" height="28" rx="5" fill="#0f172a" />
                          <rect x="150" y="150" width="16" height="16" rx="3" fill="#ffffff" />
                          <rect x="154" y="154" width="8" height="8" rx="2" fill="#0f172a" />
                          
                          {/* Module Grid Dots */}
                          <rect x="74" y="18" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="90" y="18" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="106" y="18" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="82" y="30" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="98" y="30" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="114" y="30" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="74" y="42" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="90" y="42" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="114" y="42" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="82" y="54" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="102" y="54" width="8" height="8" fill="#0f172a" rx="1.5" />

                          <rect x="18" y="74" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="34" y="74" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="50" y="74" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="26" y="86" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="42" y="86" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="58" y="86" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="18" y="98" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="34" y="98" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="54" y="98" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="26" y="110" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="46" y="110" width="8" height="8" fill="#0f172a" rx="1.5" />

                          <rect x="138" y="74" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="154" y="74" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="174" y="74" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="146" y="86" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="166" y="86" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="138" y="98" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="158" y="98" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="174" y="98" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="146" y="110" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="166" y="110" width="8" height="8" fill="#0f172a" rx="1.5" />

                          <rect x="74" y="138" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="94" y="138" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="114" y="138" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="82" y="150" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="102" y="150" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="122" y="150" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="74" y="166" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="94" y="166" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="114" y="166" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="82" y="178" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="102" y="178" width="8" height="8" fill="#0f172a" rx="1.5" />
                          <rect x="122" y="178" width="8" height="8" fill="#0f172a" rx="1.5" />

                          {/* WhatsApp Center Logo */}
                          <circle cx="100" cy="100" r="24" fill="#ffffff" />
                          <circle cx="100" cy="100" r="20" fill="#25D366" />
                          <path d="M100 88C93.4 88 88 93.4 88 100C88 102.3 88.7 104.5 89.9 106.3L88.7 111L93.5 109.8C95.3 111 97.6 111.7 100 111.7C106.6 111.7 112 106.3 112 100C112 93.4 106.6 88 100 88ZM105.7 104.5C105.5 105.1 104.4 105.6 103.8 105.7C103.4 105.7 102.9 105.8 100.9 105C98.4 104 96.7 101.5 96.6 101.3C96.5 101.2 95.6 100 95.6 98.7C95.6 97.4 96.2 96.8 96.5 96.5C96.7 96.3 97 96.2 97.3 96.2C97.4 96.2 97.5 96.2 97.6 96.2C97.9 96.2 98 96.3 98.2 96.6C98.4 97.1 98.9 98.3 98.9 98.5C99 98.6 99 98.8 98.9 99C98.8 99.2 98.7 99.3 98.6 99.5C98.4 99.7 98.3 99.8 98.5 100.1C98.7 100.4 99.4 101.5 100.4 102.4C101.7 103.6 102.8 104 103.1 104.2C103.4 104.3 103.6 104.3 103.8 104.1C104 103.8 104.4 103.3 104.6 103C104.8 102.7 105 102.8 105.2 102.9C105.5 103 107.1 103.8 107.3 103.9C107.5 104 107.7 104.1 107.7 104.2C107.7 104.4 107.7 105.1 105.7 104.5Z" fill="#ffffff" />
                        </svg>
                      )}
                    </div>

                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginTop: '0.6rem', display: 'block' }}>
                      ⏱️ Code refreshes in {qrCountdown}s
                    </span>

                    <button
                      type="button"
                      onClick={handleSimulateQrPairing}
                      style={{
                        marginTop: '0.9rem',
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.65rem 1.1rem',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)'
                      }}
                    >
                      📸 Simulate Phone Scan & Link Device
                    </button>
                  </>
                )}

                {pairingStatus === 'PAIRING' && (
                  <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem' }}>
                    <div style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      border: '4px solid #d1fae5',
                      borderTopColor: '#059669',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                      Pairing with WhatsApp Network...
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '240px', lineHeight: '1.4' }}>
                      Exchanging session keys with WhatsApp Web Multi-Device protocol.
                    </span>
                  </div>
                )}

                {pairingStatus === 'SUCCESS' && (
                  <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      fontSize: '1.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)'
                    }}>
                      ✓
                    </div>
                    <strong style={{ fontSize: '1.05rem', color: '#15803d' }}>
                      WhatsApp Device Linked Successfully!
                    </strong>
                    <span style={{ fontSize: '0.76rem', color: '#475569', maxWidth: '240px', lineHeight: '1.4' }}>
                      Automated missed-dose emergency alerts are now active for caregiver <strong>{familyContact.name}</strong>.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── NOT CONNECTED WARNING MODAL ─────────────────────────────────── */}
      {notConnectedWarningModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 999999,
          display: 'grid',
          placeItems: 'center',
          padding: '1.5rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '460px',
            width: '100%',
            padding: '1.6rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
            margin: 'auto',
            textAlign: 'center'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              fontSize: '1.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.9rem auto'
            }}>
              ⚠️
            </div>

            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              WhatsApp Gateway Not Connected!
            </h3>

            <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: '1.45', margin: '0 0 1.3rem 0' }}>
              Your WhatsApp Gateway is not linked yet. Please scan the QR code to pair your device before automated emergency alerts can be dispatched to your family caregiver.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setNotConnectedWarningModal(false)}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setNotConnectedWarningModal(false)
                  setShowQrModal(true)
                }}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  flex: 2,
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)'
                }}
              >
                📸 Scan QR Code Now
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
