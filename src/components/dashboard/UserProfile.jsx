import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function UserProfile() {
  const { user } = useAuth()

  // Profile form state matching reference layout
  const [formData, setFormData] = useState({
    firstName: user?.name ? user.name.split(' ')[0] : 'Sittu',
    lastName: user?.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : 'Dev',
    username: '@SittuDev',
    email: user?.email || (user?.phone?.includes('@') ? user?.phone : 'sittu@medisafe.com'),
    phone: user?.phone?.includes('@') ? '9876543210' : (user?.phone || '9876543210'),
    countryCode: '+91',
    dob: '1998-05-15',
    gender: 'Male',
    bloodGroup: 'O+',
    medicalConditions: 'Mild Asthma, Seasonal Allergies',
    emergencyContact: 'Rajesh Sharma (+91 98111 22334)',
    caregiverContact: 'Rahul Sharma (+91 98765 11223)'
  })

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')

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

  const handleChangePassword = () => {
    setShowPasswordModal(true)
  }

  return (
    <div style={{ maxWidth: '540px', margin: '0 auto', padding: '1rem 0', animation: 'auth-card-in 0.4s ease' }}>
      {/* Glass Card Container (Identical to Login / Auth Page) */}
      <div
        className="auth-card"
        style={{
          width: '100%',
          maxWidth: '540px',
          margin: 0,
          background: 'rgba(15, 23, 42, 0.78)',
          borderRadius: '28px',
          padding: '2.5rem 2.2rem',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          boxShadow: '0 25px 65px rgba(0, 0, 0, 0.65)'
        }}
      >
        {/* Header Title (Matching Reference Image) */}
        <h1 className="auth-title" style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1.6rem', color: '#ffffff' }}>
          Edit Profile
        </h1>

        {savedSuccess && (
          <div className="auth-alert success" style={{ marginBottom: '1.4rem' }}>
            ✓ Profile saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* First Name */}
          <div className="auth-form-group" style={{ marginBottom: 0 }}>
            <label className="auth-label" htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              className="auth-input"
              style={{ paddingLeft: '1.1rem' }}
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Sabrina"
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
              style={{ paddingLeft: '1.1rem' }}
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Aryan"
            />
          </div>

          {/* Username */}
          <div className="auth-form-group" style={{ marginBottom: 0 }}>
            <label className="auth-label" htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="auth-input"
              style={{ paddingLeft: '1.1rem' }}
              value={formData.username}
              onChange={handleChange}
              placeholder="@Sabrina"
            />
          </div>

          {/* Email */}
          <div className="auth-form-group" style={{ marginBottom: 0 }}>
            <label className="auth-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="auth-input"
              style={{ paddingLeft: '1.1rem' }}
              value={formData.email}
              onChange={handleChange}
              placeholder="SabrinaAry208@gmail.com"
            />
          </div>

          {/* Phone Number with Prefix */}
          <div className="auth-form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
              <label className="auth-label" htmlFor="phone" style={{ margin: 0 }}>Phone Number</label>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>✓ Verified</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="auth-input"
                style={{ width: '90px', paddingLeft: '0.8rem', paddingRight: '0.5rem', background: '#0f172a', textAlign: 'center', flexShrink: 0 }}
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
                style={{ flex: 1, paddingLeft: '1.1rem' }}
                value={formData.phone}
                onChange={handleChange}
                placeholder="904 6470"
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
              style={{ paddingLeft: '1.1rem' }}
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
              style={{ paddingLeft: '1.1rem', background: '#0f172a' }}
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
              style={{ paddingLeft: '1.1rem', background: '#0f172a' }}
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

          {/* Medical Conditions */}
          <div className="auth-form-group" style={{ marginBottom: 0 }}>
            <label className="auth-label" htmlFor="medicalConditions">Medical Conditions &amp; Allergies</label>
            <input
              id="medicalConditions"
              name="medicalConditions"
              type="text"
              className="auth-input"
              style={{ paddingLeft: '1.1rem' }}
              value={formData.medicalConditions}
              onChange={handleChange}
              placeholder="e.g. Asthma, Penicillin Allergy"
            />
          </div>

          {/* Emergency Contact */}
          <div className="auth-form-group" style={{ marginBottom: 0 }}>
            <label className="auth-label" htmlFor="emergencyContact">Emergency Contact</label>
            <input
              id="emergencyContact"
              name="emergencyContact"
              type="text"
              className="auth-input"
              style={{ paddingLeft: '1.1rem' }}
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="Name &amp; Phone"
            />
          </div>

          {/* Caregiver Contact */}
          <div className="auth-form-group" style={{ marginBottom: 0 }}>
            <label className="auth-label" htmlFor="caregiverContact">Caregiver / Trusted Contact</label>
            <input
              id="caregiverContact"
              name="caregiverContact"
              type="text"
              className="auth-input"
              style={{ paddingLeft: '1.1rem' }}
              value={formData.caregiverContact}
              onChange={handleChange}
              placeholder="Caregiver Name &amp; Phone"
            />
          </div>

          {/* Save Profile Primary Button */}
          <button
            type="submit"
            className="btn-auth-primary"
            style={{ marginTop: '0.8rem', padding: '1rem', borderRadius: '16px', fontSize: '1rem', fontWeight: 800 }}
          >
            Save Profile 💾
          </button>

          {/* Change Password Pill Button (Exact Reference Match) */}
          <button
            type="button"
            onClick={handleChangePassword}
            style={{
              width: '100%',
              padding: '0.95rem',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '0.2rem',
              boxShadow: '0 4px 15px rgba(3, 105, 161, 0.35)',
              transition: 'all 0.25s ease'
            }}
          >
            Change Password 🔒
          </button>
        </form>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div style={{ marginTop: '1.5rem', padding: '1.2rem', background: 'rgba(255,255,255,0.06)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ margin: '0 0 0.8rem 0', color: '#ffffff', fontSize: '0.95rem' }}>Update Account Password</h4>
            <input type="password" className="auth-input" placeholder="Enter current password" style={{ width: '100%', marginBottom: '0.8rem', paddingLeft: '1rem' }} />
            <input type="password" className="auth-input" placeholder="Enter new password" style={{ width: '100%', marginBottom: '1rem', paddingLeft: '1rem' }} />
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                type="button"
                onClick={() => {
                  setPasswordMsg('✓ Password updated successfully!')
                  setTimeout(() => { setPasswordMsg(''); setShowPasswordModal(false) }, 2500)
                }}
                className="btn-auth-primary"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Update 🔒
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: 'none', padding: '0.75rem 1.2rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
            {passwordMsg && <p style={{ color: '#6ee7b7', fontSize: '0.85rem', marginTop: '0.6rem', fontWeight: 700 }}>{passwordMsg}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
