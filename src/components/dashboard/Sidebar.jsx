import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/>
        <rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
      </svg>
    )
  },
  {
    id: 'myhealth', label: 'My Health',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    )
  },
  {
    id: 'appointments', label: 'Appointments',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )
  },
  {
    id: 'drug-interactions', label: 'Real Drug Interactions',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    )
  },
  {
    id: 'symptom-checker', label: 'Body Symptom Checker',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    )
  },
  {
    id: 'records', label: 'Medical Records',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    )
  },
  {
    id: 'medicines', label: 'Medicines',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.5 3a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 0 0-5h-3z"/>
        <path d="M13.5 8H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h5.5"/>
        <path d="M12 14v4"/><path d="M10 16h4"/>
      </svg>
    )
  },
  {
    id: 'analytics', label: 'Health Analytics',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    )
  },
  {
    id: 'profile', label: 'Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )
  },
  {
    id: 'settings', label: 'Settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    )
  }
]

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
  return 'PulseMed Member'
}

const getInitials = (name) => {
  if (!name) return 'PM'
  const parts = name.trim().split(/[\s._@]+/)
  if (parts.length >= 2 && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export default function Sidebar({ activeId = 'dashboard', onNav, isCollapsed = false, onToggleCollapse }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const displayName = getUserDisplayName(user)
  const initials = getInitials(displayName)

  const handleLogout = async () => {
    if (logout) {
      await logout()
    }
    navigate('/auth')
  }

  return (
    <aside className={`medisafe-sidebar ${isCollapsed ? 'is-collapsed' : ''}`}>
      {/* Floating Edge Collapse Toggle Button */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="sidebar-collapse-btn"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Brand Header */}
      <div className="sidebar-brand-row">
        <div className="sidebar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')} title="PulseMed Home">
          <div className="brand-icon-wrapper">
            <svg className="brand-logo" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M12 8v8"/><path d="M8 12h8"/>
            </svg>
          </div>
          {!isCollapsed && <span className="brand-name">PulseMed</span>}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.id} className="nav-item-wrapper">
              <button
                type="button"
                id={`nav-${item.id}`}
                className={`nav-item-btn ${activeId === item.id ? 'active' : ''}`}
                aria-current={activeId === item.id ? 'page' : undefined}
                title={isCollapsed ? item.label : undefined}
                onClick={() => onNav && onNav(item.id)}
              >
                <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer / User Profile & Logout */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card" title={isCollapsed ? displayName : undefined}>
          <div className="sidebar-user-avatar">{initials}</div>
          {!isCollapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{displayName}</span>
              <span className="sidebar-user-role">{user && user.phone !== 'guest@pulsemed.com' ? 'Verified Member' : 'Guest Account'}</span>
            </div>
          )}
        </div>
        <button type="button" className="logout-btn" onClick={handleLogout} id="logout-btn" title={isCollapsed ? 'Sign Out' : undefined}>
          <span className="nav-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
          {!isCollapsed && <span className="nav-label">Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
