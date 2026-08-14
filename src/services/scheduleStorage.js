// src/services/scheduleStorage.js

const SCHEDULES_KEY = 'medisafe_schedules'
const DOSE_RECORDS_KEY = 'medisafe_dose_records'

// Initial seed schedules for immediate demonstration
const INITIAL_SCHEDULES = [
  {
    id: 'sch-demo-1',
    medicineName: 'Amoxicillin',
    dosage: '500 mg',
    frequency: 'twice_daily',
    frequencyLabel: 'Twice Daily',
    times: ['08:00', '20:00'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    instructions: 'Take with food and full glass of water',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch-demo-2',
    medicineName: 'Paracetamol',
    dosage: '650 mg',
    frequency: 'daily',
    frequencyLabel: 'Once Daily',
    times: ['14:00'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    instructions: 'Take after lunch',
    createdAt: new Date().toISOString()
  }
]

export function getSchedules() {
  try {
    const raw = localStorage.getItem(SCHEDULES_KEY)
    if (!raw) {
      localStorage.setItem(SCHEDULES_KEY, JSON.stringify(INITIAL_SCHEDULES))
      return INITIAL_SCHEDULES
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error('Error reading schedules from storage:', err)
    return INITIAL_SCHEDULES
  }
}

export function saveSchedule(newSchedule) {
  const schedules = getSchedules()
  const existingIdx = schedules.findIndex((s) => s.id === newSchedule.id)

  let updated
  if (existingIdx >= 0) {
    updated = [...schedules]
    updated[existingIdx] = newSchedule
  } else {
    updated = [newSchedule, ...schedules]
  }

  try {
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(updated))
    generateTodayDoseRecords(updated)
    window.dispatchEvent(new Event('medisafe_schedules_updated'))
  } catch (err) {
    console.error('Error saving schedule to storage:', err)
  }
  return updated
}

export function deleteSchedule(id) {
  const schedules = getSchedules()
  const updated = schedules.filter((s) => s.id !== id)
  try {
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('medisafe_schedules_updated'))
  } catch (err) {
    console.error('Error deleting schedule from storage:', err)
  }
  return updated
}

export function getDoseRecords() {
  try {
    const raw = localStorage.getItem(DOSE_RECORDS_KEY)
    const records = raw ? JSON.parse(raw) : []
    const schedules = getSchedules()
    return generateTodayDoseRecords(schedules, records)
  } catch (err) {
    console.error('Error reading dose records from storage:', err)
    return []
  }
}

export function saveDoseRecords(records) {
  try {
    localStorage.setItem(DOSE_RECORDS_KEY, JSON.stringify(records))
    window.dispatchEvent(new Event('medisafe_dose_records_updated'))
  } catch (err) {
    console.error('Error saving dose records:', err)
  }
}

export function updateDoseStatus(doseId, status, snoozeMinutes = 0) {
  const records = getDoseRecords()
  const updated = records.map((record) => {
    if (record.id === doseId) {
      const now = new Date()
      let snoozedUntil = null
      if (status === 'snoozed' && snoozeMinutes > 0) {
        snoozedUntil = new Date(now.getTime() + snoozeMinutes * 60000).toISOString()
      }

      return {
        ...record,
        status,
        actedAt: now.toISOString(),
        snoozedUntil
      }
    }
    return record
  })

  saveDoseRecords(updated)
  return updated
}

export function generateTodayDoseRecords(schedules, existingRecords = null) {
  let records = existingRecords
  if (!records) {
    try {
      const raw = localStorage.getItem(DOSE_RECORDS_KEY)
      records = raw ? JSON.parse(raw) : []
    } catch {
      records = []
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const newGenerated = [...records]
  let hasChanges = false

  schedules.forEach((sch) => {
    if (sch.startDate && sch.startDate > todayStr) return
    if (sch.endDate && sch.endDate < todayStr) return

    const times = sch.times || [sch.time || '08:00']
    times.forEach((t) => {
      const doseId = `dose-${sch.id}-${todayStr}-${t}`
      const exists = newGenerated.some((r) => r.id === doseId)
      if (!exists) {
        newGenerated.push({
          id: doseId,
          scheduleId: sch.id,
          medicineName: sch.medicineName,
          dosage: sch.dosage,
          scheduledTime: t,
          scheduledDate: todayStr,
          status: 'pending', // 'pending' | 'taken' | 'skipped' | 'snoozed' | 'missed'
          actedAt: null,
          snoozedUntil: null,
          instructions: sch.instructions || ''
        })
        hasChanges = true
      }
    })
  })

  if (hasChanges) {
    try {
      localStorage.setItem(DOSE_RECORDS_KEY, JSON.stringify(newGenerated))
    } catch (e) {
      console.error('Failed to save auto-generated dose records:', e)
    }
  }

  return newGenerated
}
