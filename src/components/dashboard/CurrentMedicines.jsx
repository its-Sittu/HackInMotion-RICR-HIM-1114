import React from 'react'

export default function CurrentMedicines() {
  return (
    <section className="medisafe-section-card">
      <div className="card-section-header">
        <h3 className="section-card-title">Current Medicines</h3>
        <button 
          type="button" 
          className="add-medicine-btn"
          aria-label="Add a new medicine"
        >
          <span className="btn-icon" aria-hidden="true">+</span>
          <span className="btn-text">Add Medicine</span>
        </button>
      </div>

      <div className="card-section-body">
        <div className="empty-state-container" aria-hidden="true">
          <div className="empty-state-icon-wrapper">
            <svg 
              className="empty-state-icon"
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.25" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m10.5 13.5 3-3" />
              <path d="m8.5 8.5 7 7a4.95 4.95 0 1 1-7-7Z" />
            </svg>
          </div>
          <p className="empty-state-text">No medicines added yet.</p>
        </div>
      </div>
    </section>
  )
}
