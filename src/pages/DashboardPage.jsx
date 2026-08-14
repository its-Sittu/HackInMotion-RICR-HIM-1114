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

  // Mock vital statistics
  const vitals = [
    {
      id: 'heart-rate',
      title: 'Heart Rate',
      value: '74',
      unit: 'bpm',
      status: 'Normal',
      trend: '+2% from yesterday',
      color: '#ef4444',
      bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.02) 100%)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    },
    {
      id: 'blood-pressure',
      title: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg',
      status: 'Optimal',
      trend: 'Stable',
      color: '#6366f1',
      bgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.02) 100%)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    },
    {
      id: 'blood-oxygen',
      title: 'Blood Oxygen',
      value: '98.5',
      unit: '%',
      status: 'Healthy',
      trend: 'Normal range (95-100%)',
      color: '#06b6d4',
      bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.02) 100%)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      )
    },
    {
      id: 'steps-card',
      title: 'Daily Steps',
      value: '8,420',
      unit: '/ 10,000',
      status: '84% Goal',
      trend: '+1,240 vs last week',
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      )
    }
  ]

  // Mock medical records
  const recentRecords = [
    { id: 1, title: 'Blood Pressure & ECG Scan', date: 'Yesterday, 4:30 PM', doctor: 'Dr. Sarah Jenkins', status: 'Completed', tag: 'Cardiology' },
    { id: 2, title: 'Complete Blood Count (CBC)', date: 'Aug 10, 2026', doctor: 'Dr. Robert Chen', status: 'Normal', tag: 'Hematology' },
    { id: 3, title: 'Lipid Profile Report', date: 'Jul 28, 2026', doctor: 'Dr. Sarah Jenkins', status: 'Normal', tag: 'Lab Test' }
  ]

  // Mock doctors
  const doctors = [
    { id: 1, name: 'Dr. Sarah Jenkins', spec: 'Cardiologist', rating: '4.9', reviews: 128, avatar: '👩‍⚕️' },
    { id: 2, name: 'Dr. Robert Chen', spec: 'Neurologist', rating: '4.8', reviews: 94, avatar: '👨‍⚕️' }
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
                    <h4 style={{ color: '#0f172a', fontWeight: 800 }}>FDA & Gemini Clinical Safety Engine</h4>
                    <p className="dash-doc-spec" style={{ color: '#64748b' }}>Instant Active Compound & Overdose Risk Scanner</p>

                    <div className="dash-appt-meta-grid" style={{ marginTop: '0.6rem' }}>
                      <div className="dash-appt-meta-item">
                        <span>🛡️ Overdose Risk Prevention</span>
                      </div>
                      <div className="dash-appt-meta-item">
                        <span>🔬 Active Compound Overlap</span>
                      </div>
                    </div>

                    <p className="dash-appt-loc" style={{ marginTop: '0.5rem', color: '#475569' }}>
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

            {/* Bottom Grid: Medical Records & Recommended Doctors */}
            <div className="dash-grid-2col">
              {/* Recent Medical Records */}
              <section className="dash-card">
                <div className="dash-card-header">
                  <h3 className="dash-card-title">Recent Medical Records</h3>
                  <button className="dash-link-btn">View All</button>
                </div>

                <div className="dash-records-list">
                  {recentRecords.map((rec) => (
                    <div key={rec.id} className="dash-record-item">
                      <div className="dash-record-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div className="dash-record-info">
                        <h4>{rec.title}</h4>
                        <p>{rec.doctor} • {rec.date}</p>
                      </div>
                      <span className="dash-tag">{rec.tag}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recommended Doctors */}
              <section className="dash-card">
                <div className="dash-card-header">
                  <h3 className="dash-card-title">Recommended Specialists</h3>
                  <button className="dash-link-btn">Browse All</button>
                </div>

                <div className="dash-doctors-list">
                  {doctors.map((doc) => (
                    <div key={doc.id} className="dash-doc-item">
                      <div className="dash-doc-avatar">{doc.avatar}</div>
                      <div className="dash-doc-info">
                        <h4>{doc.name}</h4>
                        <p>{doc.spec} • ⭐ {doc.rating} ({doc.reviews})</p>
                      </div>
                      <button className="dash-btn-book">Book</button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

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
