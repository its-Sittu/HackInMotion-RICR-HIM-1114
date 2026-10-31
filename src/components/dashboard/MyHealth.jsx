import React, { useState, useEffect } from 'react'
import MedicationAlarm from './MedicationAlarm'
import { saveActivityToMedicalHistory } from '../../utils/activityLogger'
import '../../styles/my-health.css'

const INITIAL_MARKED_DAYS = {
  '2026-08-10': { status: 'TAKEN', note: 'Morning & Night doses taken on time', typeIcon: '💊', color: '#10b981', bg: '#064e3b' },
  '2026-08-11': { status: 'TAKEN', note: 'Took Pantocid 40 30 mins before breakfast', typeIcon: '💊', color: '#10b981', bg: '#064e3b' },
  '2026-08-12': { status: 'CHECKUP', note: 'Annual ECG & Cardiac checkup completed', typeIcon: '🩺', color: '#38bdf8', bg: '#0c4a6e' },
  '2026-08-13': { status: 'TAKEN', note: 'All medication doses completed', typeIcon: '💊', color: '#10b981', bg: '#064e3b' }
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const HEALTH_SUB_TABS = [
  { id: 'all', label: 'All Modules (Overview)', icon: '🌟' },
  { id: 'calendar', label: 'Health Calendar', icon: '📅' },
  { id: 'alarms', label: 'Medication Alarms', icon: '⏰' },
  { id: 'caregiver', label: 'Caregiver WhatsApp SOS', icon: '👨‍👩‍👧' },
  { id: 'meals', label: 'Diet & Meal Routine', icon: '🥗' }
]

export default function MyHealth() {
  const [currentMonth, setCurrentMonth] = useState(7) // 0-indexed: 7 = August
  const [currentYear, setCurrentYear] = useState(2026)
  const [activeSubTab, setActiveSubTab] = useState('all')

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
      setCurrentYear((prev) => prev - 1)
    } else {
      setCurrentMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((prev) => prev + 1)
    } else {
      setCurrentMonth((prev) => prev + 1)
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
    let bg = '#064e3b'

    if (modalStatus === 'MISSED') {
      typeIcon = '⚠️'
      color = '#f43f5e'
      bg = '#4c0519'
    } else if (modalStatus === 'CHECKUP') {
      typeIcon = '🩺'
      color = '#38bdf8'
      bg = '#0c4a6e'
    }

    setMarkedDays((prev) => ({
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

    setMarkedDays((prev) => {
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
  const takenCount = Object.values(markedDays).filter((d) => d.status === 'TAKEN').length
  const adherenceRate = totalMarkedCount > 0 ? Math.round((takenCount / totalMarkedCount) * 100) : 100

  // ── Render Calendar Widget Component ─────────────────────────
  const renderCalendarCard = () => (
    <div className="myhealth-card myhealth-calendar-card" style={{ padding: '1.4rem', height: '100%' }}>
      {/* Calendar Header Bar */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.9) 100%)',
          borderRadius: '16px',
          padding: '0.9rem 1.1rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.9rem',
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
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 800,
                color: '#ffffff',
                transition: 'all 0.15s ease'
              }}
              title="Next Month"
            >
              ›
            </button>
          </div>

          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 900,
              margin: 0,
              letterSpacing: '-0.02em',
              color: '#ffffff'
            }}
          >
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
        </div>

        {/* Live Calendar Badge */}
        <span
          style={{
            backgroundColor: 'rgba(99, 102, 241, 0.22)',
            border: '1px solid rgba(99, 102, 241, 0.45)',
            color: '#a5b4fc',
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '0.22rem 0.6rem',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          ✨ Interactive
        </span>
      </div>

      {/* 7-Column Calendar Grid Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.35rem',
          textAlign: 'center',
          marginBottom: '0.5rem',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#818cf8',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '0.25rem 0',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              borderRadius: '8px'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.4rem',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Blank Leading Cells */}
        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <div
            key={`blank-${idx}`}
            style={{
              minHeight: '52px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              opacity: 0.2
            }}
          />
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
              className={`myhealth-calendar-cell ${isToday ? 'is-today' : ''}`}
              style={{
                backgroundColor: marking ? marking.bg : undefined,
                borderColor: marking ? marking.color : undefined
              }}
              title={
                marking
                  ? `${dateKey}: ${marking.status} - ${marking.note || 'No note'}`
                  : `Click to log health activity for ${dateKey}`
              }
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: isToday || marking ? 900 : 700,
                    color: isToday ? '#a5b4fc' : marking ? marking.color : '#cbd5e1'
                  }}
                >
                  {dayNum}
                </span>

                {isToday && (
                  <span
                    style={{
                      fontSize: '0.46rem',
                      backgroundColor: '#6366f1',
                      color: '#ffffff',
                      padding: '0.1rem 0.28rem',
                      borderRadius: '4px',
                      fontWeight: 900
                    }}
                  >
                    TODAY
                  </span>
                )}
              </div>

              {/* Marked Badge or Placeholder */}
              {marking ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.68rem' }}>{marking.typeIcon}</span>
                  <strong
                    style={{
                      fontSize: '0.52rem',
                      color: marking.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                      fontWeight: 900
                    }}
                  >
                    {marking.status}
                  </strong>
                </div>
              ) : (
                <span style={{ fontSize: '0.5rem', color: '#64748b', fontWeight: 600 }}>+ Log</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Calendar Bottom Legend Bar */}
      <div
        style={{
          marginTop: '1.2rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.6rem'
        }}
      >
        <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Status Legend:
        </span>
        <div style={{ display: 'flex', gap: '0.45rem', fontSize: '0.68rem', fontWeight: 800, flexWrap: 'wrap' }}>
          <span style={{ color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.55rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            💊 Dose Taken
          </span>
          <span style={{ color: '#fb7185', backgroundColor: 'rgba(244, 63, 94, 0.15)', padding: '0.2rem 0.55rem', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
            ⚠️ Missed
          </span>
          <span style={{ color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.15)', padding: '0.2rem 0.55rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            🩺 Checkup
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="myhealth-container">
      {/* ── ULTRA-EXECUTIVE HERO BANNER ───────────────────────────────────── */}
      <div className="myhealth-hero-banner">
        <div className="myhealth-hero-glow" />

        <div className="myhealth-hero-content">
          <div className="myhealth-hero-top">
            <div className="myhealth-hero-brand">
              <div className="myhealth-hero-icon-box">📅</div>
              <div>
                <span className="myhealth-hero-tag">Patient Health & Safety Command</span>
                <h1 className="myhealth-hero-title">Digital Medication & Adherence Tracker</h1>
              </div>
            </div>

            {/* Executive Quick Stats */}
            <div className="myhealth-hero-stats">
              <div className="myhealth-stat-pill">
                <span style={{ fontSize: '1.1rem' }}>💊</span>
                <div>
                  <span className="myhealth-stat-label">Adherence Rate</span>
                  <span className="myhealth-stat-val" style={{ color: '#34d399' }}>
                    {adherenceRate}% Excellent
                  </span>
                </div>
              </div>

              <div className="myhealth-stat-pill">
                <span style={{ fontSize: '1.1rem' }}>🔥</span>
                <div>
                  <span className="myhealth-stat-label">Total Days Logged</span>
                  <span className="myhealth-stat-val">{totalMarkedCount} Days</span>
                </div>
              </div>

              <div className="myhealth-stat-pill">
                <span style={{ fontSize: '1.1rem' }}>⚡</span>
                <div>
                  <span className="myhealth-stat-label">Safety Status</span>
                  <span className="myhealth-stat-val" style={{ color: '#38bdf8' }}>
                    Automated SOS
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="myhealth-hero-desc">
            Complete daily health adherence portal: track your medication schedule, set audio alarms, sync family caregiver WhatsApp SOS triggers, and manage clinical dietary meal routines.
          </p>
        </div>
      </div>

      {/* ── SEGMENTED NAVIGATION TABS (PROPER FOCUS & SPACED MODULARITY) ──── */}
      <nav className="myhealth-nav-tabs" aria-label="Health Modules Filter">
        {HEALTH_SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`myhealth-tab-btn ${activeSubTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveSubTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── TAB CONTENT ──────────────────────────────────────────────────── */}
      {/* 1. ALL MODULES (OVERVIEW): BALANCED 2-ROW GRID WITH PROPER SPACING */}
      {activeSubTab === 'all' && (
        <>
          {/* Row 1: Calendar & Medication Alarms side-by-side with equal visual weight */}
          <div className="myhealth-top-grid">
            {renderCalendarCard()}
            <MedicationAlarm section="alarms" />
          </div>

          {/* Row 2: Caregiver WhatsApp SOS Gateway (Full Width, Spacious) */}
          <div className="myhealth-full-section">
            <MedicationAlarm section="caregiver" />
          </div>

          {/* Row 3: Healthy Food Planning Schedule (Full Width, Spacious) */}
          <div className="myhealth-full-section">
            <MedicationAlarm section="meals" />
          </div>
        </>
      )}

      {/* 2. CALENDAR TAB ONLY */}
      {activeSubTab === 'calendar' && (
        <div style={{ maxWidth: '850px', margin: '0 auto 2rem auto' }}>
          {renderCalendarCard()}
        </div>
      )}

      {/* 3. ALARMS TAB ONLY */}
      {activeSubTab === 'alarms' && (
        <div style={{ maxWidth: '900px', margin: '0 auto 2rem auto' }}>
          <MedicationAlarm section="alarms" />
        </div>
      )}

      {/* 4. CAREGIVER SOS TAB ONLY */}
      {activeSubTab === 'caregiver' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto 2rem auto' }}>
          <MedicationAlarm section="caregiver" />
        </div>
      )}

      {/* 5. DIET & MEALS TAB ONLY */}
      {activeSubTab === 'meals' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto 2rem auto' }}>
          <MedicationAlarm section="meals" />
        </div>
      )}

      {/* ── DAY MARK & REMOVE MODAL ───────────────────────────────────── */}
      {selectedDayKey && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(11, 17, 32, 0.82)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'grid',
            placeItems: 'center',
            padding: '1.5rem',
            boxSizing: 'border-box',
            margin: 0
          }}
        >
          <div
            className="myhealth-card"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '1.8rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
              margin: 'auto',
              boxSizing: 'border-box'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.3rem',
                paddingBottom: '0.85rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                  Log Daily Health Status
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 700 }}>
                  Date: {selectedDayKey}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDayKey(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#cbd5e1',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                ✕
              </button>
            </div>

            {/* Status Type Selectors */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'block',
                  marginBottom: '0.65rem'
                }}
              >
                Select Status Category:
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setModalStatus('TAKEN')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: '14px',
                    border: modalStatus === 'TAKEN' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: modalStatus === 'TAKEN' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: modalStatus === 'TAKEN' ? '#34d399' : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>💊</span>
                  <span>Dose Taken</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalStatus('MISSED')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: '14px',
                    border: modalStatus === 'MISSED' ? '2px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: modalStatus === 'MISSED' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: modalStatus === 'MISSED' ? '#fb7185' : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>⚠️</span>
                  <span>Missed Dose</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalStatus('CHECKUP')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: '14px',
                    border: modalStatus === 'CHECKUP' ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: modalStatus === 'CHECKUP' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: modalStatus === 'CHECKUP' ? '#38bdf8' : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>🩺</span>
                  <span>Checkup</span>
                </button>
              </div>
            </div>

            {/* Custom Note Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'block',
                  marginBottom: '0.5rem'
                }}
              >
                Health / Patient Note (Optional):
              </label>

              <input
                type="text"
                placeholder="e.g. Took Pantocid 40 30 mins pre-meal..."
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                style={{
                  width: '100%',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '0.7rem 0.95rem',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {markedDays[selectedDayKey] && (
                <button
                  type="button"
                  onClick={handleRemoveMarking}
                  style={{
                    backgroundColor: 'rgba(244, 63, 94, 0.15)',
                    color: '#fb7185',
                    border: '1px solid rgba(244, 63, 94, 0.35)',
                    borderRadius: '12px',
                    padding: '0.7rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  🗑️ Remove
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveMarking}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.7rem 1.1rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  flex: 2,
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                }}
              >
                ✓ Save Health Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
