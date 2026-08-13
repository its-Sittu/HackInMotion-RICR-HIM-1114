// src/services/missedDoseDetector.js
import { getDoseRecords, saveDoseRecords } from './scheduleStorage'

/**
 * Checks pending and snoozed doses against the current time.
 * If scheduled time + grace period (default 30 min) has passed without being taken,
 * transition status to 'missed' and save in storage.
 *
 * NOTE: Does NOT send emergency messages to emergency contacts.
 * Strictly detects and records missed doses locally.
 */
export function detectMissedDoses(gracePeriodMinutes = 30) {
  const records = getDoseRecords()
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  let hasUpdates = false
  const freshlyMissed = []

  const updatedRecords = records.map((rec) => {
    // Only pending or snoozed doses can become missed
    if (rec.status !== 'pending' && rec.status !== 'snoozed') {
      return rec
    }

    let isOverdue = false

    // Past date dose that was never taken
    if (rec.scheduledDate < todayStr) {
      isOverdue = true
    } else if (rec.scheduledDate === todayStr && rec.scheduledTime) {
      if (rec.scheduledTime === 'Now') return rec

      const [schH, schM] = rec.scheduledTime.split(':').map((v) => parseInt(v, 10))
      const scheduledMinutes = schH * 60 + schM
      const cutoffMinutes = scheduledMinutes + gracePeriodMinutes

      if (rec.status === 'snoozed' && rec.snoozedUntil) {
        const snoozeDate = new Date(rec.snoozedUntil)
        if (now > new Date(snoozeDate.getTime() + gracePeriodMinutes * 60000)) {
          isOverdue = true
        }
      } else if (currentMinutes > cutoffMinutes) {
        isOverdue = true
      }
    }

    if (isOverdue) {
      hasUpdates = true
      const missedRecord = {
        ...rec,
        status: 'missed',
        actedAt: rec.actedAt || now.toISOString()
      }
      freshlyMissed.push(missedRecord)
      return missedRecord
    }

    return rec
  })

  if (hasUpdates) {
    saveDoseRecords(updatedRecords)
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('medisafe_missed_doses_detected', {
        detail: { freshlyMissed, totalMissed: updatedRecords.filter((r) => r.status === 'missed') }
      })
      window.dispatchEvent(event)
    }
  }

  return updatedRecords.filter((r) => r.status === 'missed')
}

export function getActiveMissedDoses() {
  const records = getDoseRecords()
  return records.filter((r) => r.status === 'missed')
}
