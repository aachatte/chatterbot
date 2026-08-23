import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Anonymized Aggregate Data
const gradeData = [
  { grade: '9th Grade', sentiment: 0.3, alerts: 12 },
  { grade: '10th Grade', sentiment: 0.1, alerts: 18 },
  { grade: '11th Grade', sentiment: -0.4, alerts: 45 }, // High stress year
  { grade: '12th Grade', sentiment: 0.5, alerts: 8 },
];

const topStressors = [
  { id: 1, keyword: 'Finals Week', count: 342, category: 'Academic' },
  { id: 2, keyword: 'Social Isolation', count: 156, category: 'Social' },
  { id: 3, keyword: 'College Apps', count: 289, category: 'Academic' },
];

export default function CounselorDashboard() {
  const handleExport = () => window.print();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--cb-space-6)' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: 'var(--cb-primary)', letterSpacing: '-0.5px' }}>District Counselor Portal</h1>
          <p style={{ color: 'var(--cb-text-secondary)', fontSize: 16, marginTop: 8 }}>Anonymized aggregate wellness metrics across the student body.</p>
        </div>
        <button onClick={handleExport} className="no-print" style={{ padding: '12px 20px', background: 'var(--cb-bg-elevated)', color: 'var(--cb-text-primary)', border: '1px solid var(--cb-border)', borderRadius: 'var(--cb-radius-lg)', fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--cb-shadow-sm)' }}>
          📄 Export District Report
        </button>
      </div>

      {/* TOP AGGREGATE STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--cb-space-4)', marginBottom: 'var(--cb-space-6)' }}>
        {[
          { label: 'Total Enrolled Students', value: '1,670', color: 'var(--cb-text-primary)' },
          { label: 'Messages Analyzed', value: '14,205', color: 'var(--cb-text-primary)' },
          { label: 'District Avg Sentiment', value: '+0.12', color: 'var(--cb-primary)' },
          { label: 'Active Escalations', value: '3', color: 'var(--cb-danger)' }
        ].map(stat => (
          <div key={stat.label} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: 14, color: 'var(--cb-text-secondary)', marginBottom: 12, fontWeight: 500 }}>{stat.label}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: stat.color, letterSpacing: '-1px' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 'var(--cb-space-6)' }}>
        
        {/* SENTIMENT HEATMAP */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minHeight: 400 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: '4px', color: 'var(--cb-primary)' }}>Grade-Level Sentiment Heatmap</h2>
          <p style={{ fontSize: 14, color: 'var(--cb-text-tertiary)', marginBottom: 'var(--cb-space-5)' }}>
            Scores below 0.0 indicate collective distress. Notice the sharp dip in 11th grade.
          </p>
          <div style={{ flex: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--cb-border)" />
                <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--cb-text-secondary)', fontWeight: 500 }} dy={10} />
                <YAxis domain={[-1, 1]} axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--cb-text-tertiary)' }} />
                <Tooltip cursor={{ fill: 'var(--cb-bg-muted)' }} contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--cb-bg-elevated)', boxShadow: 'var(--cb-shadow-lg)' }} />
                <Bar dataKey="sentiment" radius={[4, 4, 4, 4]}>
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.sentiment < 0 ? 'var(--cb-danger)' : 'var(--cb-primary)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP STRESSORS PANEL */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: '4px', color: 'var(--cb-primary)' }}>Top District Stressors</h2>
          <p style={{ fontSize: 14, color: 'var(--cb-text-tertiary)', marginBottom: 'var(--cb-space-5)' }}>Most common distress keywords flagged this week.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-3)' }}>
            {topStressors.map((stressor) => (
              <div key={stressor.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--cb-bg-muted)', padding: '16px', borderRadius: 'var(--cb-radius-md)', border: '1px solid var(--cb-border)' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--cb-text-primary)' }}>{stressor.keyword}</div>
                  <div style={{ fontSize: 12, color: 'var(--cb-text-secondary)', marginTop: 4 }}>{stressor.category}</div>
                </div>
                <div style={{ background: 'var(--cb-bg-elevated)', padding: '6px 12px', borderRadius: '20px', fontSize: 13, fontWeight: 600, color: 'var(--cb-danger)', border: '1px solid var(--cb-border)' }}>
                  {stressor.count} mentions
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
