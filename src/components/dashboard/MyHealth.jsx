import React from 'react'

export default function MyHealth() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justify: 'center',
      minHeight: '70vh',
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      padding: '3rem 2rem',
      textAlign: 'center',
      boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
      marginTop: '1rem'
    }}>
      <div style={{
        width: '70px',
        height: '70px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.04) 100%)',
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        fontSize: '2.2rem',
        marginBottom: '1.2rem',
        border: '1px solid rgba(239, 68, 68, 0.2)'
      }}>
        ❤️
      </div>

      <h2 style={{
        fontSize: '1.6rem',
        fontWeight: 800,
        color: '#0f172a',
        margin: '0 0 0.5rem 0',
        letterSpacing: '-0.4px'
      }}>
        My Health Hub
      </h2>

      <p style={{
        color: '#64748b',
        fontSize: '0.94rem',
        maxWidth: '460px',
        lineHeight: 1.55,
        margin: 0
      }}>
        Your personal health parameters and vitals vault is ready. Active health metrics and biological logs will be displayed here.
      </p>
    </div>
  )
}
