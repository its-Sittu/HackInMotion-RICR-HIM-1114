import React from 'react'

export default function Header() {
  return (
    <header className="medisafe-header">
      <div className="header-greetings">
        <h2 className="header-title">Good Morning 👋</h2>
        <p className="header-subtitle">Here is your medication safety overview.</p>
      </div>

      <div className="header-actions">
        {/* Notification Icon */}
        <button 
          type="button" 
          className="notification-trigger" 
          aria-label="View notifications"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="notification-badge" aria-hidden="true"></span>
        </button>

        {/* User Profile Display */}
        <div className="user-profile-display">
          <div className="profile-details">
            <span className="profile-name">Alex Johnson</span>
            <span className="profile-role">Health Account</span>
          </div>
          <div className="profile-avatar-wrapper">
            <span className="profile-avatar-initials">AJ</span>
          </div>
        </div>
      </div>
    </header>
  )
}
