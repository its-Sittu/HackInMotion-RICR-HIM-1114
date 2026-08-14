import React, { useState, useEffect, useRef } from 'react'

const INITIAL_ALARMS = [
  {
    id: 'alarm-1',
    medicine: 'Pantocid 40mg (Pantoprazole)',
    time: '08:00 AM',
    period: 'Subah (Morning)',
    instruction: 'Pre-Breakfast (Khali Pet 30 mins before food)',
    status: 'ACTIVE', // 'ACTIVE' | 'TAKEN' | 'SNOOZED'
    color: '#6366f1'
  },
  {
    id: 'alarm-2',
    medicine: 'Dolo 650mg (Paracetamol)',
    time: '02:00 PM',
    period: 'Dopahar (Afternoon)',
    instruction: 'After Food (Khane Ke Baad)',
    status: 'ACTIVE',
    color: '#059669'
  },
  {
    id: 'alarm-3',
    medicine: 'Metformin 500mg',
    time: '09:30 PM',
    period: 'Raat (Night)',
    instruction: 'With Dinner (Khane Ke Sath)',
    status: 'ACTIVE',
    color: '#d97706'
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

  const [activeRingingAlarm, setActiveRingingAlarm] = useState(null)

  // Phone-Style Alarm Time Picker Modal state
  const [modifyModalAlarm, setModifyModalAlarm] = useState(null)
  const [pickerHour, setPickerHour] = useState('08')
  const [pickerMinute, setPickerMinute] = useState('00')
  const [pickerAmpm, setPickerAmpm] = useState('AM')

  // Add new alarm modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMedName, setNewMedName] = useState('')
  const [newMedTime, setNewMedTime] = useState('08:00')
  const [newMedInstruction, setNewMedInstruction] = useState('After Food')

  const audioCtxRef = useRef(null)
  const soundIntervalRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem('pulsemed_medication_alarms', JSON.stringify(alarms))
    } catch {
      // localStorage optional
    }
  }, [alarms])

  // Open Phone-Style Alarm Time Picker Modal for an alarm
  const openTimePickerModal = (alarm) => {
    setModifyModalAlarm(alarm)

    // Parse existing time string e.g. "08:00 AM"
    try {
      const parts = alarm.time.split(' ')
      if (parts.length === 2) {
        const [h, m] = parts[0].split(':')
        setPickerHour(String(h).padStart(2, '0'))
        setPickerMinute(String(m).padStart(2, '0'))
        setPickerAmpm(parts[1].toUpperCase())
      } else {
        const now = new Date()
        const hours = now.getHours()
        setPickerHour(String(hours % 12 === 0 ? 12 : hours % 12).padStart(2, '0'))
        setPickerMinute(String(now.getMinutes()).padStart(2, '0'))
        setPickerAmpm(hours >= 12 ? 'PM' : 'AM')
      }
    } catch {
      setPickerHour('08')
      setPickerMinute('00')
      setPickerAmpm('AM')
    }
  }



  // Save selected phone alarm time
  const handleSavePickerTime = () => {
    if (!modifyModalAlarm) return

    const formattedTimeStr = `${pickerHour}:${pickerMinute} ${pickerAmpm}`

    // Calculate period
    let h24 = parseInt(pickerHour, 10)
    if (pickerAmpm === 'PM' && h24 < 12) h24 += 12
    if (pickerAmpm === 'AM' && h24 === 12) h24 = 0

    const period = h24 < 12 ? 'Subah (Morning)' : h24 < 17 ? 'Dopahar (Afternoon)' : h24 < 21 ? 'Shaam (Evening)' : 'Raat (Night)'

    setAlarms(prev => prev.map(item => {
      if (item.id === modifyModalAlarm.id) {
        return {
          ...item,
          time: formattedTimeStr,
          period,
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

      // Harmonic Crystal Chime Frequencies (E5, G#5, B5, E6)
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
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12
      const formattedMinutes = String(minutes).padStart(2, '0')
      const formattedTimeStr = `${String(formattedHours).padStart(2, '0')}:${formattedMinutes} ${ampm}`

      alarms.forEach(alarm => {
        if (alarm.status === 'ACTIVE' && alarm.time.toUpperCase() === formattedTimeStr.toUpperCase()) {
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

  // Mark medicine as TAKEN ✅
  const handleMarkTaken = (alarmId) => {
    setAlarms(prev => prev.map(item => {
      if (item.id === alarmId) {
        return { ...item, status: 'TAKEN', takenTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      }
      return item
    }))

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

  // Add new medicine alarm
  const handleAddNewAlarm = () => {
    if (!newMedName.trim()) return

    const [h, m] = newMedTime.split(':')
    let hour = parseInt(h, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    hour = hour % 12 === 0 ? 12 : hour % 12
    const formatted12h = `${String(hour).padStart(2, '0')}:${m} ${ampm}`

    const period = hour < 12 ? 'Subah (Morning)' : hour < 17 ? 'Dopahar (Afternoon)' : hour < 21 ? 'Shaam (Evening)' : 'Raat (Night)'

    const newAlarm = {
      id: `alarm-${Date.now()}`,
      medicine: newMedName.trim(),
      time: formatted12h,
      period,
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

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      padding: '1.4rem 1.6rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⏰</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Medication Alarm & Reminders
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Subah / Shaam Audio Sound Reminders & Adherence Tracker
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
            borderRadius: '10px',
            padding: '0.45rem 0.85rem',
            fontSize: '0.78rem',
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
              <span style={{ fontSize: '0.7rem', color: '#be123c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block' }}>
                🔊 ALARM RINGING NOW! ({activeRingingAlarm.time})
              </span>
              <h4 style={{ margin: '0.1rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#881337' }}>
                {activeRingingAlarm.medicine}
              </h4>
              <span style={{ fontSize: '0.78rem', color: '#9f1239', fontWeight: 600 }}>
                📌 {activeRingingAlarm.instruction}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: item.status === 'TAKEN' ? '#15803d' : '#0f172a' }}>
                    {item.medicine}
                  </h4>
                  <span style={{ fontSize: '0.65rem', backgroundColor: '#e2e8f0', color: '#475569', padding: '0.1rem 0.4rem', borderRadius: '6px', fontWeight: 700 }}>
                    {item.period}
                  </span>
                </div>

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
                  fontSize: '0.9rem',
                  padding: '0.2rem'
                }}
                title="Delete alarm"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
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
              padding: '1.4rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              marginBottom: '1.6rem'
            }}>
              {/* Hour Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>Hour</span>
                <select
                  value={pickerHour}
                  onChange={(e) => setPickerHour(e.target.value)}
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '14px',
                    padding: '0.4rem 0.6rem',
                    outline: 'none',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const val = String(i + 1).padStart(2, '0')
                    return <option key={val} value={val}>{val}</option>
                  })}
                </select>
              </div>

              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#6366f1', marginTop: '1.2rem' }}>:</span>

              {/* Minute Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>Minute</span>
                <select
                  value={pickerMinute}
                  onChange={(e) => setPickerMinute(e.target.value)}
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '14px',
                    padding: '0.4rem 0.6rem',
                    outline: 'none',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {Array.from({ length: 60 }).map((_, i) => {
                    const val = String(i).padStart(2, '0')
                    return <option key={val} value={val}>{val}</option>
                  })}
                </select>
              </div>

              {/* AM / PM Toggle Pill */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>AM / PM</span>
                <div style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '12px', padding: '0.2rem' }}>
                  <button
                    type="button"
                    onClick={() => setPickerAmpm('AM')}
                    style={{
                      border: 'none',
                      borderRadius: '10px',
                      backgroundColor: pickerAmpm === 'AM' ? '#6366f1' : 'transparent',
                      color: pickerAmpm === 'AM' ? '#ffffff' : '#475569',
                      fontWeight: 800,
                      padding: '0.5rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    AM
                  </button>

                  <button
                    type="button"
                    onClick={() => setPickerAmpm('PM')}
                    style={{
                      border: 'none',
                      borderRadius: '10px',
                      backgroundColor: pickerAmpm === 'PM' ? '#6366f1' : 'transparent',
                      color: pickerAmpm === 'PM' ? '#ffffff' : '#475569',
                      fontWeight: 800,
                      padding: '0.5rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    PM
                  </button>
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
    </div>
  )
}
