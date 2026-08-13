import React, { useState } from 'react'
import ActiveWarnings from '../components/dashboard/ActiveWarnings'
import MedicationDashboard from '../components/medication/MedicationDashboard'
import '../styles/dashboard.css'

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState('medication') // 'medication' | 'warnings'

  return (
    <div className="dashboard-container">
      <main className="dashboard-main" style={{ maxWidth: '960px' }}>
        <h1 className="dashboard-heading">Medicine Safety Dashboard</h1>
        
        <p className="dashboard-subheading">
          Smart Medicine Safety & Drug Interaction Assistant
        </p>
        
        <div className="divider-line"></div>

        {/* Master Section Toggle */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '2rem',
            width: '100%',
            maxWidth: '560px'
          }}
        >
          <button
            type="button"
            className={`med-btn ${activeSection === 'medication' ? 'med-btn-primary' : 'med-btn-secondary'}`}
            style={{ flex: 1, padding: '0.75rem 1.25rem', fontSize: '0.95rem' }}
            onClick={() => setActiveSection('medication')}
          >
            💊 Medication Schedule & Adherence
          </button>
          <button
            type="button"
            className={`med-btn ${activeSection === 'warnings' ? 'med-btn-primary' : 'med-btn-secondary'}`}
            style={{ flex: 1, padding: '0.75rem 1.25rem', fontSize: '0.95rem' }}
            onClick={() => setActiveSection('warnings')}
          >
            ⚠️ Drug Interaction Warnings
          </button>
        </div>
        
        {/* Render Selected View */}
        {activeSection === 'medication' ? (
          <MedicationDashboard />
        ) : (
          <ActiveWarnings />
        )}
      </main>
    </div>
  )
}
