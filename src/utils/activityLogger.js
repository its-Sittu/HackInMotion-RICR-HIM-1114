/**
 * Global Activity Logger Helper for PulseMed Medical History
 * Automatically records every user health activity into Medical Records (localStorage: 'pulsemed_medical_records')
 */
export function saveActivityToMedicalHistory(activity) {
  try {
    const saved = localStorage.getItem('pulsemed_medical_records')
    let existing = []

    if (saved) {
      existing = JSON.parse(saved)
    }

    const now = new Date()
    const formattedDate = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })

    const newRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: activity.title || 'User Health Activity',
      category: activity.category || 'Medicines',
      typeIcon: activity.typeIcon || '📋',
      date: formattedDate,
      status: activity.status || 'LOGGED ✅',
      statusBg: activity.statusBg || '#d1fae5',
      statusColor: activity.statusColor || '#059669',
      summary: activity.summary || 'Health activity recorded in PulseMed system.',
      doctorNote: activity.doctorNote || 'Logged automatically by PulseMed Activity Engine.',
      details: Array.isArray(activity.details) ? activity.details : [activity.summary || 'Activity recorded']
    }

    const updated = [newRecord, ...existing]
    localStorage.setItem('pulsemed_medical_records', JSON.stringify(updated))

    // Dispatch event so active components update in real time
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pulsemed_medical_history_updated', { detail: newRecord }))
    }

    return newRecord
  } catch (err) {
    console.error('Error saving activity to medical history:', err)
    return null
  }
}
