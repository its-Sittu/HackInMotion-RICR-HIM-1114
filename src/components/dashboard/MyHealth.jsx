import React, { useState, useEffect } from 'react'
import MedicationAlarm from './MedicationAlarm'
import HealthAnalytics from './HealthAnalytics'
import { saveActivityToMedicalHistory } from '../../utils/activityLogger'

const INITIAL_MARKED_DAYS = {
  '2026-08-10': { status: 'TAKEN', note: 'Morning & Night doses taken on time', typeIcon: '💊', color: '#10b981', bg: '#d1fae5' },
  '2026-08-11': { status: 'TAKEN', note: 'Took Pantocid 40 30 mins before breakfast', typeIcon: '💊', color: '#10b981', bg: '#d1fae5' },
  '2026-08-12': { status: 'CHECKUP', note: 'Annual ECG & Cardiac checkup completed', typeIcon: '🩺', color: '#0284c7', bg: '#e0f2fe' },
  '2026-08-13': { status: 'TAKEN', note: 'All medication doses completed', typeIcon: '💊', color: '#10b981', bg: '#d1fae5' }
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MyHealth() {
  const [currentMonth, setCurrentMonth] = useState(7) // 0-indexed: 7 = August
  const [currentYear, setCurrentYear] = useState(2026)

  const [markedDays, setMarkedDays] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsemed_marked_calendar_days')
      return saved ? JSON.parse(saved) : INITIAL_MARKED_DAYS
    } catch {
      return INITIAL_MARKED_DAYS
    }
  })

  const [selectedDayKey, setSelectedDayKey] = useState(null)
  const [modalStatus, setModalStatus] = useState('TAKEN')
  const [modalNote, setModalNote] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem('pulsemed_marked_calendar_days', JSON.stringify(markedDays))
    } catch {
      // localStorage optional
    }
  }, [markedDays])

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(prev => prev - 1)
    } else {
      setCurrentMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(prev => prev + 1)
    } else {
      setCurrentMonth(prev => prev + 1)
    }
  }

  const openDayModal = (dayNum) => {
    const formattedDay = String(dayNum).padStart(2, '0')
    const formattedMonth = String(currentMonth + 1).padStart(2, '0')
    const dateKey = `${currentYear}-${formattedMonth}-${formattedDay}`

    setSelectedDayKey(dateKey)
    const existing = markedDays[dateKey]
    if (existing) {
      setModalStatus(existing.status)
      setModalNote(existing.note || '')
    } else {
      setModalStatus('TAKEN')
      setModalNote('')
    }
  }

  const handleSaveMarking = () => {
    if (!selectedDayKey) return

    let typeIcon = '💊'
    let color = '#10b981'
    let bg = '#d1fae5'

    if (modalStatus === 'MISSED') {
      typeIcon = '⚠️'
      color = '#e11d48'
      bg = '#ffe4e6'
    } else if (modalStatus === 'CHECKUP') {
      typeIcon = '🩺'
      color = '#0284c7'
      bg = '#e0f2fe'
    }

    setMarkedDays(prev => ({
      ...prev,
      [selectedDayKey]: {
        status: modalStatus,
        note: modalNote.trim(),
        typeIcon,
        color,
        bg
      }
    }))

    saveActivityToMedicalHistory({
      title: `Calendar Health Day Marked (${selectedDayKey})`,
      category: 'Lab Reports',
      typeIcon,
      status: `${modalStatus} ✅`,
      statusBg: bg,
      statusColor: color,
      summary: `Marked day ${selectedDayKey} as ${modalStatus}. Note: ${modalNote.trim() || 'Health Day Logged'}`,
      doctorNote: modalNote.trim() || `Health day status set to ${modalStatus}`,
      details: [
        `Date Marked: ${selectedDayKey}`,
        `Status: ${modalStatus}`,
        `Patient Note: ${modalNote.trim() || 'None'}`
      ]
    })

    setSelectedDayKey(null)
  }

  const handleRemoveMarking = () => {
    if (!selectedDayKey) return

    setMarkedDays(prev => {
      const next = { ...prev }
      delete next[selectedDayKey]
      return next
    })

    setSelectedDayKey(null)
  }

  // Calculate calendar grid days
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7 // Mon = 0

  const totalMarkedCount = Object.keys(markedDays).length
  const takenCount = Object.values(markedDays).filter(d => d.status === 'TAKEN').length
  const adherenceRate = totalMarkedCount > 0 ? Math.round((takenCount / totalMarkedCount) * 100) : 100

  return (
    <div style={{ marginTop: '-0.4rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── ULTRA-EXECUTIVE HERO BANNER ───────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        borderRadius: '22px',
        padding: '1.8rem 2rem',
        marginBottom: '1.6rem',
        color: '#ffffff',
        boxShadow: '0 20px 50px -15px rgba(15, 23, 42, 0.6)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0, left: 0,
          backgroundImage: 'radial-gradient(circle at 85% 15%, rgba(129, 140, 248, 0.2) 0%, transparent 45%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                width: '50px',
                height: '50px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                fontSize: '1.45rem',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
                flexShrink: 0,
                marginTop: '0.1rem'
              }}>
                📅
              </div>

              <div>
                <span style={{ color: '#818cf8', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                  Interactive Patient Health Calendar
                </span>

                <h1 style={{
                  fontSize: '1.7rem',
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: '-0.5px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Digital Medication & Adherence Tracker
                </h1>
              </div>
            </div>

            {/* Quick Stats Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '0.5rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem'
              }}>
                <span style={{ fontSize: '1.1rem' }}>💊</span>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Adherence Rate</span>
                  <strong style={{ fontSize: '0.84rem', color: '#34d399', fontWeight: 800 }}>{adherenceRate}% Excellent</strong>
                </div>
              </div>

              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '0.5rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem'
              }}>
                <span style={{ fontSize: '1.1rem' }}>🔥</span>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Total Days Marked</span>
                  <strong style={{ fontSize: '0.84rem', color: '#f8fafc', fontWeight: 800 }}>{totalMarkedCount} Days</strong>
                </div>
              </div>
            </div>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, maxWidth: '780px', lineHeight: 1.5 }}>
            Click on any date to mark medication intake (Dose Taken 💊, Missed ⚠️, Lab Checkup 🩺) or add personal health notes. Click again to easily remove or update markings.
          </p>
        </div>
      </div>

      {/* ── 2-COLUMN LAYOUT: SLEEK COMPACT WIDGET CALENDAR ON LEFT ───────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(350px, 410px) 1fr',
        gap: '1.6rem',
        alignItems: 'start',
        width: '100%',
        boxSizing: 'border-box'
      }}>

        {/* ── LEFT: ULTRA-ATTRACTIVE DIGITAL HEALTH CALENDAR WIDGET ──────────── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '1.4rem',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.04)',
          animation: 'fadeInUp 0.3s ease-out',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          {/* Calendar Header: Sleek Dark Gradient Header Bar */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            borderRadius: '16px',
            padding: '0.9rem 1.1rem',
            marginBottom: '1rem',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    transition: 'all 0.15s ease'
                  }}
                  title="Previous Month"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    transition: 'all 0.15s ease'
                  }}
                  title="Next Month"
                >
                  ›
                </button>
              </div>

              <h2 style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                margin: 0,
                letterSpacing: '-0.3px',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
            </div>

            {/* Today Badge */}
            <span style={{
              backgroundColor: 'rgba(129, 140, 248, 0.2)',
              border: '1px solid rgba(129, 140, 248, 0.35)',
              color: '#c7d2fe',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.2rem 0.55rem',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              ✨ Live Calendar
            </span>
          </div>

          {/* 7-Column Calendar Grid Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.35rem',
            textAlign: 'center',
            marginBottom: '0.5rem',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {DAYS_OF_WEEK.map(day => (
              <div key={day} style={{
                fontSize: '0.68rem',
                fontWeight: 900,
                color: '#6366f1',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                padding: '0.2rem 0',
                backgroundColor: '#f8fafc',
                borderRadius: '6px'
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.35rem',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* Blank Leading Cells */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`blank-${idx}`} style={{ minHeight: '48px', backgroundColor: '#f8fafc', borderRadius: '10px', opacity: 0.25 }} />
            ))}

            {/* Active Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1
              const formattedDay = String(dayNum).padStart(2, '0')
              const formattedMonth = String(currentMonth + 1).padStart(2, '0')
              const dateKey = `${currentYear}-${formattedMonth}-${formattedDay}`
              const marking = markedDays[dateKey]

              const isToday = currentMonth === 7 && currentYear === 2026 && dayNum === 14

              return (
                <div
                  key={dateKey}
                  onClick={() => openDayModal(dayNum)}
                  style={{
                    minHeight: '52px',
                    minWidth: 0,
                    borderRadius: '12px',
                    padding: '0.3rem 0.25rem',
                    border: isToday ? '2px solid #6366f1' : marking ? `1.5px solid ${marking.color}` : '1px solid #e2e8f0',
                    backgroundColor: marking ? marking.bg : isToday ? '#eef2ff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isToday ? '0 4px 14px rgba(99, 102, 241, 0.25)' : marking ? '0 2px 8px rgba(0,0,0,0.03)' : 'none',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}
                  title={marking ? `${dateKey}: ${marking.status} - ${marking.note || 'No note'}` : `Click to mark ${dateKey}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: isToday || marking ? 900 : 700,
                      color: isToday ? '#4338ca' : marking ? marking.color : '#0f172a'
                    }}>
                      {dayNum}
                    </span>

                    {isToday && (
                      <span style={{ fontSize: '0.45rem', backgroundColor: '#6366f1', color: '#ffffff', padding: '0.08rem 0.2rem', borderRadius: '4px', fontWeight: 900 }}>
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* Ultra-Attractive Marked Info Badge */}
                  {marking ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.7rem' }}>{marking.typeIcon}</span>
                      <strong style={{ fontSize: '0.52rem', color: marking.color, textTransform: 'uppercase', letterSpacing: '0.1px', whiteSpace: 'nowrap', fontWeight: 900 }}>
                        {marking.status}
                      </strong>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.52rem', color: '#cbd5e1', fontWeight: 600 }}>
                      + Mark
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Calendar Bottom Legend Bar */}
          <div style={{
            marginTop: '1rem',
            paddingTop: '0.7rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.4rem'
          }}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Legend:</span>
            <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.68rem', fontWeight: 800 }}>
              <span style={{ color: '#059669', backgroundColor: '#d1fae5', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                💊 Taken
              </span>
              <span style={{ color: '#be123c', backgroundColor: '#ffe4e6', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                ⚠️ Missed
              </span>
              <span style={{ color: '#0369a1', backgroundColor: '#e0f2fe', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                🩺 Checkup
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: MEDICATION ALARM SUITE ─────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {/* Medication Audio Alarm & Reminders & Diet Schedule */}
          <MedicationAlarm />
        </div>
      </div>

      {/* ── PATIENT HEALTH ANALYTICS & INSIGHTS (PIE CHART & BAR GRAPH) ──── */}
      <HealthAnalytics />

      {/* ── DAY MARK & REMOVE MODAL ───────────────────────────────────── */}
      {selectedDayKey && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'grid',
          placeItems: 'center',
          padding: '1.5rem',
          boxSizing: 'border-box',
          margin: 0
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '460px',
            width: '100%',
            padding: '1.8rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            animation: 'fadeInUp 0.25s ease-out',
            margin: 'auto',
            boxSizing: 'border-box'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h3 style={{ margin: '0 0 0.15rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Mark Health Status
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#6366f1', fontWeight: 700 }}>
                  Date: {selectedDayKey}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDayKey(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#64748b',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                ✕
              </button>
            </div>

            {/* Status Type Selectors */}
            <div style={{ marginBottom: '1.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '0.6rem' }}>
                Select Status Category:
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setModalStatus('TAKEN')}
                  style={{
                    padding: '0.7rem 0.5rem',
                    borderRadius: '12px',
                    border: modalStatus === 'TAKEN' ? '2px solid #10b981' : '1px solid #cbd5e1',
                    backgroundColor: modalStatus === 'TAKEN' ? '#d1fae5' : '#ffffff',
                    color: modalStatus === 'TAKEN' ? '#047857' : '#475569',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>💊</span>
                  <span>Dose Taken</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalStatus('MISSED')}
                  style={{
                    padding: '0.7rem 0.5rem',
                    borderRadius: '12px',
                    border: modalStatus === 'MISSED' ? '2px solid #e11d48' : '1px solid #cbd5e1',
                    backgroundColor: modalStatus === 'MISSED' ? '#ffe4e6' : '#ffffff',
                    color: modalStatus === 'MISSED' ? '#be123c' : '#475569',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                  <span>Missed Dose</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalStatus('CHECKUP')}
                  style={{
                    padding: '0.7rem 0.5rem',
                    borderRadius: '12px',
                    border: modalStatus === 'CHECKUP' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    backgroundColor: modalStatus === 'CHECKUP' ? '#e0f2fe' : '#ffffff',
                    color: modalStatus === 'CHECKUP' ? '#0369a1' : '#475569',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>🩺</span>
                  <span>Lab / Checkup</span>
                </button>
              </div>
            </div>

            {/* Custom Note Text Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '0.5rem' }}>
                Health Note (Optional):
              </label>

              <input
                type="text"
                placeholder="e.g. Took Pantocid 40 30 mins pre-meal..."
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                style={{
                  width: '100%',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '0.65rem 0.9rem',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Action Buttons: Remove Marking vs Save */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {markedDays[selectedDayKey] && (
                <button
                  type="button"
                  onClick={handleRemoveMarking}
                  style={{
                    backgroundColor: '#fff1f2',
                    color: '#e11d48',
                    border: '1px solid #fecdd3',
                    borderRadius: '12px',
                    padding: '0.65rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  🗑️ Remove Marking
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveMarking}
                style={{
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  flex: 2,
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                }}
              >
                ✓ Save Health Mark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
