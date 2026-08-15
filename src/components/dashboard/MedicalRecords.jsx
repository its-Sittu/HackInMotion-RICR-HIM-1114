import React, { useState, useEffect } from 'react'

const INITIAL_RECORDS = [
  {
    id: 'rec-1',
    title: 'Dolo 650 + Combiflam Interaction Check',
    category: 'Drug Interactions',
    typeIcon: '🧪',
    date: 'Aug 14, 2026 • 07:15 AM',
    status: 'HIGH RISK 🚨',
    statusBg: '#ffe4e6',
    statusColor: '#be123c',
    summary: 'Both Dolo 650 and Combiflam contain Paracetamol. Simultaneous consumption risks acute Paracetamol overdose and liver toxicity.',
    doctorNote: 'Maintain a 4 to 6-hour gap between doses. Do not combine Paracetamol-based formulations.',
    details: [
      'Active Overlap: Paracetamol 650mg + Paracetamol 325mg (Total 975mg single dose)',
      'Toxic Limit: Daily Paracetamol exceeding 3,000mg causes elevated hepatic enzymes',
      'Action Taken: High-risk alert flagged & alternate dose interval recommended'
    ]
  },
  {
    id: 'rec-2',
    title: 'Chest & Right Arm Symptom Diagnosis',
    category: 'Symptom Checks',
    typeIcon: '🩺',
    date: 'Aug 14, 2026 • 08:10 AM',
    status: 'ANALYZED ✅',
    statusBg: '#d1fae5',
    statusColor: '#059669',
    summary: '100% Probability Distribution: 45% Musculoskeletal Strain, 25% GERD / Acidity, 15% Costochondritis, 10% Anxiety, 5% Angina.',
    doctorNote: 'Primary likelihood indicates muscle strain or acid reflux post-meal. Low cardiovascular emergency risk.',
    details: [
      'Regions Evaluated: Right Arm, Right Hand, Chest / Lungs',
      'Top Expected Cause: Musculoskeletal Chest Wall Strain (45% probability)',
      'Action Taken: Recommended warm compress, hydration, and Pantoprazole 40mg pre-meals'
    ]
  },
  {
    id: 'rec-3',
    title: 'Annual ECG & Cardiac Diagnostic Assessment',
    category: 'Lab Reports',
    typeIcon: '📄',
    date: 'Jul 15, 2026 • 10:30 AM',
    status: 'NORMAL ✅',
    statusBg: '#d1fae5',
    statusColor: '#059669',
    summary: 'Resting 12-Lead ECG shows normal sinus rhythm (74 bpm), normal PR interval, and no acute ischemic ST-segment changes.',
    doctorNote: 'Dr. Sarah Jenkins: Excellent cardiac health parameters. Repeat annual checkup in 12 months.',
    details: [
      'Heart Rate: 74 bpm (Normal Sinus Rhythm)',
      'Blood Pressure: 120/80 mmHg',
      'Attachment: Official Signed PDF Report (Verified by St. Jude Cardiac Center)'
    ]
  },
  {
    id: 'rec-4',
    title: 'Pantocid 40 Prescribed Dosage Schedule',
    category: 'Medicines',
    typeIcon: '💊',
    date: 'Jun 28, 2026 • 09:00 AM',
    status: 'ACTIVE 📌',
    statusBg: '#e0e7ff',
    statusColor: '#4338ca',
    summary: 'Pantoprazole 40mg prescribed once daily in the morning 30 minutes before breakfast (Khali Pet) for gastric acid control.',
    doctorNote: 'Swallow tablet whole with water. Do not crush or chew. Duration: 14 Days.',
    details: [
      'Active Compound: Pantoprazole Sodium 40mg',
      'Dosage Schedule: Pre-Breakfast (Khali pet 30 mins before food)',
      'Manufacturer: Sun Pharmaceutical Industries'
    ]
  }
]

const CATEGORIES = [
  { id: 'All', label: '📂 All Activities' },
  { id: 'Drug Interactions', label: '🧪 Drug Interactions' },
  { id: 'Symptom Checks', label: '🩺 Symptom Checks' },
  { id: 'Medicines', label: '💊 Medicines' },
  { id: 'Lab Reports', label: '📄 Lab Reports' }
]

export default function MedicalRecords() {
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsemed_medical_records')
      return saved ? JSON.parse(saved) : INITIAL_RECORDS
    } catch {
      return INITIAL_RECORDS
    }
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem('pulsemed_medical_records', JSON.stringify(records))
    } catch {
      // localStorage optional
    }
  }, [records])

  // Listen to real-time activity logs from across the application
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('pulsemed_medical_records')
        if (saved) {
          setRecords(JSON.parse(saved))
        }
      } catch {
        // optional
      }
    }

    window.addEventListener('pulsemed_medical_history_updated', handleUpdate)
    return () => window.removeEventListener('pulsemed_medical_history_updated', handleUpdate)
  }, [])

  const handleDeleteRecord = (id) => {
    setRecords(prev => prev.filter(rec => rec.id !== id))
    setDeleteConfirmId(null)
    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord(null)
    }
  }

  const handleClearAllHistory = () => {
    setRecords([])
    localStorage.setItem('pulsemed_medical_records', JSON.stringify([]))
    setSelectedRecord(null)
  }

  const filteredRecords = records.filter(rec => {
    const matchesCategory = activeCategory === 'All' || rec.category === activeCategory
    const q = searchQuery.trim().toLowerCase()
    const matchesQuery = !q ||
      rec.title.toLowerCase().includes(q) ||
      rec.category.toLowerCase().includes(q) ||
      rec.summary.toLowerCase().includes(q) ||
      rec.status.toLowerCase().includes(q)
    return matchesCategory && matchesQuery
  })

  return (
    <div style={{ marginTop: '-0.4rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── ULTRA-EXECUTIVE HERO BANNER ───────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #111827 40%, #1e1b4b 100%)',
        borderRadius: '24px',
        padding: 'clamp(1.1rem, 3.5vw, 1.8rem)',
        marginBottom: '1.4rem',
        color: '#ffffff',
        boxShadow: '0 20px 50px -15px rgba(15, 23, 42, 0.6)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0, left: 0,
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
                flexShrink: 0
              }}>
                📂
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.15rem' }}>
                  <span style={{ color: '#818cf8', fontSize: '0.74rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Patient Health Vault
                  </span>

                  <span style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(52, 211, 153, 0.35)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '20px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <span style={{ width: '6px', height: '6px', backgroundColor: '#34d399', borderRadius: '50%', display: 'inline-block', animation: 'pulseDot 1.8s infinite' }} />
                    HEALTH SYNC ACTIVE
                  </span>
                </div>

                <h1 style={{
                  fontSize: 'clamp(1.25rem, 3.5vw, 1.7rem)',
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: '-0.5px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Structured Medical Records &amp; Activity History
                </h1>
              </div>
            </div>

            {/* Quick Stats & Action Buttons */}
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
                <span style={{ fontSize: '1rem' }}>📋</span>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Total Logged</span>
                  <strong style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 700 }}>{records.length} Records</strong>
                </div>
              </div>

              {records.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  style={{
                    backgroundColor: 'rgba(225, 29, 72, 0.2)',
                    border: '1px solid rgba(225, 29, 72, 0.4)',
                    color: '#fecdd3',
                    borderRadius: '12px',
                    padding: '0.5rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                  title="Wipe all logged history"
                >
                  🗑️ Clear All History
                </button>
              )}

              <button
                type="button"
                onClick={() => { setRecords(INITIAL_RECORDS); localStorage.setItem('pulsemed_medical_records', JSON.stringify(INITIAL_RECORDS)) }}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  color: '#e2e8f0',
                  borderRadius: '12px',
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🔄 Restore Defaults
              </button>
            </div>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 1.4rem 0', maxWidth: '760px', lineHeight: 1.5 }}>
            Structured timeline capturing all your PulseMed interactions: drug interaction safety checks, body map symptom analyses, prescribed medicines, lab PDFs, and doctor appointments.
          </p>

          {/* Search Input Bar */}
          <div style={{ maxWidth: '640px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              padding: '0.3rem 0.4rem 0.3rem 1.1rem',
              border: '2px solid rgba(165, 180, 252, 0.5)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: '0.7rem' }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>

              <input
                type="text"
                placeholder="Search records by title, doctor, category, or status tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.94rem',
                  fontWeight: 500,
                  color: '#0f172a',
                  backgroundColor: 'transparent',
                  padding: '0.5rem 0'
                }}
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    color: '#64748b',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── CATEGORY FILTER PILLS ─────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.4rem' }}>
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '14px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: isActive ? 'none' : '1px solid #cbd5e1',
                background: isActive ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                boxShadow: isActive ? '0 6px 16px rgba(99, 102, 241, 0.25)' : '0 2px 5px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── EMPTY RECORDS STATE ────────────────────────────────────────── */}
      {filteredRecords.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3.5rem 2rem',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '2px dashed #cbd5e1',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
        }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.6rem' }}>📂</span>
          <h3 style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>
            No medical records found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0 auto 1.2rem auto', maxWidth: '420px' }}>
            {searchQuery ? `No records matching "${searchQuery}". Try clearing search.` : 'Perform drug interaction checks or body map symptom analyses to automatically capture activities.'}
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setActiveCategory('All') }}
            style={{
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.6rem 1.4rem',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Show All Records
          </button>
        </div>
      )}

      {/* ── STRUCTURED RECORDS CARD TIMELINE ──────────────────────────── */}
      {filteredRecords.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {filteredRecords.map(rec => (
            <div
              key={rec.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                padding: '1.3rem 1.6rem',
                boxShadow: '0 8px 24px -4px rgba(0,0,0,0.04)',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.2rem',
                transition: 'all 0.25s ease'
              }}
            >
              {/* Left Info Section */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, minWidth: '280px' }}>
                <div style={{
                  backgroundColor: '#f1f5f9',
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0,
                  marginTop: '0.15rem'
                }}>
                  {rec.typeIcon}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                    <span style={{
                      backgroundColor: rec.statusBg,
                      color: rec.statusColor,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: 800
                    }}>
                      {rec.status}
                    </span>

                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                      🏷️ {rec.category}
                    </span>

                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      🕒 {rec.date}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0', lineHeight: 1.3 }}>
                    {rec.title}
                  </h3>

                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, fontWeight: 500 }}>
                    {rec.summary}
                  </p>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setSelectedRecord(rec)}
                  style={{
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    border: '1px solid #c7d2fe',
                    borderRadius: '12px',
                    padding: '0.52rem 0.95rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>👁️</span>
                  <span>View Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(rec.id)}
                  style={{
                    backgroundColor: '#fff1f2',
                    color: '#e11d48',
                    border: '1px solid #fecdd3',
                    borderRadius: '12px',
                    padding: '0.52rem 0.85rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>🗑️</span>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── INTERACTIVE RECORD DETAIL MODAL ──────────────────────────── */}
      {selectedRecord && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '650px',
            width: '100%',
            padding: '1.8rem',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
            animation: 'fadeInUp 0.3s ease-out',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem', paddingBottom: '0.9rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.6rem' }}>{selectedRecord.typeIcon}</span>
                <div>
                  <span style={{
                    backgroundColor: selectedRecord.statusBg,
                    color: selectedRecord.statusColor,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '6px',
                    display: 'inline-block',
                    marginBottom: '0.2rem'
                  }}>
                    {selectedRecord.status}
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    {selectedRecord.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#64748b',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Category & Date Meta */}
              <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.85rem', color: '#64748b' }}>
                <span>Category: <strong>{selectedRecord.category}</strong></span>
                <span>Date: <strong>{selectedRecord.date}</strong></span>
              </div>

              {/* Summary Box */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '14px', padding: '1.1rem 1.25rem', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '0.82rem', color: '#334155', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
                  Activity Overview:
                </strong>
                <p style={{ margin: 0, fontSize: '0.94rem', color: '#0f172a', lineHeight: 1.55, fontWeight: 600 }}>
                  {selectedRecord.summary}
                </p>
              </div>

              {/* Details List */}
              {Array.isArray(selectedRecord.details) && (
                <div style={{ backgroundColor: '#fafafa', borderRadius: '14px', padding: '1.1rem 1.25rem', border: '1px solid #f1f5f9' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#334155', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                    Clinical Breakdown & Parameters:
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {selectedRecord.details.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                        <span style={{ color: '#6366f1', fontWeight: 700 }}>•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctor / Safety Note */}
              {selectedRecord.doctorNote && (
                <div style={{ backgroundColor: '#fff1f2', borderLeft: '5px solid #e11d48', borderRadius: '14px', padding: '1.1rem 1.25rem' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#be123c', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
                    Physician & Safety Note:
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#881337', lineHeight: 1.5, fontWeight: 500 }}>
                    {selectedRecord.doctorNote}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(selectedRecord.id)}
                style={{
                  backgroundColor: '#fff1f2',
                  color: '#e11d48',
                  border: '1px solid #fecdd3',
                  borderRadius: '12px',
                  padding: '0.55rem 1rem',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🗑️ Delete Record
              </button>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                style={{
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.55rem 1.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ────────────────────────────────── */}
      {deleteConfirmId && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          padding: '1rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '430px',
            width: '100%',
            padding: '1.8rem',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
            animation: 'fadeInUp 0.25s ease-out',
            margin: 'auto'
          }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>⚠️</span>
            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
              Delete Medical Record?
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1.4rem 0', lineHeight: 1.45 }}>
              Are you sure you want to permanently remove this recorded activity from your medical vault?
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDeleteRecord(deleteConfirmId)}
                style={{
                  backgroundColor: '#e11d48',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  flex: 1,
                  boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)'
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
