import React from 'react'

export default function OverviewCards() {
  const cardsData = [
    {
      id: 'current-medicines',
      title: 'Current Medicines',
      value: '0',
      type: 'primary', // Indigo theme
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.5 3a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 0 0-5h-3z" />
          <path d="M13.5 8H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h5.5" />
          <path d="M12 14v4" />
          <path d="M10 16h4" />
        </svg>
      )
    },
    {
      id: 'active-warnings',
      title: 'Active Warnings',
      value: '0',
      type: 'warning', // Amber/Yellow theme
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    },
    {
      id: 'safety-checks',
      title: 'Safety Checks',
      value: '0',
      type: 'info', // Cyan/Blue theme
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    },
    {
      id: 'safety-status',
      title: 'Safety Status',
      value: 'No Critical Risks',
      type: 'success', // Emerald/Green theme
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 11 11 13 15 9" />
        </svg>
      )
    }
  ]

  return (
    <div className="overview-cards-grid">
      {cardsData.map((card) => (
        <div key={card.id} className={`overview-card ${card.type}`}>
          <div className="card-header-icon">
            <div className="icon-badge" aria-hidden="true">
              {card.icon}
            </div>
          </div>
          <div className="card-details">
            <h3 className="card-title">{card.title}</h3>
            <span className="card-value">{card.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
