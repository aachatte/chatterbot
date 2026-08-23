import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Existing graph data...
const weeklyData = [
  { day: 'Mon', mood: 0.8 }, { day: 'Tue', mood: 0.6 }, { day: 'Wed', mood: 0.9 },
  { day: 'Thu', mood: -0.2 }, { day: 'Fri', mood: -0.8 }, { day: 'Sat', mood: 0.5 }, { day: 'Sun', mood: 0.8 }
];

// Conversation Starters Data
const aiInsights = [
  {
    id: 1,
    category: "Academic",
    observation: 'Maya has mentioned feeling "overwhelmed" by a history paper 3 times in the last 48 hours.',
    suggestion: 'Instead of asking "Are you stressed?", try asking: "Would you like me to help you break down your history paper into smaller chunks?"'
  },
  {
    id: 2,
    category: "Sleep",
    observation: 'Texting patterns indicate Maya is frequently active and responding to messages past 1:30 AM on weeknights.',
    suggestion: 'Consider establishing a "devices in the kitchen by 10 PM" family routine, framing it around wellness rather than punishment.'
  },
  {
    id: 3,
    category: "Social",
    observation: 'Maya used language indicating frustration with her peer group (e.g., "being weird", "icing me out").',
    suggestion: 'Validate her feelings first. Try saying: "Friend drama is really exhausting. Do you want advice, or do you just want to vent?"'
  }
];

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Academic', 'Sleep', 'Social'];

  const filteredInsights = activeFilter === 'All' 
    ? aiInsights 
    : aiInsights.filter(insight => insight.category === activeFilter);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      {/* ... (Keep your existing Header, Demo Banner, and Top Stats components here) ... */}
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 'var(--cb-space-6)' }}>
        
        {/* ... (Keep your existing Predictive Sentiment Trend Graph here) ... */}
        
        {/* INTERACTIVE CONVERSATION STARTERS */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: 600 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: '4px' }}>Conversation Starters</h2>
          <p style={{ fontSize: 14, color: 'var(--cb-text-tertiary)', marginBottom: 'var(--cb-space-4)' }}>
            Empathetic scripts based on recent sentiment stressors.
          </p>

          {/* Category Filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--cb-space-5)', flexWrap: 'wrap' }}>
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: activeFilter === filter ? 'none' : '1px solid var(--cb-border)',
                  background: activeFilter === filter ? 'var(--cb-primary-gradient)' : 'var(--cb-bg-elevated)',
                  color: activeFilter === filter ? 'white' : 'var(--cb-text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                {filter}
              </button>
            ))}
          </div>
          
          {/* Insights List */}
          <div className="insight-scroll" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-5)', paddingRight: '8px' }}>
            {filteredInsights.map((insight) => (
              <div key={insight.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                
                {/* Observation Block */}
                <div style={{ background: 'var(--cb-bg-muted)', border: '1px solid var(--cb-border)', padding: 16, borderRadius: 'var(--cb-radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cb-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Context</div>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--cb-text-primary)', lineHeight: 1.5 }}>{insight.observation}</p>
                </div>

                {/* Suggestion Block */}
                <div style={{ background: 'var(--cb-bg-elevated)', border: '1px dashed var(--cb-border)', padding: 16, borderRadius: 'var(--cb-radius-md)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cb-text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Suggested Approach</div>
                  <p style={{ fontSize: 14, color: 'var(--cb-text-secondary)', lineHeight: 1.5 }}>
                    {insight.suggestion.split('"').map((text, i) => i % 2 !== 0 ? <em key={i} style={{ color: 'var(--cb-text-primary)', fontWeight: 500 }}>"{text}"</em> : text )}
                  </p>
                </div>
                
                {/* Divider */}
                <hr style={{ border: 'none', borderTop: '1px solid var(--cb-border)', margin: '4px 0' }} />
              </div>
            ))}
            
            {filteredInsights.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--cb-text-tertiary)', fontSize: 14 }}>
                No immediate concerns detected in this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
