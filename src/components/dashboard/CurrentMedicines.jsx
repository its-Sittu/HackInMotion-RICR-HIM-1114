import { useState } from 'react';
import '../../styles/current-medicines.css';

// Reusable MedicineCard Component
export function MedicineCard({ name, dosage, type, onRemove }) {
  return (
    <div className="medicine-card">
      <div className="medicine-card-left">
        <span className="medicine-card-emoji" role="img" aria-label="pill">💊</span>
        <div className="medicine-card-info">
          <h4 className="medicine-card-name">{name}</h4>
          <p className="medicine-card-subtitle">
            {dosage} • {type}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="btn-remove"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
      >
        Remove
      </button>
    </div>
  );
}

// CurrentMedicines Dashboard Component
export default function CurrentMedicines() {
  const [medicines, setMedicines] = useState([
    { id: 1, name: 'Paracetamol', dosage: '500 mg', type: 'Tablet' },
    { id: 2, name: 'Metformin', dosage: '500 mg', type: 'Tablet' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
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

  const handleRemoveStub = (medName) => {
    // Stubbed action: "Do NOT implement actual remove functionality yet."
    console.log(`[Stub Action] Requested removal of medicine: ${medName}. Actual remove functionality is not implemented yet.`);
  };

  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Local Search UI */}
      {medicines.length > 0 && !isAdding && (
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search medicine by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {medicines.length > 0 ? (
        filteredMedicines.length > 0 ? (
          <div className="medicines-list">
            {filteredMedicines.map((med) => (
              <MedicineCard
                key={med.id}
                name={med.name}
                dosage={med.dosage}
                type={med.type}
                onRemove={() => handleRemoveStub(med.name)}
              />
            ))}
          </div>
        ) : (
          <div className="search-empty-state">
            <svg className="search-empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
            <p className="search-empty-text">No medicines match your search "{searchTerm}"</p>
          </div>
        )
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
