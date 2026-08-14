import React from 'react'
import { useAuth } from '../../context/AuthContext'

const getGreetingTime = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return { text: 'Good Morning', icon: '🌅' }
  if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', icon: '☀️' }
  if (hour >= 17 && hour < 22) return { text: 'Good Evening', icon: '🌆' }
  return { text: 'Good Night', icon: '🌙' }
}

const getUserDisplayName = (user) => {
  if (!user) return 'Guest User'
  if (user.name) return user.name
  if (user.phone) {
    if (user.phone.includes('@')) {
      const emailPart = user.phone.split('@')[0]
      return emailPart.charAt(0).toUpperCase() + emailPart.slice(1)
    }
    return user.phone
  }
  return 'Guest User'
}

const getInitials = (name) => {
  if (!name) return 'GU'
  const parts = name.trim().split(/[\s._@]+/)
  if (parts.length >= 2 && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export default function Header() {
  const { user } = useAuth()
  const greeting = getGreetingTime()
  const displayName = getUserDisplayName(user)
  const initials = getInitials(displayName)
  const isGuest = !user || user.phone === 'guest@medisafe.com'

  return (
    <header className="dash-header" style={{
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
      gap: '1.5rem',
      paddingBottom: '1.2rem',
      borderBottom: '1px solid #e2e8f0',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    }}>
      <div className="dash-greeting">
          <h1 className="dash-title" style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#0f172a',
            margin: '0 0 0.3rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <span>{greeting.text}, {displayName}</span>
            <span style={{ fontSize: '1.6rem' }}>{greeting.icon}</span>
          </h1>
          <p className="dash-subtitle" style={{
            color: '#64748b',
            fontSize: '0.92rem',
            margin: 0,
            fontWeight: 500
          }}>
            Here is your PulseMed health & medication safety overview.
          </p>
        </div>

      <div className="dash-header-actions" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {/* Notification Icon Button */}
        <button
          type="button"
          aria-label="Notifications"
          style={{
            position: 'relative',
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span style={{
            position: 'absolute',
            top: '9px',
            right: '9px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            border: '2px solid #ffffff'
          }} />
        </button>

        {/* User Profile Badge Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: '#ffffff',
          padding: '0.45rem 0.85rem 0.45rem 0.6rem',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            color: '#ffffff',
            fontSize: '0.85rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
          }}>
            {initials}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>
              {displayName}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isGuest ? '#f59e0b' : '#6366f1', lineHeight: 1.25 }}>
              {isGuest ? 'Guest Account' : 'PulseMed Member'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
