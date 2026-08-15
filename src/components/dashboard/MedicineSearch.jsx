import React, { useState, useEffect, useCallback } from 'react'
import { saveActivityToMedicalHistory } from '../../utils/activityLogger'
import { getApiUrl } from '../../utils/apiConfig'

const CATEGORIES = [
  { id: 'All', label: '🌐 All Medicines' },
  { id: 'Pain', label: '💊 Pain & Fever' },
  { id: 'Antibiotic', label: '🦠 Antibiotics' },
  { id: 'Gastric', label: '🔥 Antacids & Gastric' },
  { id: 'Allergic', label: '🤧 Anti-Allergic' },
  { id: 'Chronic', label: '🩺 Diabetes & Heart' }
]

const POPULAR_SEARCHES = ['Dolo 650', 'Pantocid 40', 'Crocin 500', 'Azithral 500', 'Combiflam', 'Cetirizine 10', 'Metformin']

const AI_PROMPTS = [
  'Pantocid 40 kab aur kaise khaye?',
  'Dolo 650 aur Combiflam ek sath le sakte hain?',
  'Can I eat banana with egg?',
  'Fasting blood sugar 140 mg/dL normal hai?',
  'Paracetamol 650 dosage & timing'
]

/**
 * Custom Rich AI Response Renderer for Bullet Points, Short Summary, and Note Callouts
 */
function FormattedAiAnswer({ text }) {
  if (!text) return null

  // Split into paragraphs/blocks
  const blocks = text.split(/\n\n+/).filter(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim()

        // 1. Quick Summary Section (In Short)
        if (trimmed.includes('Quick Summary') || trimmed.startsWith('📌')) {
          return (
            <div key={idx} style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderLeft: '5px solid #0284c7',
              borderRadius: '14px',
              padding: '1.1rem 1.3rem',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.1rem' }}>📌</span>
                <strong style={{ color: '#0369a1', fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Quick Summary (In Short)
                </strong>
              </div>
              <div style={{ color: '#0c4a6e', fontSize: '0.96rem', fontWeight: 600, lineHeight: 1.55 }}>
                {trimmed.replace(/^(📌|\*\*Quick Summary.*?\*\*|### Quick Summary.*?\n)/i, '').replace(/\*\*/g, '').trim()}
              </div>
            </div>
          )
        }

        // 2. Important Note & Safety Facts Callout
        if (trimmed.includes('Important Note') || trimmed.includes('Safety Facts') || trimmed.startsWith('⚠️')) {
          return (
            <div key={idx} style={{
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderLeft: '5px solid #e11d48',
              borderRadius: '14px',
              padding: '1.1rem 1.3rem',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                <strong style={{ color: '#be123c', fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Important Note & Safety Facts
                </strong>
              </div>
              <div style={{ color: '#881337', fontSize: '0.92rem', lineHeight: 1.55, fontWeight: 500 }}>
                {trimmed.split('\n').map((line, lIdx) => {
                  const cleanLine = line.replace(/^(\*|•|⚠️|\*\*Important Note.*?\*\*|-)\s*/, '').replace(/\*\*/g, '').trim()
                  if (!cleanLine) return null
                  return (
                    <div key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: '#e11d48', fontWeight: 700 }}>•</span>
                      <span>{cleanLine}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }

        // 3. Bullet Point Lists or Regular Markdown Paragraphs
        const lines = trimmed.split('\n').filter(Boolean)
        const headerLine = lines[0].startsWith('###') || lines[0].startsWith('**') || lines[0].startsWith('💡') || lines[0].startsWith('🕒')
          ? lines[0]
          : null

        const contentLines = headerLine ? lines.slice(1) : lines

        return (
          <div key={idx} style={{ backgroundColor: '#fafafa', border: '1px solid #f1f5f9', borderRadius: '14px', padding: '1.1rem 1.3rem' }}>
            {headerLine && (
              <h4 style={{
                margin: '0 0 0.6rem 0',
                fontSize: '1.02rem',
                fontWeight: 800,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                {headerLine.replace(/^(###|\*\*|\*)\s*/, '').replace(/\*\*/g, '')}
              </h4>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {contentLines.map((line, lIdx) => {
                const isBullet = line.trim().startsWith('*') || line.trim().startsWith('•') || line.trim().startsWith('-')
                const cleanText = line.replace(/^(\*|•|-)\s*/, '').trim()

                if (!cleanText) return null

                // Format bold segments
                const parts = cleanText.split(/(\*\*.*?\*\*)/g)

                return (
                  <div key={lIdx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: isBullet ? '0.6rem' : '0',
                    fontSize: '0.93rem',
                    color: '#334155',
                    lineHeight: 1.6
                  }}>
                    {isBullet && (
                      <span style={{
                        color: '#6366f1',
                        fontSize: '1.1rem',
                        lineHeight: 1,
                        marginTop: '0.15rem'
                      }}>
                        •
                      </span>
                    )}
                    <div>
                      {parts.map((p, pIdx) => {
                        if (p.startsWith('**') && p.endsWith('**')) {
                          return <strong key={pIdx} style={{ color: '#0f172a', fontWeight: 700 }}>{p.slice(2, -2)}</strong>
                        }
                        return p
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const DEFAULT_FALLBACK_MEDICINES = [
  {
    id: 'dolo-650',
    brandName: 'Dolo 650 / Paracetamol',
    genericName: 'Paracetamol (Acetaminophen) 650mg',
    category: 'Pain Relief & Fever',
    imageUrl: '/images/medicines/med_yellow_tablets.png',
    purpose: 'Fever reduction, mild to moderate pain relief (headache, body ache, toothache).',
    whenToTake: '1 tablet after meals, every 4–6 hours as needed. Maximum 4 tablets per day.',
    dosageSchedule: 'Post-Meals (Take After Food)',
    precautions: 'Do not exceed daily limit. Avoid alcohol while taking. Consult doctor if liver disease exists.',
    activeIngredients: 'Paracetamol (650mg)',
    manufacturer: 'Micro Labs Ltd'
  },
  {
    id: 'crocin-500',
    brandName: 'Crocin Advance 500',
    genericName: 'Paracetamol 500mg',
    category: 'Pain Relief & Fever',
    imageUrl: '/images/medicines/med_red_white_pills.png',
    purpose: 'Fast relief from fever, headache, body pain, and joint aches.',
    whenToTake: '1 to 2 tablets every 4 to 6 hours after food. Max 4000mg in 24 hours.',
    dosageSchedule: 'Post-Meals (Take After Food)',
    precautions: 'Do not take with other paracetamol-containing medicines.',
    activeIngredients: 'Paracetamol (500mg)',
    manufacturer: 'GSK Consumer Healthcare'
  },
  {
    id: 'combiflam',
    brandName: 'Combiflam',
    genericName: 'Ibuprofen (400mg) + Paracetamol (325mg)',
    category: 'Pain Relief & Anti-Inflammatory',
    imageUrl: '/images/medicines/med_cream_ovals.png',
    purpose: 'Relief from severe pain, swelling, toothache, muscle cramps, and fever.',
    whenToTake: '1 tablet 2-3 times daily AFTER meals with plenty of water.',
    dosageSchedule: 'Strictly Post-Meals (Take After Food)',
    precautions: 'Never take on an empty stomach. Avoid if history of stomach ulcers exists.',
    activeIngredients: 'Ibuprofen (400mg), Paracetamol (325mg)',
    manufacturer: 'Sanofi India'
  },
  {
    id: 'pantocid-40',
    brandName: 'Pantocid 40 / Pan-D',
    genericName: 'Pantoprazole 40mg',
    category: 'Antacid & Gastric Care',
    imageUrl: '/images/medicines/med_blue_blister.jpg',
    purpose: 'Acidity, heartburn, GERD, gas, and stomach ulcer prevention.',
    whenToTake: '1 tablet DAILY IN THE MORNING 30 minutes BEFORE breakfast (Empty Stomach).',
    dosageSchedule: 'Pre-Breakfast (Empty Stomach)',
    precautions: 'Swallow whole with water. Do not crush or chew the tablet.',
    activeIngredients: 'Pantoprazole Sodium (40mg)',
    manufacturer: 'Sun Pharma'
  },
  {
    id: 'azithral-500',
    brandName: 'Azithral 500 / Azithromycin',
    genericName: 'Azithromycin 500mg',
    category: 'Antibiotics',
    imageUrl: '/images/medicines/med_red_capsules.png',
    purpose: 'Bacterial infections of respiratory tract, throat, lungs, ears, and skin.',
    whenToTake: '1 tablet once daily for 3 to 5 days, taken 1 hour before or 2 hours after meals.',
    dosageSchedule: 'Once Daily (Fixed Time)',
    precautions: 'Complete full course even if symptoms improve early. Do not take with antacids.',
    activeIngredients: 'Azithromycin (500mg)',
    manufacturer: 'Alembic Pharmaceuticals'
  },
  {
    id: 'amoxil-500',
    brandName: 'Amoxicillin 500',
    genericName: 'Amoxicillin 500mg',
    category: 'Antibiotics',
    imageUrl: '/images/medicines/med_red_capsules.png',
    purpose: 'Broad-spectrum antibiotic for chest, throat, dental, and urinary tract infections.',
    whenToTake: '1 capsule every 8 hours (3 times a day) after meals with a glass of water.',
    dosageSchedule: 'Every 8 Hours (Post-Meals)',
    precautions: 'Inform doctor if allergic to penicillin. Finish prescribed course completely.',
    activeIngredients: 'Amoxicillin Trihydrate (500mg)',
    manufacturer: 'GlaxoSmithKline'
  },
  {
    id: 'cetirizine-10',
    brandName: 'Cetzine 10 / Okacet',
    genericName: 'Cetirizine Hydrochloride 10mg',
    category: 'Anti-Allergic',
    imageUrl: '/images/medicines/med_yellow_tablets.png',
    purpose: 'Relief from allergic runny nose, sneezing, watery eyes, and skin hives/itching.',
    whenToTake: '1 tablet ONCE DAILY at bedtime before sleep.',
    dosageSchedule: 'Night Bedtime (Before Sleep)',
    precautions: 'May cause mild drowsiness. Avoid driving or operating machinery after taking.',
    activeIngredients: 'Cetirizine Hydrochloride (10mg)',
    manufacturer: 'Dr. Reddy Labs'
  },
  {
    id: 'glycomet-500',
    brandName: 'Glycomet 500 / Metformin',
    genericName: 'Metformin Hydrochloride 500mg',
    category: 'Diabetes Care',
    imageUrl: '/images/medicines/med_cream_ovals.png',
    purpose: 'Type-2 Diabetes management to control blood sugar levels.',
    whenToTake: '1 tablet twice daily WITH or IMMEDIATELY AFTER meals (Breakfast & Dinner).',
    dosageSchedule: 'With Meals (During Food)',
    precautions: 'Regular blood glucose monitoring is required. Avoid excessive alcohol.',
    activeIngredients: 'Metformin Hydrochloride (500mg)',
    manufacturer: 'USV Ltd'
  },
  {
    id: 'aspirin-75',
    brandName: 'Ecosprin 75 / Aspirin',
    genericName: 'Aspirin (Acetylsalicylic Acid) 75mg',
    category: 'Blood Thinner & Heart Care',
    imageUrl: '/images/medicines/med_red_white_pills.png',
    purpose: 'Prevention of heart attacks, stroke, and blood clot formation.',
    whenToTake: '1 tablet once daily after main meal (Lunch or Dinner) at the same time.',
    dosageSchedule: 'Post-Meal (Take After Food)',
    precautions: 'Must be taken under medical supervision. Avoid if bleeding disorders exist.',
    activeIngredients: 'Aspirin (75mg)',
    manufacturer: 'USV Private Limited'
  }
]

export default function MedicineSearch() {
  const [activeMode, setActiveMode] = useState('search') // 'search' | 'ai'
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [medicines, setMedicines] = useState(DEFAULT_FALLBACK_MEDICINES)
  const [loading, setLoading] = useState(false)
  const [addedIds, setAddedIds] = useState([])
  const [expandedId, setExpandedId] = useState(null)

  // AI Assistant States
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState(null)

  const fetchMedicines = useCallback(async (q) => {
    setLoading(true)
    try {
      const res = await fetch(getApiUrl(`/api/medicines/search?q=${encodeURIComponent(q)}`))
      const data = await res.json()
      if (data.success && data.medicines && data.medicines.length > 0) {
        setMedicines(data.medicines)
      } else if (!q || !q.trim()) {
        setMedicines(DEFAULT_FALLBACK_MEDICINES)
      } else {
        const filtered = DEFAULT_FALLBACK_MEDICINES.filter(m =>
          m.brandName.toLowerCase().includes(q.toLowerCase()) ||
          m.genericName.toLowerCase().includes(q.toLowerCase())
        )
        setMedicines(filtered.length > 0 ? filtered : DEFAULT_FALLBACK_MEDICINES)
      }
    } catch {
      const filtered = DEFAULT_FALLBACK_MEDICINES.filter(m =>
        m.brandName.toLowerCase().includes(q.toLowerCase()) ||
        m.genericName.toLowerCase().includes(q.toLowerCase())
      )
      setMedicines(filtered.length > 0 ? filtered : DEFAULT_FALLBACK_MEDICINES)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeMode === 'search') {
      const timer = setTimeout(() => {
        fetchMedicines(query)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [query, fetchMedicines, activeMode])

  const handleAddSchedule = (id) => {
    setAddedIds(prev => [...prev, id])
    setTimeout(() => {
      setAddedIds(prev => prev.filter(item => item !== id))
    }, 3500)
  }

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  const handleAiConsult = async (customPrompt) => {
    const textToAsk = customPrompt || aiPrompt
    if (!textToAsk || !textToAsk.trim()) return

    setAiLoading(true)
    setAiResponse(null)
    try {
      let res = await fetch(getApiUrl('/api/medicines/ai-consult'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToAsk.trim() })
      })

      // Secondary Fail-Safe Attempt if primary endpoint returns non-OK status
      if (!res.ok) {
        res = await fetch('https://pulsemed-backend.onrender.com/api/medicines/ai-consult', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: textToAsk.trim() })
        })
      }

      const data = await res.json()
      if (data.success) {
        setAiResponse(data)

        saveActivityToMedicalHistory({
          title: `AI Search: "${textToAsk.trim()}"`,
          category: 'Medicines',
          typeIcon: '🤖',
          status: 'SEARCHED 🔎',
          statusBg: '#f3e8ff',
          statusColor: '#7e22ce',
          summary: `Asked Gemini AI: "${textToAsk.trim()}"`,
          doctorNote: `AI Search Provider: ${data.provider || 'Google Gemini AI Medical Assistant'}`,
          details: [
            `Question Prompt: "${textToAsk.trim()}"`,
            `Provider Engine: ${data.provider || 'Google Gemini AI'}`,
            `Query Processed: Real Medical Database & Clinical Search`
          ]
        })
      } else {
        setAiResponse({
          success: false,
          answer: data.message || 'Unable to retrieve AI response. Please try again.'
        })
      }
    } catch {
      // Direct Fallback Call to Live Render Backend
      try {
        const fallbackRes = await fetch('https://pulsemed-backend.onrender.com/api/medicines/ai-consult', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: textToAsk.trim() })
        })
        const fallbackData = await fallbackRes.json()
        if (fallbackData.success) {
          setAiResponse(fallbackData)
          return
        }
      } catch {
        // Ignored
      }
      setAiResponse({
        success: false,
        answer: 'Failed to connect to AI Assistant. Please check your network connection.'
      })
    } finally {
      setAiLoading(false)
    }
  }

  const filteredMedicines = medicines.filter(med => {
    if (activeCategory === 'All') return true
    if (activeCategory === 'Pain') return med.category.includes('Pain') || med.category.includes('Fever')
    if (activeCategory === 'Antibiotic') return med.category.includes('Antibiotic')
    if (activeCategory === 'Gastric') return med.category.includes('Antacid') || med.category.includes('Gastric')
    if (activeCategory === 'Allergic') return med.category.includes('Allergic')
    if (activeCategory === 'Chronic') return med.category.includes('Diabetes') || med.category.includes('Heart') || med.category.includes('Blood')
    return true
  })

  // Common line clamp helper styles for uniform text lengths
  const lineClampStyle = (lines) => ({
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  })

  return (
    <div style={{ marginTop: '-0.4rem', padding: '0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
      `}</style>

      {/* ── HERO BANNER WITH ULTRA-PROFESSIONAL EXECUTIVE HEADER ────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #111827 40%, #1e1b4b 100%)',
        borderRadius: '22px',
        padding: '1.8rem 2rem',
        marginBottom: '1.4rem',
        color: '#ffffff',
        boxShadow: '0 20px 50px -15px rgba(15, 23, 42, 0.6)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Subtle Background Radial Glow */}
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
          {/* Header Row: Title & Badges on Left, Mode Switcher & Stats on Right */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1rem' }}>
            
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
                💊
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
                    PulseMed Intelligent Safety Directory
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
                    10k+ FDA MEDS
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
                  Smart Medicine Search & Dosage Guide
                </h1>
              </div>
            </div>

            {/* Right Side: AI Assistant Mode Switcher */}
            <div style={{
              display: 'inline-flex',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              padding: '0.25rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              backdropFilter: 'blur(10px)'
            }}>
              <button
                type="button"
                onClick={() => setActiveMode('search')}
                style={{
                  padding: '0.48rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: activeMode === 'search' ? '#6366f1' : 'transparent',
                  color: activeMode === 'search' ? '#ffffff' : '#cbd5e1',
                  transition: 'all 0.2s ease'
                }}
              >
                🔍 Search Directory
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('ai')}
                style={{
                  padding: '0.48rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: activeMode === 'ai' ? '#a855f7' : 'transparent',
                  color: activeMode === 'ai' ? '#ffffff' : '#cbd5e1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.2s ease'
                }}
              >
                🤖 Ask Gemini AI
              </button>
            </div>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 1.4rem 0', maxWidth: '760px', lineHeight: 1.5 }}>
            {activeMode === 'search'
              ? 'Search any medicine by brand or generic chemical name to get instant medical info: kab aur kaise lena hai, active dosage, purpose, and safety precautions.'
              : 'Ask Gemini AI Assistant any health query, food combination safety, drug interaction, or personalized timing guidance in real time.'}
          </p>

          {/* MODE 1: DIRECTORY SEARCH BAR */}
          {activeMode === 'search' && (
            <div style={{ position: 'relative', maxWidth: '720px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(12px)',
                borderRadius: '14px',
                padding: '0.25rem 0.35rem 0.25rem 1.1rem',
                border: '2px solid rgba(165, 180, 252, 0.5)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: '0.7rem' }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>

                <input
                  type="text"
                  placeholder="Type medicine name e.g. Dolo 650, Pantocid 40, Paracetamol, Azithral..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: '#0f172a',
                    backgroundColor: 'transparent',
                    padding: '0.55rem 0'
                  }}
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
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
                      fontSize: '0.85rem',
                      marginRight: '0.3rem'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Popular Suggestion Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
                <span style={{ color: '#a5b4fc', fontSize: '0.78rem', fontWeight: 700 }}>Popular:</span>
                {POPULAR_SEARCHES.map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: '10px',
                      padding: '0.2rem 0.6rem',
                      color: '#f1f5f9',
                      fontSize: '0.76rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ⚡ {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MODE 2: GEMINI AI ASSISTANT SEARCH INPUT */}
          {activeMode === 'ai' && (
            <div style={{ position: 'relative', maxWidth: '740px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '0.25rem 0.35rem 0.25rem 1.1rem',
                border: '2px solid #a855f7',
                boxShadow: '0 8px 22px rgba(168, 85, 247, 0.25)'
              }}>
                <span style={{ fontSize: '1.1rem', marginRight: '0.6rem', flexShrink: 0 }}>🤖</span>
                <input
                  type="text"
                  placeholder="Ask Gemini AI: e.g. Can I eat banana with egg? Or Omeprazole timing?"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAiConsult() }}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.94rem',
                    fontWeight: 500,
                    color: '#0f172a',
                    backgroundColor: 'transparent',
                    padding: '0.55rem 0'
                  }}
                />

                <button
                  type="button"
                  onClick={() => handleAiConsult()}
                  disabled={aiLoading || !aiPrompt.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.55rem 1.1rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: aiLoading || !aiPrompt.trim() ? 'not-allowed' : 'pointer',
                    opacity: aiLoading || !aiPrompt.trim() ? 0.6 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: '0 4px 10px rgba(168, 85, 247, 0.3)',
                    flexShrink: 0
                  }}
                >
                  {aiLoading ? 'Thinking...' : 'Ask AI'}
                </button>
              </div>

              {/* Quick AI Prompts */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
                <span style={{ color: '#a5b4fc', fontSize: '0.76rem', fontWeight: 700 }}>Quick Questions:</span>
                {AI_PROMPTS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setAiPrompt(p); handleAiConsult(p) }}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: '10px',
                      padding: '0.2rem 0.6rem',
                      color: '#f1f5f9',
                      fontSize: '0.76rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    💬 {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── AI CONSULTATION RESPONSE PANEL ───────────────────────────── */}
      {activeMode === 'ai' && (
        <div style={{ marginBottom: '1.6rem' }}>
          {aiLoading && (
            <div style={{
              textAlign: 'center',
              padding: '2.5rem 1.5rem',
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 25px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                border: '3.5px solid #f3e8ff',
                borderTop: '3.5px solid #a855f7',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 0.8rem'
              }} />
              <h4 style={{ color: '#0f172a', margin: '0 0 0.25rem 0' }}>Consulting Google Gemini AI Model…</h4>
              <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>Analyzing clinical health data and real-time medical guidelines…</p>
            </div>
          )}

          {!aiLoading && aiResponse && (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e9d5ff',
              padding: '1.5rem 1.8rem',
              boxShadow: '0 10px 30px rgba(168, 85, 247, 0.08)',
              position: 'relative'
            }}>
              {/* AI Response Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', paddingBottom: '0.7rem', borderBottom: '1px solid #f3e8ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                    color: '#ffffff',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    🤖 {aiResponse.provider || 'Google Gemini AI'}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                    Live Medical Consultation
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setAiResponse(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.95rem' }}
                >
                  ✕
                </button>
              </div>

              {/* User Prompt Query */}
              {aiResponse.query && (
                <div style={{ backgroundColor: '#faf5ff', borderRadius: '10px', padding: '0.65rem 0.9rem', marginBottom: '1.1rem', border: '1px solid #f3e8ff' }}>
                  <strong style={{ fontSize: '0.76rem', color: '#7e22ce', textTransform: 'uppercase', display: 'block', marginBottom: '0.15rem' }}>
                    Your Question:
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#581c87', fontWeight: 600 }}>
                    &quot;{aiResponse.query}&quot;
                  </p>
                </div>
              )}

              {/* Rich Formatted Answer with Bullet Points, Short Summary & Note Callout */}
              <FormattedAiAnswer text={aiResponse.answer} />

              {/* Doctor Disclaimer Note */}
              <div style={{ marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px solid #f3e8ff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.95rem' }}>👨‍⚕️</span>
                <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  PulseMed AI provides educational health recommendations. Always consult a certified medical practitioner for prescription treatments.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CATEGORY FILTER PILLS ──────────────────────────────────── */}
      {activeMode === 'search' && (
        <>
          <div style={{
            display: 'flex',
            gap: '0.6rem',
            flexWrap: 'wrap',
            marginBottom: '1.4rem'
          }}>
            {CATEGORIES.map((cat) => {
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
                    border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                    background: isActive ? 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    boxShadow: isActive ? '0 6px 20px rgba(56, 189, 248, 0.3)' : 'none',
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

          {/* ── LOADING STATE ─────────────────────────────────────────── */}
          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                border: '3.5px solid rgba(56, 189, 248, 0.2)',
                borderTop: '3.5px solid #38bdf8',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 1rem'
              }} />
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', fontWeight: 600 }}>
                Searching clinical medicine database & openFDA records...
              </p>
            </div>
          )}

          {/* ── EMPTY RESULTS STATE ────────────────────────────────────── */}
          {!loading && filteredMedicines.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3.5rem 2rem',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.35)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.4rem', fontWeight: 800 }}>
                No medicines found for &quot;{query}&quot;
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: '0 auto 1.2rem auto', maxWidth: '420px' }}>
                Try searching for generic terms like <strong>Paracetamol</strong>, <strong>Ibuprofen</strong>, <strong>Pantoprazole</strong>, or <strong>Amoxicillin</strong>.
              </p>
              <button
                type="button"
                onClick={() => { setQuery(''); setActiveCategory('All') }}
                style={{
                  backgroundColor: '#38bdf8',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.6rem 1.4rem',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Show All Medicines
              </button>
            </div>
          )}

          {/* ── EQUAL-HEIGHT UNIFORM MEDICINE CARDS GRID ───────────────────── */}
          {!loading && filteredMedicines.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '1.5rem',
              alignItems: 'stretch'
            }}>
              {filteredMedicines.map((med) => {
                const isAdded = addedIds.includes(med.id)
                const isExpanded = expandedId === med.id

                return (
                  <div key={med.id} style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '22px',
                    border: '1px solid #e2e8f0',
                    padding: '1.4rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    transition: 'all 0.25s ease'
                  }}>
                    {/* Decorative Top Accent Bar */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '5px',
                      background: med.category.includes('Pain') ? 'linear-gradient(90deg, #ef4444, #f97316)' :
                                 med.category.includes('Antibiotic') ? 'linear-gradient(90deg, #10b981, #06b6d4)' :
                                 med.category.includes('Antacid') ? 'linear-gradient(90deg, #f59e0b, #eab308)' :
                                 'linear-gradient(90deg, #2563eb, #6366f1)'
                    }} />

                    <div>
                      {/* Perfectly Fitted Product Image Thumbnail Container */}
                      <div style={{
                        height: '190px',
                        width: '100%',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        marginBottom: '1.2rem',
                        marginTop: '0.2rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.4rem',
                        boxSizing: 'border-box'
                      }}>
                        <img
                          src={med.imageUrl || '/images/medicines/med_yellow_tablets.png'}
                          alt={med.brandName}
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = '/images/medicines/med_yellow_tablets.png'
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            objectPosition: 'center',
                            transform: 'scale(1.06)',
                            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.12))'
                          }}
                        />
                      </div>

                      {/* Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.8rem', marginBottom: '1rem', minHeight: '3.2rem' }}>
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                          <h3 style={{
                            fontSize: '1.18rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            margin: '0 0 0.25rem 0',
                            letterSpacing: '-0.3px',
                            lineHeight: 1.3,
                            ...(isExpanded ? {} : lineClampStyle(2))
                          }} title={med.brandName}>
                            {med.brandName}
                          </h3>
                          <span style={{
                            fontSize: '0.82rem',
                            color: '#64748b',
                            fontWeight: 600,
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }} title={med.genericName}>
                            🧪 {med.genericName}
                          </span>
                        </div>

                        <span style={{
                          backgroundColor: med.category.includes('Pain') ? '#fef2f2' :
                                           med.category.includes('Antibiotic') ? '#ecfdf5' :
                                           med.category.includes('Antacid') ? '#fffbeb' : '#eff6ff',
                          color: med.category.includes('Pain') ? '#dc2626' :
                                 med.category.includes('Antibiotic') ? '#059669' :
                                 med.category.includes('Antacid') ? '#d97706' : '#2563eb',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '0.28rem 0.7rem',
                          borderRadius: '12px',
                          whiteSpace: 'nowrap',
                          border: '1px solid rgba(0,0,0,0.06)',
                          flexShrink: 0
                        }}>
                          {med.category}
                        </span>
                      </div>

                      {/* ── SECTION 1: DOSAGE & ADMINISTRATION ────── */}
                      <div style={{
                        background: '#eff6ff',
                        borderLeft: '4px solid #2563eb',
                        borderRadius: '14px',
                        border: '1px solid #dbeafe',
                        padding: '0.9rem 1rem',
                        marginBottom: '1rem',
                        minHeight: isExpanded ? 'auto' : '5.4rem',
                        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '1rem' }}>🕒</span>
                            <strong style={{ fontSize: '0.8rem', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 800 }}>
                              DOSAGE & ADMINISTRATION:
                            </strong>
                          </div>
                          <p style={{
                            fontSize: '0.88rem',
                            color: '#1e3a8a',
                            fontWeight: 700,
                            margin: 0,
                            lineHeight: 1.45,
                            ...(isExpanded ? {} : lineClampStyle(2))
                          }}>
                            {med.whenToTake}
                          </p>
                        </div>

                        {med.dosageSchedule && (
                          <div style={{ marginTop: '0.45rem' }}>
                            <span style={{
                              display: 'inline-block',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#1d4ed8',
                              backgroundColor: '#ffffff',
                              padding: '0.18rem 0.6rem',
                              borderRadius: '8px',
                              border: '1px solid #bfdbfe'
                            }}>
                              📌 {med.dosageSchedule}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ── SECTION 2: CLINICAL INDICATIONS & USES ──────── */}
                      <div style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        padding: '0.8rem 0.95rem',
                        marginBottom: '0.9rem',
                        border: '1px solid #f1f5f9',
                        minHeight: isExpanded ? 'auto' : '4.2rem'
                      }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          <span>💡</span> CLINICAL INDICATIONS & USES:
                        </span>
                        <p style={{
                          fontSize: '0.86rem',
                          color: '#475569',
                          margin: 0,
                          lineHeight: 1.4,
                          fontWeight: 600,
                          ...(isExpanded ? {} : lineClampStyle(2))
                        }}>
                          {med.purpose}
                        </p>
                      </div>

                      {/* ── SECTION 3: SAFETY WARNINGS & PRECAUTIONS ──────────── */}
                      {med.precautions && (
                        <div style={{
                          backgroundColor: '#fef2f2',
                          borderLeft: '4px solid #ef4444',
                          borderRadius: '12px',
                          border: '1px solid #fee2e2',
                          padding: '0.75rem 0.95rem',
                          marginBottom: '0.8rem',
                          minHeight: isExpanded ? 'auto' : '3.8rem'
                        }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                            <span>⚠️</span> WARNINGS & PRECAUTIONS:
                          </span>
                          <p style={{
                            fontSize: '0.82rem',
                            color: '#7f1d1d',
                            margin: 0,
                            lineHeight: 1.38,
                            fontWeight: 600,
                            ...(isExpanded ? {} : lineClampStyle(2))
                          }}>
                            {med.precautions}
                          </p>
                        </div>
                      )}

                      {/* Toggle Read More / Collapse link */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(med.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0,
                          marginBottom: '0.8rem',
                          display: 'inline-block'
                        }}
                      >
                        {isExpanded ? '▲ Show Less' : '▼ Read Full Guidelines'}
                      </button>
                    </div>

                    {/* ── CARD FOOTER & ACTIONS ────────────────────────────── */}
                    <div style={{
                      marginTop: '0.6rem',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        fontSize: '0.76rem',
                        color: '#64748b',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '160px'
                      }} title={med.manufacturer}>
                        🏢 {med.manufacturer}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAddSchedule(med.id)}
                        style={{
                          background: isAdded ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '0.52rem 0.95rem',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: isAdded ? '0 4px 14px rgba(16, 185, 129, 0.3)' : '0 4px 14px rgba(99, 102, 241, 0.3)',
                          transition: 'all 0.2s ease',
                          flexShrink: 0
                        }}
                      >
                        {isAdded ? '✓ Added' : '➕ Add to Schedule'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
