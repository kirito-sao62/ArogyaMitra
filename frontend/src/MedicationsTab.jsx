import React, { useState, useEffect } from 'react';
import { useMedicationReminders } from './hooks/useMedicationReminders';

export default function MedicationsTab() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [timeInput, setTimeInput] = useState('');
  const [reminderTimes, setReminderTimes] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Activate background notification hook
  useMedicationReminders(medications);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/medications/default_user');
      if (!res.ok) throw new Error('Failed to fetch medications data');
      const data = await res.json();
      setMedications(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTime = () => {
    if (timeInput && !reminderTimes.includes(timeInput)) {
      setReminderTimes([...reminderTimes, timeInput]);
      setTimeInput('');
    }
  };

  const handleRemoveTime = (timeToRemove) => {
    setReminderTimes(reminderTimes.filter(t => t !== timeToRemove));
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    if (!name || !dosage || reminderTimes.length === 0) {
      alert("Please fill in Medication Name, Dosage, and add at least one reminder time.");
      return;
    }
    
    try {
      setSubmitting(true);
      const payload = {
        user_id: 'default_user',
        name,
        dosage,
        frequency,
        reminder_times: reminderTimes
      };

      const res = await fetch('/api/v1/medications/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to add medication');
      
      // Clear form
      setName('');
      setDosage('');
      setFrequency('Daily');
      setReminderTimes([]);
      fetchMedications();
    } catch (err) {
      console.error(err);
      alert('Error updating medications: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMedication = async (id) => {
    if (!confirm('Are you sure you want to delete this medication schedule?')) return;
    try {
      const res = await fetch(`/api/v1/medications/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete medication');
      setMedications(medications.filter(m => m.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleTaken = async (med) => {
    const today = new Date().toDateString();
    // If it was taken today, we are "unchecking" it. Otherwise checking it.
    const newTakenStatus = med.last_taken === today ? null : today;
    
    try {
      const res = await fetch(`/api/v1/medications/${med.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ last_taken: newTakenStatus || '' })
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      setMedications(medications.map(m => m.id === med.id ? {...m, last_taken: newTakenStatus} : m));
    } catch (err) {
      console.error(err);
      alert('Error updating status: ' + err.message);
    }
  };

  const todayStr = new Date().toDateString();

  return (
    <div className="vitals-container">
      {/* Header Section */}
      <div className="vitals-header">
        <h2>Active Medications</h2>
        <p>Schedule alerts for your daily prescriptions. Your browser will send native push notifications to keep you on track.</p>
      </div>

      <div className="vitals-layout">
        
        {/* Add Medication Form Panel */}
        <div className="vitals-panel form-panel" style={{ flex: 1, minWidth: '320px' }}>
          <div className="vitals-card">
            <div className="vitals-card-header">
              <div className="icon-wrapper info-bg">
                <i className="fas fa-pills"></i>
              </div>
              <h3>New Prescription</h3>
            </div>

            <form onSubmit={handleAddMedication} className="vitals-form">
              <div className="form-group">
                <label>Medicine Name</label>
                <div className="input-with-icon">
                  <i className="fas fa-capsules input-icon"></i>
                  <input 
                    type="text" 
                    placeholder="e.g. Paracetamol" 
                    className="vitals-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dosage</label>
                <div className="input-with-icon">
                  <i className="fas fa-syringe input-icon warning-icon"></i>
                  <input 
                    type="text" 
                    placeholder="e.g. 500mg" 
                    className="vitals-input"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Frequency</label>
                <select className="vitals-input" style={{ paddingLeft: '14px' }} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="As Needed">As Needed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reminder Times (HH:MM)</label>
                <div className="med-time-adder">
                  <input 
                    type="time" 
                    className="vitals-input"
                    style={{ paddingLeft: '14px', flex: 1 }}
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                  />
                  <button type="button" className="action-btn-add" onClick={handleAddTime}>
                     <i className="fas fa-plus"></i>
                  </button>
                </div>
                
                {reminderTimes.length > 0 && (
                  <div className="med-time-chips">
                    {reminderTimes.map(time => (
                      <div key={time} className="med-chip">
                        {time} 
                        <i className="fas fa-times med-chip-close" onClick={() => handleRemoveTime(time)}></i>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="vitals-btn" disabled={submitting}>
                  {submitting ? (
                    <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                  ) : (
                    <><i className="fas fa-plus-circle"></i> Add Medication</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Daily Checklist Panel */}
        <div className="vitals-panel chart-panel" style={{ flex: 2, minWidth: '400px' }}>
          <div className="vitals-card vitals-chart-wrapper">
             <div className="vitals-card-header">
                <div className="icon-wrapper">
                  <i className="fas fa-clipboard-check"></i>
                </div>
                <h3>Daily Checklist</h3>
             </div>

             {loading ? (
                <div className="vitals-state loading-state">
                  <div className="spinner"></div>
                  <p>Loading your schedule...</p>
                </div>
             ) : error ? (
                <div className="vitals-state error-state">
                   <i className="fas fa-exclamation-triangle"></i>
                   <div className="error-title">Failed to load schedule</div>
                   <div className="error-desc">{error}</div>
                </div>
             ) : medications.length === 0 ? (
                <div className="vitals-state empty-state-box">
                   <div className="empty-icon-wrapper">💊</div>
                   <h4>No active prescriptions</h4>
                   <p>Use the form on the left to schedule your medicinal reminders.</p>
                </div>
             ) : (
                <div className="medication-list">
                    {medications.map(med => {
                        const isTakenToday = med.last_taken === todayStr;
                        return (
                            <div key={med.id} className={`medication-item ${isTakenToday ? 'taken' : ''}`}>
                                <div className="med-checkbox-wrapper" onClick={() => handleToggleTaken(med)}>
                                    <div className={`med-checkbox ${isTakenToday ? 'checked' : ''}`}>
                                        {isTakenToday && <i className="fas fa-check"></i>}
                                    </div>
                                </div>
                                <div className="med-details">
                                    <h4>{med.name}</h4>
                                    <p><strong>{med.dosage}</strong> • {med.frequency}</p>
                                    <div className="med-times">
                                        {med.reminder_times.map(t => (
                                            <span key={t} className="med-time-badge"><i className="far fa-clock"></i> {t}</span>
                                        ))}
                                    </div>
                                </div>
                                <button className="action-btn-delete" onClick={() => handleDeleteMedication(med.id)} title="Remove medication">
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        )
                    })}
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
