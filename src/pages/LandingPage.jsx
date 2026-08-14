import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/landing.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleGuestContinue = () => {
    const guestUser = {
      _id: 'guest_user_id',
      phone: 'guest@pulsemed.com',
      name: 'Guest User',
      isPhoneVerified: true
    }
    const guestToken = 'pulsemed_guest_session_token'
    login(guestToken, guestUser)
    navigate('/dashboard')
  }

  const handleSignIn = () => {
    navigate('/auth')
  }

  return (
    <div className="landing-screen">
      {/* Soft atmospheric ambient glow lights matching organ colors */}
      <div className="ambient-glow glow-purple" />
      <div className="ambient-glow glow-blue" />
      <div className="ambient-glow glow-red" />
      <div className="ambient-glow glow-orange" />
      <div className="ambient-glow glow-green" />

      {/* ── 5 3D Medical Organs (Matching Reference Composition) ── */}

      {/* 1. Purple Brain (Top-Left) */}
      <div className="organ-frame organ-pos-brain">
        <img
          src="/images/brain.png"
          alt="3D Medical Brain"
          className="organ-image"
          loading="eager"
        />
      </div>

      {/* 2. Blue Lungs (Top-Right) */}
      <div className="organ-frame organ-pos-lungs">
        <img
          src="/images/lungs.png"
          alt="3D Medical Lungs"
          className="organ-image"
          loading="eager"
        />
      </div>

      {/* 3. Red Heart (Mid/Lower-Left) */}
      <div className="organ-frame organ-pos-heart">
        <img
          src="/images/heart.png"
          alt="3D Medical Heart"
          className="organ-image"
          loading="eager"
        />
      </div>

      {/* 4. Orange Kidney (Mid/Lower-Right) */}
      <div className="organ-frame organ-pos-kidney">
        <img
          src="/images/kidney.png"
          alt="3D Medical Kidney"
          className="organ-image"
          loading="eager"
        />
      </div>

      {/* 5. Green Stomach (Bottom-Center) */}
      <div className="organ-frame organ-pos-stomach">
        <img
          src="/images/stomach.png"
          alt="3D Medical Stomach"
          className="organ-image"
          loading="eager"
        />
      </div>

      {/* ── Center Content Area ── */}
      <main className="landing-center-content">
        {/* Brand mark */}
        <div className="landing-brand">
          <div className="landing-brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span className="landing-brand-name">PulseMed</span>
        </div>

        {/* CTA Buttons */}
        <div className="hero-cta-wrapper">
          <button
            id="sign-in-btn"
            className="btn-continue-guest"
            onClick={handleSignIn}
            type="button"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none' }}
          >
            <span>Sign In / Sign Up</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          <button
            id="continue-as-guest-btn"
            className="btn-continue-guest"
            onClick={handleGuestContinue}
            type="button"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' }}
          >
            <span>Continue as Guest</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  )
}
