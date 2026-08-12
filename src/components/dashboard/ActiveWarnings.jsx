import React from 'react'
import InteractionWarningCard from './InteractionWarningCard'
import '../../styles/activeWarnings.css'

// Re-export InteractionWarningCard for standalone use
export { InteractionWarningCard }

// Local placeholder warnings data featuring Mild, Moderate, Severe severities
const DEFAULT_WARNINGS = [
  {
    id: 'warn-1',
    severity: 'Severe',
    medicines: ['Warfarin', 'Aspirin'],
    explanation: 'Combining blood thinners like Warfarin with Aspirin significantly increases the risk of severe internal bleeding.',
    recommendation: 'Consult your prescribing physician immediately before taking these medications together.'
  },
  {
    id: 'warn-2',
    severity: 'Moderate',
    medicines: ['Medicine A', 'Medicine B'],
    explanation: 'These medicines may interact.',
    recommendation: 'Consult your doctor or pharmacist.'
  },
  {
    id: 'warn-3',
    severity: 'Mild',
    medicines: ['Calcium Supplement', 'Levothyroxine'],
    explanation: 'Calcium can bind to thyroid medication, reducing overall gastrointestinal absorption.',
    recommendation: 'Take these medications at least 4 hours apart.'
  }
]

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
            <InteractionWarningCard key={warning.id || index} warning={warning} />
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
