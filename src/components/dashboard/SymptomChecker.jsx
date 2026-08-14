import React, { useState } from 'react'

const BODY_PARTS_FRONT = [
  { id: 'head', name: 'Head / Brain', icon: '🧠', coords: 'Top Center' },
  { id: 'neck', name: 'Neck / Throat', icon: '🦒', coords: 'Upper Middle' },
  { id: 'chest', name: 'Chest / Lungs / Heart', icon: '🫀', coords: 'Chest Region' },
  { id: 'stomach', name: 'Stomach / Abdomen', icon: '🫄', coords: 'Abdominal Region' },
  { id: 'right_arm', name: 'Right Arm', icon: '💪', coords: 'Upper Right' },
  { id: 'right_hand', name: 'Right Hand', icon: '✋', coords: 'Lower Right' },
  { id: 'left_arm', name: 'Left Arm', icon: '💪', coords: 'Upper Left' },
  { id: 'left_hand', name: 'Left Hand', icon: '🤚', coords: 'Lower Left' },
  { id: 'right_leg', name: 'Right Leg', icon: '🦵', coords: 'Leg Right' },
  { id: 'left_leg', name: 'Left Leg', icon: '🦵', coords: 'Leg Left' }
]

const BODY_PARTS_BACK = [
  { id: 'head_back', name: 'Head / Occipital', icon: '🧠', coords: 'Upper Back Head' },
  { id: 'neck_back', name: 'Upper Spine / Neck', icon: '🦴', coords: 'Cervical Spine' },
  { id: 'upper_back', name: 'Upper Back / Shoulders', icon: '🪨', coords: 'Thoracic Region' },
  { id: 'lower_back', name: 'Lower Back / Lumbar', icon: '⚡', coords: 'Lumbar Region' },
  { id: 'glutes', name: 'Hip / Glutes', icon: '🦵', coords: 'Pelvic Region' },
  { id: 'right_leg_back', name: 'Right Calf / Hamstring', icon: '🦵', coords: 'Lower Right Back' },
  { id: 'left_leg_back', name: 'Left Calf / Hamstring', icon: '🦵', coords: 'Lower Left Back' }
]

export default function SymptomChecker() {
  const [viewMode, setViewMode] = useState('front') // 'front' | 'back'
  const [selectedParts, setSelectedParts] = useState(['Right Arm', 'Right Hand'])
  const [description, setDescription] = useState('')
  const [reportFile, setReportFile] = useState(null)

  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)

  const currentPartsList = viewMode === 'front' ? BODY_PARTS_FRONT : BODY_PARTS_BACK

  const toggleBodyPart = (partName) => {
    setSelectedParts(prev => {
      if (prev.includes(partName)) {
        return prev.filter(p => p !== partName)
      } else {
        return [...prev, partName]
      }
    })
  }

  const removePart = (partName) => {
    setSelectedParts(prev => prev.filter(p => p !== partName))
  }

  const handleRunAnalysis = async () => {
    if (selectedParts.length === 0 && !description.trim()) return

    setLoading(true)
    setAnalysisResult(null)

    try {
      const res = await fetch('/api/medicines/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bodyParts: selectedParts,
          description: description.trim(),
          viewMode: viewMode === 'front' ? 'Front View' : 'Back View'
        })
      })
      const data = await res.json()
      if (data.success) {
        setAnalysisResult(data)
      }
    } catch {
      setAnalysisResult({
        success: false,
        summary: 'Network error performing clinical analysis. Please try again.'
      })
    } finally {
      setLoading(false)
    }
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

      {/* ── ULTRA-EXECUTIVE HERO BANNER ───────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #111827 40%, #064e3b 100%)',
        borderRadius: '22px',
        padding: '1.8rem 2rem',
        marginBottom: '1.6rem',
        color: '#ffffff',
        boxShadow: '0 20px 50px -15px rgba(15, 23, 42, 0.6)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 40%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                width: '50px',
                height: '50px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                fontSize: '1.45rem',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
                flexShrink: 0,
                marginTop: '0.1rem'
              }}>
                🩺
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                  <span style={{
                    color: '#34d399',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase'
                  }}>
                    Interactive Clinical Diagnostic Engine
                  </span>

                  <span style={{
                    backgroundColor: 'rgba(52, 211, 153, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(52, 211, 153, 0.35)',
                    padding: '0.18rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <span style={{ width: '6px', height: '6px', backgroundColor: '#34d399', borderRadius: '50%', display: 'inline-block', animation: 'pulseDot 1.8s infinite' }} />
                    100% PROBABILITY ENGINE
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
                  Body Map Symptom & Clinical Analyzer
                </h1>
              </div>
            </div>

            {/* Selected Count Indicator */}
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              borderRadius: '14px',
              padding: '0.5rem 0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '0.9rem' }}>🎯</span>
              <span style={{ fontSize: '0.82rem', color: '#a7f3d0', fontWeight: 700 }}>
                {selectedParts.length} Body Area{selectedParts.length !== 1 ? 's' : ''} Selected
              </span>
            </div>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, maxWidth: '760px', lineHeight: 1.5 }}>
            Select affected body regions on the interactive map, describe your symptoms, and receive an AI clinical analysis broken down into <strong>Top 5 expected causes totaling 100% probability</strong>.
          </p>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN LAYOUT: BODY MAP (LEFT) & SYMPTOM FORM (RIGHT) ────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '1.6rem',
        marginBottom: '1.8rem',
        alignItems: 'stretch'
      }}>

        {/* ── LEFT PANEL: INTERACTIVE BODY MAP ──────────────────────────── */}
        <div style={{
          backgroundColor: '#090d16',
          borderRadius: '22px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1.6rem',
          boxShadow: '0 12px 35px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          color: '#ffffff'
        }}>
          <div>
            {/* Header & View Mode Switcher */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                  Body Map
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
                  {viewMode === 'front' ? 'Front View' : 'Back View'} • Tap to Select Area
                </span>
              </div>

              {/* View Switcher Pills */}
              <div style={{
                display: 'inline-flex',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                padding: '0.2rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <button
                  type="button"
                  onClick={() => setViewMode('front')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '9px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'front' ? '#10b981' : 'transparent',
                    color: viewMode === 'front' ? '#ffffff' : '#cbd5e1',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Front View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('back')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '9px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'back' ? '#10b981' : 'transparent',
                    color: viewMode === 'back' ? '#ffffff' : '#cbd5e1',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Back View
                </button>
              </div>
            </div>

            {/* 2D Anatomy Map Grid with Interactive Glowing Body Regions */}
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '1.2rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.8rem',
              minHeight: '340px',
              alignContent: 'center'
            }}>
              {currentPartsList.map(part => {
                const isSelected = selectedParts.includes(part.name)
                return (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => toggleBodyPart(part.name)}
                    style={{
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '0.75rem 0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 0 16px rgba(16, 185, 129, 0.35)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{part.icon}</span>
                      <div style={{ textAlign: 'left' }}>
                        <span style={{
                          display: 'block',
                          fontSize: '0.84rem',
                          fontWeight: isSelected ? 800 : 600,
                          color: isSelected ? '#34d399' : '#f1f5f9'
                        }}>
                          {part.name}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{part.coords}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <span style={{
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        padding: '0.18rem 0.45rem',
                        borderRadius: '6px',
                        letterSpacing: '0.5px'
                      }}>
                        SELECTED
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tip Note */}
          <div style={{
            marginTop: '1.2rem',
            paddingTop: '0.8rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1rem', color: '#38bdf8' }}>ℹ️</span>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.4 }}>
              <strong>Tip:</strong> Tap any body area above to toggle selection. Multiple areas can be selected simultaneously for comprehensive clinical assessment.
            </span>
          </div>
        </div>

        {/* ── RIGHT PANEL: SYMPTOM INPUT FORM ───────────────────────────── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '22px',
          border: '1px solid #e2e8f0',
          padding: '1.6rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between'
        }}>
          <div>
            {/* 1. AFFECTED AREAS CHIPS */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>
                1. Affected Areas Selected
              </label>

              <div style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #10b981',
                borderRadius: '14px',
                padding: '0.85rem 1rem',
                minHeight: '52px',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                {selectedParts.length > 0 ? (
                  selectedParts.map(partName => (
                    <span key={partName} style={{
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                      borderRadius: '10px',
                      padding: '0.3rem 0.7rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <span>✓ {partName}</span>
                      <button
                        type="button"
                        onClick={() => removePart(partName)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#059669',
                          cursor: 'pointer',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          padding: 0,
                          marginLeft: '0.2rem'
                        }}
                      >
                        ✕
                      </button>
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.84rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    No body region selected. Tap areas on the Body Map left.
                  </span>
                )}
              </div>
            </div>

            {/* 2. SYMPTOMS / ALLERGIES DESCRIPTION TEXTAREA */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>
                2. Symptoms / Pain Description / Allergies
              </label>

              <textarea
                placeholder="Describe your symptoms in detail e.g. Sharp throbbing pain after eating, duration (2 days), severity (scale 1-10), or food allergies..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                style={{
                  width: '100%',
                  borderRadius: '14px',
                  border: '1.5px solid #10b981',
                  backgroundColor: '#ffffff',
                  padding: '0.85rem 1rem',
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.05)'
                }}
              />
            </div>

            {/* 3. UPLOAD PHOTO OR REPORT (PDF) DROPZONE */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>
                3. Upload Photo or Medical Report (PDF / Optional)
              </label>

              <div style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '14px',
                backgroundColor: '#f8fafc',
                padding: '1.1rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.3rem' }}>📤</span>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'block' }}>
                  {reportFile ? `Attached: ${reportFile.name}` : 'Click to attach Lab Report (PDF) or Skin Photo'}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  Supports PNG, JPG, PDF up to 10MB
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setReportFile(e.target.files[0] || null)}
                  style={{ display: 'none' }}
                  id="report-file-upload"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleRunAnalysis}
            disabled={loading || (selectedParts.length === 0 && !description.trim())}
            style={{
              width: '100%',
              height: '48px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '0.94rem',
              fontWeight: 800,
              cursor: loading || (selectedParts.length === 0 && !description.trim()) ? 'not-allowed' : 'pointer',
              opacity: loading || (selectedParts.length === 0 && !description.trim()) ? 0.6 : 1,
              boxShadow: '0 8px 22px rgba(16, 185, 129, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justify: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <span>⚡</span>
            <span>{loading ? 'Running AI Clinical Diagnostic...' : 'Run Clinical Analysis >'}</span>
          </button>
        </div>
      </div>

      {/* ── LOADING SCANNER STATE ─────────────────────────────────────── */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '2.8rem 2rem',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #a7f3d0',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '1.8rem'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
            animation: 'scanBeam 1.5s infinite linear'
          }} />

          <div style={{
            width: '42px',
            height: '42px',
            border: '3.5px solid #d1fae5',
            borderTop: '3.5px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <h4 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.3rem 0' }}>
            ⚡ Evaluating Symptoms Across 24k+ Clinical Patterns
          </h4>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Analyzing <strong>{selectedParts.join(', ')}</strong> with Google Gemini 3.5 Flash AI Engine…
          </p>
        </div>
      )}

      {/* ── 5 PROBABILITY-RANKED CLINICAL DIAGNOSTIC RESULTS PANEL ────────────────── */}
      {!loading && analysisResult && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '22px',
          border: '1px solid #a7f3d0',
          padding: '1.8rem',
          boxShadow: '0 12px 35px rgba(0,0,0,0.05)',
          position: 'relative',
          animation: 'fadeInUp 0.35s ease-out'
        }}>
          {/* Header Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.4rem', paddingBottom: '0.9rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{
                backgroundColor: '#d1fae5',
                color: '#059669',
                border: '1px solid #a7f3d0',
                padding: '0.45rem 0.95rem',
                borderRadius: '12px',
                fontSize: '0.86rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                📊 100% PROBABILITY DISTRIBUTION ANALYSIS
              </span>

              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                {analysisResult.provider || 'Gemini 3.5 Flash Clinical Engine'}
              </span>
            </div>

            <span style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 700 }}>
              Regions Evaluated: <strong>{analysisResult.bodyParts ? analysisResult.bodyParts.join(', ') : 'Selected Areas'}</strong>
            </span>
          </div>

          {/* Clinical Executive Summary */}
          <div style={{
            backgroundColor: '#f0f9ff',
            borderLeft: '5px solid #0284c7',
            borderRadius: '14px',
            padding: '1.15rem 1.35rem',
            marginBottom: '1.4rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.1rem' }}>📌</span>
              <strong style={{ color: '#0369a1', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Overall Clinical Assessment
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.96rem', color: '#0c4a6e', fontWeight: 600, lineHeight: 1.55 }}>
              {analysisResult.summary}
            </p>
          </div>

          {/* Top 5 Expected Causes Totaling 100% Probability */}
          <div style={{ marginBottom: '1.4rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span>🩺</span> Top 5 Expected Medical Causes (Percentage Probability Breakdown)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Array.isArray(analysisResult.conditions) && analysisResult.conditions.map((cond, idx) => {
                const pct = cond.percentage || 20
                const isHigh = cond.risk === 'high'
                const isMod = cond.risk === 'moderate'

                const barColor = isHigh ? 'linear-gradient(90deg, #ef4444, #dc2626)' :
                                 isMod ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
                                 'linear-gradient(90deg, #10b981, #059669)'

                return (
                  <div key={idx} style={{
                    backgroundColor: '#fafafa',
                    borderRadius: '16px',
                    border: '1px solid #f1f5f9',
                    padding: '1.1rem 1.3rem'
                  }}>
                    {/* Title & Percentage Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <span style={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'center',
                          fontSize: '0.76rem',
                          fontWeight: 800
                        }}>
                          {idx + 1}
                        </span>
                        <strong style={{ fontSize: '0.98rem', color: '#0f172a', fontWeight: 800 }}>
                          {cond.name}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{
                          backgroundColor: isHigh ? '#ffe4e6' : isMod ? '#fef3c7' : '#d1fae5',
                          color: isHigh ? '#be123c' : isMod ? '#b45309' : '#047857',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '8px',
                          textTransform: 'uppercase'
                        }}>
                          {cond.risk || 'Low Risk'}
                        </span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                          {pct}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      height: '8px',
                      width: '100%',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      marginBottom: '0.7rem'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: barColor,
                        borderRadius: '10px',
                        transition: 'width 0.6s ease'
                      }} />
                    </div>

                    {/* Clinical Explanation & Action Step */}
                    <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <div><strong>Reasoning:</strong> {cond.explanation}</div>
                      {cond.action && (
                        <div style={{ color: '#059669', fontWeight: 600 }}>
                          <strong>Recommended Care:</strong> {cond.action}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Safety Warning Red-Flag Callout */}
          {analysisResult.safetyWarning && (
            <div style={{
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderLeft: '5px solid #e11d48',
              borderRadius: '14px',
              padding: '1.15rem 1.35rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                <strong style={{ color: '#be123c', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Emergency Warning Signals (Red Flags)
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#881337', lineHeight: 1.55, fontWeight: 500 }}>
                {analysisResult.safetyWarning}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
