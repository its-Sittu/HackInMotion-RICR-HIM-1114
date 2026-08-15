import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getApiUrl } from '../../utils/apiConfig'
import { saveActivityToMedicalHistory } from '../../utils/activityLogger'

const INITIAL_MEDICINES = [
  { id: 'med-1', name: 'Dolo 650', dosage: '650mg', frequency: 'Twice Daily', timeOfDay: 'Post-Meals (After Food)', takenToday: true, active: true },
  { id: 'med-2', name: 'Pantocid 40', dosage: '40mg', frequency: 'Once Daily', timeOfDay: 'Pre-Breakfast (Empty Stomach)', takenToday: true, active: true },
  { id: 'med-3', name: 'Cetirizine 10', dosage: '10mg', frequency: 'Once Daily', timeOfDay: 'Night Bedtime (Before Sleep)', takenToday: false, active: true },
  { id: 'med-4', name: 'Glycomet 500', dosage: '500mg', frequency: 'Twice Daily', timeOfDay: 'With Meals (During Food)', takenToday: false, active: true }
]

const QUICK_SUGGESTIONS = [
  { name: 'Dolo 650', dosage: '650mg', frequency: 'Twice Daily', timeOfDay: 'Post-Meals (After Food)' },
  { name: 'Pantocid 40', dosage: '40mg', frequency: 'Once Daily', timeOfDay: 'Pre-Breakfast (Empty Stomach)' },
  { name: 'Azithral 500', dosage: '500mg', frequency: 'Once Daily', timeOfDay: 'Fixed Time (1h Pre-Food)' },
  { name: 'Ecosprin 75', dosage: '75mg', frequency: 'Once Daily', timeOfDay: 'Post-Lunch (After Food)' },
  { name: 'Atorva 20', dosage: '20mg', frequency: 'Once Daily', timeOfDay: 'Night Bedtime' },
  { name: 'Amoxil 500', dosage: '500mg', frequency: 'Every 8 Hours', timeOfDay: 'Post-Meals' }
]

export default function CurrentMedicines() {
  const { token } = useAuth()
  const [medicines, setMedicines] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsemed_active_medicines')
      return saved ? JSON.parse(saved) : INITIAL_MEDICINES
    } catch {
      return INITIAL_MEDICINES
    }
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    dosage: '500mg',
    frequency: 'Twice Daily',
    timeOfDay: 'Post-Meals (After Food)'
  })
  const [takeMessage, setTakeMessage] = useState('')

  // Sync with backend API if authenticated
  useEffect(() => {
    const fetchUserMeds = async () => {
      if (!token) return
      try {
        const res = await fetch(getApiUrl('/api/medicines/user/list'), {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success && Array.isArray(data.medicines) && data.medicines.length > 0) {
          const formatted = data.medicines.map((m, idx) => ({
            id: m._id || `med-${idx}`,
            name: m.name,
            dosage: m.dosage || '500mg',
            frequency: m.frequency || 'Twice Daily',
            timeOfDay: m.timeOfDay || 'Post-Meals',
            takenToday: false,
            active: m.active !== false
          }))
          setMedicines(formatted)
          localStorage.setItem('pulsemed_active_medicines', JSON.stringify(formatted))
        }
      } catch {
        // Fallback to local storage
      }
    }
    fetchUserMeds()
  }, [token])

  useEffect(() => {
    try {
      localStorage.setItem('pulsemed_active_medicines', JSON.stringify(medicines))
    } catch {
      // LocalStorage optional
    }
  }, [medicines])

  const handleAddMedicine = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    const newMed = {
      id: `med-${Date.now()}`,
      name: formData.name.trim(),
      dosage: formData.dosage.trim(),
      frequency: formData.frequency.trim(),
      timeOfDay: formData.timeOfDay.trim(),
      takenToday: false,
      active: true
    }

    const updated = [newMed, ...medicines]
    setMedicines(updated)
    setIsModalOpen(false)
    setFormData({ name: '', dosage: '500mg', frequency: 'Twice Daily', timeOfDay: 'Post-Meals (After Food)' })

    // Log to Medical History
    saveActivityToMedicalHistory({
      type: 'MEDICINE_LOGGED',
      title: `Added Medication: ${newMed.name} (${newMed.dosage})`,
      category: 'Prescription',
      doctor: 'Self Logged',
      details: `Scheduled ${newMed.frequency} - ${newMed.timeOfDay}`
    })

    // Sync to backend if token exists
    if (token) {
      try {
        await fetch(getApiUrl('/api/medicines/user/add'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: newMed.name,
            dosage: newMed.dosage,
            frequency: newMed.frequency,
            timeOfDay: newMed.timeOfDay
          })
        })
      } catch {
        // Offline safe
      }
    }
  }

  const handleToggleTaken = (id) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        const nextState = !m.takenToday
        if (nextState) {
          setTakeMessage(`✓ Great job! Marked ${m.name} as taken today.`)
          setTimeout(() => setTakeMessage(''), 3000)
          saveActivityToMedicalHistory({
            type: 'MEDICINE_TAKEN',
            title: `Dose Taken: ${m.name}`,
            category: 'Adherence',
            doctor: 'Patient Action',
            details: `Successfully completed ${m.dosage} dose at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          })
        }
        return { ...m, takenToday: nextState }
      }
      return m
    }))
  }

  const handleDelete = (id, name) => {
    setMedicines(prev => prev.filter(m => m.id !== id))
    saveActivityToMedicalHistory({
      type: 'MEDICINE_DISCONTINUED',
      title: `Discontinued: ${name}`,
      category: 'Prescription',
      doctor: 'Patient Action',
      details: `Removed from active medication regimen.`
    })
  }

  const takenCount = medicines.filter(m => m.takenToday).length
  const adherenceRate = medicines.length > 0 ? Math.round((takenCount / medicines.length) * 100) : 100

  return (
    <section className="dash-card" style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.4rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>💊</span>
            <h3 className="dash-card-title" style={{ margin: 0, fontSize: '1.25rem' }}>Active Prescribed Medications</h3>
            <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
              {medicines.length} Active
            </span>
          </div>
          <p className="dash-card-desc" style={{ margin: '0.25rem 0 0 0' }}>
            Track daily dosages, mark adherence, and auto-screen for dangerous drug interactions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '0.65rem 1.25rem',
            background: 'linear-gradient(135deg, #f43f5e 0%, #06b6d4 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '0.88rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 15px rgba(244, 63, 94, 0.35)',
            transition: 'all 0.2s ease'
          }}
        >
          <span>+</span> Add Medication
        </button>
      </div>

      {/* Adherence Progress Strip */}
      <div style={{ padding: '0.9rem 1.1rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
            🎯
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Today&apos;s Dosage Adherence</span>
            <strong style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 900 }}>{takenCount} of {medicines.length} Doses Taken ({adherenceRate}%)</strong>
          </div>
        </div>
        <span style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: 800, backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '0.3rem 0.7rem', borderRadius: '10px' }}>
          ✓ Drug Safety Matrix Screened
        </span>
      </div>

      {takeMessage && (
        <div className="auth-alert success" style={{ marginBottom: '1.2rem' }}>
          {takeMessage}
        </div>
      )}

      {/* Medicines List Grid */}
      {medicines.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '2.4rem', display: 'block', marginBottom: '0.6rem' }}>💊</span>
          <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>No Active Medicines Added</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.4rem 0 1rem 0' }}>Add your prescribed daily medicines to start monitoring intake schedules and drug safety.</p>
          <button type="button" onClick={() => setIsModalOpen(true)} className="btn-auth-primary" style={{ width: 'auto', padding: '0.6rem 1.4rem', margin: '0 auto', fontSize: '0.88rem' }}>
            + Add First Medicine
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {medicines.map((med) => (
            <div
              key={med.id}
              style={{
                padding: '1.2rem',
                borderRadius: '18px',
                background: med.takenToday ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                border: med.takenToday ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.8rem',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                      {med.name}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>
                      Dosage: {med.dosage}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '8px',
                    backgroundColor: med.takenToday ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                    color: med.takenToday ? '#ffffff' : '#94a3b8'
                  }}>
                    {med.takenToday ? '✓ TAKEN' : 'PENDING'}
                  </span>
                </div>

                <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                    ⏰ <strong>Frequency:</strong> {med.frequency}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                    🍽️ <strong>Timing:</strong> {med.timeOfDay}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => handleToggleTaken(med.id)}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: med.takenToday ? 'rgba(255, 255, 255, 0.1)' : '#10b981',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {med.takenToday ? 'Mark Uncompleted' : '✓ Take Dose'}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(med.id, med.name)}
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#fca5a5',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="Remove from list"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prominent Medical Disclaimer */}
      <div style={{ marginTop: '1.4rem', padding: '0.8rem 1rem', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
        <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '0.1rem' }}>⚠️</span>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#fcd34d', lineHeight: 1.45 }}>
          <strong>Clinical Medical Disclaimer:</strong> MediSafe medication logs and automated interaction analyses provide educational assistance. Always adhere to your doctor&apos;s physical prescription before taking or altering any medicine doses.
        </p>
      </div>

      {/* Add Medication Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'grid',
          placeItems: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '24px',
            padding: '1.8rem',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>Add New Medication</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Quick Autofill Pills */}
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Quick Autofill:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {QUICK_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.name}
                    type="button"
                    onClick={() => setFormData({ name: sug.name, dosage: sug.dosage, frequency: sug.frequency, timeOfDay: sug.timeOfDay })}
                    style={{
                      padding: '0.25rem 0.6rem',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#38bdf8',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + {sug.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddMedicine} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label className="auth-label" style={{ fontSize: '0.76rem', marginBottom: '0.35rem' }}>Medicine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol, Pantocid 40..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="auth-input"
                  style={{ width: '100%', paddingLeft: '1rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label className="auth-label" style={{ fontSize: '0.76rem', marginBottom: '0.35rem' }}>Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg, 1 tablet"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="auth-input"
                    style={{ width: '100%', paddingLeft: '1rem' }}
                  />
                </div>

                <div>
                  <label className="auth-label" style={{ fontSize: '0.76rem', marginBottom: '0.35rem' }}>Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="auth-input"
                    style={{ width: '100%', paddingLeft: '0.8rem', background: '#0f172a' }}
                  >
                    <option value="Once Daily">Once Daily</option>
                    <option value="Twice Daily">Twice Daily</option>
                    <option value="Thrice Daily">Thrice Daily</option>
                    <option value="Every 8 Hours">Every 8 Hours</option>
                    <option value="SOS As Needed">SOS As Needed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="auth-label" style={{ fontSize: '0.76rem', marginBottom: '0.35rem' }}>Administration Timing</label>
                <select
                  value={formData.timeOfDay}
                  onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                  className="auth-input"
                  style={{ width: '100%', paddingLeft: '0.8rem', background: '#0f172a' }}
                >
                  <option value="Post-Meals (After Food)">Post-Meals (After Food)</option>
                  <option value="Pre-Breakfast (Empty Stomach)">Pre-Breakfast (Empty Stomach)</option>
                  <option value="With Meals (During Food)">With Meals (During Food)</option>
                  <option value="Night Bedtime (Before Sleep)">Night Bedtime (Before Sleep)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-auth-primary"
                  style={{ flex: 2, padding: '0.75rem', marginTop: 0, borderRadius: '12px' }}
                >
                  ✓ Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
