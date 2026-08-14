import React, { useState } from 'react'
import '../../styles/medication.css'

export default function TodayDosesList({
  doseRecords = [],
  onActionStatus
}) {
  const [activeSnoozeMenu, setActiveSnoozeMenu] = useState(null)

  const formatTime12h = (hhmm) => {
    if (!hhmm) return ''
    if (hhmm === 'Now') return 'Now'
    const [h, m] = hhmm.split(':')
    const hour = parseInt(h, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${m} ${ampm}`
  }

  const formatActedTimestamp = (isoString) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const handleSnoozeClick = (doseId, minutes) => {
    setActiveSnoozeMenu(null)
    if (onActionStatus) {
      onActionStatus(doseId, 'snoozed', minutes)
    }
  }

  return (
    <div className="med-panel">
      <div className="med-panel-header">
        <h3 className="med-panel-title">
          <svg
            className="med-panel-icon"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Today&apos;s Scheduled Doses
        </h3>
        <span className="med-badge med-badge-indigo">
          {doseRecords.length} Doses Scheduled Today
        </span>
      </div>

      {doseRecords.length === 0 ? (
        <div className="empty-schedule-state">
          <svg
            className="empty-icon"
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <p>All doses completed or no doses scheduled for today!</p>
        </div>
      ) : (
        <div className="dose-list">
          {doseRecords.map((dose) => {
            const isTaken = dose.status === 'taken'
            const isSkipped = dose.status === 'skipped'
            const isSnoozed = dose.status === 'snoozed'
            const isMissed = dose.status === 'missed'

            return (
              <div key={dose.id} className="dose-item-card">
                <div className="dose-info">
                  <div className="dose-time-badge">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {formatTime12h(dose.scheduledTime)}
                  </div>

                  <div className="dose-details">
                    <h4 className="dose-med-title">{dose.medicineName}</h4>
                    <span className="dose-med-sub">
                      Dosage: <strong>{dose.dosage}</strong>
                      {dose.instructions ? ` • ${dose.instructions}` : ''}
                    </span>
                  </div>
                </div>

                <div className="dose-actions-group">
                  {isTaken && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="med-badge med-badge-green">
                        ✓ Taken {dose.actedAt ? `at ${formatActedTimestamp(dose.actedAt)}` : ''}
                      </span>
                      <button
                        type="button"
                        className="med-btn med-btn-secondary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => onActionStatus && onActionStatus(dose.id, 'pending')}
                      >
                        Undo
                      </button>
                    </div>
                  )}

                  {isSkipped && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="med-badge med-badge-amber">
                        ✕ Skipped {dose.actedAt ? `at ${formatActedTimestamp(dose.actedAt)}` : ''}
                      </span>
                      <button
                        type="button"
                        className="med-btn med-btn-secondary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => onActionStatus && onActionStatus(dose.id, 'pending')}
                      >
                        Undo
                      </button>
                    </div>
                  )}

                  {isMissed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="med-badge med-badge-rose">
                        ⚠️ Missed Dose
                      </span>
                      <button
                        type="button"
                        className="med-btn med-btn-primary"
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => onActionStatus && onActionStatus(dose.id, 'taken')}
                      >
                        Mark Taken
                      </button>
                    </div>
                  )}

                  {(!isTaken && !isSkipped && !isMissed) && (
                    <>
                      {isSnoozed && (
                        <span className="med-badge med-badge-purple" style={{ marginRight: '0.2rem' }}>
                          💤 Snoozed
                        </span>
                      )}

                      {/* TAKEN ACTION BUTTON */}
                      <button
                        type="button"
                        className="med-btn btn-taken"
                        onClick={() => onActionStatus && onActionStatus(dose.id, 'taken')}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Taken
                      </button>

                      {/* SKIPPED ACTION BUTTON */}
                      <button
                        type="button"
                        className="med-btn btn-skipped"
                        onClick={() => onActionStatus && onActionStatus(dose.id, 'skipped')}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Skipped
                      </button>

                      {/* SNOOZE ACTION BUTTON WITH POPOVER */}
                      <div style={{ position: 'relative' }}>
                        <button
                          type="button"
                          className="med-btn btn-snooze"
                          onClick={() =>
                            setActiveSnoozeMenu(activeSnoozeMenu === dose.id ? null : dose.id)
                          }
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                          </svg>
                          Snooze ▾
                        </button>

                        {activeSnoozeMenu === dose.id && (
                          <div className="snooze-options-popover">
                            <button
                              type="button"
                              className="snooze-opt-btn"
                              onClick={() => handleSnoozeClick(dose.id, 15)}
                            >
                              ⏱ 15 Minutes
                            </button>
                            <button
                              type="button"
                              className="snooze-opt-btn"
                              onClick={() => handleSnoozeClick(dose.id, 30)}
                            >
                              ⏱ 30 Minutes
                            </button>
                            <button
                              type="button"
                              className="snooze-opt-btn"
                              onClick={() => handleSnoozeClick(dose.id, 60)}
                            >
                              ⏱ 1 Hour
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
