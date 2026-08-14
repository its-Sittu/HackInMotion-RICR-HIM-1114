import React, { useState, useEffect } from 'react'
import MedicationScheduleList from './MedicationScheduleList'
import DosageTimingForm from './DosageTimingForm'
import TodayDosesList from './TodayDosesList'
import AdherenceAnalytics from './AdherenceAnalytics'
import MissedDoseAlerts from './MissedDoseAlerts'
import {
  getSchedules,
  saveSchedule,
  deleteSchedule,
  getDoseRecords,
  updateDoseStatus
} from '../../services/scheduleStorage'
import { startReminderScheduler, triggerTestReminder, requestNotificationPermission } from '../../services/reminderService'
import { detectMissedDoses, getActiveMissedDoses } from '../../services/missedDoseDetector'
import '../../styles/medication.css'

export default function MedicationDashboard() {
  const [schedules, setSchedules] = useState([])
  const [doseRecords, setDoseRecords] = useState([])
  const [missedDoses, setMissedDoses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [activeTab, setActiveTab] = useState('today') // 'today' | 'analytics' | 'schedule'
  const [activeToast, setActiveToast] = useState(null)
  const [notificationPermission, setNotificationPermission] = useState('default')

  const refreshAllData = () => {
    const schs = getSchedules()
    setSchedules(schs)

    // Detect missed doses automatically
    detectMissedDoses(30)

    const doses = getDoseRecords()
    setDoseRecords(doses)

    const activeMissed = getActiveMissedDoses()
    setMissedDoses(activeMissed)
  }

  useEffect(() => {
    refreshAllData()

    // Request notification permission if supported
    requestNotificationPermission().then((perm) => {
      setNotificationPermission(perm)
    })

    // Start background reminder scheduler
    const cleanupScheduler = startReminderScheduler((dose) => {
      setActiveToast({
        title: `⏰ Time for ${dose.medicineName}`,
        body: `${dose.dosage} scheduled for ${dose.scheduledTime}`
      })
    })

    // Listen for custom events
    const handleSchedulesUpdated = () => refreshAllData()
    const handleDosesUpdated = () => refreshAllData()
    const handleReminderTriggered = (e) => {
      if (e.detail) {
        setActiveToast({
          title: e.detail.title,
          body: e.detail.body
        })
      }
    }

    window.addEventListener('medisafe_schedules_updated', handleSchedulesUpdated)
    window.addEventListener('medisafe_dose_records_updated', handleDosesUpdated)
    window.addEventListener('medisafe_reminder_triggered', handleReminderTriggered)

    return () => {
      cleanupScheduler()
      window.removeEventListener('medisafe_schedules_updated', handleSchedulesUpdated)
      window.removeEventListener('medisafe_dose_records_updated', handleDosesUpdated)
      window.removeEventListener('medisafe_reminder_triggered', handleReminderTriggered)
    }
  }, [])

  const handleSaveSchedule = (scheduleData) => {
    saveSchedule(scheduleData)
    setShowForm(false)
    setEditingSchedule(null)
    refreshAllData()
  }

  const handleDeleteSchedule = (id) => {
    if (window.confirm('Are you sure you want to delete this medication schedule?')) {
      deleteSchedule(id)
      refreshAllData()
    }
  }

  const handleActionStatus = (doseId, status, snoozeMinutes = 0) => {
    updateDoseStatus(doseId, status, snoozeMinutes)
    refreshAllData()
  }

  const handleTestReminder = () => {
    triggerTestReminder('Amoxicillin 500mg')
  }

  return (
    <div className="medication-module-container">
      {/* Toast Notification Banner */}
      {activeToast && (
        <div
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            color: '#fff',
            padding: '0.9rem 1.25rem',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🔔</span>
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>{activeToast.title}</strong>
              <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>{activeToast.body}</span>
            </div>
          </div>
          <button
            type="button"
            className="med-btn med-btn-secondary"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}
            onClick={() => setActiveToast(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Missed Dose Warning Alert */}
      {missedDoses.length > 0 && (
        <MissedDoseAlerts
          missedDoses={missedDoses}
          onResolveDose={handleActionStatus}
        />
      )}

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            className={`med-btn ${activeTab === 'today' ? 'med-btn-primary' : 'med-btn-secondary'}`}
            onClick={() => { setActiveTab('today'); setShowForm(false); }}
          >
            📋 Today's Doses
          </button>
          <button
            type="button"
            className={`med-btn ${activeTab === 'analytics' ? 'med-btn-primary' : 'med-btn-secondary'}`}
            onClick={() => { setActiveTab('analytics'); setShowForm(false); }}
          >
            📊 Adherence Analytics
          </button>
          <button
            type="button"
            className={`med-btn ${activeTab === 'schedule' ? 'med-btn-primary' : 'med-btn-secondary'}`}
            onClick={() => { setActiveTab('schedule'); setShowForm(false); }}
          >
            🗓 Schedules ({schedules.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="med-btn med-btn-secondary"
            onClick={handleTestReminder}
            title="Test medication reminder trigger"
          >
            ⏰ Test Reminder
          </button>
          {!showForm && (
            <button
              type="button"
              className="med-btn med-btn-primary"
              onClick={() => { setShowForm(true); setEditingSchedule(null); }}
            >
              + Add Schedule
            </button>
          )}
        </div>
      </div>

      {/* Form Drawer / Panel */}
      {showForm ? (
        <DosageTimingForm
          initialData={editingSchedule}
          onSave={handleSaveSchedule}
          onCancel={() => { setShowForm(false); setEditingSchedule(null); }}
        />
      ) : (
        <>
          {activeTab === 'today' && (
            <TodayDosesList
              doseRecords={doseRecords}
              onActionStatus={handleActionStatus}
            />
          )}

          {activeTab === 'analytics' && (
            <AdherenceAnalytics doseRecords={doseRecords} />
          )}

          {activeTab === 'schedule' && (
            <MedicationScheduleList
              schedules={schedules}
              onAddNewClick={() => setShowForm(true)}
              onDeleteSchedule={handleDeleteSchedule}
            />
          )}
        </>
      )}
    </div>
  )
}
