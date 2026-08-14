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

  const getThemeClass = (progress) => {
    if (progress <= 0.22) return 'theme-hero'
    if (progress <= 0.48) return 'theme-lungs'
    if (progress <= 0.72) return 'theme-kidneys'
    return 'theme-human'
  }

  const activeThemeClass = getThemeClass(scrollProgress)

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
    <div className={`medisafe-landing ${activeThemeClass}`}>
      {/* ── 3D CONTINUOUS SCROLL CANVAS (VOLUMETRIC 3D ORGAN ON RIGHT SIDE) ── */}
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
          <span className="medisafe-nav-item" onClick={() => scrollToSection('sec-heart')}>Workflow</span>
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

      {/* ── CONTINUOUS SCROLL SECTIONS (ALL CONTENT ALIGNED TO LEFT SIDE) ── */}
      <div className="medisafe-scroll-wrapper">
        {/* ── SECTION 1: HERO (REFERENCE IMAGE STYLE PILL BADGE & BUTTONS) ── */}
        <section id="sec-hero" className="medisafe-section">
          <div className="hero-content-col">
            <h1 className="hero-main-heading">
              MEDISAFE
            </h1>

            <p className="hero-tagline">
              &ldquo;Because no patient should get hurt by the medicine that was supposed to help them.&rdquo;
            </p>

            <span className="hero-support-text">
              Smart Medicine Safety &amp; Drug Interaction Assistant
            </span>

            {/* Reference Image Style Pill Buttons */}
            <div className="hero-btn-row">
              <button type="button" className="btn-medisafe-primary" onClick={handleGuestContinue}>
                <span>Explore MediSafe</span>
                <div className="btn-arrow-circle">↗</div>
              </button>

              <button type="button" className="btn-medisafe-secondary" onClick={handleGuestContinue}>
                <span>Continue as Guest</span>
                <div className="btn-arrow-circle-sec">↗</div>
              </button>
            </div>

            <div className="scroll-explore-indicator">
              SCROLL TO EXPLORE ↓
            </div>
          </div>
        </section>

        {/* ── SECTION 2: HEART STAGE • WORKFLOW STEP 2 ───────── */}
        <section id="sec-heart" className="medisafe-section">
          <div className="anatomical-quote-box">
            <span className="step-indicator-pill">Step 2 of 5 • Smart Audio Alarms &amp; Family Alerts</span>
            <h2 className="anatomical-heading">
              &ldquo;Every dose affects the body.&rdquo;
            </h2>
            <p className="anatomical-subtext">
              Schedule morning/evening medication reminders with phone-style audio ringing. Unanswered alarms automatically alert your emergency contacts via Fast2SMS and EmailJS.
            </p>
          </div>
        </section>

        {/* ── SECTION 3: LUNGS STAGE • WORKFLOW STEP 3 ────────── */}
        <section id="sec-lungs" className="medisafe-section">
          <div className="anatomical-quote-box">
            <span className="step-indicator-pill">Step 3 of 5 • Real Drug Interaction &amp; Overdose Engine</span>
            <h2 className="anatomical-heading">
              &ldquo;Every medicine has a journey.&rdquo;
            </h2>
            <p className="anatomical-subtext">
              Input multiple prescription or OTC medicines to detect active compound overlaps, dangerous contraindications, and overdose risks powered by FDA databases.
            </p>
          </div>
        </section>

        {/* ── SECTION 4: KIDNEYS STAGE • WORKFLOW STEP 4 ───────── */}
        <section id="sec-kidney" className="medisafe-section">
          <div className="anatomical-quote-box">
            <span className="step-indicator-pill">Step 4 of 5 • Body Symptom &amp; Burn Diagnostic Evaluator</span>
            <h2 className="anatomical-heading">
              &ldquo;The body processes every dose.&rdquo;
            </h2>
            <p className="anatomical-subtext">
              Evaluate ENT, throat, skin, or burn symptoms to receive instant clinical severity indices, red flag emergency warnings, and recommended care protocols.
            </p>
          </div>
        </section>

        {/* ── SECTION 5: FULL HUMAN STAGE • WORKFLOW STEP 5 ───── */}
        <section id="sec-human" className="medisafe-section">
          <div className="anatomical-quote-box">
            <span className="step-indicator-pill">Step 5 of 5 • Healthy Diet Sync &amp; Adherence Analytics</span>
            <h2 className="anatomical-heading">
              Visualizing Safety Across All Human Systems
            </h2>
            <p className="anatomical-subtext">
              Follow pre/post meal clinical diet schedules, mark food consumed, and track dynamic health compliance across all integrated modules.
            </p>

            <div className="reference-feature-pills-row">
              <div className="reference-feature-pill-card">
                <div className="reference-feature-icon-circle" style={{ backgroundColor: '#10b981' }}>
                  ⚡
                </div>
                <div className="reference-feature-info">
                  <span className="reference-feature-title">Drug Interaction</span>
                  <span className="reference-feature-desc">FDA Compound Scanner</span>
                </div>
              </div>

              <div className="reference-feature-pill-card">
                <div className="reference-feature-icon-circle" style={{ backgroundColor: '#6366f1' }}>
                  ⏰
                </div>
                <div className="reference-feature-info">
                  <span className="reference-feature-title">Smart Alarms</span>
                  <span className="reference-feature-desc">Audio + Family Alerts</span>
                </div>
              </div>

              <div className="reference-feature-pill-card">
                <div className="reference-feature-icon-circle" style={{ backgroundColor: '#f59e0b' }}>
                  🥗
                </div>
                <div className="reference-feature-info">
                  <span className="reference-feature-title">Diet Schedule</span>
                  <span className="reference-feature-desc">Medication Sync</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 6: PRODUCT VALUE (4 CAPABILITIES CARDS) ─── */}
        <section id="sec-capabilities" className="medisafe-section">
          <div className="capabilities-header">
            <span className="hero-badge-pill">Capabilities</span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', margin: '0.4rem 0 0.8rem 0', lineHeight: 1.15 }}>
              One place for safer medication decisions.
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '1.05rem', margin: 0, lineHeight: 1.55 }}>
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

        {/* ── SECTION 7: FINAL CALL TO ACTION ────────────────── */}
        <section id="sec-cta" className="medisafe-section">
          <div className="final-cta-box">
            <h2 className="final-cta-heading">
              Your medicines should help you.<br />MediSafe helps you take them safely.
            </h2>

            <div className="hero-btn-row">
              <button type="button" className="btn-medisafe-primary" onClick={handleGuestContinue}>
                <span>Get Started</span>
                <div className="btn-arrow-circle">↗</div>
              </button>

              <button type="button" className="btn-medisafe-secondary" onClick={handleGuestContinue}>
                <span>Continue as Guest</span>
                <div className="btn-arrow-circle-sec">↗</div>
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
