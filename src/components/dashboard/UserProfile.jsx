import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function UserProfile() {
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    name: user?.name || 'Sittu Dev',
    email: user?.email || (user?.phone?.includes('@') ? user?.phone : 'sittu@medisafe.com'),
    phone: user?.phone?.includes('@') ? '+91 98765 43210' : (user?.phone || '+91 98765 43210'),
    dob: '1998-05-15',
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: 'Penicillin, Sulfa Drugs',
    conditions: 'Mild Asthma',
    physicianName: 'Dr. Sharma (Cardiologist)',
    physicianPhone: '+91 98111 22334',
    caregiverName: 'Rahul Sharma',
    caregiverRelation: 'Brother',
    caregiverPhone: '+91 98765 11223',
    caregiverEmail: 'rahul@example.com',
    twoFactorEnabled: true,
    smsAlerts: true,
    emailAlerts: true
  })

  const [activeSubTab, setActiveSubTab] = useState('personal')
  const [isSaved, setIsSaved] = useState(false)
  const [testAlertSent, setTestAlertSent] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleSendTestAlert = () => {
    setTestAlertSent(true)
    setTimeout(() => setTestAlertSent(false), 4000)
  }

  return (
    <div className="dash-profile-container" style={{ animation: 'dash-fade-in 0.3s ease' }}>
      {/* Profile Header Banner */}
      <div className="dash-card" style={{ padding: '2rem', marginBottom: '1.8rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.7) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.8rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #f43f5e 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', boxShadow: '0 0 25px rgba(244, 63, 94, 0.45)' }}>
              {formData.name.slice(0, 2).toUpperCase()}
            </div>
            <button style={{ position: 'absolute', bottom: '0', right: '0', background: '#38bdf8', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }} title="Change Avatar">
              ✏️
            </button>
          </div>

          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>{formData.name}</h2>
              <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.78rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                ✓ Verified Account
              </span>
            </div>

            <p style={{ color: '#94a3b8', margin: '0 0 0.8rem 0', fontSize: '0.92rem' }}>
              {formData.email} • {formData.phone}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}><strong>Blood Group:</strong> {formData.bloodGroup}</span>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}><strong>Member Since:</strong> Aug 2025</span>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}><strong>Caregiver:</strong> {formData.caregiverName}</span>
            </div>
          </div>

          <button onClick={handleSave} className="dash-btn-primary" style={{ padding: '0.8rem 1.6rem', borderRadius: '14px' }}>
            Save Changes 💾
          </button>
        </div>

        {isSaved && (
          <div style={{ marginTop: '1.2rem', padding: '0.8rem 1.2rem', background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ✓ Profile details successfully updated!
          </div>
        )}
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.8rem' }}>
        <button
          onClick={() => setActiveSubTab('personal')}
          style={{ background: activeSubTab === 'personal' ? 'linear-gradient(135deg, #f43f5e 0%, #06b6d4 100%)' : 'rgba(255, 255, 255, 0.06)', color: '#ffffff', border: 'none', padding: '0.65rem 1.3rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
        >
          👤 Personal Details
        </button>
        <button
          onClick={() => setActiveSubTab('medical')}
          style={{ background: activeSubTab === 'medical' ? 'linear-gradient(135deg, #f43f5e 0%, #06b6d4 100%)' : 'rgba(255, 255, 255, 0.06)', color: '#ffffff', border: 'none', padding: '0.65rem 1.3rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
        >
          🩺 Medical Identity &amp; Allergies
        </button>
        <button
          onClick={() => setActiveSubTab('caregiver')}
          style={{ background: activeSubTab === 'caregiver' ? 'linear-gradient(135deg, #f43f5e 0%, #06b6d4 100%)' : 'rgba(255, 255, 255, 0.06)', color: '#ffffff', border: 'none', padding: '0.65rem 1.3rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
        >
          👨‍👩‍👧 Caregiver &amp; Family Alerts
        </button>
        <button
          onClick={() => setActiveSubTab('security')}
          style={{ background: activeSubTab === 'security' ? 'linear-gradient(135deg, #f43f5e 0%, #06b6d4 100%)' : 'rgba(255, 255, 255, 0.06)', color: '#ffffff', border: 'none', padding: '0.65rem 1.3rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
        >
          🔒 Security &amp; Sessions
        </button>
      </div>

      {/* Tab 1: Personal Details */}
      {activeSubTab === 'personal' && (
        <form onSubmit={handleSave} className="dash-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.4rem' }}>Personal Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="auth-input" style={{ width: '100%', paddingLeft: '1rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="auth-input" style={{ width: '100%', paddingLeft: '1rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="auth-input" style={{ width: '100%', paddingLeft: '1rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="auth-input" style={{ width: '100%', paddingLeft: '1rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="auth-input" style={{ width: '100%', paddingLeft: '1rem', background: '#0f172a' }}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="auth-input" style={{ width: '100%', paddingLeft: '1rem', background: '#0f172a' }}>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Medical Identity */}
      {activeSubTab === 'medical' && (
        <form onSubmit={handleSave} className="dash-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.4rem' }}>Clinical Profile &amp; Allergies</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#f43f5e', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Known Drug Allergies</label>
              <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} className="auth-input" style={{ width: '100%', paddingLeft: '1rem' }} placeholder="e.g. Penicillin, Sulfa, Aspirin" />
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.3rem', display: 'block' }}>MediSafe automatically cross-checks active drug interactions against these allergies.</span>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Chronic Health Conditions</label>
              <input type="text" name="conditions" value={formData.conditions} onChange={handleChange} className="auth-input" style={{ width: '100%', paddingLeft: '1rem' }} placeholder="e.g. Hypertension, Diabetes, Asthma" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Primary Physician Name</label>
              <input type="text" name="physicianName" value={formData.physicianName} onChange={handleChange} className="auth-input" style={{ width: '100%', paddingLeft: '1rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Physician Contact Phone</label>
              <input type="text" name="physicianPhone" value={formData.physicianPhone} onChange={handleChange} className="auth-input" style={{ width: '100%', paddingLeft: '1rem' }} />
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Caregiver Alerts */}
      {activeSubTab === 'caregiver' && (
        <form onSubmit={handleSave} className="dash-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.4rem' }}>Emergency Caregiver &amp; Alert Routing</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Caregiver Name</label>
              <input type="text" name="caregiverName" value={formData.caregiverName} onChange={handleChange} className="auth-input" style={{ width: '100%', paddingLeft: '1rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Relationship</label>
              <input type="text" name="caregiverRelation" value={formData.caregiverRelation} onChange={handleChange} className="auth-input" style={{ width: '100%', paddingLeft: '1rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Fast2SMS Alert Mobile</label>
              <input type="text" name="caregiverPhone" value={formData.caregiverPhone} onChange={handleChange} className="auth-input" style={{ width: '100%', paddingLeft: '1rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>EmailJS Alert Email</label>
              <input type="email" name="caregiverEmail" value={formData.caregiverEmail} onChange={handleChange} className="auth-input" style={{ width: '100%', paddingLeft: '1rem' }} />
            </div>
          </div>

          <div style={{ padding: '1.2rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ margin: '0 0 0.3rem 0', color: '#ffffff', fontSize: '0.95rem' }}>Send Test Emergency Notification</h4>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem' }}>Verifies Fast2SMS SMS and EmailJS dispatch to caregiver contacts.</p>
            </div>
            <button type="button" onClick={handleSendTestAlert} className="btn-medisafe-primary" style={{ padding: '0.65rem 1.3rem', fontSize: '0.88rem' }}>
              Send Test Alert 🚀
            </button>
          </div>

          {testAlertSent && (
            <div style={{ marginTop: '1rem', padding: '0.8rem 1.2rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700 }}>
              🚀 Test SMS and Email alert dispatched to {formData.caregiverName} ({formData.caregiverPhone})!
            </div>
          )}
        </form>
      )}

      {/* Tab 4: Security & Sessions */}
      {activeSubTab === 'security' && (
        <div className="dash-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.4rem' }}>Security &amp; Active Sessions</h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div>
              <h4 style={{ margin: '0 0 0.2rem 0', color: '#ffffff', fontSize: '0.95rem' }}>Two-Factor Authentication (2FA)</h4>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem' }}>Requires Fast2SMS OTP verification on logins from unrecognized devices.</p>
            </div>
            <input type="checkbox" name="twoFactorEnabled" checked={formData.twoFactorEnabled} onChange={handleChange} style={{ width: '22px', height: '22px', accentColor: '#10b981', cursor: 'pointer' }} />
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.8rem 0', color: '#ffffff', fontSize: '0.95rem' }}>Active Signed-In Devices</h4>
            <div style={{ padding: '0.9rem 1.2rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', display: 'block' }}>Windows PC • Chrome Browser</span>
                <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>Current Active Session • India</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Active Now</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
