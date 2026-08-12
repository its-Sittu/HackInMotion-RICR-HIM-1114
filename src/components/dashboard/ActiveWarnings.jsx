import React from 'react'
import '../../styles/activeWarnings.css'

// Local placeholder warnings data
const DEFAULT_WARNINGS = [
  {
    id: 'warn-1',
    riskLevel: 'Moderate Interaction',
    riskType: 'moderate',
    medicines: ['Medicine A', 'Medicine B'],
    explanation: 'These medicines may interact.',
    recommendation: 'Consult your doctor or pharmacist.'
  },
  {
    id: 'warn-2',
    riskLevel: 'High Risk',
    riskType: 'high',
    medicines: ['Warfarin', 'Aspirin'],
    explanation: 'Combining blood thinners like Warfarin with Aspirin significantly increases the risk of severe internal bleeding.',
    recommendation: 'Consult your prescribing physician immediately before taking these medications together.'
  }
]

export function WarningCard({ warning }) {
  const { riskLevel, riskType, medicines, explanation, recommendation } = warning

  const getBadgeClass = (type) => {
    switch (type) {
      case 'high':
        return 'warning-badge badge-high'
      case 'moderate':
        return 'warning-badge badge-moderate'
      case 'low':
      default:
        return 'warning-badge badge-low'
    }
  }

  const formattedMedicines = Array.isArray(medicines) ? medicines.join(' + ') : medicines

  return (
    <div className={`active-warning-card risk-${riskType || 'moderate'}`}>
      <div className="warning-card-header">
        <span className={getBadgeClass(riskType)}>
          {riskLevel || 'Moderate Interaction'}
        </span>
      </div>

      <div className="warning-medicines">
        <span className="medicine-names">
          {formattedMedicines}
        </span>
      </div>

      <p className="warning-explanation">
        {explanation || 'These medicines may interact.'}
      </p>

      <div className="warning-recommendation-box">
        <strong className="recommendation-label">Recommendation:</strong>
        <p className="recommendation-text">
          {recommendation || 'Consult your doctor or pharmacist.'}
        </p>
      </div>
    </div>
  )
}

export default function ActiveWarnings({ warnings = DEFAULT_WARNINGS, title = "Active Warnings" }) {
  return (
    <section className="active-warnings-section">
      <div className="active-warnings-header">
        <h2 className="active-warnings-title">
          <svg 
            className="warning-title-icon" 
            width="22" 
            height="22" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {title}
        </h2>
        {warnings && warnings.length > 0 && (
          <span className="warning-count-badge">{warnings.length} Active</span>
        )}
      </div>

      <div className="active-warnings-list">
        {warnings && warnings.length > 0 ? (
          warnings.map((warning, index) => (
            <WarningCard key={warning.id || index} warning={warning} />
          ))
        ) : (
          <div className="no-warnings-state">
            <p>No active interactions detected.</p>
          </div>
        )}
      </div>
    </section>
  )
}
