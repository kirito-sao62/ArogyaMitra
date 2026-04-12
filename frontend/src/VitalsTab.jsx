import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function VitalsTab() {
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [weight, setWeight] = useState('');
  const [sleep, setSleep] = useState('');
  const [water, setWater] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVitals();
  }, []);

  const fetchVitals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/vitals/default_user?days=30');
      if (!res.ok) throw new Error('Failed to fetch vitals data');
      const data = await res.json();
      
      // Map data for Recharts (Format dates beautifully)
      const formatted = data.map(v => ({
        ...v,
        date: new Date(v.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      }));
      setVitals(formatted);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogVitals = async (e) => {
    e.preventDefault();
    if (!weight && !sleep && !water) {
      alert("Please fill in at least one vital metric to save.");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        user_id: 'default_user',
        weight: weight ? parseFloat(weight) : null,
        sleep_hours: sleep ? parseFloat(sleep) : null,
        water_intake: water ? parseFloat(water) : null
      };

      const res = await fetch('/api/v1/vitals/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to log vital');
      
      // Clear form and refetch
      setWeight('');
      setSleep('');
      setWater('');
      fetchVitals();
    } catch (err) {
      console.error(err);
      alert('Error updating vitals: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVital = async (id) => {
    if (!confirm('Are you sure you want to delete this vital entry?')) return;
    try {
      const res = await fetch(`/api/v1/vitals/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete vital entry');
      setVitals(vitals.filter(v => v.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleResetDashboard = async () => {
    if (!confirm('Are you absolutely sure you want to clear ALL your vital data? This action cannot be undone!')) return;
    try {
      const res = await fetch(`/api/v1/vitals/user/default_user`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to reset dashboard');
      setVitals([]);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="vitals-container">
      {/* Header Section */}
      <div className="vitals-header">
        <h2>Interactive Vitals Dashboard</h2>
        <p>Log your daily health metrics and visualize your progress over time. Our AI uses this to provide better personalized context.</p>
      </div>

      <div className="vitals-layout">
        {/* Form Logging Panel */}
        <div className="vitals-panel form-panel">
          <div className="vitals-card">
            <div className="vitals-card-header">
              <div className="icon-wrapper">
                <i className="fas fa-heartbeat"></i>
              </div>
              <h3>Log Today's Vitals</h3>
            </div>

            <form onSubmit={handleLogVitals} className="vitals-form">
              <div className="form-group">
                <label>Weight (kg or lbs)</label>
                <div className="input-with-icon">
                  <i className="fas fa-weight input-icon"></i>
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="e.g. 70.5" 
                    className="vitals-input"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Sleep (hours)</label>
                <div className="input-with-icon">
                  <i className="fas fa-moon input-icon warning-icon"></i>
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="e.g. 8.0" 
                    className="vitals-input"
                    value={sleep}
                    onChange={(e) => setSleep(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Water Intake (Liters)</label>
                <div className="input-with-icon">
                  <i className="fas fa-tint input-icon info-icon"></i>
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="e.g. 2.5" 
                    className="vitals-input"
                    value={water}
                    onChange={(e) => setWater(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="vitals-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                  ) : (
                    <><i className="fas fa-save"></i> Save Metrics</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Dashboard Analytics Panel */}
        <div className="vitals-panel chart-panel">
          <div className="vitals-card vitals-chart-wrapper">
            <div className="vitals-chart-header">
              <div className="vitals-card-header">
                <div className="icon-wrapper info-bg">
                  <i className="fas fa-chart-line text-xl"></i>
                </div>
                <h3>Insights & Trends</h3>
              </div>
              <span className="badge">Last 30 Days</span>
            </div>

             {loading ? (
                <div className="vitals-state loading-state">
                  <div className="spinner"></div>
                  <p>Loading your health data...</p>
                </div>
             ) : error ? (
                <div className="vitals-state error-state">
                   <i className="fas fa-exclamation-triangle"></i>
                   <div className="error-title">Failed to load trends</div>
                   <div className="error-desc">{error}</div>
                </div>
             ) : vitals.length === 0 ? (
                <div className="vitals-state empty-state-box">
                   <div className="empty-icon-wrapper">📊</div>
                   <h4>No data logged yet</h4>
                   <p>
                     Use the form on the left to input your first health metrics. Your beautiful trend graph will appear right here!
                   </p>
                </div>
             ) : (
                <div className="vitals-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={vitals}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                      <XAxis 
                        dataKey="date" 
                        tick={{fontSize: 12, fill: 'var(--text-secondary)'}} 
                        axisLine={false} 
                        tickLine={false} 
                        dy={10}
                      />
                      <YAxis 
                        yAxisId="left" 
                        tick={{fontSize: 12, fill: 'var(--text-secondary)'}} 
                        axisLine={false} 
                        tickLine={false} 
                        dx={-10}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        tick={{fontSize: 12, fill: 'var(--text-tertiary)'}} 
                        axisLine={false} 
                        tickLine={false} 
                        dx={10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: '1px solid var(--glass-border)', 
                          backgroundColor: 'var(--glass-bg)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                          color: 'var(--text-primary)'
                        }} 
                        itemStyle={{ fontWeight: '500' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Area yAxisId="left" type="monotone" dataKey="weight" name="Weight (kg)" stroke="#667eea" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" dot={{strokeWidth: 2, r: 4}} activeDot={{r: 6, strokeWidth: 0}} connectNulls />
                      <Area yAxisId="left" type="monotone" dataKey="sleep_hours" name="Sleep (hrs)" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorSleep)" dot={{strokeWidth: 2, r: 4}} activeDot={{r: 6, strokeWidth: 0}} connectNulls />
                      <Area yAxisId="right" type="monotone" dataKey="water_intake" name="Water (Liters)" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorWater)" dot={{strokeWidth: 2, r: 4}} activeDot={{r: 6, strokeWidth: 0}} connectNulls />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             )}
          </div>
        </div>
      </div>

      {vitals.length > 0 && (
        <div className="vitals-history-panel">
          <div className="vitals-card">
            <div className="vitals-card-header flex-between">
              <div className="flex-row">
                <div className="icon-wrapper warning-bg">
                  <i className="fas fa-history"></i>
                </div>
                <h3>Recent Logs</h3>
              </div>
              <button className="vitals-btn-danger" onClick={handleResetDashboard}>
                <i className="fas fa-trash-alt"></i> Reset Dashboard
              </button>
            </div>
            
            <div className="vitals-table-wrapper">
              <table className="vitals-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Weight (kg)</th>
                    <th>Sleep (hrs)</th>
                    <th>Water (L)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...vitals].reverse().map(v => (
                    <tr key={v.id}>
                      <td>{v.date}</td>
                      <td>{v.weight || '-'}</td>
                      <td>{v.sleep_hours || '-'}</td>
                      <td>{v.water_intake || '-'}</td>
                      <td>
                        <button className="action-btn-delete" onClick={() => handleDeleteVital(v.id)} title="Delete entry">
                          <i className="fas fa-times"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
