import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/landing.css'

export default function LandingPage() {
  const navigate = useNavigate()

  const handleGuestContinue = () => {
    navigate('/dashboard')
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
        <div className="landing-text-wrapper">
          <h1 className="hero-main-title">
            Your Health,<br />
            All in One Place
          </h1>

          <p className="hero-sub-title">
            Track your health, manage appointments, and stay connected with your care.
          </p>
        </div>

        {/* Prominent "Continue as Guest" CTA */}
        <div className="hero-cta-wrapper">
          <button
            id="continue-as-guest-btn"
            className="btn-continue-guest"
            onClick={handleGuestContinue}
            type="button"
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
