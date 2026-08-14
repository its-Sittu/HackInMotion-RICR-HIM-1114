import React, { useState, useEffect } from 'react'

export default function AppSettings() {
  // Day / Black Theme Function State (Dark Mode default vs Light Mode)
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('medisafe_theme_mode') || 'dark'
  })

  const [settings, setSettings] = useState({
    alarmSoundEnabled: true,
    smsAlertsEnabled: true,
    emailAlertsEnabled: true,
    strictInteractionRules: true
  })

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [settingsSyncActive] = useState(true)

  // Apply Live Day/Black Theme change to document body
  useEffect(() => {
    localStorage.setItem('medisafe_theme_mode', themeMode)
    if (themeMode === 'light') {
      document.body.classList.add('light-theme')
      document.body.classList.remove('dark-theme')
    } else {
      document.body.classList.add('dark-theme')
      document.body.classList.remove('light-theme')
    }
  }, [themeMode])

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSaveSettings = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      appName: 'MediSafe',
      exportDate: new Date().toISOString(),
      themeMode,
      settings
    }, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", "MediSafe_Settings_Export.json")
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
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
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'linear-gradient(135deg, #f43f5e 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', boxShadow: '0 0 20px rgba(244, 63, 94, 0.35)' }}>
              ⚙️
            </div>
            <div>
              <h1 className="auth-title" style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                Application Settings
              </h1>
              <p style={{ color: '#94a3b8', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>
                Configure live Day/Black themes, notification channels, and clinical interaction safety.
              </p>
            </div>
          </div>

          <button onClick={handleSaveSettings} className="btn-auth-primary" style={{ padding: '0.75rem 1.6rem', borderRadius: '14px', fontSize: '0.9rem', width: 'auto', marginTop: 0 }}>
            Save Settings 💾
          </button>
        </div>

        {savedSuccess && (
          <div className="auth-alert success" style={{ marginBottom: '1.6rem' }}>
            ✓ Application preferences saved successfully!
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.6rem', width: '100%', boxSizing: 'border-box' }}>
          {/* 1. Theme Mode (Day / Black Function) */}
          <div style={{ padding: '1.4rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <label className="auth-label" style={{ marginBottom: '0.8rem', color: '#38bdf8', fontSize: '0.85rem' }}>
              ☀️ Theme Appearance (Day / Black Mode)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                style={{
                  padding: '0.9rem',
                  borderRadius: '14px',
                  border: themeMode === 'dark' ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(15, 23, 42, 0.9)',
                  color: '#ffffff',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                🌙 Black (Dark)
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('light')}
                style={{
                  padding: '0.9rem',
                  borderRadius: '14px',
                  border: themeMode === 'light' ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                ☀️ Day (Light)
              </button>
            </div>
          </div>

          {/* 2. Notifications & Alarms */}
          <div style={{ padding: '1.4rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label className="auth-label" style={{ margin: 0, color: '#10b981', fontSize: '0.85rem' }}>
              ⏰ Alarms &amp; Notifications
            </label>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', display: 'block' }}>Ringtone Audio Alarm</span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Play sound when dosage reminder triggers.</span>
              </div>
              <input type="checkbox" checked={settings.alarmSoundEnabled} onChange={() => handleToggle('alarmSoundEnabled')} style={{ width: '22px', height: '22px', accentColor: '#10b981', cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', display: 'block' }}>Fast2SMS SMS Alerts</span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Send mobile SMS for critical unconfirmed dosages.</span>
              </div>
              <input type="checkbox" checked={settings.smsAlertsEnabled} onChange={() => handleToggle('smsAlertsEnabled')} style={{ width: '22px', height: '22px', accentColor: '#10b981', cursor: 'pointer' }} />
            </div>
          </div>

          {/* 3. Clinical Rules & Data Backup */}
          <div style={{ padding: '1.4rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label className="auth-label" style={{ margin: 0, color: '#f43f5e', fontSize: '0.85rem' }}>
              ⚡ Clinical Safety &amp; Data Export
            </label>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', display: 'block' }}>Strict FDA Interaction Rules</span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Enforce strict major/moderate drug warning alerts.</span>
              </div>
              <input type="checkbox" checked={settings.strictInteractionRules} onChange={() => handleToggle('strictInteractionRules')} style={{ width: '22px', height: '22px', accentColor: '#10b981', cursor: 'pointer' }} />
            </div>

            <button
              type="button"
              onClick={handleExportData}
              style={{
                width: '100%',
                padding: '0.85rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                marginTop: '0.2rem'
              }}
            >
              Export JSON Backup 📥
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
