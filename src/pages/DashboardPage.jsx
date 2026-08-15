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

            {/* Center Grid: Analytics & Appointment */}
            <div className="dash-grid-2col">
              {/* Health Analytics Chart */}
              <section className="dash-card dash-chart-card">
                <div className="dash-card-header">
                  <div>
                    <h3 className="dash-card-title">Health Analytics & Activity</h3>
                    <p className="dash-card-desc">7-day continuous bio-rhythm tracking</p>
                  </div>
                  <div className="dash-chart-pills">
                    <span className="dash-pill active">Weekly</span>
                    <span className="dash-pill">Monthly</span>
                  </div>
                </div>

                <div className="dash-chart-container">
                  {/* Premium custom SVG Chart */}
                  <svg viewBox="0 0 600 180" className="dash-svg-chart">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                    </defs>
                    
                    {/* Horizontal Grid lines */}
                    <line x1="40" y1="30" x2="570" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="40" y1="80" x2="570" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="40" y1="130" x2="570" y2="130" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

                    {/* Area Fill */}
                    <path
                      d="M 50,130 C 120,110 170,40 240,65 C 310,90 360,35 430,50 C 500,65 530,25 570,30 L 570,160 L 50,160 Z"
                      fill="url(#chartGrad)"
                    />

                    {/* Smooth Curve */}
                    <path
                      d="M 50,130 C 120,110 170,40 240,65 C 310,90 360,35 430,50 C 500,65 530,25 570,30"
                      fill="none"
                      stroke="url(#lineGrad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Interactive Points */}
                    <circle cx="50" cy="130" r="5" fill="#6366f1" stroke="#fff" strokeWidth="2.5" />
                    <circle cx="240" cy="65" r="5" fill="#818cf8" stroke="#fff" strokeWidth="2.5" />
                    <circle cx="430" cy="50" r="5" fill="#a855f7" stroke="#fff" strokeWidth="2.5" />
                    <circle cx="570" cy="30" r="6" fill="#22d3ee" stroke="#fff" strokeWidth="2.5" />
                  </svg>

                  <div className="dash-chart-labels">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </section>

              {/* Real Drug Interactions & Safety Hub */}
              <section className="dash-card dash-appointment-card">
                <div className="dash-card-header">
                  <h3 className="dash-card-title">⚡ Real Drug Interactions</h3>
                  <span className="dash-badge-pulse" style={{ background: '#d1fae5', color: '#059669' }}>FDA Live Engine</span>
                </div>

                <div className="dash-appointment-body">
                  <div className="dash-doc-avatar-large" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', fontSize: '1.5rem' }}>
                    ⚡
                  </div>
                  <div className="dash-appointment-details">
                    <h4 style={{ fontWeight: 800 }}>FDA & Gemini Clinical Safety Engine</h4>
                    <p className="dash-doc-spec">Instant Active Compound & Overdose Risk Scanner</p>

                    <div className="dash-appt-meta-grid" style={{ marginTop: '0.6rem' }}>
                      <div className="dash-appt-meta-item">
                        <span>🛡️ Overdose Risk Prevention</span>
                      </div>
                      <div className="dash-appt-meta-item">
                        <span>🔬 Active Compound Overlap</span>
                      </div>
                    </div>

                    <p className="dash-appt-loc" style={{ marginTop: '0.5rem' }}>
                      Check if Paracetamol, Ibuprofen, or prescription medicines are safe to take together.
                    </p>
                  </div>
                </div>

                <div className="dash-appointment-actions">
                  <button className="dash-btn-primary" onClick={() => setActiveTab('drug-interactions')} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: '#10b981' }}>
                    Run Interaction Check ⚡
                  </button>
                  <button className="dash-btn-secondary" onClick={() => setActiveTab('symptom-checker')}>
                    Body Symptom Checker 🩺
                  </button>
                </div>
              </section>
            </div>

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
