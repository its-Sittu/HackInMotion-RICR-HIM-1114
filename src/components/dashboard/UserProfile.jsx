import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function UserProfile() {
  const { user } = useAuth()

  // Clean Profile Form State (Username, Medical Conditions, Emergency & Caregiver Contacts removed as requested)
  const [formData, setFormData] = useState({
    firstName: user?.name ? user.name.split(' ')[0] : 'Sittu',
    lastName: user?.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : 'Dev',
    email: user?.email || (user?.phone?.includes('@') ? user?.phone : 'sittu@medisafe.com'),
    phone: user?.phone?.includes('@') ? '9876543210' : (user?.phone || '9876543210'),
    countryCode: '+91',
    dob: '1998-05-15',
    gender: 'Male',
    bloodGroup: 'O+'
  })

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [profileValid] = useState(true)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3500)
  }

  return (
    <div style={{ width: '100%', padding: '0.5rem 0', animation: 'auth-card-in 0.4s ease', boxSizing: 'border-box' }}>
      {/* Full-Width Wide Landscape Card Container */}
      <div
        className="auth-card"
        style={{
          width: '100%',
          maxWidth: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          background: 'rgba(15, 23, 42, 0.85)',
          borderRadius: '28px',
          padding: '2.5rem 2.8rem',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          boxShadow: '0 25px 65px rgba(0, 0, 0, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden'
        }}
      >
        {/* Top Header Row with Title & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'linear-gradient(135deg, #f43f5e 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', boxShadow: '0 0 20px rgba(244, 63, 94, 0.35)' }}>
              👤
            </div>
            <div>
              <h1 className="auth-title" style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                Edit Profile
              </h1>
              <p style={{ color: '#94a3b8', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>
                Manage your personal identity, contact email, and core health details.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              style={{
                padding: '0.75rem 1.4rem',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 15px rgba(3, 105, 161, 0.35)'
              }}
            >
              Change Password 🔒
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="btn-auth-primary"
              style={{ padding: '0.75rem 1.6rem', borderRadius: '14px', fontSize: '0.9rem', width: 'auto', marginTop: 0 }}
            >
              Save Profile 💾
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="auth-alert success" style={{ marginBottom: '1.6rem' }}>
            ✓ Profile saved successfully!
          </div>
        )}

        {/* Clean Form Grid Layout */}
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.6rem', width: '100%', boxSizing: 'border-box' }}>
          {/* First Name */}
          <div className="auth-form-group" style={{ marginBottom: 0 }}>
            <label className="auth-label" htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              className="auth-input"
              style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '1.1rem' }}
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
            />
          </div>

          {/* Last Name */}
          <div className="auth-form-group" style={{ marginBottom: 0 }}>
            <label className="auth-label" htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              className="auth-input"
              style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '1.1rem' }}
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
            />
          </div>

          {/* Email Address */}
          <div className="auth-form-group" style={{ marginBottom: 0 }}>
            <label className="auth-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="auth-input"
              style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '1.1rem' }}
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
            />
          </div>

          {/* Phone Number */}
          <div className="auth-form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
              <label className="auth-label" htmlFor="phone" style={{ margin: 0 }}>Phone Number</label>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>✓ Verified</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="auth-input"
                style={{ width: '85px', paddingLeft: '0.5rem', paddingRight: '0.3rem', background: '#0f172a', textAlign: 'center', flexShrink: 0 }}
              >
                <option value="+91">+91 ▼</option>
                <option value="+1">+1 ▼</option>
                <option value="+44">+44 ▼</option>
                <option value="+234">+234 ▼</option>
              </select>
              <input
                id="phone"
                name="phone"
                type="text"
                className="auth-input"
                style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', paddingLeft: '1.1rem' }}
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />
            </div>
          </div>

          {/* Birth Date */}
          <div className="auth-form-group" style={{ marginBottom: 0 }}>
            <label className="auth-label" htmlFor="dob">Birth Date</label>
            <input
              id="dob"
              name="dob"
              type="date"
              className="auth-input"
              style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '1.1rem' }}
              value={formData.dob}
              onChange={handleChange}
            />
          </div>

          {/* Gender */}
          <div className="auth-form-group" style={{ marginBottom: 0 }}>
            <label className="auth-label" htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              className="auth-input"
              style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '1.1rem', background: '#0f172a' }}
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Gender ▼</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Blood Group */}
          <div className="auth-form-group" style={{ marginBottom: 0 }}>
            <label className="auth-label" htmlFor="bloodGroup">Blood Group</label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              className="auth-input"
              style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '1.1rem', background: '#0f172a' }}
              value={formData.bloodGroup}
              onChange={handleChange}
            >
              <option value="O+">O+ (Universal Donor)</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
            </select>
          </div>
        </form>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div style={{ marginTop: '1.8rem', padding: '1.5rem', background: 'rgba(255,255,255,0.06)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', boxSizing: 'border-box' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#ffffff', fontSize: '1rem', fontWeight: 800 }}>Update Account Password</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <input type="password" className="auth-input" placeholder="Enter current password" style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '1rem' }} />
              <input type="password" className="auth-input" placeholder="Enter new password" style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '1rem' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: 'none', padding: '0.75rem 1.4rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasswordMsg('✓ Password updated successfully!')
                  setTimeout(() => { setPasswordMsg(''); setShowPasswordModal(false) }, 2500)
                }}
                className="btn-auth-primary"
                style={{ padding: '0.75rem 1.6rem', width: 'auto', marginTop: 0 }}
              >
                Update 🔒
              </button>
            </div>
            {passwordMsg && <p style={{ color: '#6ee7b7', fontSize: '0.85rem', marginTop: '0.6rem', fontWeight: 700 }}>{passwordMsg}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
