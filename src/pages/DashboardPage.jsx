import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import Header from '../components/dashboard/Header'
import MedicineSearch from '../components/dashboard/MedicineSearch'
import DrugInteractionChecker from '../components/dashboard/DrugInteractionChecker'
import SymptomChecker from '../components/dashboard/SymptomChecker'
import MedicalRecords from '../components/dashboard/MedicalRecords'
import MyHealth from '../components/dashboard/MyHealth'
import HealthAnalytics from '../components/dashboard/HealthAnalytics'
import UserProfile from '../components/dashboard/UserProfile'
import AppSettings from '../components/dashboard/AppSettings'
import NearbyHospitalsMap from '../components/dashboard/NearbyHospitalsMap'
import '../styles/dashboard.css'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('pulsemed_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem('pulsemed_sidebar_collapsed', String(next))
      } catch {
        // localStorage optional
      }
      return next
    })
  }

  // MediSafe Live Medicine Safety Statistics
  const vitals = [
    {
      id: 'active-meds',
      title: 'Active Medicines Today',
      value: '4',
      unit: 'scheduled',
      status: 'Active Plan',
      trend: 'Subah, Dopahar & Shaam doses',
      color: '#38bdf8',
      bgGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0.03) 100%)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.5 3a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 0 0-5h-3z" />
          <path d="M13.5 8H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h5.5" />
        </svg>
      )
    },
    {
      id: 'interaction-risk',
      title: 'Drug Interaction Risk',
      value: '0',
      unit: 'warnings',
      status: 'FDA Safe ✓',
      trend: 'All 4 active compounds safe',
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.03) 100%)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      )
    },
    {
      id: 'adherence-rate',
      title: 'Dosage Adherence',
      value: '96.5',
      unit: '%',
      status: 'High Score',
      trend: 'On track with reminders',
      color: '#6366f1',
      bgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.03) 100%)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      )
    },
    {
      id: 'safety-scans',
      title: 'Safety Scans Done',
      value: '18',
      unit: 'searches',
      status: 'Verified',
      trend: '+4 searches this week',
      color: '#f43f5e',
      bgGradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(244, 63, 94, 0.03) 100%)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )
    }
  ]

  return (
    <div className="dash-layout">
      {/* Dynamic Responsive Fixed Sidebar */}
      <Sidebar
        activeId={activeTab}
        onNav={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Main Content Area */}
      <main className={`dash-main ${isSidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
        {/* Conditional Tab Views */}
        {activeTab === 'medicines' ? (
          <MedicineSearch />
        ) : activeTab === 'drug-interactions' ? (
          <DrugInteractionChecker />
        ) : activeTab === 'symptom-checker' ? (
          <SymptomChecker />
        ) : activeTab === 'records' ? (
          <MedicalRecords />
        ) : activeTab === 'myhealth' ? (
          <MyHealth />
        ) : activeTab === 'analytics' ? (
          <HealthAnalytics />
        ) : activeTab === 'profile' ? (
          <UserProfile />
        ) : activeTab === 'settings' ? (
          <AppSettings />
        ) : (
          <>
            {/* Top Header Bar (Dashboard Tab Only) */}
            <Header />

            {/* Health Overview / Vitals Grid */}
            <section className="dash-vitals-grid">
              {vitals.map((item) => (
                <div key={item.id} className="dash-vital-card" style={{ background: item.bgGradient }}>
                  <div className="dash-vital-top">
                    <div className="dash-vital-icon" style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}30` }}>
                      {item.icon}
                    </div>
                    <span className="dash-vital-badge" style={{ color: item.color, backgroundColor: `${item.color}15` }}>
                      {item.status}
                    </span>
                  </div>
                  <div className="dash-vital-info">
                    <span className="dash-vital-label">{item.title}</span>
                    <div className="dash-vital-val-row">
                      <span className="dash-vital-value">{item.value}</span>
                      <span className="dash-vital-unit">{item.unit}</span>
                    </div>
                    <span className="dash-vital-trend">{item.trend}</span>
                  </div>
                </div>
              ))}
            </section>

            {/* Nearby Emergency Hospitals & Trauma Map Radar Section */}
            <NearbyHospitalsMap />

            {/* Quick Actions Bar */}
            <section className="dash-quick-actions">
              <span className="dash-quick-title">Quick Actions:</span>
              <button className="dash-quick-btn" onClick={() => setActiveTab('medicines')}>💊 Search Medicine</button>
              <button className="dash-quick-btn" onClick={() => setActiveTab('drug-interactions')}>⚡ Drug Interactions</button>
              <button className="dash-quick-btn">🩺 Log Vital Measurement</button>
              <button className="dash-quick-btn">📄 Upload Lab Report</button>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
