import React, { useState } from 'react'
import '../../styles/medication.css'

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Once Daily', defaultTimes: ['08:00'] },
  { value: 'twice_daily', label: 'Twice Daily', defaultTimes: ['08:00', '20:00'] },
  { value: 'thrice_daily', label: 'Three Times Daily', defaultTimes: ['08:00', '14:00', '20:00'] },
  { value: 'every_8_hours', label: 'Every 8 Hours', defaultTimes: ['06:00', '14:00', '22:00'] },
  { value: 'weekly', label: 'Weekly', defaultTimes: ['09:00'] },
  { value: 'as_needed', label: 'As Needed (PRN)', defaultTimes: ['08:00'] }
]

export default function DosageTimingForm({
  onSave,
  onCancel,
  initialData = null
}) {
  const getTodayISO = () => new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    medicineName: initialData?.medicineName || '',
    dosage: initialData?.dosage || '',
    frequency: initialData?.frequency || 'daily',
    times: initialData?.times?.length ? initialData.times : ['08:00'],
    startDate: initialData?.startDate || getTodayISO(),
    endDate: initialData?.endDate || '',
    instructions: initialData?.instructions || ''
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validate = (data = formData) => {
    const errs = {}

    if (!data.medicineName || !data.medicineName.trim()) {
      errs.medicineName = 'Medicine name is required.'
    } else if (data.medicineName.trim().length < 2) {
      errs.medicineName = 'Medicine name must be at least 2 characters.'
    }

    if (!data.dosage || !data.dosage.trim()) {
      errs.dosage = 'Dosage amount is required (e.g. 500 mg, 1 tablet).'
    }

    if (!data.frequency) {
      errs.frequency = 'Please select a frequency.'
    }

    if (!data.startDate) {
      errs.startDate = 'Start date is required.'
    }

    if (data.endDate) {
      if (new Date(data.endDate) < new Date(data.startDate)) {
        errs.endDate = 'End date cannot be earlier than start date.'
      }
    }

    if (!data.times || data.times.length === 0) {
      errs.times = 'At least one scheduled time is required.'
    } else {
      const invalidTime = data.times.some((t) => !t || !/^([01]\d|2[0-3]):[0-5]\d$/.test(t))
      if (invalidTime) {
        errs.times = 'Please enter valid times in HH:MM format.'
      }
    }

    return errs
  }

  const handleInputChange = (field, value) => {
    const nextData = { ...formData, [field]: value }

    if (field === 'frequency') {
      const selectedOption = FREQUENCY_OPTIONS.find((opt) => opt.value === value)
      if (selectedOption) {
        nextData.times = [...selectedOption.defaultTimes]
      }
    }

    setFormData(nextData)

    if (touched[field]) {
      const fieldErrors = validate(nextData)
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }))
    }
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const fieldErrors = validate()
    setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }))
  }

  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.times]
    newTimes[index] = value
    const nextData = { ...formData, times: newTimes }
    setFormData(nextData)

    if (touched.times) {
      const fieldErrors = validate(nextData)
      setErrors((prev) => ({ ...prev, times: fieldErrors.times }))
    }
  }

  const addTimeSlot = () => {
    setFormData((prev) => ({
      ...prev,
      times: [...prev.times, '12:00']
    }))
  }

  const removeTimeSlot = (index) => {
    if (formData.times.length <= 1) return
    const newTimes = formData.times.filter((_, idx) => idx !== index)
    setFormData((prev) => ({ ...prev, times: newTimes }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({
      medicineName: true,
      dosage: true,
      frequency: true,
      times: true,
      startDate: true,
      endDate: true
    })

    const validationErrors = validate()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const freqObj = FREQUENCY_OPTIONS.find((opt) => opt.value === formData.frequency)

    onSave({
      id: initialData?.id || `med-sch-${Date.now()}`,
      medicineName: formData.medicineName.trim(),
      dosage: formData.dosage.trim(),
      frequency: formData.frequency,
      frequencyLabel: freqObj ? freqObj.label : formData.frequency,
      times: formData.times,
      startDate: formData.startDate,
      endDate: formData.endDate || null,
      instructions: formData.instructions.trim(),
      createdAt: initialData?.createdAt || new Date().toISOString()
    })
  }

  return (
    <div className="med-panel">
      <div className="med-panel-header">
        <h3 className="med-panel-title">
          <svg
            className="med-panel-icon"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
          {initialData ? 'Edit Medication Schedule' : 'Add New Medication Schedule'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="med-form-card" noValidate>
        <div className="med-form-grid">
          {/* Medicine Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="medicineName">
              Medicine Name <span className="form-required">*</span>
            </label>
            <input
              id="medicineName"
              type="text"
              className={`form-input ${errors.medicineName ? 'is-invalid' : ''}`}
              placeholder="e.g. Amoxicillin, Paracetamol"
              value={formData.medicineName}
              onChange={(e) => handleInputChange('medicineName', e.target.value)}
              onBlur={() => handleBlur('medicineName')}
            />
            {errors.medicineName && (
              <span className="form-error-msg">{errors.medicineName}</span>
            )}
          </div>

          {/* Dosage */}
          <div className="form-group">
            <label className="form-label" htmlFor="dosage">
              Dosage & Unit <span className="form-required">*</span>
            </label>
            <input
              id="dosage"
              type="text"
              className={`form-input ${errors.dosage ? 'is-invalid' : ''}`}
              placeholder="e.g. 500 mg, 1 tablet, 5 ml"
              value={formData.dosage}
              onChange={(e) => handleInputChange('dosage', e.target.value)}
              onBlur={() => handleBlur('dosage')}
            />
            {errors.dosage && (
              <span className="form-error-msg">{errors.dosage}</span>
            )}
          </div>

          {/* Frequency */}
          <div className="form-group">
            <label className="form-label" htmlFor="frequency">
              Frequency <span className="form-required">*</span>
            </label>
            <select
              id="frequency"
              className={`form-select ${errors.frequency ? 'is-invalid' : ''}`}
              value={formData.frequency}
              onChange={(e) => handleInputChange('frequency', e.target.value)}
              onBlur={() => handleBlur('frequency')}
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.frequency && (
              <span className="form-error-msg">{errors.frequency}</span>
            )}
          </div>

          {/* Scheduled Times */}
          <div className="form-group form-group-full">
            <label className="form-label">
              Scheduled Time(s) <span className="form-required">*</span>
            </label>
            <div className="times-input-list">
              {formData.times.map((t, idx) => (
                <div key={idx} className="time-input-row">
                  <input
                    type="time"
                    className={`form-input ${errors.times ? 'is-invalid' : ''}`}
                    value={t}
                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                    onBlur={() => handleBlur('times')}
                  />
                  {formData.times.length > 1 && (
                    <button
                      type="button"
                      className="med-btn med-btn-danger med-btn-icon-only"
                      onClick={() => removeTimeSlot(idx)}
                      title="Remove time"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="med-btn med-btn-secondary"
                style={{ width: 'fit-content', marginTop: '0.2rem' }}
                onClick={addTimeSlot}
              >
                + Add Another Time
              </button>
            </div>
            {errors.times && (
              <span className="form-error-msg">{errors.times}</span>
            )}
          </div>

          {/* Start Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="startDate">
              Start Date <span className="form-required">*</span>
            </label>
            <input
              id="startDate"
              type="date"
              className={`form-input ${errors.startDate ? 'is-invalid' : ''}`}
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              onBlur={() => handleBlur('startDate')}
            />
            {errors.startDate && (
              <span className="form-error-msg">{errors.startDate}</span>
            )}
          </div>

          {/* End Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="endDate">
              End Date (Optional)
            </label>
            <input
              id="endDate"
              type="date"
              className={`form-input ${errors.endDate ? 'is-invalid' : ''}`}
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              onBlur={() => handleBlur('endDate')}
            />
            {errors.endDate && (
              <span className="form-error-msg">{errors.endDate}</span>
            )}
          </div>

          {/* Special Instructions */}
          <div className="form-group form-group-full">
            <label className="form-label" htmlFor="instructions">
              Special Instructions / Notes
            </label>
            <input
              id="instructions"
              type="text"
              className="form-input"
              placeholder="e.g. Take with food, Do not crush"
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="med-btn med-btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="med-btn med-btn-primary">
            Save Schedule
          </button>
        </div>
      </form>
    </div>
  )
}
