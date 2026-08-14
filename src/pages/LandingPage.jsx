import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Medical3DCanvas from '../components/landing/Medical3DCanvas'
import '../styles/landing.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  // Track page scroll progress (0.0 to 1.0)
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollTop / docHeight : 0

      setScrollProgress(progress)
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleGuestContinue = () => {
    const guestUser = {
      _id: 'guest_user_id',
      phone: 'guest@medisafe.com',
      name: 'Guest User',
      isPhoneVerified: true
    }
    const guestToken = 'medisafe_guest_session_token'
    login(guestToken, guestUser)
    navigate('/dashboard')
  }

  const handleSignIn = () => {
    navigate('/auth')
  }

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="medisafe-landing">
      {/* ── 3D CONTINUOUS SCROLL CANVAS ───────────────────────── */}
      <Medical3DCanvas scrollProgress={scrollProgress} />

      {/* ── FLOATING GLASS NAVBAR ────────────────────────────── */}
      <header className={`medisafe-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="medisafe-logo" onClick={() => scrollToSection('sec-hero')}>
          <div className="medisafe-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span className="medisafe-brand-name">MEDISAFE</span>
        </div>

        <nav className="medisafe-nav-menu">
          <span className="medisafe-nav-item" onClick={() => scrollToSection('sec-hero')}>Home</span>
          <span className="medisafe-nav-item" onClick={() => scrollToSection('sec-heart')}>How It Works</span>
          <span className="medisafe-nav-item" onClick={() => scrollToSection('sec-lungs')}>Safety</span>
          <span className="medisafe-nav-item" onClick={() => scrollToSection('sec-capabilities')}>Features</span>
        </nav>

        <div className="medisafe-nav-actions">
          <button type="button" className="btn-nav-login" onClick={handleSignIn}>
            Login
          </button>
          <button type="button" className="btn-nav-start" onClick={handleGuestContinue}>
            Get Started
          </button>
        </div>
      </header>

      {/* ── CONTINUOUS SCROLL SECTIONS ────────────────────────── */}
      <div className="medisafe-scroll-wrapper">
        {/* ── SECTION 1: HERO (HEART) ────────────────────────── */}
        <section id="sec-hero" className="medisafe-section">
          <div className="hero-badge-pill">
            <span>✨ AI-Powered Clinical Safety Engine</span>
          </div>

          <h1 className="hero-main-heading">
            MEDISAFE
          </h1>

          <p className="hero-tagline">
            &ldquo;Because no patient should get hurt by the medicine that was supposed to help them.&rdquo;
          </p>

          <span className="hero-support-text">
            Smart Medicine Safety &amp; Drug Interaction Assistant
          </span>

          <div className="hero-btn-row">
            <button type="button" className="btn-medisafe-primary" onClick={handleGuestContinue}>
              <span>Explore MediSafe</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <button type="button" className="btn-medisafe-secondary" onClick={handleGuestContinue}>
              <span>Continue as Guest</span>
            </button>
          </div>

          <div className="scroll-explore-indicator">
            SCROLL TO EXPLORE ↓
          </div>
        </section>

        {/* ── SECTION 2: HEART → LUNGS TRANSITION ───────────── */}
        <section id="sec-heart" className="medisafe-section">
          <div className="anatomical-quote-box">
            <h2 className="anatomical-heading">
              &ldquo;Every dose affects the body.&rdquo;
            </h2>
            <p className="anatomical-subtext">
              Understanding what we take is the first step toward safer care.
            </p>
          </div>
        </section>

        {/* ── SECTION 3: LUNGS → KIDNEYS TRANSITION ──────────── */}
        <section id="sec-lungs" className="medisafe-section">
          <div className="anatomical-quote-box">
            <h2 className="anatomical-heading">
              &ldquo;Every medicine has a journey.&rdquo;
            </h2>
            <p className="anatomical-subtext">
              The body processes every dose. MediSafe helps you understand the risks before they interact.
            </p>
          </div>
        </section>

        {/* ── SECTION 4: KIDNEYS → FULL HUMAN HOLOGRAPHIC ANATOMY ── */}
        <section id="sec-human" className="medisafe-section">
          <div className="anatomical-quote-box" style={{ maxWidth: '850px' }}>
            <h2 className="anatomical-heading">
              Visualizing Safety Across Human Systems
            </h2>
            <p className="anatomical-subtext">
              MediSafe protects the human body by scanning chemical compound overlaps, timing constraints, and daily bio-rhythms.
            </p>

            <div className="orbiting-panels-container">
              <div className="orbiting-panel-badge">
                <span>💊 Medication Safety</span>
              </div>
              <div className="orbiting-panel-badge">
                <span>⚡ Drug Interaction</span>
              </div>
              <div className="orbiting-panel-badge">
                <span>⚠️ Risk Detection</span>
              </div>
              <div className="orbiting-panel-badge">
                <span>⏰ Medication Reminder</span>
              </div>
              <div className="orbiting-panel-badge">
                <span>🩺 AI Health Assistant</span>
              </div>
              <div className="orbiting-panel-badge">
                <span>👨‍👩‍👧 Caregiver Alerts</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 5: PRODUCT VALUE (4 CAPABILITIES) ─────── */}
        <section id="sec-capabilities" className="medisafe-section">
          <div className="capabilities-header">
            <span className="hero-badge-pill">Capabilities</span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', margin: '0.4rem 0 0.8rem 0' }}>
              One place for safer medication decisions.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0 }}>
              Comprehensive clinical tools built to prevent prescription errors and empower patient safety.
            </p>
          </div>

          <div className="capabilities-grid">
            {/* Capability 1 */}
            <div className="capability-card">
              <span className="capability-icon">⚡</span>
              <h3 className="capability-title">1. Drug Interaction Detection</h3>
              <p className="capability-desc">
                Check medicines before they interact. Instant active compound scanning powered by clinical databases.
              </p>
            </div>

            {/* Capability 2 */}
            <div className="capability-card">
              <span className="capability-icon">🛡️</span>
              <h3 className="capability-title">2. Medication Safety</h3>
              <p className="capability-desc">
                Understand complex pharmacological risks and side effects explained in simple, empowering language.
              </p>
            </div>

            {/* Capability 3 */}
            <div className="capability-card">
              <span className="capability-icon">⏰</span>
              <h3 className="capability-title">3. Smart Reminders</h3>
              <p className="capability-desc">
                Never lose track of your medication schedule with phone-style audio alarms and meal synchronization.
              </p>
            </div>

            {/* Capability 4 */}
            <div className="capability-card">
              <span className="capability-icon">👨‍👩‍👧</span>
              <h3 className="capability-title">4. Caregiver Protection</h3>
              <p className="capability-desc">
                Keep trusted family members informed via instant SMS and Email notifications when doses are unanswered.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 6: FINAL CALL TO ACTION ────────────────── */}
        <section id="sec-cta" className="medisafe-section">
          <div className="final-cta-box">
            <h2 className="final-cta-heading">
              Your medicines should help you.<br />MediSafe helps you take them safely.
            </h2>

            <div className="hero-btn-row">
              <button type="button" className="btn-medisafe-primary" onClick={handleGuestContinue}>
                <span>Get Started</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <button type="button" className="btn-medisafe-secondary" onClick={handleGuestContinue}>
                <span>Continue as Guest</span>
              </button>
            </div>

            <p className="final-cta-support">
              AI-powered medication safety • Drug interaction detection • Smart reminders
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
