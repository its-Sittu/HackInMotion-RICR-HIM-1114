// src/services/reminderService.js
import { getDoseRecords } from './scheduleStorage'

let reminderInterval = null

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Browser Notifications are not supported in this environment.')
    return 'unsupported'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch (err) {
    console.error('Error requesting notification permission:', err)
    return 'denied'
  }
}

export function sendBrowserNotification(title, options = {}) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      return new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: options.tag || 'medisafe-reminder',
        renotify: true,
        ...options
      })
    } catch (err) {
      console.warn('Browser notification trigger fallback:', err)
    }
  }
  return null
}

export function checkUpcomingReminders(onReminder) {
  const records = getDoseRecords()
  const now = new Date()
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const dueDoses = records.filter((rec) => {
    if (rec.status === 'taken' || rec.status === 'skipped') return false

    if (rec.status === 'snoozed' && rec.snoozedUntil) {
      const snoozeTime = new Date(rec.snoozedUntil)
      return now >= snoozeTime
    }

    if (rec.status === 'pending') {
      return rec.scheduledTime === currentHHMM
    }

    return false
  })

  dueDoses.forEach((dose) => {
    const title = `⏰ Time to take ${dose.medicineName}!`
    const body = `Dosage: ${dose.dosage} scheduled for ${dose.scheduledTime}. ${dose.instructions ? 'Note: ' + dose.instructions : ''}`

    sendBrowserNotification(title, { body, tag: `dose-${dose.id}` })

    const reminderEvent = new CustomEvent('medisafe_reminder_triggered', {
      detail: { dose, title, body, timestamp: new Date().toISOString() }
    })
    window.dispatchEvent(reminderEvent)

    if (onReminder) {
      onReminder(dose)
    }
  })

  return dueDoses
}

export function startReminderScheduler(onReminder) {
  if (reminderInterval) {
    clearInterval(reminderInterval)
  }

  // Check immediately, then check every 30 seconds
  checkUpcomingReminders(onReminder)
  reminderInterval = setInterval(() => {
    checkUpcomingReminders(onReminder)
  }, 30000)

  return () => {
    if (reminderInterval) {
      clearInterval(reminderInterval)
      reminderInterval = null
    }
  }
}

export function triggerTestReminder(medicineName = 'Amoxicillin 500mg') {
  const title = `⏰ Demo Reminder: ${medicineName}`
  const body = `It's time to take your scheduled dose of ${medicineName}. Please log your response.`

  sendBrowserNotification(title, { body, tag: `test-${Date.now()}` })

  const reminderEvent = new CustomEvent('medisafe_reminder_triggered', {
    detail: {
      dose: {
        id: `test-dose-${Date.now()}`,
        medicineName,
        dosage: '500 mg',
        scheduledTime: 'Now',
        scheduledDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      },
      title,
      body,
      timestamp: new Date().toISOString()
    }
  })
  window.dispatchEvent(reminderEvent)
}
