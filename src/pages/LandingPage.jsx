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

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="landing-container">
      {/* ── STICKY NAVBAR ───────────────────────────────────────── */}
      <header className="landing-navbar">
        <div className="landing-nav-logo" onClick={() => scrollToSection('hero-slide')}>
          <div className="landing-nav-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span className="landing-nav-brand">PulseMed</span>
        </div>

        <nav className="landing-nav-links">
          <span className="landing-nav-link" onClick={() => scrollToSection('hero-slide')}>Overview</span>
          <span className="landing-nav-link" onClick={() => scrollToSection('workflow-slide')}>How It Works</span>
          <span className="landing-nav-link" onClick={() => scrollToSection('features-slide')}>Features</span>
          <span className="landing-nav-link" onClick={() => scrollToSection('analytics-slide')}>Analytics</span>
        </nav>

        <div className="landing-nav-actions">
          <button type="button" className="btn-nav-guest" onClick={handleGuestContinue}>
            Guest Access
          </button>
          <button type="button" className="btn-nav-primary" onClick={handleSignIn}>
            Sign In / Register
          </button>
        </div>
      </header>

      {/* ── SLIDE 1: HERO SECTION ───────────────────────────────── */}
      <section id="hero-slide" className="landing-slide-section section-hero">
        <div className="hero-content-box">
          <div className="hero-pill-badge">
            <span>✨ AI-Powered Clinical Intelligence Platform</span>
          </div>

          <h1 className="hero-title">
            Next-Generation Patient Bio-Rhythm & Medication Safety Engine
          </h1>

          <p className="hero-subtitle">
            Real-time drug interaction scanning, smart audio alarms with emergency SMS alerts, synchronized clinical diet schedules, and body symptom evaluation.
          </p>

          <div className="hero-actions-row">
            <button type="button" className="btn-hero-cta" onClick={handleGuestContinue}>
              <span>🚀 Launch Interactive Dashboard</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <button type="button" className="btn-hero-secondary" onClick={() => scrollToSection('workflow-slide')}>
              <span>📖 Explore 5-Step Workflow</span>
            </button>
          </div>

          <div className="hero-vitals-strip">
            <div className="hero-vital-pill">
              <span>⏰ Audio Alarms + Emergency Alerts</span>
            </div>
            <div className="hero-vital-pill">
              <span>⚡ FDA Drug Interaction Scanner</span>
            </div>
            <div className="hero-vital-pill">
              <span>🥗 Healthy Diet & Schedule Board</span>
            </div>
            <div className="hero-vital-pill">
              <span>🩺 ENT & Body Symptom Evaluator</span>
            </div>
            <div className="hero-vital-pill">
              <span>📊 Multi-Feature Analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SLIDE 2: PROJECT WORKFLOW (5-STEP HOW IT WORKS) ──────── */}
      <section id="workflow-slide" className="landing-slide-section section-workflow">
        <div className="section-header-center">
          <span className="section-badge">Simple 5-Step Workflow</span>
          <h2 className="section-title">How PulseMed Clinical Engine Works</h2>
          <p className="section-desc">
            An end-to-end patient workflow designed for seamless medication compliance, safety checking, and diet synchronization.
          </p>
        </div>

        <div className="workflow-steps-grid">
          {/* Step 1 */}
          <div className="workflow-step-card">
            <div className="step-number-badge">1</div>
            <span className="step-card-icon">🔐</span>
            <h3 className="step-card-title">Instant Secure Auth</h3>
            <p className="step-card-desc">
              Sign in via Indian phone OTP authentication or instantly test using Guest Mode access.
            </p>
          </div>

          {/* Step 2 */}
          <div className="workflow-step-card">
            <div className="step-number-badge">2</div>
            <span className="step-card-icon">⏰</span>
            <h3 className="step-card-title">Set Audio Alarms</h3>
            <p className="step-card-desc">
              Schedule morning/evening medication reminders with phone-style audio ringing and automatic SMS/Email family alerts.
            </p>
          </div>

          {/* Step 3 */}
          <div className="workflow-step-card">
            <div className="step-number-badge">3</div>
            <span className="step-card-icon">⚡</span>
            <h3 className="step-card-title">Scan Drug Interactions</h3>
            <p className="step-card-desc">
              Input multiple medicines to evaluate active compound overlaps, contraindications, and overdose risks via FDA databases.
            </p>
          </div>

          {/* Step 4 */}
          <div className="workflow-step-card">
            <div className="step-number-badge">4</div>
            <span className="step-card-icon">🩺</span>
            <h3 className="step-card-title">Evaluate Symptoms</h3>
            <p className="step-card-desc">
              Check ENT, throat, or burn symptoms to receive clinical severity scores, red flags, and triage recommendations.
            </p>
          </div>

          {/* Step 5 */}
          <div className="workflow-step-card">
            <div className="step-number-badge">5</div>
            <span className="step-card-icon">🥗</span>
            <h3 className="step-card-title">Sync Diet & Log Intake</h3>
            <p className="step-card-desc">
              Follow pre/post meal clinical diet schedules, mark food consumed, and track overall health adherence analytics.
            </p>
          </div>
        </div>
      </section>

      {/* ── SLIDE 3: CORE FEATURES SUITE ────────────────────────── */}
      <section id="features-slide" className="landing-slide-section section-features">
        <div className="section-header-center">
          <span className="section-badge">Core Capabilities</span>
          <h2 className="section-title">Built for Modern Patient Bio-Rhythm Care</h2>
          <p className="section-desc">
            Explore the specialized modules engineered for patient safety, daily adherence, and clinical precision.
          </p>
        </div>

        <div className="features-grid-main">
          {/* Feature 1 */}
          <div className="feature-suite-card">
            <div>
              <div className="feature-card-header">
                <div className="feature-icon-box" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                  ⏰
                </div>
                <h3 className="feature-card-title">Smart Audio Alarms</h3>
              </div>
              <p className="feature-card-text">
                Ringing medication alarms with custom time modification, snooze control, and Fast2SMS & EmailJS emergency alerts.
              </p>
            </div>
            <span className="feature-card-tag" style={{ backgroundColor: '#eef2ff', color: '#4338ca' }}>
              Real Audio & Alerts
            </span>
          </div>

          {/* Feature 2 */}
          <div className="feature-suite-card">
            <div>
              <div className="feature-card-header">
                <div className="feature-icon-box" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
                  ⚡
                </div>
                <h3 className="feature-card-title">FDA Interaction Engine</h3>
              </div>
              <p className="feature-card-text">
                Evaluates active drug compounds to detect dangerous overlaps, contraindications, and active compound duplication.
              </p>
            </div>
            <span className="feature-card-tag" style={{ backgroundColor: '#d1fae5', color: '#047857' }}>
              FDA Clinical Engine
            </span>
          </div>

          {/* Feature 3 */}
          <div className="feature-suite-card">
            <div>
              <div className="feature-card-header">
                <div className="feature-icon-box" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                  🥗
                </div>
                <h3 className="feature-card-title">Healthy Food Planning Board</h3>
              </div>
              <p className="feature-card-text">
                Meal schedules synchronized with medication doses, calorie target tracking, diet tags, and mark-consumed status logger.
              </p>
            </div>
            <span className="feature-card-tag" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
              Medication Sync
            </span>
          </div>

          {/* Feature 4 */}
          <div className="feature-suite-card">
            <div>
              <div className="feature-card-header">
                <div className="feature-icon-box" style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                  🩺
                </div>
                <h3 className="feature-card-title">ENT & Body Symptom Evaluator</h3>
              </div>
              <p className="feature-card-text">
                Detailed symptom diagnostic checker providing clinical severity indices, red flag warnings, and first-aid care plans.
              </p>
            </div>
            <span className="feature-card-tag" style={{ backgroundColor: '#f0f9ff', color: '#0369a1' }}>
              Clinical Triage
            </span>
          </div>
        </div>
      </section>

      {/* ── SLIDE 4: ANALYTICS & INSIGHTS SHOWCASE ───────────────── */}
      <section id="analytics-slide" className="landing-slide-section section-analytics">
        <div className="section-header-center">
          <span className="section-badge">Live Analytics Engine</span>
          <h2 className="section-title">Patient Bio-Rhythm Analytics & Insights</h2>
          <p className="section-desc">
            Aggregating performance metrics across doses taken, healthy meals consumed, symptom checks, and drug safety scans.
          </p>
        </div>

        <div className="analytics-preview-box">
          <div className="analytics-preview-header">
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                📊 Multi-Feature Health Score: 99 / 100 Optimal
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                Live patient adherence index calculated dynamically across modules
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ backgroundColor: '#d1fae5', color: '#047857', padding: '0.3rem 0.75rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800 }}>
                ✓ 98% Dose Adherence
              </span>
              <span style={{ backgroundColor: '#eef2ff', color: '#4338ca', padding: '0.3rem 0.75rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800 }}>
                ✓ 100% Drug Safety Ratio
              </span>
            </div>
          </div>

          <div className="analytics-demo-grid">
            <div className="analytics-demo-card">
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                🥧 Donut Feature Distribution
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Visualizes the proportion of Medications (37%), Healthy Meals (49%), Symptom Checks (12%), and Lab Reports (2%).
              </p>
            </div>

            <div className="analytics-demo-card">
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                📊 7-Day Performance Bar Graph
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Continuous bio-rhythm tracking highlighting daily compliance trends with live score indicators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SLIDE 5: EXECUTIVE FOOTER & CTA ─────────────────────── */}
      <section id="footer-slide" className="landing-slide-section section-footer">
        <div className="cta-banner-box">
          <h2 className="cta-title">Ready to Experience PulseMed AI Patient Care?</h2>
          <p className="cta-subtitle">
            Join thousands of patients taking control of their medication timing, drug safety, and daily bio-rhythms today.
          </p>

          <div className="hero-actions-row">
            <button type="button" className="btn-hero-cta" onClick={handleGuestContinue}>
              <span>🚀 Open Dashboard Now</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <button type="button" className="btn-hero-secondary" onClick={handleSignIn} style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
              <span>🔑 Sign In / Register Account</span>
            </button>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#ffffff' }}>
            <span style={{ fontSize: '1.2rem' }}>🏥</span> PulseMed Platform • HackInMotion (RICR-HIM-1114)
          </div>

          <div>
            Built for HackInMotion 2026 • AI Patient Health & Bio-Rhythm Care
          </div>
        </div>
      </section>
    </div>
  )
}
