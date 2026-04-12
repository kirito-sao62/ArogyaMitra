import React, { useState, useEffect } from 'react';

export default function DietPlannerTab() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [goal, setGoal] = useState('Healthy Maintenance');
  
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const [dietPlan, setDietPlan] = useState(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Load from local storage on mount
  useEffect(() => {
    const cached = localStorage.getItem('arogya_diet_plan');
    if (cached) {
      try {
        setDietPlan(JSON.parse(cached));
      } catch (e) {
        console.error("Cache parsing error", e);
      }
    }
  }, []);

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!weight || !goal) {
      alert("Please provide at least your weight and medical goal.");
      return;
    }
    
    setGenerating(true);
    setError(null);

    const payload = {
      age: age ? parseInt(age) : null,
      weight: parseFloat(weight),
      height: height ? parseFloat(height) : null,
      restrictions,
      goal
    };

    try {
      const res = await fetch('/api/v1/diet-plan/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
         throw new Error(data.detail || 'Failed to generate plan');
      }
      
      const newPlan = data.diet_plan;
      setDietPlan(newPlan);
      localStorage.setItem('arogya_diet_plan', JSON.stringify(newPlan));
      setActiveDayIndex(0); // reset view to Day 1
      
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const dayKeys = dietPlan ? Object.keys(dietPlan) : [];
  const activeDayKey = dayKeys[activeDayIndex];
  const dailyMeals = dietPlan ? dietPlan[activeDayKey] : null;

  return (
    <div className="vitals-container diet-container">
      <div className="vitals-header">
        <h2>AI Diet Planner</h2>
        <p>Let our AI model generate a comprehensive 7-day culinary roadmap tailored to your specific biometrics and goals.</p>
      </div>

      <div className="vitals-layout">
        {/* Input Parameters Panel */}
        <div className="vitals-panel form-panel" style={{ flex: 1, minWidth: '320px' }}>
          <div className="vitals-card">
            <div className="vitals-card-header">
              <div className="icon-wrapper info-bg">
                <i className="fas fa-apple-alt"></i>
              </div>
              <h3>Dietary Profile</h3>
            </div>

            <form onSubmit={handleGeneratePlan} className="vitals-form">
              <div className="form-group flex-row-fields">
                <div style={{flex: 1}}>
                  <label>Age</label>
                  <input type="number" placeholder="Yrs" className="vitals-input padded-input" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div style={{flex: 1}}>
                  <label>Weight</label>
                  <input type="number" step="0.1" placeholder="kg" className="vitals-input padded-input" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div style={{flex: 1}}>
                  <label>Height</label>
                  <input type="number" step="0.1" placeholder="cm" className="vitals-input padded-input" value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Dietary Restrictions & Allergies</label>
                <input 
                  type="text" 
                  placeholder="e.g. Vegetarian, Gluten-Free, No Nuts" 
                  className="vitals-input padded-input"
                  value={restrictions}
                  onChange={(e) => setRestrictions(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Target Goal</label>
                <select className="vitals-input padded-input" value={goal} onChange={(e) => setGoal(e.target.value)}>
                    <option value="Healthy Maintenance">Healthy Maintenance</option>
                    <option value="Weight Loss">Weight Loss (Caloric Deficit)</option>
                    <option value="Muscle Gain">Muscle Gain (High Protein)</option>
                    <option value="Diabetic Management">Diabetic Management (Low Sugar)</option>
                </select>
              </div>

              <div className="form-actions" style={{ marginTop: '10px' }}>
                <button type="submit" className="vitals-btn" disabled={generating}>
                  {generating ? (
                    <><i className="fas fa-spinner fa-spin"></i> Analyzing Guidelines...</>
                  ) : (
                    <><i className="fas fa-magic"></i> Generate 7-Day Plan</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Generated Plan Panel */}
        <div className="vitals-panel chart-panel" style={{ flex: 2, minWidth: '400px' }}>
          <div className="vitals-card vitals-chart-wrapper">
             
             {generating ? (
                <div className="vitals-state loading-state">
                  <div className="spinner"></div>
                  <h4 style={{marginTop: '15px'}}>AI is computing calories...</h4>
                  <p style={{fontSize: '14px', color: 'var(--text-secondary)'}}>Generating structured 7-day culinary parameters via Groq Llama-3.</p>
                </div>
             ) : error ? (
                <div className="vitals-state error-state">
                   <i className="fas fa-exclamation-triangle"></i>
                   <div className="error-title">AI Processing Failed</div>
                   <div className="error-desc">{error}</div>
                </div>
             ) : !dietPlan ? (
                <div className="vitals-state empty-state-box">
                   <div className="empty-icon-wrapper">🍽️</div>
                   <h4>No Diet Plan Active</h4>
                   <p>Fill out the nutritional profile parameters on the left and tap Generate to receive your custom 7-Day sequence.</p>
                </div>
             ) : (
                <div className="diet-plan-layout">
                  <div className="vitals-card-header flex-between" style={{marginBottom: '10px'}}>
                    <div className="flex-row">
                      <div className="icon-wrapper">
                         <i className="fas fa-calendar-alt"></i>
                      </div>
                      <h3>Your Weekly Plan</h3>
                    </div>
                  </div>

                  {/* Horizontal Scroll Tab Interface */}
                  <div className="diet-tabs-container">
                    {dayKeys.map((day, idx) => (
                      <button 
                         key={day} 
                         className={`diet-tab-btn ${activeDayIndex === idx ? 'active' : ''}`}
                         onClick={() => setActiveDayIndex(idx)}
                      >
                         {day}
                      </button>
                    ))}
                  </div>

                  {/* Daily Render Component */}
                  <div className="diet-daily-view">
                    <h4 className="diet-day-title">{activeDayKey} Schedule</h4>
                    
                    <div className="meals-grid">
                      {Object.keys(dailyMeals).map(mealKey => {
                        const mealData = dailyMeals[mealKey];
                        return (
                          <div key={mealKey} className="meal-card">
                             <div className="meal-card-header">
                               <span className="meal-badge">{mealKey}</span>
                               {mealData.calories && <span className="calorie-badge"><i className="fas fa-fire"></i> {mealData.calories}</span>}
                             </div>
                             <p className="meal-description">{mealData.meal || mealData}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
             )}

          </div>
        </div>
      </div>
    </div>
  );
}
