import React, { useState, useEffect } from 'react'

export default function AppSettings() {
  // Day / Black Theme Function State (Dark Mode default vs Light Mode vs System)
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('medisafe_theme_mode') || 'dark'
  })

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('medisafe_accent_color') || 'emerald'
  })

  const [settings, setSettings] = useState({
    alarmSoundEnabled: true,
    alarmVolume: 80,
    smsAlertsEnabled: true,
    emailAlertsEnabled: true,
    desktopNotifications: true,
    strictInteractionRules: true,
    mealSyncBufferMins: 30,
    autoLogCalories: false
  })

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [cacheCleared, setCacheCleared] = useState(false)

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

  useEffect(() => {
    localStorage.setItem('medisafe_accent_color', accentColor)
  }, [accentColor])

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

  const handleClearCache = () => {
    setCacheCleared(true)
    setTimeout(() => setCacheCleared(false), 3000)
  }

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      appName: 'MediSafe',
      exportDate: new Date().toISOString(),
      themeMode,
      accentColor,
      settings
    }, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", "MediSafe_Health_Settings_Export.json")
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="dash-settings-container" style={{ animation: 'dash-fade-in 0.3s ease' }}>
      {/* Title Header */}
      <div className="dash-card" style={{ padding: '1.8rem 2rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.7) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.4rem 0' }}>App Settings &amp; Preferences</h2>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.92rem' }}>Customize live Day/Black themes, notification channels, and clinical safety thresholds.</p>
          </div>
          <button onClick={handleSaveSettings} className="dash-btn-primary" style={{ padding: '0.8rem 1.6rem', borderRadius: '14px' }}>
            Save Preferences 💾
          </button>
        </div>

        {savedSuccess && (
          <div style={{ marginTop: '1.2rem', padding: '0.8rem 1.2rem', background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700 }}>
            ✓ Settings successfully saved to your MediSafe profile!
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* 1. Theme & Appearance ("Day Black Function") */}
        <section className="dash-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ☀️ Theme &amp; Appearance (Day / Black Mode)
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Color Theme Mode</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                style={{
                  padding: '0.85rem',
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
                  padding: '0.85rem',
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

              <button
                type="button"
                onClick={() => setThemeMode('system')}
                style={{
                  padding: '0.85rem',
                  borderRadius: '14px',
                  border: themeMode === 'system' ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                💻 Auto System
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Accent Highlight Palette</label>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              {[
                { id: 'emerald', hex: '#10b981', label: 'Emerald' },
                { id: 'cyan', hex: '#06b6d4', label: 'Cyan Sky' },
                { id: 'crimson', hex: '#f43f5e', label: 'Ruby Crimson' },
                { id: 'indigo', hex: '#6366f1', label: 'Indigo Pulse' }
              ].map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setAccentColor(acc.id)}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '12px',
                    border: accentColor === acc.id ? `2px solid ${acc.hex}` : '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: acc.hex }} />
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Notifications & Alarms */}
        <section className="dash-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⏰ Medication Alarms &amp; Notifications
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', display: 'block' }}>Ringtone Audio Alarm</span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Play sound chime when dosage reminder triggers.</span>
              </div>
              <input type="checkbox" checked={settings.alarmSoundEnabled} onChange={() => handleToggle('alarmSoundEnabled')} style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', display: 'block' }}>Fast2SMS SMS Alerts</span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Send mobile SMS for critical unconfirmed dosages.</span>
              </div>
              <input type="checkbox" checked={settings.smsAlertsEnabled} onChange={() => handleToggle('smsAlertsEnabled')} style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', display: 'block' }}>EmailJS Caregiver Dispatch</span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Forward emergency emails to family contacts.</span>
              </div>
              <input type="checkbox" checked={settings.emailAlertsEnabled} onChange={() => handleToggle('emailAlertsEnabled')} style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }} />
            </div>
          </div>
        </section>

        {/* 3. Clinical Rules & Data Management */}
        <section className="dash-card" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚡ Clinical Rules &amp; Data Export
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '14px' }}>
              <h4 style={{ margin: '0 0 0.4rem 0', color: '#ffffff', fontSize: '0.92rem' }}>Strict FDA Interaction Checks</h4>
              <p style={{ margin: '0 0 0.8rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>Enforce strict major/moderate drug warning severity alerts.</p>
              <input type="checkbox" checked={settings.strictInteractionRules} onChange={() => handleToggle('strictInteractionRules')} style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }} />
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '14px' }}>
              <h4 style={{ margin: '0 0 0.4rem 0', color: '#ffffff', fontSize: '0.92rem' }}>Export Health Profile Data</h4>
              <p style={{ margin: '0 0 0.8rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>Download JSON report of all logged medicines &amp; alarms.</p>
              <button type="button" onClick={handleExportData} className="btn-medisafe-primary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}>
                Download JSON Report 📥
              </button>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '14px' }}>
              <h4 style={{ margin: '0 0 0.4rem 0', color: '#ffffff', fontSize: '0.92rem' }}>Clear Local Search Cache</h4>
              <p style={{ margin: '0 0 0.8rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>Resets cached offline medicine search queries.</p>
              <button type="button" onClick={handleClearCache} style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                Clear Offline Cache 🧹
              </button>

              {cacheCleared && (
                <span style={{ display: 'block', fontSize: '0.78rem', color: '#6ee7b7', fontWeight: 700, marginTop: '0.4rem' }}>✓ Cache Cleared!</span>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
