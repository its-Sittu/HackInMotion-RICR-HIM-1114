import React from 'react'
import { useAuth } from '../../context/AuthContext'

const getUserDisplayName = (user) => {
  if (!user) return 'Patient Session'
  if (user.name) return user.name
  if (user.phone) {
    if (user.phone.includes('@')) {
      const emailPart = user.phone.split('@')[0]
      return emailPart.charAt(0).toUpperCase() + emailPart.slice(1)
    }
    return user.phone
  }
  return 'Patient Session'
}

const getInitials = (name) => {
  if (!name || name === 'Patient Session' || name === 'Guest User') return 'PX'
  const parts = name.trim().split(/[\s._@]+/)
  if (parts.length >= 2 && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const getFormattedDate = () => {
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
  return new Date().toLocaleDateString('en-US', options)
}

export default function Header() {
  const { user } = useAuth()
  const displayName = getUserDisplayName(user)
  const initials = getInitials(displayName)
  const isGuest = !user || user.phone === 'guest@medisafe.com' || user.phone === 'guest@pharmx.ai' || user.phone === 'guest@pulsemed.com'
  const currentDate = getFormattedDate()

  return (
    <header className="dash-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1.5rem',
      paddingBottom: '1.2rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      marginBottom: '1.4rem',
      flexWrap: 'wrap'
    }}>
      <div className="dash-greeting">
        {/* Real-Time Clinical Surveillance Status Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.22rem 0.75rem',
          borderRadius: '9999px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          marginBottom: '0.45rem'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#34d399',
            letterSpacing: '0.6px',
            textTransform: 'uppercase'
          }}>
            Clinical Safety Surveillance • Active
          </span>
        </div>

        <h1 className="dash-title" style={{
          fontSize: '1.85rem',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          color: '#ffffff',
          margin: '0 0 0.3rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <span className="dash-greeting-text" style={{ color: '#ffffff' }}>
            {isGuest ? 'Patient Safety & Clinical Command Center' : `Welcome, ${displayName}`}
          </span>
        </h1>
        <p className="dash-subtitle" style={{
          fontSize: '0.92rem',
          color: '#94a3b8',
          margin: 0,
          fontWeight: 500,
          maxWidth: '720px',
          lineHeight: 1.5
        }}>
          Real-time pharmacological surveillance, drug-drug interaction detection, and emergency trauma radar.
        </p>
      </div>

      <div className="dash-header-actions" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        flexWrap: 'wrap'
      }}>
        {/* Live Date / Engine Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.55rem 0.95rem',
          borderRadius: '14px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          backdropFilter: 'blur(12px)'
        }}>
          <span style={{ fontSize: '0.95rem' }}>🗓️</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 700, lineHeight: 1.2 }}>
              {currentDate}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, letterSpacing: '0.3px' }}>
              FDA &amp; Gemini Live Radar
            </span>
          </div>
        </div>

        {/* Notification Icon Button */}
        <button
          type="button"
          aria-label="Notifications"
          className="dash-header-notif-btn"
          style={{
            position: 'relative',
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: '#f8fafc'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            border: '2px solid #0f172a'
          }} />
        </button>

        {/* User Profile Badge Display */}
        <div className="dash-header-badge" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.45rem 0.95rem 0.45rem 0.6rem',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
            color: '#ffffff',
            fontSize: '0.85rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(14, 165, 233, 0.35)'
          }}>
            {initials}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="dash-profile-name" style={{ fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.25, color: '#f8fafc' }}>
              {isGuest ? 'Patient Session' : displayName}
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', lineHeight: 1.25, letterSpacing: '0.2px' }}>
              {isGuest ? 'Verified Access' : 'Pharmx AI Member'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
