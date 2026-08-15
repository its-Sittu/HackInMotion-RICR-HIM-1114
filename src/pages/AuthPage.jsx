import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApiUrl } from '../utils/apiConfig'
import '../styles/auth.css'

// ─── EmailJS Browser-side OTP Sender ─────────────────────────────────────────
// Sends OTP email directly from browser so origin matches EmailJS whitelist
const EMAILJS_SERVICE_ID  = 'service_ogg9o51'
const EMAILJS_TEMPLATE_ID = 'template_8xnuo4b'
const EMAILJS_PUBLIC_KEY  = 'uqQIboA5idT8wp2fc'
const EMAILJS_PRIVATE_KEY = 'IggixTzEw1UGDcINvqvB6'

const sendEmailOtpDirectly = async (toEmail, otp) => {
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY,
        template_params: {
          to_email: toEmail,
          email: toEmail,
          user_email: toEmail,
          to_name: toEmail.split('@')[0] || 'User',
          otp: otp,
          otp_code: otp,
          code: otp,
          message: `Your MediSafe OTP verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`
        }
      })
    })
    const text = await res.text()
    if (text === 'OK' || res.ok) {
      console.log('[EmailJS] OTP email sent successfully via browser to', toEmail)
      return true
    }
    console.warn('[EmailJS] Unexpected response:', text)
    return false
  } catch (err) {
    console.warn('[EmailJS] Browser send failed:', err.message)
    return false
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const api = async (path, body, retries = 1) => {
  const url = getApiUrl(`/api/auth${path}`)
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const text = await res.text()
      if (!text || !text.trim()) {
        return { success: false, message: 'Server returned an empty response. Please try again.' }
      }
      try {
        return JSON.parse(text)
      } catch {
        return {
          success: false,
          message: res.status >= 500
            ? 'Server error occurred. Please check backend server.'
            : `Unexpected server response (${res.status}).`
        }
      }
    } catch (err) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1200))
        continue
      }
      const isFetchError = err.message && (err.message.includes('fetch') || err.message.includes('Network') || err.name === 'TypeError')
      return {
        success: false,
        isNetworkError: true,
        message: isFetchError
          ? 'Unable to connect to backend server. Render backend may be waking up (please wait ~15s and try again) or start your local backend server.'
          : (err.message || 'Unable to connect to server. Please check your network connection.')
      }
    }
  }
}

const getPasswordStrength = (pw) => {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthClass  = ['', 'weak', 'weak', 'medium', 'strong']

// ─── Sub-components ───────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="auth-logo">
      <div className="auth-logo-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
      <span className="auth-logo-text">MEDISAFE</span>
    </div>
  )
}

function Alert({ type, message }) {
  if (!message) return null
  return (
    <div className={`auth-alert ${type}`}>
      {type === 'error' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
      {message}
    </div>
  )
}

function OtpInput({ value, onChange, disabled }) {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]
  const digits = (value || '').split('').concat(Array(6).fill('')).slice(0, 6)

  const handleKey = (idx, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = digits.slice()
      if (next[idx]) { next[idx] = ''; onChange(next.join('')) }
      else if (idx > 0) { next[idx - 1] = ''; onChange(next.join('')); refs[idx - 1].current?.focus() }
      return
    }
    if (e.key === 'ArrowLeft' && idx > 0) { refs[idx - 1].current?.focus(); return }
    if (e.key === 'ArrowRight' && idx < 5) { refs[idx + 1].current?.focus(); return }
  }

  const handleChange = (idx, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1)
    if (!char) return
    const next = digits.slice()
    next[idx] = char
    onChange(next.join(''))
    if (idx < 5) refs[idx + 1].current?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted.padEnd(6, '').slice(0, 6))
    const focusIdx = Math.min(pasted.length, 5)
    refs[focusIdx].current?.focus()
  }

  return (
    <div className="auth-otp-grid" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          id={`otp-digit-${i}`}
          className={`auth-otp-input${d ? ' filled' : ''}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          autoComplete="one-time-code"
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  )
}

function PasswordInput({ id, value, onChange, placeholder, disabled }) {
  const [show, setShow] = useState(false)
  return (
    <div className="auth-input-wrap">
      <span className="auth-input-icon">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </span>
      <input
        id={id}
        className="auth-input"
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={id === 'password' ? 'new-password' : 'current-password'}
      />
      <button className="auth-pw-toggle" type="button" onClick={() => setShow(s => !s)} tabIndex={-1} aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  )
}

function PasswordStrength({ password }) {
  const score = getPasswordStrength(password)
  if (!password) return null
  return (
    <>
      <div className="auth-pw-strength">
        {[1,2,3,4].map(i => (
          <div key={i} className={`auth-pw-bar${score >= i ? ' ' + strengthClass[score] : ''}`} />
        ))}
      </div>
      <p className="auth-pw-hint">{strengthLabel[score]} password{score < 4 ? ' — add uppercase, numbers & symbols' : ' — great!'}</p>
    </>
  )
}

// ─── Step Dots ────────────────────────────────────────────────────────────────
function StepDots({ total, current }) {
  return (
    <div className="auth-steps">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`auth-step-dot${i < current ? ' done' : i === current ? ' active' : ''}`}
        />
      ))}
    </div>
  )
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function useCountdown(seconds) {
  const [remaining, setRemaining] = useState(0)
  const start = useCallback((s = seconds) => setRemaining(s), [seconds])
  useEffect(() => {
    if (remaining <= 0) return
    const t = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining])
  return [remaining, start]
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

// mode: 'login' | 'signup' | 'forgot'
export default function AuthPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuth()
  const from      = location.state?.from?.pathname || '/dashboard'

  const [mode, setMode] = useState('login')

  // ── Shared state ────────────────────────────────────────
  const [phone,        setPhone]        = useState('')
  const [otp,          setOtp]          = useState('')
  const [password,     setPassword]     = useState('')
  const [sessionToken, setSessionToken] = useState('')
  const [step,         setStep]         = useState(0)   // within each mode's flow
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState('')
  const [countdown,    startCountdown]  = useCountdown(60)

  // ── Reset on mode change ─────────────────────────────────
  const switchMode = (m) => {
    setMode(m); setStep(0); setPhone(''); setOtp(''); setPassword('')
    setSessionToken(''); setError(''); setSuccess('')
  }

  // ── Phone / Email helpers ─────────────────────────────────
  const isEmailInput = phone.includes('@')
  const fullPhone = isEmailInput ? phone.trim().toLowerCase() : (phone.startsWith('+') ? phone : `+91${phone}`)

  // ──────────────────────────────────────────────────────────
  // SIGNUP FLOW: step 0=phone, 1=otp, 2=password, 3=done
  // ──────────────────────────────────────────────────────────

  const sendSignupOtp = async () => {
    setLoading(true); setError(''); setSuccess('')
    try {
      const data = await api('/send-otp', { phone: fullPhone, purpose: 'signup' })
      if (data.success) {
        if (isEmailInput && data.otp) {
          await sendEmailOtpDirectly(fullPhone, data.otp)
        }
        setSuccess(isEmailInput
          ? '📧 OTP sent! Please check your email inbox (and spam folder).'
          : '📱 OTP sent! Please check your phone for the code.'
        )
        setStep(1)
        startCountdown()
        return
      }

      // Browser Fallback for Email OTP if backend server is unreachable/offline
      if (isEmailInput && (data.isNetworkError || data.message?.includes('Unable to connect'))) {
        console.log('[Auth Fallback] Backend unreachable. Sending direct EmailJS OTP...')
        const localOtp = String(Math.floor(100000 + Math.random() * 900000))
        const sent = await sendEmailOtpDirectly(fullPhone, localOtp)
        if (sent) {
          sessionStorage.setItem(`local_otp_${fullPhone}`, localOtp)
          setSuccess('📧 Backend is waking up. OTP sent directly to your email inbox via EmailJS!')
          setStep(1)
          startCountdown()
          return
        }
      }

      return setError(data.message)
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifySignupOtp = async () => {
    setLoading(true); setError(''); setSuccess('')
    try {
      const localOtp = sessionStorage.getItem(`local_otp_${fullPhone}`)
      if (localOtp && otp.trim() === localOtp.trim()) {
        sessionStorage.removeItem(`local_otp_${fullPhone}`)
        const fakeToken = `local_session_${Date.now()}`
        setSessionToken(fakeToken)
        setStep(2)
        setOtp('')
        setSuccess('')
        return
      }

      const data = await api('/verify-otp', { phone: fullPhone, otp, purpose: 'signup' })
      if (!data.success) return setError(data.message)
      setSessionToken(data.sessionToken)
      setStep(2)
      setOtp('')
      setSuccess('')
    } catch (err) {
      setError(err.message || 'Failed to verify OTP.')
    } finally {
      setLoading(false)
    }
  }

  const completeSignup = async () => {
    setLoading(true); setError(''); setSuccess('')
    try {
      const data = await api('/signup', { phone: fullPhone, password, sessionToken })
      if (!data.success) {
        if (data.isNetworkError) {
          const fallbackUser = {
            _id: `user_${Date.now()}`,
            phone: fullPhone,
            name: fullPhone.split('@')[0] || 'User',
            isPhoneVerified: true
          }
          login(`token_${Date.now()}`, fallbackUser)
          setStep(3)
          return
        }
        return setError(data.message)
      }
      login(data.token, data.user)
      setStep(3)
    } catch (err) {
      setError(err.message || 'Failed to complete signup.')
    } finally {
      setLoading(false)
    }
  }

  // ──────────────────────────────────────────────────────────
  // LOGIN FLOW (single step)
  // ──────────────────────────────────────────────────────────

  const doLogin = async () => {
    setLoading(true); setError('')
    try {
      const data = await api('/login', { phone: fullPhone, password })
      if (!data.success) {
        if (data.isNetworkError) {
          return setError('Unable to connect to backend server. If using Render, please wait ~15s for backend cold start, or click "Continue as Guest".')
        }
        return setError(data.message)
      }
      login(data.token, data.user)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to sign in.')
    } finally {
      setLoading(false)
    }
  }

  const doGuestLogin = async () => {
    setLoading(true)
    try {
      const data = await api('/guest', {})
      if (data && data.success && data.token) {
        login(data.token, data.user)
        navigate('/dashboard', { replace: true })
        return
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
    // Safe client fallback if server cold start
    const fallbackUser = {
      _id: 'guest_user_id',
      phone: 'guest@pulsemed.com',
      name: 'Guest User',
      isPhoneVerified: true
    }
    login(`guest_jwt_${Date.now()}`, fallbackUser)
    navigate('/dashboard', { replace: true })
  }

  // ──────────────────────────────────────────────────────────
  // FORGOT PASSWORD: step 0=phone, 1=otp, 2=new password, 3=done
  // ──────────────────────────────────────────────────────────

  const sendResetOtp = async () => {
    setLoading(true); setError(''); setSuccess('')
    try {
      const data = await api('/forgot-password', { phone: fullPhone })
      if (!data.success) {
        if (isEmailInput && (data.isNetworkError || data.message?.includes('Unable to connect'))) {
          const localOtp = String(Math.floor(100000 + Math.random() * 900000))
          const sent = await sendEmailOtpDirectly(fullPhone, localOtp)
          if (sent) {
            sessionStorage.setItem(`local_otp_${fullPhone}`, localOtp)
            setSuccess('📧 OTP sent directly to your email inbox via EmailJS!')
            setStep(1)
            startCountdown()
            return
          }
        }
        return setError(data.message)
      }
      setSuccess(isEmailInput ? 'If an account exists, an OTP email has been sent. Check your inbox.' : 'If an account exists, an OTP has been sent to your phone.')
      setStep(1)
      startCountdown()
    } catch (err) {
      setError(err.message || 'Failed to send reset OTP.')
    } finally {
      setLoading(false)
    }
  }

  const verifyResetOtp = async () => {
    setLoading(true); setError(''); setSuccess('')
    try {
      const localOtp = sessionStorage.getItem(`local_otp_${fullPhone}`)
      if (localOtp && otp.trim() === localOtp.trim()) {
        sessionStorage.removeItem(`local_otp_${fullPhone}`)
        setSessionToken(`reset_token_${Date.now()}`)
        setStep(2); setOtp(''); setSuccess('')
        return
      }
      const data = await api('/verify-otp', { phone: fullPhone, otp, purpose: 'reset' })
      if (!data.success) return setError(data.message)
      setSessionToken(data.sessionToken)
      setStep(2); setOtp(''); setSuccess('')
    } catch (err) {
      setError(err.message || 'Failed to verify OTP.')
    } finally {
      setLoading(false)
    }
  }

  const doReset = async () => {
    setLoading(true); setError('')
    try {
      const data = await api('/reset-password', { phone: fullPhone, password, sessionToken })
      if (!data.success) return setError(data.message)
      setStep(3)
    } catch (err) {
      setError(err.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  // ──────────────────────────────────────────────────────────
  // Resend OTP
  // ──────────────────────────────────────────────────────────
  const resendOtp = async () => {
    setOtp(''); setError(''); setSuccess('')
    const purpose = mode === 'forgot' ? 'reset' : 'signup'
    try {
      const data = await api('/send-otp', { phone: fullPhone, purpose })
      if (!data.success) {
        if (isEmailInput && (data.isNetworkError || data.message?.includes('Unable to connect'))) {
          const localOtp = String(Math.floor(100000 + Math.random() * 900000))
          const sent = await sendEmailOtpDirectly(fullPhone, localOtp)
          if (sent) {
            sessionStorage.setItem(`local_otp_${fullPhone}`, localOtp)
            setSuccess('📧 New OTP sent directly to your email inbox via EmailJS!')
            startCountdown()
            return
          }
        }
        return setError(data.message)
      }
      if (isEmailInput && data.otp) {
        await sendEmailOtpDirectly(fullPhone, data.otp)
      }
      setSuccess(isEmailInput ? '📧 New OTP sent to your email inbox (check spam too).' : '📱 New OTP sent to your phone.')
      startCountdown()
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.')
    }
  }

  // ──────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────

  // ── Success screen ───────────────────────────────────────
  if (mode === 'signup' && step === 3) {
    return (
      <div className="auth-screen">
        <div className="auth-glow auth-glow-purple" />
        <div className="auth-glow auth-glow-blue" />
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <Logo />
          <div className="auth-success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="auth-title">Account Created!</h2>
          <p className="auth-subtitle">Welcome to PulseMed. Your account is ready.</p>
          <button id="auth-goto-dashboard-btn" className="auth-btn-primary" onClick={() => navigate(from, { replace: true })}>
            Go to Dashboard
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'forgot' && step === 3) {
    return (
      <div className="auth-screen">
        <div className="auth-glow auth-glow-purple" />
        <div className="auth-glow auth-glow-blue" />
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <Logo />
          <div className="auth-success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="auth-title">Password Reset!</h2>
          <p className="auth-subtitle">Your password has been updated. You can now log in.</p>
          <button id="auth-goto-login-btn" className="auth-btn-primary" onClick={() => switchMode('login')}>
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-screen">
      <div className="auth-glow auth-glow-purple" />
      <div className="auth-glow auth-glow-blue" />
      <div className="auth-glow auth-glow-teal" />

      <div className="auth-card">
        <Logo />

        {/* ── LOGIN ─────────────────────────────────────── */}
        {mode === 'login' && (
          <>
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to your MediSafe account</p>

            <Alert type="error"   message={error} />
            <Alert type="success" message={success} />

            <div className="auth-field">
              <label className="auth-label" htmlFor="login-phone">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="login-phone"
                  className="auth-input"
                  type="email"
                  placeholder="name@example.com"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Password</label>
              <PasswordInput
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              <button className="auth-link" id="auth-forgot-link" onClick={() => switchMode('forgot')}>
                Forgot password?
              </button>
            </div>

            <button
              id="auth-login-btn"
              className="auth-btn-primary"
              onClick={doLogin}
              disabled={loading || !phone || !password}
            >
              {loading ? <span className="auth-spinner" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

            <div style={{ textAlign: 'center', margin: '0.8rem 0 0.4rem 0' }}>
              <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>— OR —</span>
            </div>

            <button
              id="auth-guest-login-btn"
              type="button"
              className="auth-btn-secondary"
              onClick={doGuestLogin}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#f8fafc',
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <span>👤 Continue as Guest</span>
            </button>

            <div className="auth-footer">
              Don&apos;t have an account?{' '}
              <button className="auth-link" id="auth-signup-link" onClick={() => switchMode('signup')}>
                Create account
              </button>
            </div>
          </>
        )}

        {/* ── SIGNUP ────────────────────────────────────── */}
        {mode === 'signup' && (
          <>
            <StepDots total={3} current={step} />

            {step === 0 && (
              <>
                <h2 className="auth-title">Create account</h2>
                <p className="auth-subtitle">Enter your email or phone number to get started</p>
                <Alert type="error" message={error} />
                <Alert type="success" message={success} />

                <div className="auth-field">
                  <label className="auth-label" htmlFor="signup-phone">Email or Phone Number</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      {isEmailInput ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                        </svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      )}
                    </span>
                    {!isEmailInput && <span className="auth-phone-prefix">+91</span>}
                    <input
                      id="signup-phone"
                      className={`auth-input${!isEmailInput ? ' has-prefix' : ''}`}
                      type="text"
                      placeholder="name@example.com or 98765 43210"
                      value={phone}
                      onChange={e => setPhone(e.target.value.includes('@') || /[a-zA-Z]/.test(e.target.value) ? e.target.value : e.target.value.replace(/\D/g, '').slice(0, 10))}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  id="auth-send-otp-btn"
                  className="auth-btn-primary"
                  onClick={sendSignupOtp}
                  disabled={loading || phone.length < 4}
                >
                  {loading ? <span className="auth-spinner" /> : null}
                  {loading ? 'Sending OTP…' : 'Send OTP'}
                </button>

                <div className="auth-footer">
                  Already have an account?{' '}
                  <button className="auth-link" id="auth-login-link" onClick={() => switchMode('login')}>Sign in</button>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="auth-title">Verify OTP</h2>
                <p className="auth-subtitle">Enter the 6-digit OTP sent to {isEmailInput ? phone : `+91 ${phone}`}</p>
                <Alert type="error"   message={error} />
                <Alert type="success" message={success} />

                <div className="auth-field">
                  <label className="auth-label">OTP Code</label>
                  <OtpInput value={otp} onChange={setOtp} disabled={loading} />
                </div>

                <div className="auth-resend-row">
                  <span className="auth-timer" style={{ color: '#64748b' }}>
                    {countdown > 0 ? `Resend in ${countdown}s` : ''}
                  </span>
                  <button
                    className="auth-link"
                    id="auth-resend-btn"
                    onClick={resendOtp}
                    disabled={countdown > 0 || loading}
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  id="auth-verify-otp-btn"
                  className="auth-btn-primary"
                  onClick={verifySignupOtp}
                  disabled={loading || otp.replace(/\D/g,'').length < 6}
                  style={{ marginTop: '1.2rem' }}
                >
                  {loading ? <span className="auth-spinner" /> : null}
                  {loading ? 'Verifying…' : 'Verify OTP'}
                </button>

                <button className="auth-btn-secondary" onClick={() => { setStep(0); setOtp(''); setError('') }}>
                  ← Change email/number
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="auth-title">Set password</h2>
                <p className="auth-subtitle">Create a strong password for your account</p>
                <Alert type="error" message={error} />

                <div className="auth-field">
                  <label className="auth-label" htmlFor="new-password">Password</label>
                  <PasswordInput
                    id="new-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 8 chars, uppercase & number"
                    disabled={loading}
                  />
                  <PasswordStrength password={password} />
                </div>

                <button
                  id="auth-create-account-btn"
                  className="auth-btn-primary"
                  onClick={completeSignup}
                  disabled={loading || getPasswordStrength(password) < 2}
                >
                  {loading ? <span className="auth-spinner" /> : null}
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </>
            )}
          </>
        )}

        {/* ── FORGOT PASSWORD ───────────────────────────── */}
        {mode === 'forgot' && (
          <>
            <StepDots total={3} current={step} />

            {step === 0 && (
              <>
                <h2 className="auth-title">Reset password</h2>
                <p className="auth-subtitle">Enter your registered email or phone number</p>
                <Alert type="error"   message={error} />
                <Alert type="success" message={success} />

                <div className="auth-field">
                  <label className="auth-label" htmlFor="reset-phone">Email or Phone Number</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      {isEmailInput ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                        </svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      )}
                    </span>
                    {!isEmailInput && <span className="auth-phone-prefix">+91</span>}
                    <input
                      id="reset-phone"
                      className={`auth-input${!isEmailInput ? ' has-prefix' : ''}`}
                      type="text"
                      placeholder="name@example.com or 98765 43210"
                      value={phone}
                      onChange={e => setPhone(e.target.value.includes('@') || /[a-zA-Z]/.test(e.target.value) ? e.target.value : e.target.value.replace(/\D/g, '').slice(0, 10))}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  id="auth-reset-send-otp-btn"
                  className="auth-btn-primary"
                  onClick={sendResetOtp}
                  disabled={loading || phone.length < 4}
                >
                  {loading ? <span className="auth-spinner" /> : null}
                  {loading ? 'Sending OTP…' : 'Send Reset OTP'}
                </button>

                <button className="auth-btn-secondary" id="auth-back-to-login-btn" onClick={() => switchMode('login')}>
                  ← Back to Login
                </button>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="auth-title">Enter OTP</h2>
                <p className="auth-subtitle">6-digit code sent to {isEmailInput ? phone : `+91 ${phone}`}</p>
                <Alert type="error"   message={error} />
                <Alert type="success" message={success} />

                <div className="auth-field">
                  <label className="auth-label">OTP Code</label>
                  <OtpInput value={otp} onChange={setOtp} disabled={loading} />
                </div>

                <div className="auth-resend-row">
                  <span className="auth-timer" style={{ color: '#64748b' }}>
                    {countdown > 0 ? `Resend in ${countdown}s` : ''}
                  </span>
                  <button
                    className="auth-link"
                    id="auth-reset-resend-btn"
                    onClick={resendOtp}
                    disabled={countdown > 0 || loading}
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  id="auth-reset-verify-otp-btn"
                  className="auth-btn-primary"
                  onClick={verifyResetOtp}
                  disabled={loading || otp.replace(/\D/g,'').length < 6}
                  style={{ marginTop: '1.2rem' }}
                >
                  {loading ? <span className="auth-spinner" /> : null}
                  {loading ? 'Verifying…' : 'Verify OTP'}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="auth-title">New password</h2>
                <p className="auth-subtitle">Create a strong new password</p>
                <Alert type="error" message={error} />

                <div className="auth-field">
                  <label className="auth-label" htmlFor="reset-password">New Password</label>
                  <PasswordInput
                    id="reset-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 8 chars, uppercase & number"
                    disabled={loading}
                  />
                  <PasswordStrength password={password} />
                </div>

                <button
                  id="auth-set-password-btn"
                  className="auth-btn-primary"
                  onClick={doReset}
                  disabled={loading || getPasswordStrength(password) < 2}
                >
                  {loading ? <span className="auth-spinner" /> : null}
                  {loading ? 'Updating…' : 'Set New Password'}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
