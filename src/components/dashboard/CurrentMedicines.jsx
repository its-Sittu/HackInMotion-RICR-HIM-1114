import { useState } from 'react';
import '../../styles/current-medicines.css';

export default function CurrentMedicines() {
  const [medicines, setMedicines] = useState([
    { id: 1, name: 'Paracetamol', dosage: '500 mg', type: 'Tablet' },
    { id: 2, name: 'Metformin', dosage: '500 mg', type: 'Tablet' }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [type, setType] = useState('Tablet');

  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMed = {
      id: Date.now(),
      name: name.trim(),
      dosage: dosage.trim() || 'N/A',
      type
    };

    setMedicines(prev => [...prev, newMed]);
    setName('');
    setDosage('');
    setType('Tablet');
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setMedicines(prev => prev.filter(med => med.id !== id));
  };

  return (
    <section className="medicines-section">
      <div className="medicines-header">
        <h2 className="medicines-title">Current Medicines</h2>
        {!isAdding && medicines.length > 0 && (
          <button 
            type="button" 
            className="btn-primary"
            onClick={() => setIsAdding(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Medicine
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddMedicine} className="medicine-form-card">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="med-name">Medicine Name</label>
              <input
                id="med-name"
                type="text"
                className="form-input"
                placeholder="e.g. Ibuprofen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="med-dosage">Dosage</label>
              <input
                id="med-dosage"
                type="text"
                className="form-input"
                placeholder="e.g. 200 mg"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="med-type">Form</label>
              <select
                id="med-type"
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Liquid">Liquid</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Cream">Cream</option>
                <option value="Inhaler">Inhaler</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => {
                setIsAdding(false);
                setName('');
                setDosage('');
                setType('Tablet');
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Medicine
            </button>
          </div>
        </form>
      )}

      {medicines.length > 0 ? (
        <div className="medicines-list">
          {medicines.map((med) => (
            <div key={med.id} className="medicine-item">
              <div className="medicine-details">
                <div className="medicine-badge">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {/* Pill capsule shape */}
                    <path d="m10.5 2 9.5 9.5c2 2 2 5.2 0 7.2s-5.2 2-7.2 0L3.3 9.2c-2-2-2-5.2 0-7.2s5.2-2 7.2 0z" />
                    <path d="m8.5 7 7 7" />
                  </svg>
                </div>
                <div className="medicine-info">
                  <span className="medicine-name">{med.name}</span>
                  <div className="medicine-meta">
                    <span>{med.dosage}</span>
                    <span className="meta-dot"></span>
                    <span>{med.type}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-delete"
                onClick={() => handleDelete(med.id)}
                aria-label={`Remove ${med.name}`}
                title="Remove Medicine"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="medicines-empty">
          <div className="empty-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h3 className="empty-title">No Medicines Listed</h3>
          <p className="empty-desc">
            Your medicine list is currently empty. Add your medicines to keep track of dosages and review potential drug interactions.
          </p>
          {!isAdding && (
            <button 
              type="button" 
              className="btn-primary"
              onClick={() => setIsAdding(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Medicine
            </button>
          )}
        </div>
      )}
    </section>
  );
}
