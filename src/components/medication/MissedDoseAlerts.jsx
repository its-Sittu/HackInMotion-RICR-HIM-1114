import React from 'react'
import '../../styles/medication.css'

export default function MissedDoseAlerts({
  missedDoses = [],
  onResolveDose
}) {
  if (!missedDoses || missedDoses.length === 0) return null

  const formatTime12h = (hhmm) => {
    if (!hhmm) return ''
    if (hhmm === 'Now') return 'Now'
    const [h, m] = hhmm.split(':')
    const hour = parseInt(h, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${m} ${ampm}`
  }

  return (
    <div className="missed-alert-panel">
      <div className="missed-alert-header">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>Missed Medication Warning ({missedDoses.length})</span>
      </div>

      <div className="missed-alert-list">
        {missedDoses.map((dose) => (
          <div key={dose.id} className="missed-alert-item">
            <div className="missed-item-info">
              <span className="missed-med-title">{dose.medicineName} ({dose.dosage})</span>
              <span className="missed-med-meta">
                Scheduled time: <strong>{formatTime12h(dose.scheduledTime)}</strong> on {dose.scheduledDate}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {onResolveDose && (
                <>
                  <button
                    type="button"
                    className="med-btn btn-taken"
                    onClick={() => onResolveDose(dose.id, 'taken')}
                  >
                    Mark as Taken
                  </button>
                  <button
                    type="button"
                    className="med-btn btn-skipped"
                    onClick={() => onResolveDose(dose.id, 'skipped')}
                  >
                    Dismiss / Skip
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
