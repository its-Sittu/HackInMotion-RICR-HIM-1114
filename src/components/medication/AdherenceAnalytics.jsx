import React from 'react'
import { calculateAdherence, calculateWeeklyAdherence } from '../../services/adherenceCalculator'
import '../../styles/medication.css'

export default function AdherenceAnalytics({ doseRecords = [] }) {
  const stats = calculateAdherence(doseRecords)
  const weeklyData = calculateWeeklyAdherence(doseRecords)

  // SVG Circular Progress offset calculation
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (stats.adherencePercentage / 100) * circumference

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
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Adherence Analytics
        </h3>
        <span className="med-badge med-badge-green">
          {stats.statusLabel} ({stats.adherencePercentage}%)
        </span>
      </div>

      {/* Hero Progress Gauge */}
      <div className="adherence-hero-box">
        <div className="progress-circle-container">
          <svg className="progress-circle-svg" viewBox="0 0 88 88">
            <defs>
              <linearGradient id="adherenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <circle className="progress-circle-bg" cx="44" cy="44" r={radius} />
            <circle
              className="progress-circle-fill"
              cx="44"
              cy="44"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="progress-circle-text">{stats.adherencePercentage}%</div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-h)' }}>
            Daily Medication Adherence
          </h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.5 }}>
            You have completed <strong>{stats.takenCount}</strong> out of{' '}
            <strong>{stats.totalScheduled}</strong> scheduled doses today.
            {stats.missedCount > 0 && (
              <span style={{ color: '#f43f5e', fontWeight: 600 }}> ({stats.missedCount} missed)</span>
            )}
          </p>
        </div>
      </div>

      {/* 4 Stat Counter Cards */}
      <div className="analytics-grid">
        <div className="analytics-stat-card" style={{ borderLeft: '4px solid #22c55e' }}>
          <span className="stat-label">Taken Doses</span>
          <span className="stat-value" style={{ color: '#22c55e' }}>
            {stats.takenCount}
          </span>
        </div>

        <div className="analytics-stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <span className="stat-label">Skipped Doses</span>
          <span className="stat-value" style={{ color: '#f59e0b' }}>
            {stats.skippedCount}
          </span>
        </div>

        <div className="analytics-stat-card" style={{ borderLeft: '4px solid #a855f7' }}>
          <span className="stat-label">Snoozed Doses</span>
          <span className="stat-value" style={{ color: '#a855f7' }}>
            {stats.snoozedCount}
          </span>
        </div>

        <div className="analytics-stat-card" style={{ borderLeft: '4px solid #f43f5e' }}>
          <span className="stat-label">Missed Doses</span>
          <span className="stat-value" style={{ color: '#f43f5e' }}>
            {stats.missedCount}
          </span>
        </div>
      </div>

      {/* 7-Day Weekly Adherence Bar Chart */}
      <div className="weekly-chart-box">
        <h4 className="chart-title">Weekly Adherence Trend (Past 7 Days)</h4>
        <div className="weekly-bars-container">
          {weeklyData.map((day, idx) => {
            let barClass = 'bar-fill-high'
            if (day.percentage < 60) barClass = 'bar-fill-low'
            else if (day.percentage < 85) barClass = 'bar-fill-mid'

            return (
              <div key={idx} className="bar-column">
                <span className="bar-value">{day.percentage}%</span>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${barClass}`}
                    style={{ height: `${Math.max(8, day.percentage)}%` }}
                    title={`${day.dayName}: ${day.percentage}% (${day.taken}/${day.total} doses taken)`}
                  />
                </div>
                <span className="bar-label">{day.dayName}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
