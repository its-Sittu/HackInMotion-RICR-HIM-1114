import React, { useState, useEffect, useRef, useCallback } from 'react'
import { saveActivityToMedicalHistory } from '../../utils/activityLogger'

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

export default function MedicationAlarm() {
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
  const [ringingTimer, setRingingTimer] = useState(60)
  const [familyCareSyncEnabled, setFamilyCareSyncEnabled] = useState(true)

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
      summary: `1-minute alarm rang with no response for "${alarm.medicine}" (${alarm.time}). Marked as Missed.`,
      doctorNote: `Dose missed by patient. Instruction: ${alarm.instruction}`,
      details: [
        `Medicine Missed: ${alarm.medicine}`,
        `Scheduled Time: ${alarm.time}`,
        `Status: Missed Dose ⚠️`
      ]
    })
  }, [])

  // 60-Second Ringing Countdown Effect
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

  return (
    <>
      <div style={{
        backgroundColor: '#ffffff',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      padding: '1.1rem 1.3rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
      boxSizing: 'border-box'
    }}>
      <style>{`
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.4); }
          70% { box-shadow: 0 0 0 16px rgba(225, 29, 72, 0); }
          100% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); }
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
                  ⏱️ {ringingTimer}s until Family SOS
                </span>
              </div>

              <h4 style={{ margin: '0.1rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#881337' }}>
                {activeRingingAlarm.medicine}
              </h4>
              <span style={{ fontSize: '0.78rem', color: '#9f1239', fontWeight: 600, display: 'block' }}>
                📌 {activeRingingAlarm.instruction}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#be123c', fontWeight: 700, marginTop: '0.2rem', display: 'block' }}>
                ⚠️ If unanswered in {ringingTimer} seconds, automated SOS alert will be sent to 3 priority contacts.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
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
                title="Test alarm sound"
              >
                🔊 Test
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

      {/* ── HEALTHY FOOD PLANNING & SCHEDULE BOARD (ALARM KE NICHE) ────────── */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        padding: '1.2rem 1.4rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
        boxSizing: 'border-box',
        marginTop: '1.4rem'
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

    </>
  )
}
