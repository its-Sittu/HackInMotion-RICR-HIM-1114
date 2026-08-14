import React, { useState } from 'react'
import { saveActivityToMedicalHistory } from '../../utils/activityLogger'

// Body parts definition for SVG Interactive Mannequin
const BODY_PARTS_CONFIG = {
  front: [
    { id: 'head', label: 'Head / Brain', type: 'circle', cx: 150, cy: 52, r: 26 },
    { id: 'neck', label: 'Neck / Throat', type: 'rect', x: 141, y: 80, width: 18, height: 16, rx: 4 },
    { id: 'chest', label: 'Chest / Lungs / Heart', type: 'polygon', points: '118,98 182,98 176,155 124,155' },
    { id: 'stomach', label: 'Stomach / Abdomen', type: 'polygon', points: '124,158 176,158 171,215 129,215' },
    { id: 'pelvis', label: 'Pelvis / Hips', type: 'polygon', points: '129,218 171,218 176,252 124,252' },
    { id: 'right_arm_upper', label: 'Right Arm', type: 'polygon', points: '88,102 114,99 104,162 80,162' },
    { id: 'right_arm_lower', label: 'Right Hand', type: 'polygon', points: '78,165 102,165 92,228 70,228' },
    { id: 'left_arm_upper', label: 'Left Arm', type: 'polygon', points: '186,99 212,102 220,162 196,162' },
    { id: 'left_arm_lower', label: 'Left Hand', type: 'polygon', points: '198,165 222,165 230,228 208,228' },
    { id: 'right_leg_upper', label: 'Right Leg (Thigh)', type: 'polygon', points: '127,255 147,255 144,350 126,350' },
    { id: 'right_leg_lower', label: 'Right Foot', type: 'polygon', points: '126,353 144,353 142,440 122,440' },
    { id: 'left_leg_upper', label: 'Left Leg (Thigh)', type: 'polygon', points: '153,255 173,255 174,350 156,350' },
    { id: 'left_leg_lower', label: 'Left Foot', type: 'polygon', points: '156,353 174,353 178,440 158,440' }
  ],
  back: [
    { id: 'head_back', label: 'Head / Occipital', type: 'circle', cx: 150, cy: 52, r: 26 },
    { id: 'neck_back', label: 'Upper Spine / Neck', type: 'rect', x: 141, y: 80, width: 18, height: 16, rx: 4 },
    { id: 'upper_back', label: 'Upper Back / Shoulders', type: 'polygon', points: '118,98 182,98 176,155 124,155' },
    { id: 'lower_back', label: 'Lower Back / Lumbar', type: 'polygon', points: '124,158 176,158 171,215 129,215' },
    { id: 'glutes', label: 'Glutes / Hips', type: 'polygon', points: '129,218 171,218 176,252 124,252' },
    { id: 'right_arm_back', label: 'Right Shoulder / Arm', type: 'polygon', points: '88,102 114,99 104,162 80,162' },
    { id: 'right_hand_back', label: 'Right Hand Back', type: 'polygon', points: '78,165 102,165 92,228 70,228' },
    { id: 'left_arm_back', label: 'Left Shoulder / Arm', type: 'polygon', points: '186,99 212,102 220,162 196,162' },
    { id: 'left_hand_back', label: 'Left Hand Back', type: 'polygon', points: '198,165 222,165 230,228 208,228' },
    { id: 'right_leg_back', label: 'Right Hamstring', type: 'polygon', points: '127,255 147,255 144,350 126,350' },
    { id: 'right_calf', label: 'Right Calf / Ankle', type: 'polygon', points: '126,353 144,353 142,440 122,440' },
    { id: 'left_leg_back', label: 'Left Hamstring', type: 'polygon', points: '153,255 173,255 174,350 156,350' },
    { id: 'left_calf', label: 'Left Calf / Ankle', type: 'polygon', points: '156,353 174,353 178,440 158,440' }
  ]
}

const playEcoTechPingSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    const now = ctx.currentTime

    // 1. High Tech Eco Ping Oscillator
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, now) // A5 chime
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.08)
    osc1.frequency.exponentialRampToValueAtTime(440, now + 0.35)

    gain1.gain.setValueAtTime(0.18, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    // 2. Sub Harmonic Eco Resonance Oscillator
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(523.25, now) // C5 note
    osc2.frequency.exponentialRampToValueAtTime(261.63, now + 0.4)

    gain2.gain.setValueAtTime(0.12, now)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

    // 3. Futuristic Biquad Bandpass Filter for Eco Spatial Resonance
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1200, now)
    filter.Q.setValueAtTime(8, now)

    // Connect nodes
    osc1.connect(gain1)
    osc2.connect(gain2)

    gain1.connect(filter)
    gain2.connect(filter)

    filter.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)

    osc1.stop(now + 0.4)
    osc2.stop(now + 0.45)
  } catch {
    // Gracefully handle browser audio autoplay policies
  }
}

export default function SymptomChecker() {
  const [viewMode, setViewMode] = useState('front') // 'front' | 'back'
  const [searchQuery, setSearchQuery] = useState('')
  const [symptomTriageActive] = useState(true)
  const [selectedParts, setSelectedParts] = useState(['Left Arm', 'Left Hand'])
  const [description, setDescription] = useState('')
  const [reportFile, setReportFile] = useState(null)

  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [hoveredPart, setHoveredPart] = useState(null)

  const activePartsList = BODY_PARTS_CONFIG[viewMode]

  const togglePart = (label) => {
    playEcoTechPingSound()
    setSelectedParts(prev => {
      if (prev.includes(label)) {
        return prev.filter(p => p !== label)
      } else {
        return [...prev, label]
      }
    })
  }

  const removePart = (label) => {
    setSelectedParts(prev => prev.filter(p => p !== label))
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

        const topCond = data.conditions?.[0]
        saveActivityToMedicalHistory({
          title: `Symptom Check: ${selectedParts.join(', ')}`,
          category: 'Symptom Checks',
          typeIcon: '🩺',
          status: 'ANALYZED ✅',
          statusBg: '#d1fae5',
          statusColor: '#059669',
          summary: data.summary || `Symptom analysis for ${selectedParts.join(', ')}`,
          doctorNote: topCond ? `Primary Suspected Cause: ${topCond.name} (${topCond.percentage}% probability). Care: ${topCond.action}` : 'Symptom analysis completed.',
          details: [
            `Body Regions Evaluated: ${selectedParts.join(', ')}`,
            `Reported Description: "${description.trim() || 'Selected body regions'}"`,
            `Primary Cause: ${topCond ? `${topCond.name} (${topCond.percentage}%)` : 'Analyzed'}`,
            `AI Provider: ${data.provider || 'Google Gemini AI Engine'}`
          ]
        })
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
        .body-part-shape {
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .body-part-shape:hover {
          filter: drop-shadow(0 0 10px #38bdf8);
          opacity: 0.9;
        }
      `}</style>

      {/* ── MAIN 2-COLUMN LAYOUT ────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 390px) 1fr',
        gap: '1.6rem',
        marginBottom: '1.8rem',
        alignItems: 'start'
      }}>

        {/* ── LEFT PANEL: COMPACT IDENTICAL SVG HUMAN BODY MANNEQUIN MAP ───────── */}
        <div style={{
          backgroundColor: '#0b101d',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1.3rem 1.4rem',
          boxShadow: '0 16px 45px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          color: '#ffffff',
          position: 'relative'
        }}>
          <div>
            {/* Header Row: Body Map Title & Badge on Left, View Switcher on Center/Right */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <h3 style={{ margin: '0 0 0.15rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#10b981', letterSpacing: '-0.3px' }}>
                  Body Map
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                  Front/Back View • Select Area
                </span>
              </div>

              {/* Top Right Counter Pill */}
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '20px',
                padding: '0.3rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                color: '#34d399',
                fontWeight: 700
              }}>
                <span>✓</span>
                <span>{selectedParts.length} Selected</span>
              </div>
            </div>

            {/* Front View / Back View Switcher Pills */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{
                display: 'inline-flex',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '0.24rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <button
                  type="button"
                  onClick={() => setViewMode('front')}
                  style={{
                    padding: '0.4rem 1.1rem',
                    borderRadius: '9px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'front' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                    color: viewMode === 'front' ? '#34d399' : '#94a3b8',
                    borderLeft: viewMode === 'front' ? '2px solid #10b981' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Front View
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('back')}
                  style={{
                    padding: '0.4rem 1.1rem',
                    borderRadius: '9px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'back' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                    color: viewMode === 'back' ? '#34d399' : '#94a3b8',
                    borderLeft: viewMode === 'back' ? '2px solid #10b981' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Back View
                </button>
              </div>
            </div>

            {/* ── IDENTICAL SVG ANATOMICAL MANNEQUIN CANVAS ──────────────────── */}
            <div style={{
              display: 'flex',
              justify: 'center',
              alignItems: 'center',
              position: 'relative',
              padding: '0.5rem 0 0.5rem 25px'
            }}>
              {/* Outer Cyan Glowing Body Aura */}
              <div style={{
                position: 'absolute',
                width: '170px',
                height: '350px',
                background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.14) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              <svg
                width="280"
                height="410"
                viewBox="0 0 300 460"
                style={{ overflow: 'visible', transform: 'scale(0.96)' }}
              >
                {/* Outer Faint Anatomical Body Silhouette Outline */}
                <g opacity="0.15" stroke="#38bdf8" strokeWidth="2" fill="none">
                  <circle cx="150" cy="52" r="32" />
                  <path d="M 115,95 Q 150,85 185,95 L 225,160 L 235,230 L 205,230 L 195,165 L 178,250 L 180,350 L 180,445 L 155,445 L 150,260 L 145,445 L 120,445 L 120,350 L 122,250 L 105,165 L 95,230 L 65,230 L 75,160 Z" />
                </g>

                {/* Interactive Body Parts Polygons & Shapes */}
                {activePartsList.map((part) => {
                  const isSelected = selectedParts.includes(part.label)

                  const fillColor = isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.04)'
                  const strokeColor = isSelected ? '#34d399' : 'rgba(255, 255, 255, 0.2)'
                  const strokeWidth = isSelected ? 2.5 : 1.5
                  const filterStyle = isSelected ? 'drop-shadow(0 0 12px #10b981)' : 'none'

                  return (
                    <g key={part.id} onClick={() => togglePart(part.label)} className="body-part-shape">
                      {part.type === 'circle' && (
                        <circle
                          cx={part.cx}
                          cy={part.cy}
                          r={part.r}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          style={{ filter: filterStyle }}
                          onMouseEnter={() => setHoveredPart(part.label)}
                          onMouseLeave={() => setHoveredPart(null)}
                        />
                      )}

                      {part.type === 'rect' && (
                        <rect
                          x={part.x}
                          y={part.y}
                          width={part.width}
                          height={part.height}
                          rx={part.rx}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          style={{ filter: filterStyle }}
                          onMouseEnter={() => setHoveredPart(part.label)}
                          onMouseLeave={() => setHoveredPart(null)}
                        />
                      )}

                      {part.type === 'polygon' && (
                        <polygon
                          points={part.points}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          style={{ filter: filterStyle }}
                          onMouseEnter={() => setHoveredPart(part.label)}
                          onMouseLeave={() => setHoveredPart(null)}
                        />
                      )}

                      {/* FLOATING NEON "SELECTED" BADGE ON SELECTED SEGMENTS */}
                      {isSelected && (
                        <g transform={`translate(${
                          part.id.includes('left_arm') ? 228 :
                          part.id.includes('right_arm') ? 35 :
                          part.id.includes('chest') ? 185 :
                          part.id.includes('stomach') ? 180 : 185
                        }, ${
                          part.id.includes('upper') || part.id.includes('arm') ? (part.cy || 130) :
                          part.id.includes('lower') || part.id.includes('hand') ? 195 :
                          part.id.includes('head') ? 45 : 175
                        })`}>
                          <rect
                            x="0"
                            y="0"
                            width="58"
                            height="18"
                            rx="4"
                            fill="#10b981"
                            stroke="#34d399"
                            strokeWidth="1"
                            style={{ filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.6))' }}
                          />
                          <text
                            x="29"
                            y="12"
                            fill="#ffffff"
                            fontSize="8.5"
                            fontWeight="900"
                            textAnchor="middle"
                            letterSpacing="0.8"
                          >
                            SELECTED
                          </text>
                        </g>
                      )}
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Hover Tooltip display */}
            <div style={{ textAlign: 'center', height: '24px', marginTop: '0.4rem' }}>
              {hoveredPart && (
                <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>
                  👉 Click to toggle: {hoveredPart}
                </span>
              )}
            </div>
          </div>

          {/* Bottom Tip Callout Box */}
          <div style={{
            marginTop: '1.2rem',
            padding: '0.85rem 1rem',
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem'
          }}>
            <span style={{ fontSize: '1rem', color: '#38bdf8', flexShrink: 0, marginTop: '0.1rem' }}>ℹ️</span>
            <span style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.45 }}>
              <strong style={{ color: '#38bdf8' }}>Tip:</strong> Click directly on any body segment above (Head, Chest, Arms, Legs). Selected parts will glow green with a <strong>SELECTED</strong> badge.
            </span>
          </div>
        </div>

        {/* ── RIGHT PANEL: SYMPTOMS & DIAGNOSTIC FORM ───────────────────── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '1.8rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between'
        }}>
          <div>
            {/* 1. AFFECTED AREAS */}
            <div style={{ marginBottom: '1.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  1. Affected Areas
                </label>
                {selectedParts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedParts([])}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e11d48',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>

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
                      padding: '0.32rem 0.75rem',
                      fontSize: '0.84rem',
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
                    No body region selected. Click segments on the Body Map left.
                  </span>
                )}
              </div>
            </div>

            {/* 2. SYMPTOMS / ALLERGIES */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>
                2. Symptoms / Allergies
              </label>

              <textarea
                placeholder="Describe your pain, swelling, duration, or allergies e.g. Pain in arm and shoulder for 2 days..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                style={{
                  width: '100%',
                  borderRadius: '14px',
                  border: '1.5px solid #10b981',
                  backgroundColor: '#ffffff',
                  padding: '0.85rem 1rem',
                  fontSize: '0.94rem',
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

            {/* 3. UPLOAD PHOTO OR REPORT (PDF) */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>
                3. Upload Photo or Report (PDF)
              </label>

              <div style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '14px',
                backgroundColor: '#f8fafc',
                padding: '1.2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '0.3rem' }}>📤</span>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', display: 'block' }}>
                  {reportFile ? `Attached: ${reportFile.name}` : 'Click to upload Photo or PDF'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Attach clear photos of skin issues or medical lab reports
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setReportFile(e.target.files[0] || null)}
                  style={{ display: 'none' }}
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
              height: '50px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '0.96rem',
              fontWeight: 800,
              cursor: loading || (selectedParts.length === 0 && !description.trim()) ? 'not-allowed' : 'pointer',
              opacity: loading || (selectedParts.length === 0 && !description.trim()) ? 0.6 : 1,
              boxShadow: '0 8px 22px rgba(16, 185, 129, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              justify: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <span>⚡</span>
            <span>{loading ? 'Evaluating Symptoms...' : 'Run Clinical Analysis >'}</span>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 700 }}>
                Regions Evaluated: <strong>{analysisResult.bodyParts ? analysisResult.bodyParts.join(', ') : 'Selected Areas'}</strong>
              </span>

              <button
                type="button"
                onClick={() => setAnalysisResult(null)}
                style={{
                  backgroundColor: '#fff1f2',
                  color: '#e11d48',
                  border: '1px solid #fecdd3',
                  borderRadius: '10px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(225, 29, 72, 0.08)'
                }}
              >
                <span>🗑️</span>
                <span>Clear Analysis</span>
              </button>
            </div>
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
                Overall Clinical Assessment (Gemini AI + Medical DB)
              </strong>
            </div>

            {analysisResult.description && (
              <div style={{ fontSize: '0.84rem', color: '#0369a1', backgroundColor: '#e0f2fe', padding: '0.4rem 0.75rem', borderRadius: '8px', marginBottom: '0.65rem', fontWeight: 600 }}>
                📝 <strong>Patient Description Analyzed:</strong> &quot;{analysisResult.description}&quot;
              </div>
            )}

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
                          justifyContent: 'center',
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
                    <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div><strong>🔍 Clinical Reasoning:</strong> {cond.explanation}</div>
                      {cond.action && (
                        <div style={{ color: '#059669', fontWeight: 600 }}>
                          <strong>💊 Recommended Care / OTC:</strong> {cond.action}
                        </div>
                      )}
                      {cond.specialist && (
                        <div style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.82rem' }}>
                          👨‍⚕️ <strong>Recommended Specialist:</strong> {cond.specialist}
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
