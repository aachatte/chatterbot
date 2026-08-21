import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const weeklyData = [
  { day: 'Mon', mood: 0.8, messages: 24 },
  { day: 'Tue', mood: 0.6, messages: 18 },
  { day: 'Wed', mood: 0.9, messages: 32 },
  { day: 'Thu', mood: -0.2, messages: 14 }, 
  { day: 'Fri', mood: -0.8, messages: 5 },  
  { day: 'Sat', mood: 0.5, messages: 28 },  
  { day: 'Sun', mood: 0.8, messages: 20 },
];

export default function Dashboard() {
  const [showDemoAlert, setShowDemoAlert] = useState(false);

  const triggerDemoAlert = () => {
    setShowDemoAlert(true);
    setTimeout(() => setShowDemoAlert(false), 10000);
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      
      <style>{`
        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--cb-space-6); }
        .dashboard-buttons { display: flex; gap: 12px; }
        .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: var(--cb-space-6); }
        
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr; }
          .dashboard-header { flex-direction: column; gap: 20px; }
          .dashboard-buttons { width: 100%; }
          .dashboard-buttons button { flex: 1; padding: 12px 8px !important; font-size: 14px !important; }
        }
      `}</style>

      <div className="dashboard-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Command Center</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--cb-bg-muted)', color: 'var(--cb-primary)', padding: '4px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
              <div className="pulse-dot"></div> System Active
            </div>
          </div>
          <p style={{ color: 'var(--cb-text-secondary)', fontSize: 16 }}>Real-time analytics and predictive safety insights.</p>
        </div>
        
        <div className="dashboard-buttons no-print">
          <button onClick={handleExport} style={{ padding: '12px 20px', background: 'var(--cb-bg-elevated)', color: 'var(--cb-text-primary)', border: '1px solid var(--cb-border)', borderRadius: 'var(--cb-radius-lg)', fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--cb-shadow-sm)' }}>
            📄 Export Report
          </button>
          <button onClick={triggerDemoAlert} style={{ padding: '12px 20px', background: 'var(--cb-danger)', color: 'white', border: 'none', borderRadius: 'var(--cb-radius-lg)', fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--cb-shadow-glow)' }}>
            🚨 Simulate Crisis
          </button>
        </div>
      </div>

      {showDemoAlert && (
        <div className="glass-card" style={{ background: 'rgba(200, 16, 46, 0.08)', borderLeft: '6px solid var(--cb-danger)', marginBottom: 'var(--cb-space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: 'var(--cb-danger)', margin: 0, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
              ⚠️ Emergency Alert: Self-Harm Keyword Detected
            </h3>
            <p style={{ color: 'var(--cb-text-primary)', margin: '8px 0 0 0', fontSize: 16 }}>
              <strong>Maya (16)</strong> used high-risk language indicating severe distress in a recent text. An automatic SMS has been sent to the parent, and 988 resources were provided.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--cb-space-4)', marginBottom: 'var(--cb-space-6)' }}>
        {[
          { label: 'Active Teens', value: '2', color: 'var(--cb-text-primary)' },
          { label: 'Messages Processed', value: '141', color: 'var(--cb-text-primary)' },
          { label: 'Avg Sentiment', value: '+0.4', color: 'var(--cb-primary)' },
          { label: 'Interventions', value: '1', color: 'var(--cb-danger)' }
        ].map(stat => (
          <div key={stat.label} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: 14, color: 'var(--cb-text-secondary)', marginBottom: 12, fontWeight: 500 }}>{stat.label}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: stat.color, letterSpacing: '-1px' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="glass-card" style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: '4px' }}>Predictive Sentiment Trend</h2>
          <p style={{ fontSize: 14, color: 'var(--cb-text-tertiary)', marginBottom: 'var(--cb-space-5)' }}>Scores below 0.0 indicate distress. Early detection prevents crises.</p>
          <div style={{ height: 320, width: '100%', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00205B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00205B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--cb-border)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--cb-text-tertiary)', fontWeight: 500 }} dy={10} />
                <YAxis domain={[-1, 1]} axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--cb-text-tertiary)' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--cb-bg-elevated)', color: 'var(--cb-text-primary)', boxShadow: 'var(--cb-shadow-lg)' }} labelStyle={{ fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="mood" stroke="#00205B" strokeWidth={4} fillOpacity={1} fill="url(#colorMood)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: '4px' }}>Coaching Insights</h2>
          <p style={{ fontSize: 14, color: 'var(--cb-text-tertiary)', marginBottom: 'var(--cb-space-5)' }}>Based on recent conversations.</p>
          <div style={{ background: 'var(--cb-bg-muted)', border: '1px solid var(--cb-border)', padding: 16, borderRadius: 'var(--cb-radius-md)', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cb-primary)', marginBottom: 8, textTransform: 'uppercase' }}>Observation</div>
            <p style={{ fontSize: 14, color: 'var(--cb-text-primary)', lineHeight: 1.5 }}>Maya has mentioned feeling "overwhelmed" by a history paper 3 times in the last 48 hours.</p>
          </div>
          <div style={{ background: 'var(--cb-bg-elevated)', border: '1px solid var(--cb-border)', padding: 16, borderRadius: 'var(--cb-radius-md)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cb-text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Suggested Approach</div>
            <p style={{ fontSize: 14, color: 'var(--cb-text-secondary)', lineHeight: 1.5 }}>Instead of asking "Are you stressed?", try asking: <em>"Would you like me to help you break down your history paper into smaller chunks?"</em></p>
          </div>
        </div>
      </div>
    </div>
  );
}
