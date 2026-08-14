// src/services/adherenceCalculator.js

/**
 * Calculates adherence statistics from dose records.
 * Formula: (Taken Doses / Total Applicable Scheduled Doses) * 100
 */
export function calculateAdherence(doseRecords = []) {
  if (!Array.isArray(doseRecords) || doseRecords.length === 0) {
    return {
      adherencePercentage: 100,
      totalScheduled: 0,
      takenCount: 0,
      skippedCount: 0,
      snoozedCount: 0,
      missedCount: 0,
      pendingCount: 0,
      statusLabel: 'No Doses Scheduled'
    }
  }

  let takenCount = 0
  let skippedCount = 0
  let snoozedCount = 0
  let missedCount = 0
  let pendingCount = 0

  doseRecords.forEach((rec) => {
    switch (rec.status) {
      case 'taken':
        takenCount++
        break
      case 'skipped':
        skippedCount++
        break
      case 'snoozed':
        snoozedCount++
        break
      case 'missed':
        missedCount++
        break
      case 'pending':
      default:
        pendingCount++
        break
    }
  })

  // Evaluated doses (doses that are completed or overdue/missed/skipped)
  const evaluatedCount = takenCount + skippedCount + missedCount
  const totalScheduled = doseRecords.length

  // Adherence formula: Taken doses / Total applicable doses * 100
  // If evaluatedCount > 0, calculate against evaluated doses (or totalScheduled)
  const denominator = evaluatedCount > 0 ? evaluatedCount : totalScheduled
  const rawPercentage = denominator > 0 ? (takenCount / denominator) * 100 : 100
  const adherencePercentage = Math.min(100, Math.max(0, Math.round(rawPercentage)))

  let statusLabel = 'Excellent'
  if (adherencePercentage < 60) {
    statusLabel = 'Needs Attention'
  } else if (adherencePercentage < 80) {
    statusLabel = 'Moderate'
  } else if (adherencePercentage < 95) {
    statusLabel = 'Good'
  }

  return {
    adherencePercentage,
    totalScheduled,
    evaluatedCount,
    takenCount,
    skippedCount,
    snoozedCount,
    missedCount,
    pendingCount,
    statusLabel
  }
}

export function calculateDailyAdherence(doseRecords = [], dateStr = null) {
  const targetDate = dateStr || new Date().toISOString().split('T')[0]
  const dayRecords = doseRecords.filter((r) => r.scheduledDate === targetDate)
  return calculateAdherence(dayRecords)
}

export function calculateWeeklyAdherence(doseRecords = []) {
  const resultDays = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
    const dayStats = calculateDailyAdherence(doseRecords, dateStr)

    resultDays.push({
      date: dateStr,
      dayName,
      percentage: dayStats.adherencePercentage,
      taken: dayStats.takenCount,
      skipped: dayStats.skippedCount,
      missed: dayStats.missedCount,
      total: dayStats.totalScheduled
    })
  }

  return resultDays
}
