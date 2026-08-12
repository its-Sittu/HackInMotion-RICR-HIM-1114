import React, { useState } from 'react'
import RiskSeverityIndicator from './RiskSeverityIndicator'
import '../../styles/activeWarnings.css'

export default function InteractionWarningCard({ 
  warning = {
    id: 'sample-1',
    severity: 'Moderate',
    medicines: ['Medicine A', 'Medicine B'],
    explanation: 'These medicines may interact.',
    symptoms: ['Dizziness', 'Nausea', 'Unusual bleeding'],
    recommendation: 'Consult your doctor or pharmacist.'
  },
  onViewDetails
}) {
  const [showDetails, setShowDetails] = useState(false)

  const { 
    severity = 'Moderate', 
    medicines = [], 
    explanation = '', 
    symptoms = ['Dizziness', 'Nausea', 'Unusual bleeding'],
    recommendation = '' 
  } = warning

  const formattedMedicines = Array.isArray(medicines) ? medicines.join(' + ') : medicines

  const handleDetailsClick = () => {
    if (onViewDetails) {
      onViewDetails(warning)
    }
    setShowDetails(prev => !prev)
  }

  return (
    <div className={`active-warning-card risk-${(severity || 'moderate').toLowerCase()}`}>
      <div className="warning-card-header">
        <RiskSeverityIndicator severity={severity} showDescription={true} />
      </div>

      <div className="warning-medicines">
        <span className="medicine-names">
          {formattedMedicines || 'Medicine A + Medicine B'}
        </span>
      </div>

      <p className="warning-explanation">
        {explanation || 'These medicines may interact.'}
      </p>

      {symptoms && symptoms.length > 0 && (
        <div className="warning-symptoms-box">
          <strong className="symptoms-label">
            <svg 
              className="symptoms-icon" 
              width="15" 
              height="15" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              aria-hidden="true"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            Symptoms to watch for:
          </strong>
          <div className="symptoms-chips-container">
            {symptoms.map((symptom, idx) => (
              <span key={idx} className="symptom-chip">
                <span className="symptom-dot" aria-hidden="true">•</span>
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="warning-recommendation-box">
        <strong className="recommendation-label">Recommendation:</strong>
        <p className="recommendation-text">
          {recommendation || 'Consult your doctor or pharmacist.'}
        </p>
      </div>

      {showDetails && (
        <div className="warning-details-expanded">
          <h4 className="details-expanded-title">Detailed Mechanism:</h4>
          <p className="details-expanded-text">
            Concurrent use of these medications may alter serum concentrations or therapeutic efficacy. Close clinical monitoring is advised.
          </p>
        </div>
      )}

      <div className="warning-card-footer">
        <button 
          type="button" 
          className="view-details-btn" 
          onClick={handleDetailsClick}
          aria-expanded={showDetails}
        >
          {showDetails ? 'Hide Details' : 'View Details'}
          <svg 
            className={`btn-arrow-icon ${showDetails ? 'icon-rotated' : ''}`} 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
