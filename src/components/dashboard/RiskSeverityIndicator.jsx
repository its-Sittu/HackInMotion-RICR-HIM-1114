import React from 'react'
import '../../styles/activeWarnings.css'

export default function RiskSeverityIndicator({ severity = 'Moderate', showDescription = true }) {
  const norm = (severity || 'moderate').toLowerCase()

  let config = {
    level: 2,
    label: 'Moderate',
    subtext: 'Needs Attention',
    ariaLabel: 'Moderate severity level - needs attention',
    typeClass: 'severity-moderate',
    icon: (
      <svg className="severity-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
  }

  if (norm === 'severe' || norm === 'high') {
    config = {
      level: 3,
      label: 'Severe',
      subtext: 'Urgent Professional Advice',
      ariaLabel: 'Severe severity level - urgent professional advice',
      typeClass: 'severity-severe',
      icon: (
        <svg className="severity-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )
    }
  } else if (norm === 'mild' || norm === 'low') {
    config = {
      level: 1,
      label: 'Mild',
      subtext: 'Low Concern',
      ariaLabel: 'Mild severity level - low concern',
      typeClass: 'severity-mild',
      icon: (
        <svg className="severity-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      )
    }
  }

  return (
    <div className={`risk-severity-indicator ${config.typeClass}`} role="status" aria-label={config.ariaLabel}>
      <div className="severity-header-group">
        <span className="severity-icon-wrapper">
          {config.icon}
        </span>
        <div className="severity-text-container">
          <span className="severity-main-label">{config.label}</span>
          {showDescription && (
            <span className="severity-subtext-label"> — {config.subtext}</span>
          )}
        </div>
      </div>

      <div className="severity-meter" title={`Severity level ${config.level} of 3`}>
        <span className={`meter-bar bar-1 ${config.level >= 1 ? 'active' : ''}`} />
        <span className={`meter-bar bar-2 ${config.level >= 2 ? 'active' : ''}`} />
        <span className={`meter-bar bar-3 ${config.level >= 3 ? 'active' : ''}`} />
      </div>
    </div>
  )
}
