import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import Header from '../components/dashboard/Header'
import MedicineSearch from '../components/dashboard/MedicineSearch'
import DrugInteractionChecker from '../components/dashboard/DrugInteractionChecker'
import SymptomChecker from '../components/dashboard/SymptomChecker'
import '../styles/dashboard.css'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

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

  // Mock upcoming appointments
  const upcomingAppointment = {
    doctor: 'Dr. Sarah Jenkins, MD',
    specialty: 'Cardiologist & Heart Specialist',
    date: 'Tomorrow, Aug 14',
    time: '10:30 AM',
    location: 'Metropolitan Medical Center, Room 402',
    avatar: 'SJ'
  }

  // Mock medical records
  const recentRecords = [
    { id: 1, title: 'Comprehensive Blood Panel', date: 'Aug 10, 2026', doctor: 'Dr. Sarah Jenkins', status: 'Completed', tag: 'Lab Results' },
    { id: 2, title: 'Chest X-Ray & Pulmonology Scan', date: 'Jul 28, 2026', doctor: 'Dr. Robert Chen', status: 'Normal', tag: 'Radiology' },
    { id: 3, title: 'Annual ECG & Cardiac Wellness', date: 'Jul 15, 2026', doctor: 'Dr. Sarah Jenkins', status: 'Normal', tag: 'Cardiology' }
  ]

  // Mock doctors
  const doctors = [
    { id: 1, name: 'Dr. Sarah Jenkins', spec: 'Cardiologist', rating: '4.9', reviews: 124, avail: 'Available Today', avatar: 'SJ' },
    { id: 2, name: 'Dr. Marcus Vance', spec: 'Neurologist', rating: '4.8', reviews: 98, avail: 'Available Aug 15', avatar: 'MV' },
    { id: 3, name: 'Dr. Elena Rostova', spec: 'Endocrinologist', rating: '5.0', reviews: 156, avail: 'Available Aug 16', avatar: 'ER' }
  ]

  return (
    <div className="dash-layout">
      {/* Dynamic Responsive Sidebar */}
      <Sidebar activeId={activeTab} onNav={setActiveTab} />

      {/* Main Content Area */}
      <main className="dash-main">
        {/* Top Header Bar */}
        <Header />

        {/* Conditional Tab Views */}
        {activeTab === 'medicines' ? (
          <MedicineSearch />
        ) : activeTab === 'drug-interactions' ? (
          <DrugInteractionChecker />
        ) : activeTab === 'symptom-checker' ? (
          <SymptomChecker />
        ) : (
          <>
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

              {/* Upcoming Appointment */}
              <section className="dash-card dash-appointment-card">
                <div className="dash-card-header">
                  <h3 className="dash-card-title">Next Appointment</h3>
                  <span className="dash-badge-pulse">Confirmed</span>
                </div>

                <div className="dash-appointment-body">
                  <div className="dash-doc-avatar-large">
                    {upcomingAppointment.avatar}
                  </div>
                  <div className="dash-appointment-details">
                    <h4>{upcomingAppointment.doctor}</h4>
                    <p className="dash-doc-spec">{upcomingAppointment.specialty}</p>

                    <div className="dash-appt-meta-grid">
                      <div className="dash-appt-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{upcomingAppointment.date}</span>
                      </div>
                      <div className="dash-appt-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{upcomingAppointment.time}</span>
                      </div>
                    </div>

                    <p className="dash-appt-loc">📍 {upcomingAppointment.location}</p>
                  </div>
                </div>

                <div className="dash-appointment-actions">
                  <button className="dash-btn-primary">Join Telehealth Room</button>
                  <button className="dash-btn-secondary">Reschedule</button>
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
