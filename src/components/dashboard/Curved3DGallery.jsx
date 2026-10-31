import React, { useState, useEffect, useRef } from 'react'
import '../../styles/curved-gallery.css'

const DEFAULT_RING_CARDS = [
  {
    id: 'active-meds',
    title: 'Active Medicines Today',
    value: '4',
    unit: 'scheduled',
    status: 'Active Plan',
    trend: 'Subah, Dopahar & Shaam doses',
    color: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.22) 0%, rgba(15, 23, 42, 0.94) 100%)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.5 3a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 0 0-5h-3z" />
        <path d="M13.5 8H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h5.5" />
      </svg>
    )
  },
  {
    id: 'interaction-risk',
    title: 'Drug Interaction Risk',
    value: '0',
    unit: 'warnings',
    status: 'FDA Safe ✓',
    trend: 'All 4 active compounds safe',
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(15, 23, 42, 0.94) 100%)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    )
  },
  {
    id: 'adherence-rate',
    title: 'Dosage Adherence',
    value: '96.5',
    unit: '%',
    status: 'High Score',
    trend: 'On track with reminders',
    color: '#818cf8',
    bgGradient: 'linear-gradient(135deg, rgba(129, 140, 248, 0.22) 0%, rgba(15, 23, 42, 0.94) 100%)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    )
  },
  {
    id: 'safety-scans',
    title: 'Safety Scans Done',
    value: '18',
    unit: 'searches',
    status: 'Verified',
    trend: '+4 searches this week',
    color: '#f43f5e',
    bgGradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.22) 0%, rgba(15, 23, 42, 0.94) 100%)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    )
  },
  {
    id: 'burn-evaluator',
    title: 'Symptom & Burn Triage',
    value: 'Grade I',
    unit: 'mild index',
    status: 'Safe Care',
    trend: 'Zero emergency red flags detected',
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(15, 23, 42, 0.94) 100%)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    )
  },
  {
    id: 'alarm-system',
    title: 'Smart Audio Alarms',
    value: '3 Active',
    unit: 'family alerts',
    status: 'Automated',
    trend: 'Phone ringing + SMS fallback sync',
    color: '#a855f7',
    bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.22) 0%, rgba(15, 23, 42, 0.94) 100%)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    )
  },
  {
    id: 'nearby-clinics',
    title: 'Nearby Trauma Care',
    value: '6',
    unit: 'within 3km',
    status: '24/7 Radar',
    trend: 'Live OpenStreetMap GPS routing',
    color: '#06b6d4',
    bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(15, 23, 42, 0.94) 100%)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    )
  },
  {
    id: 'diet-sync',
    title: 'Clinical Diet Sync',
    value: '100 %',
    unit: 'meal timing',
    status: 'Optimal',
    trend: 'Pre & post-dose meal alignment',
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(15, 23, 42, 0.94) 100%)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    )
  }
]

export default function Curved3DGallery({ cards = DEFAULT_RING_CARDS, onCardClick }) {
  const [rotationAngle, setRotationAngle] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [radius, setRadius] = useState(420)

  const stageRef = useRef(null)
  const dragStartRef = useRef({ x: 0, angle: 0 })
  const autoRotateReqRef = useRef(null)
  const isHoveredRef = useRef(false)
  const total = cards.length
  const stepAngle = 360 / total
  const baseRotationSpeed = 20 // smooth fast continuous rotation (deg/sec)

  // Responsive radius calculation
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth
      if (width < 640) {
        setRadius(270)
      } else if (width < 1024) {
        setRadius(340)
      } else {
        setRadius(400)
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // ── Auto Rotation Engine (Fast, Smooth 60fps, Pauses on Hover) ─────
  useEffect(() => {
    let lastTime = performance.now()

    const animateLoop = (time) => {
      const delta = (time - lastTime) / 1000
      lastTime = time

      if (!isDragging && !isHoveredRef.current) {
        setRotationAngle((prev) => (prev + delta * baseRotationSpeed) % 360)
      }

      autoRotateReqRef.current = requestAnimationFrame(animateLoop)
    }

    autoRotateReqRef.current = requestAnimationFrame(animateLoop)
    return () => cancelAnimationFrame(autoRotateReqRef.current)
  }, [isDragging])

  // ── Wheel Scroll Effect (Smooth and Fast Interaction) ───────
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const handleWheel = (e) => {
      // Rotate ring smoothly on mouse wheel
      const delta = e.deltaY || e.deltaX
      setRotationAngle((prev) => prev + delta * 0.22)
    }

    stage.addEventListener('wheel', handleWheel, { passive: true })
    return () => stage.removeEventListener('wheel', handleWheel)
  }, [])

  // ── Page Scroll Parallax Rotation ───────────────────────────
  useEffect(() => {
    let lastScrollY = window.scrollY
    const handleWindowScroll = () => {
      const currentScrollY = window.scrollY
      const delta = currentScrollY - lastScrollY
      lastScrollY = currentScrollY
      setRotationAngle((prev) => prev - delta * 0.18)
    }

    window.addEventListener('scroll', handleWindowScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleWindowScroll)
  }, [])

  // ── Pointer Drag / Swipe Interaction ─────────────────────────
  const handlePointerDown = (e) => {
    setIsDragging(true)
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0
    dragStartRef.current = {
      x: clientX,
      angle: rotationAngle
    }
    if (stageRef.current && e.setPointerCapture) {
      try {
        stageRef.current.setPointerCapture(e.pointerId)
      } catch {
        // pointer capture optional
      }
    }
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0
    const deltaX = currentX - dragStartRef.current.x
    const sensitivity = 0.45
    setRotationAngle((dragStartRef.current.angle + deltaX * sensitivity) % 360)
  }

  const handlePointerUp = (e) => {
    setIsDragging(false)
    if (stageRef.current && e.releasePointerCapture) {
      try {
        stageRef.current.releasePointerCapture(e.pointerId)
      } catch {
        // release optional
      }
    }
  }

  // ── Click Card to Center Facing Viewer ───────────────────────
  const handleCardClick = (index, card) => {
    const targetAngle = -(index * stepAngle)
    setRotationAngle((prev) => {
      const currentMod = ((prev % 360) + 360) % 360
      const targetMod = ((targetAngle % 360) + 360) % 360
      let diff = targetMod - currentMod
      if (diff > 180) diff -= 360
      if (diff < -180) diff += 360
      return prev + diff
    })

    if (onCardClick) onCardClick(card, index)
  }

  return (
    <div className="gallery-ring-section-wrapper">
      {/* ─── CLIPPING VIEWPORT (CRITICAL: HIDES LOWER HALF OF RING) ─── */}
      <div
        ref={stageRef}
        className="gallery-ring-clip-viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => {
          isHoveredRef.current = true
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false
          setIsDragging(false)
        }}
      >
        <div className="gallery-perspective-stage">
          <div
            className="gallery-3d-cylinder"
            style={{
              transform: `rotateY(${rotationAngle}deg)`
            }}
          >
            {cards.map((card, i) => {
              const cardAngle = i * stepAngle
              const effectiveAngle = (((cardAngle + rotationAngle) % 360) + 360) % 360
              const isFront = effectiveAngle < (stepAngle * 0.55) || effectiveAngle > (360 - stepAngle * 0.55)

              return (
                <div
                  key={card.id}
                  className={`gallery-ring-card ${isFront ? 'is-front' : ''}`}
                  style={{
                    transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                    background: card.bgGradient,
                    borderColor: isFront ? card.color : `${card.color}35`,
                    boxShadow: isFront
                      ? `0 20px 45px rgba(0, 0, 0, 0.7), 0 0 35px ${card.color}45`
                      : '0 15px 35px rgba(0, 0, 0, 0.55)'
                  }}
                  onClick={() => handleCardClick(i, card)}
                  role="button"
                  tabIndex={0}
                  aria-label={card.title}
                >
                  {/* Top Row: Icon + Status Pill Badge */}
                  <div className="card-top-row">
                    <div
                      className="card-icon-box"
                      style={{
                        backgroundColor: `${card.color}18`,
                        borderColor: `${card.color}35`,
                        color: card.color
                      }}
                    >
                      {card.icon}
                    </div>
                    <span
                      className="card-badge"
                      style={{
                        color: card.color,
                        backgroundColor: `${card.color}18`,
                        borderColor: `${card.color}35`
                      }}
                    >
                      {card.status}
                    </span>
                  </div>

                  {/* Bottom Row: Label + Value/Unit + Subtitle Trend */}
                  <div className="card-bottom-info">
                    <span className="card-title-label">{card.title}</span>
                    <div className="card-val-row">
                      <span className="card-main-val">{card.value}</span>
                      <span className="card-unit-text">{card.unit}</span>
                    </div>
                    <span className="card-trend-text">{card.trend}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
