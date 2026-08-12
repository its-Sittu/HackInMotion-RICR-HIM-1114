import { useState } from 'react';
import '../../styles/current-medicines.css';

// Master catalog of searchable medicines
const MASTER_CATALOG = [
  { id: 'c1', name: 'Paracetamol', dosage: '500 mg', type: 'Tablet' },
  { id: 'c2', name: 'Metformin', dosage: '500 mg', type: 'Tablet' },
  { id: 'c3', name: 'Ibuprofen', dosage: '200 mg', type: 'Tablet' },
  { id: 'c4', name: 'Aspirin', dosage: '325 mg', type: 'Tablet' },
  { id: 'c5', name: 'Amoxicillin', dosage: '500 mg', type: 'Capsule' },
  { id: 'c6', name: 'Atorvastatin', dosage: '20 mg', type: 'Tablet' },
  { id: 'c7', name: 'Lisinopril', dosage: '10 mg', type: 'Tablet' },
  { id: 'c8', name: 'Levothyroxine', dosage: '50 mcg', type: 'Tablet' },
  { id: 'c9', name: 'Gabapentin', dosage: '300 mg', type: 'Capsule' },
  { id: 'c10', name: 'Albuterol', dosage: '90 mcg', type: 'Inhaler' }
];

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
  const [addSearchTerm, setAddSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSelect = (item) => {
    // Prevent duplicate medicines (case-insensitive check)
    const exists = medicines.some(
      med => med.name.toLowerCase() === item.name.toLowerCase()
    );
    if (exists) return;

    const newMed = {
      id: Date.now(),
      name: item.name,
      dosage: item.dosage,
      type: item.type
    };

    setMedicines(prev => [...prev, newMed]);
    setAddSearchTerm(''); // Clear/reset search after adding
    setIsAdding(false); // Close addition dialog after adding
  };

  const handleRemoveStub = (medName) => {
    // Stubbed action: "Do NOT implement actual remove functionality yet."
    console.log(`[Stub Action] Requested removal of medicine: ${medName}. Actual remove functionality is not implemented yet.`);
  };

  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCatalog = MASTER_CATALOG.filter(item =>
    item.name.toLowerCase().includes(addSearchTerm.toLowerCase())
  );

  return (
    <section className="medicines-section">
      <div className="medicines-header">
        <h2 className="medicines-title">Current Medicines</h2>
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

      {isAdding && (
        <div className="medicine-form-card">
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="catalog-search">Search Medicine to Add</label>
            <div className="search-input-wrapper">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                id="catalog-search"
                type="text"
                className="search-input"
                placeholder="Search master catalog (e.g. Ibuprofen)..."
                value={addSearchTerm}
                onChange={(e) => setAddSearchTerm(e.target.value)}
                autoFocus
              />
              {addSearchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setAddSearchTerm('')}
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

          {/* Catalog Results List */}
          <div className="catalog-results">
            {filteredCatalog.length > 0 ? (
              filteredCatalog.map(item => {
                const isAlreadyAdded = medicines.some(
                  med => med.name.toLowerCase() === item.name.toLowerCase()
                );
                return (
                  <div key={item.id} className="catalog-item">
                    <div className="catalog-item-info">
                      <span className="catalog-item-emoji">💊</span>
                      <div className="catalog-item-details">
                        <span className="catalog-item-name">{item.name}</span>
                        <span className="catalog-item-meta">{item.dosage} • {item.type}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`btn-add-select ${isAlreadyAdded ? 'added' : 'primary'}`}
                      onClick={() => !isAlreadyAdded && handleAddSelect(item)}
                      disabled={isAlreadyAdded}
                    >
                      {isAlreadyAdded ? 'Added' : 'Add'}
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="catalog-no-results">No medicines found matching "{addSearchTerm}"</p>
            )}
          </div>

          <div className="form-actions" style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setIsAdding(false);
                setAddSearchTerm('');
              }}
            >
              Close
            </button>
          </div>
        </div>
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
