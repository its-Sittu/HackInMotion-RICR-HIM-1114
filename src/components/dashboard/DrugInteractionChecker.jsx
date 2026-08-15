import React, { useState } from 'react'
import { saveActivityToMedicalHistory } from '../../utils/activityLogger'
import { getApiUrl } from '../../utils/apiConfig'

const POPULAR_INTERACTIONS = [
  { drug1: 'Dolo 650', drug2: 'Combiflam', label: '⚡ Dolo 650 + Combiflam' },
  { drug1: 'Aspirin 75', drug2: 'Ibuprofen 400', label: '⚡ Aspirin + Ibuprofen' },
  { drug1: 'Pantocid 40', drug2: 'Amoxicillin 500', label: '⚡ Pantocid 40 + Amoxicillin' },
  { drug1: 'Cetirizine 10', drug2: 'Paracetamol 650', label: '⚡ Cetirizine + Paracetamol' }
]

export default function DrugInteractionChecker() {
  const [drug1, setDrug1] = useState('')
  const [drug2, setDrug2] = useState('')
  const [drug3, setDrug3] = useState('')
  const [showThird, setShowThird] = useState(false)

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleCheck = async (d1Override, d2Override) => {
    const d1 = d1Override || drug1
    const d2 = d2Override || drug2

    if (!d1.trim() || !d2.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch(getApiUrl('/api/medicines/check-interaction'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drug1: d1.trim(),
          drug2: d2.trim(),
          drug3: showThird && drug3.trim() ? drug3.trim() : ''
        })
      })
      const data = await res.json()
      if (data.success) {
        setResult(data)

        const isHigh = data.severity === 'high'
        const isMod = data.severity === 'moderate'

        saveActivityToMedicalHistory({
          title: `Interaction Check: ${d1} + ${d2}`,
          category: 'Drug Interactions',
          typeIcon: '🧪',
          status: isHigh ? 'HIGH RISK 🚨' : isMod ? 'CAUTION ⚠️' : 'SAFE ✅',
          statusBg: isHigh ? '#ffe4e6' : isMod ? '#fef3c7' : '#d1fae5',
          statusColor: isHigh ? '#be123c' : isMod ? '#b45309' : '#059669',
          summary: data.summary || `Interaction check between ${d1} and ${d2}`,
          doctorNote: data.note || `Source: ${data.source || 'FDA Clinical Safety Database'}`,
          details: [
            `Medicines Checked: ${d1}, ${d2} ${showThird && drug3.trim() ? `, ${drug3.trim()}` : ''}`,
            `Risk Classification: ${data.riskClassification || 'Interaction Evaluated'}`,
            `Source: ${data.source || 'FDA Database & Gemini AI'}`
          ]
        })
      }
    } catch {
      setResult({
        success: false,
        severity: 'high',
        summary: 'Network error checking real drug interaction. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleQuickPair = (d1, d2) => {
    setDrug1(d1)
    setDrug2(d2)
    handleCheck(d1, d2)
  }

  return (
    <div style={{ marginTop: '-0.4rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
        @keyframes scanBeam {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── ULTRA-PROFESSIONAL ENTERPRISE HERO BANNER ────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #111827 40%, #1e1b4b 100%)',
        borderRadius: '22px',
        padding: '1.8rem 2rem',
        marginBottom: '1.6rem',
        color: '#ffffff',
        boxShadow: '0 20px 50px -15px rgba(15, 23, 42, 0.6)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Subtle Decorative Background Mesh Grid */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Header Row: Title & Badges on Left, Enterprise Metrics on Right */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.2rem' }}>
            
            {/* Left Header Block */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                width: '50px',
                height: '50px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                fontSize: '1.45rem',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
                flexShrink: 0,
                marginTop: '0.1rem'
              }}>
                🛡️
              </div>

              <div>
                {/* Meta Sub-label & Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                  <span style={{
                    color: '#818cf8',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase'
                  }}>
                    FDA & Clinical Safety Intelligence
                  </span>

                  <span style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(52, 211, 153, 0.35)',
                    padding: '0.18rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <span style={{ width: '6px', height: '6px', backgroundColor: '#34d399', borderRadius: '50%', display: 'inline-block', animation: 'pulseDot 1.8s infinite' }} />
                    LIVE FDA INTEL v3.5
                  </span>
                </div>

                <h1 style={{
                  fontSize: '1.7rem',
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: '-0.5px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Real-Time Drug-to-Drug Interaction Checker
                </h1>
              </div>
            </div>

            {/* Right Enterprise Quick Stats Cards */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                padding: '0.5rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem'
              }}>
                <span style={{ fontSize: '1rem' }}>📊</span>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Database</span>
                  <strong style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 700 }}>24k+ FDA Drugs</strong>
                </div>
              </div>

              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                padding: '0.5rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem'
              }}>
                <span style={{ fontSize: '1rem' }}>⚡</span>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Analysis Engine</span>
                  <strong style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 700 }}>Pharmacology AI</strong>
                </div>
              </div>
            </div>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 1.4rem 0', maxWidth: '760px', lineHeight: 1.5 }}>
            Check real-time FDA safety alerts, toxic drug combinations, dosage conflicts, and time gap rules before taking multiple medicines together.
          </p>

          {/* Form Input Grid with Uniform 100% Equal Baseline Alignment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '960px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: showThird ? 'repeat(3, 1fr)' : '1fr 1fr',
              gap: '1rem',
              alignItems: 'start'
            }}>
              {/* Drug 1 */}
              <div>
                <div style={{ minHeight: '2.5rem', display: 'flex', alignItems: 'flex-end', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700, lineHeight: 1.25 }}>
                    First Medicine (Dolo 650 / Paracetamol)
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Enter 1st Medicine name..."
                  value={drug1}
                  onChange={(e) => setDrug1(e.target.value)}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '12px',
                    border: '2px solid rgba(168, 85, 247, 0.4)',
                    backgroundColor: '#ffffff',
                    padding: '0 1rem',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }}
                />
              </div>

              {/* Drug 2 */}
              <div>
                <div style={{ minHeight: '2.5rem', display: 'flex', alignItems: 'flex-end', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700, lineHeight: 1.25 }}>
                    Second Medicine (Combiflam / Ibuprofen)
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Enter 2nd Medicine name..."
                  value={drug2}
                  onChange={(e) => setDrug2(e.target.value)}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '12px',
                    border: '2px solid rgba(168, 85, 247, 0.4)',
                    backgroundColor: '#ffffff',
                    padding: '0 1rem',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }}
                />
              </div>

              {/* Drug 3 (Optional) — Equal Baseline Alignment */}
              {showThird && (
                <div style={{ animation: 'fadeInUp 0.3s ease' }}>
                  <div style={{ minHeight: '2.5rem', display: 'flex', alignItems: 'flex-end', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700, lineHeight: 1.25 }}>
                      Third Medicine (Pantocid 40 / Optional)
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter 3rd Medicine name..."
                    value={drug3}
                    onChange={(e) => setDrug3(e.target.value)}
                    style={{
                      width: '100%',
                      height: '46px',
                      borderRadius: '12px',
                      border: '2px solid rgba(168, 85, 247, 0.4)',
                      backgroundColor: '#ffffff',
                      padding: '0 1rem',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Left-Aligned Action Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '1.2rem', marginTop: '0.4rem' }}>
              <button
                type="button"
                onClick={() => handleCheck()}
                disabled={loading || !drug1.trim() || !drug2.trim()}
                style={{
                  height: '40px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0 1.35rem',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  letterSpacing: '0.2px',
                  cursor: loading || !drug1.trim() || !drug2.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !drug1.trim() || !drug2.trim() ? 0.6 : 1,
                  boxShadow: '0 6px 18px rgba(168, 85, 247, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '0.95rem' }}>⚡</span>
                <span>{loading ? 'Scanning FDA Data...' : 'Check Real Drug Interaction'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowThird(prev => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a5b4fc',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                {showThird ? '➖ Remove 3rd Medicine' : '➕ Add 3rd Medicine'}
              </button>
            </div>
          </div>

          {/* Popular Quick Pairs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ color: '#a5b4fc', fontSize: '0.78rem', fontWeight: 700 }}>Popular Checks:</span>
            {POPULAR_INTERACTIONS.map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleQuickPair(item.drug1, item.drug2)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '10px',
                  padding: '0.22rem 0.65rem',
                  color: '#f1f5f9',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── LOADING STATE ─────────────────────────────────────────── */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '2.8rem 2rem',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e9d5ff',
          boxShadow: '0 10px 30px rgba(168, 85, 247, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #a855f7, transparent)',
            animation: 'scanBeam 1.5s infinite linear'
          }} />

          <div style={{
            width: '42px',
            height: '42px',
            border: '3.5px solid #f3e8ff',
            borderTop: '3.5px solid #a855f7',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <h4 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.3rem 0' }}>
            ⚡ Scanning Molecular Interactions & FDA Databases
          </h4>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Evaluating drug interactions for <strong>{drug1}</strong> + <strong>{drug2}</strong>…
          </p>
        </div>
      )}

      {/* ── 4 STRICT CATEGORIES INTERACTION RESULTS PANEL ──────────────────────────────── */}
      {!loading && result && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '22px',
          border: result.severity === 'high' ? '1px solid #fecdd3' :
                  result.severity === 'moderate' ? '1px solid #fde68a' : '1px solid #a7f3d0',
          padding: '1.8rem',
          boxShadow: '0 12px 35px rgba(0,0,0,0.05)',
          position: 'relative',
          animation: 'fadeInUp 0.35s ease-out'
        }}>
          
          {/* ────────────────────────────────────────────────────────────
              CATEGORY 1: RISK CLASSIFICATION BADGE & HEADER
             ──────────────────────────────────────────────────────────── */}
          <div style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.8rem',
            marginBottom: '1.4rem',
            paddingBottom: '0.9rem',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{
                backgroundColor: result.severity === 'high' ? '#ffe4e6' :
                                 result.severity === 'moderate' ? '#fef3c7' : '#d1fae5',
                color: result.severity === 'high' ? '#be123c' :
                       result.severity === 'moderate' ? '#b45309' : '#047857',
                border: result.severity === 'high' ? '1px solid #fecdd3' :
                        result.severity === 'moderate' ? '1px solid #fde68a' : '1px solid #a7f3d0',
                padding: '0.45rem 0.95rem',
                borderRadius: '12px',
                fontSize: '0.86rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: result.severity === 'high' ? '0 4px 12px rgba(225, 29, 72, 0.12)' : 'none'
              }}>
                {result.severity === 'high' ? '🚨' : result.severity === 'moderate' ? '⚠️' : '✅'}
                <span>{result.riskClassification || (result.severity === 'high' ? 'HIGH INTERACTION RISK' : result.severity === 'moderate' ? 'MODERATE CAUTION REQUIRED' : 'SAFE COMBINATION')}</span>
              </span>

              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                {result.source || 'FDA & Clinical Pharmacology Check'}
              </span>
            </div>

            <span style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 700 }}>
              Checked: <strong>{result.drug1}</strong> ⚡ <strong>{result.drug2}</strong> {result.drug3 ? `⚡ ${result.drug3}` : ''}
            </span>
          </div>

          {/* ────────────────────────────────────────────────────────────
              CATEGORY 2: 📌 QUICK SUMMARY (IN SHORT)
             ──────────────────────────────────────────────────────────── */}
          <div style={{
            backgroundColor: result.severity === 'high' ? '#fff1f2' :
                             result.severity === 'moderate' ? '#fffbeb' : '#f0f9ff',
            borderLeft: result.severity === 'high' ? '5px solid #e11d48' :
                        result.severity === 'moderate' ? '5px solid #f59e0b' : '5px solid #0284c7',
            borderRadius: '14px',
            padding: '1.15rem 1.35rem',
            marginBottom: '1.3rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.1rem' }}>📌</span>
              <strong style={{
                color: result.severity === 'high' ? '#be123c' :
                       result.severity === 'moderate' ? '#b45309' : '#0369a1',
                fontSize: '0.88rem',
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
              }}>
                Quick Summary (In Short)
              </strong>
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.96rem',
              color: result.severity === 'high' ? '#881337' :
                     result.severity === 'moderate' ? '#78350f' : '#0c4a6e',
              fontWeight: 600,
              lineHeight: 1.55
            }}>
              {result.summary}
            </p>
          </div>

          {/* ────────────────────────────────────────────────────────────
              CATEGORY 3: 💡 IMPORTANT KEY POINTS (BULLET POINTS)
             ──────────────────────────────────────────────────────────── */}
          <div style={{
            backgroundColor: '#fafafa',
            borderRadius: '14px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem 1.4rem',
            marginBottom: '1.3rem'
          }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>💡</span> Important Key Points (Interaction Mechanism)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Array.isArray(result.bullets) ? (
                result.bullets.map((bText, bIdx) => (
                  <div key={bIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.93rem', color: '#334155', lineHeight: 1.6 }}>
                    <span style={{ color: '#6366f1', fontSize: '1.1rem', lineHeight: 1, marginTop: '0.15rem' }}>•</span>
                    <span>{bText}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.93rem', color: '#334155', lineHeight: 1.6 }}>
                  {result.details || 'No high-risk biochemical interference reported between these compounds.'}
                </div>
              )}
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────
              CATEGORY 4: ⚠️ IMPORTANT NOTE & SAFETY GUIDELINES
             ──────────────────────────────────────────────────────────── */}
          <div style={{
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            borderLeft: '5px solid #e11d48',
            borderRadius: '14px',
            padding: '1.2rem 1.4rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '1.1rem' }}>⚠️</span>
              <strong style={{ color: '#be123c', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Important Note & Safety Guidelines
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#881337', lineHeight: 1.55, fontWeight: 500 }}>
              {result.note || result.recommendation || 'Always maintain at least 4 to 6 hours gap between active medications to prevent dosage overlaps and stomach irritation.'}
            </p>
          </div>

          {/* Doctor Disclaimer */}
          <div style={{ marginTop: '1.3rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.95rem' }}>👨‍⚕️</span>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontStyle: 'italic' }}>
              PulseMed Real Drug Interaction Checker uses FDA clinical data and Gemini AI. Always consult your prescribing doctor before changing prescribed medicine schedules.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
