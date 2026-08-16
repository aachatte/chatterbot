import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Pitch Data - specifically designed to show a "dip" before a crisis
const weeklyData = [
  { day: 'Mon', mood: 0.8, messages: 24 },
  { day: 'Tue', mood: 0.6, messages: 18 },
  { day: 'Wed', mood: 0.9, messages: 32 },
  { day: 'Thu', mood: -0.2, messages: 14 }, // Noticeable dip
  { day: 'Fri', mood: -0.8, messages: 5 },  // Crisis zone
  { day: 'Sat', mood: 0.5, messages: 28 },  // Recovery
  { day: 'Sun', mood: 0.8, messages: 20 },
];

export default function Dashboard() {
  const [showDemoAlert, setShowDemoAlert] = useState(false);

  const triggerDemoAlert = () => {
    setShowDemoAlert(true);
    // Auto-hide after 10 seconds
    setTimeout(() => setShowDemoAlert(false), 10000);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      
      {/* HEADER & DEMO BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--cb-space-6)' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 'var(--cb-space-2)' }}>Overview</h1>
          <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15 }}>Monitor your teens' digital wellbeing in real time.</p>
        </div>
        <button 
          onClick={triggerDemoAlert}
          style={{
            padding: '10px 20px',
            background: 'var(--cb-danger)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--cb-radius-md)',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
            transition: 'transform 0.1s'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          🚨 Simulate Crisis Alert
        </button>
      </div>

      {/* DEMO CRISIS BANNER */}
      {showDemoAlert && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #F87171',
          borderLeft: '6px solid #DC2626',
          padding: '20px',
          borderRadius: 'var(--cb-radius-lg)',
          marginBottom: 'var(--cb-space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div>
            <h3 style={{ color: '#991B1B', margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ Immediate Attention Required
            </h3>
            <p style={{ color: '#7F1D1D', margin: '8px 0 0 0', fontSize: 15 }}>
              <strong>Maya (16)</strong> used high-risk language indicating severe distress. 
              <br/>An SMS notification has been dispatched to your phone ending in -4567.
            </p>
          </div>
          <button style={{ padding: '8px 16px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            View Full Context
          </button>
        </div>
      )}

      {/* TOP STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--cb-space-4)', marginBottom: 'var(--cb-space-6)' }}>
        {[
          { label: 'Active Teens', value: '2', color: 'var(--cb-text-primary)' },
          { label: 'Messages This Week', value: '141', color: 'var(--cb-text-primary)' },
          { label: 'Avg Mood Score', value: '+0.4', color: '#10B981' },
          { label: 'Interventions Prevented', value: '1', color: 'var(--cb-text-secondary)' }
        ].map(stat => (
          <div key={stat.label} style={{ background: 'var(--cb-bg-elevated)', padding: 'var(--cb-space-5)', borderRadius: 'var(--cb-radius-xl)', border: '1px solid var(--cb-border)' }}>
            <div style={{ fontSize: 13, color: 'var(--cb-text-secondary)', marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* INVESTOR CANDY GRAPH */}
      <div style={{ background: 'var(--cb-bg-elevated)', padding: 'var(--cb-space-6)', borderRadius: 'var(--cb-radius-xl)', border: '1px solid var(--cb-border)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--cb-space-2)' }}>7-Day Sentiment Trend</h2>
        <p style={{ fontSize: 14, color: 'var(--cb-text-tertiary)', marginBottom: 'var(--cb-space-6)' }}>
          Scores below 0.0 indicate stress, anxiety, or sadness. Notice the predictive dip prior to the Friday alert.
        </p>
        
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--cb-border)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--cb-text-tertiary)' }} dy={10} />
              <YAxis domain={[-1, 1]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--cb-text-tertiary)' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: 'black' }}
              />
              <Area type="monotone" dataKey="mood" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
