import React from 'react'
import InteractionWarningCard from './InteractionWarningCard'
import '../../styles/activeWarnings.css'

// Re-export InteractionWarningCard for standalone use
export { InteractionWarningCard }

// Local placeholder warnings data with clear action recommendations
const DEFAULT_WARNINGS = [
  {
    id: 'warn-1',
    severity: 'Severe',
    medicines: ['Warfarin', 'Aspirin'],
    explanation: 'Combining blood thinners like Warfarin with Aspirin significantly increases the risk of severe internal bleeding.',
    symptoms: ['Unusual bleeding', 'Severe bruising', 'Dizziness', 'Blood in urine or stool'],
    recommendation: 'Avoid combining these medicines unless specifically advised by a healthcare professional.'
  },
  {
    id: 'warn-2',
    severity: 'Moderate',
    medicines: ['Medicine A', 'Medicine B'],
    explanation: 'These medicines may interact and reduce therapeutic effectiveness.',
    symptoms: ['Dizziness', 'Nausea', 'Headache'],
    recommendation: 'Consult your doctor before taking these medicines together.'
  },
  {
    id: 'warn-3',
    severity: 'Mild',
    medicines: ['Calcium Supplement', 'Levothyroxine'],
    explanation: 'Calcium can bind to thyroid medication, reducing overall gastrointestinal absorption.',
    symptoms: ['Mild fatigue', 'Stomach upset'],
    recommendation: 'Take these medications at least 4 hours apart to ensure proper absorption.'
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
