import React from 'react'
import '../../styles/medication.css'

export default function MedicationScheduleList({
  schedules = [],
  onAddNewClick,
  onDeleteSchedule
}) {
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Medication Schedule
        </h3>

        {onAddNewClick && (
          <button
            type="button"
            className="med-btn med-btn-primary"
            onClick={onAddNewClick}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Schedule
          </button>
        )}
      </div>

      {schedules.length === 0 ? (
        <div className="empty-schedule-state">
          <svg
            className="empty-icon"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.5 20.5 3 13l3-3 7.5 7.5z" />
            <path d="m13.5 16.5 7.5-7.5-3-3-7.5 7.5z" />
            <path d="m9 9 6 6" />
          </svg>
          <p>No scheduled medications added yet.</p>
          {onAddNewClick && (
            <button
              type="button"
              className="med-btn med-btn-secondary"
              onClick={onAddNewClick}
            >
              Create your first medication schedule
            </button>
          )}
        </div>
      ) : (
        <div className="schedule-grid">
          {schedules.map((item) => (
            <div key={item.id} className="schedule-card">
              <div className="schedule-card-header">
                <div>
                  <h4 className="med-name">{item.medicineName}</h4>
                  <div className="med-dosage">{item.dosage}</div>
                </div>
                <span className="med-badge med-badge-indigo">
                  {item.frequencyLabel || item.frequency || 'Daily'}
                </span>
              </div>

              <div className="schedule-meta-list">
                <div className="schedule-meta-item">
                  <svg
                    className="schedule-meta-icon"
                    width="15"
                    height="15"
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
                  <span>Times:</span>
                </div>
                <div className="time-chips">
                  {Array.isArray(item.times) && item.times.length > 0 ? (
                    item.times.map((t, idx) => (
                      <span key={idx} className="time-chip">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="time-chip">{item.time || '08:00'}</span>
                  )}
                </div>

                <div className="schedule-meta-item" style={{ marginTop: '0.3rem' }}>
                  <svg
                    className="schedule-meta-icon"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>
                    Start: <strong>{item.startDate}</strong>
                    {item.endDate ? ` — End: ${item.endDate}` : ' (Ongoing)'}
                  </span>
                </div>

                {item.instructions && (
                  <div
                    className="schedule-meta-item"
                    style={{ fontSize: '0.8rem', opacity: 0.8 }}
                  >
                    <span>Note: {item.instructions}</span>
                  </div>
                )}
              </div>

              {onDeleteSchedule && (
                <div className="schedule-actions">
                  <button
                    type="button"
                    className="med-btn med-btn-danger med-btn-icon-only"
                    title="Remove Schedule"
                    onClick={() => onDeleteSchedule(item.id)}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
