import React, { useState } from 'react';

export default function SafetyControls() {
  // Topic Filter States
  const [topics, setTopics] = useState({
    academics: { label: 'Academics & Homework Planning', desc: 'Study schedules, test prep nudges, and assignment breakdowns', enabled: true },
    extracurriculars: { label: 'Sports & Extracurriculars', desc: 'Practice reminders, gear check-ins, and game prep', enabled: true },
    wellness: { label: 'Sleep & Daily Habits', desc: 'Hydration, screen wind-down, and routine reminders', enabled: true },
    social: { label: 'Social Dynamics & Peer Advice', desc: 'General conversation regarding school friends and peer stress', enabled: true },
    romance: { label: 'Dating & Romantic Relationships', desc: 'Discussions around dating, crush advice, or romantic relationships', enabled: false },
    popCulture: { label: 'Gaming & Pop Culture', desc: 'Casual banter about video games, music, movies, and hobbies', enabled: true },
  });

  // Curfew & Schedule States
  const [curfew, setCurfew] = useState({
    activeStartTime: '07:00',
    activeEndTime: '20:30',
    schoolMode: true,
    schoolStartTime: '08:00',
    schoolEndTime: '15:00',
    maxDailyMessages: 30,
    cooldownAfterMinutes: 20
  });

  const [saved, setSaved] = useState(false);

  const toggleTopic = (key) => {
    setTopics(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled }
    }));
  };

  const handleCurfewChange = (field, value) => {
    setCurfew(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 60 }}>
      {/* HEADER */}
      <div style={{ marginBottom: 'var(--cb-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Safety & Boundary Controls</h1>
          <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 12, background: 'var(--cb-bg-muted)', color: 'var(--cb-primary)', fontWeight: 600 }}>
            Active Profile: Maya (16)
          </span>
        </div>
        <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15 }}>
          Configure permitted discussion topics, active texting hours, and daily limits.
        </p>
      </div>

      {saved && (
        <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '6px solid var(--cb-success)', marginBottom: 'var(--cb-space-6)', padding: '16px' }}>
          <p style={{ margin: 0, color: 'var(--cb-text-primary)', fontWeight: 600 }}>
            ✓ Safety rules updated successfully. Applied to next incoming message.
          </p>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-6)' }}>
        
        {/* TOPIC FILTERS SECTION */}
        <div className="glass-card">
          <div style={{ marginBottom: 'var(--cb-space-4)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 4px 0' }}>Permitted Topic Boundaries</h2>
            <p style={{ color: 'var(--cb-text-tertiary)', fontSize: 14 }}>
              When a topic is disabled, the companion gently redirects the conversation back to authorized topics.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(topics).map(([key, item]) => (
              <div 
                key={key} 
                onClick={() => toggleTopic(key)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderRadius: 'var(--cb-radius-md)',
                  background: item.enabled ? 'var(--cb-bg-elevated)' : 'var(--cb-bg-muted)',
                  border: item.enabled ? '1px solid var(--cb-border)' : '1px dashed var(--cb-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ maxWidth: '80%' }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: item.enabled ? 'var(--cb-text-primary)' : 'var(--cb-text-tertiary)' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--cb-text-secondary)', marginTop: 2 }}>
                    {item.desc}
                  </div>
                </div>

                <div style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: item.enabled ? 'var(--cb-primary)' : 'var(--cb-border)',
                  position: 'relative',
                  transition: 'background 0.2s'
                }}>
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: 3,
                    left: item.enabled ? 22 : 4,
                    transition: 'left 0.2s'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CURFEW & ACTIVE WINDOWS SECTION */}
        <div className="glass-card">
          <div style={{ marginBottom: 'var(--cb-space-4)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 4px 0' }}>Digital Curfew & Active Windows</h2>
            <p style={{ color: 'var(--cb-text-tertiary)', fontSize: 14 }}>
              The bot will mute proactive nudges and pause message exchanges outside these hours.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--cb-space-4)' }}>
            {/* Daily Window */}
            <div style={{ background: 'var(--cb-bg-muted)', padding: 16, borderRadius: 'var(--cb-radius-md)', border: '1px solid var(--cb-border)' }}>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Daily Active Hours</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input 
                  type="time" 
                  value={curfew.activeStartTime} 
                  onChange={e => handleCurfewChange('activeStartTime', e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--cb-border)', background: 'var(--cb-bg-elevated)', color: 'var(--cb-text-primary)' }}
                />
                <span style={{ fontSize: 14, color: 'var(--cb-text-tertiary)' }}>to</span>
                <input 
                  type="time" 
                  value={curfew.activeEndTime} 
                  onChange={e => handleCurfewChange('activeEndTime', e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--cb-border)', background: 'var(--cb-bg-elevated)', color: 'var(--cb-text-primary)' }}
                />
              </div>
            </div>

            {/* School Hours Mute */}
            <div style={{ background: 'var(--cb-bg-muted)', padding: 16, borderRadius: 'var(--cb-radius-md)', border: '1px solid var(--cb-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 600 }}>School Hours Silence</label>
                <input 
                  type="checkbox" 
                  checked={curfew.schoolMode} 
                  onChange={e => handleCurfewChange('schoolMode', e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: curfew.schoolMode ? 1 : 0.4 }}>
                <input 
                  type="time" 
                  disabled={!curfew.schoolMode}
                  value={curfew.schoolStartTime} 
                  onChange={e => handleCurfewChange('schoolStartTime', e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--cb-border)', background: 'var(--cb-bg-elevated)', color: 'var(--cb-text-primary)' }}
                />
                <span style={{ fontSize: 14, color: 'var(--cb-text-tertiary)' }}>to</span>
                <input 
                  type="time" 
                  disabled={!curfew.schoolMode}
                  value={curfew.schoolEndTime} 
                  onChange={e => handleCurfewChange('schoolEndTime', e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--cb-border)', background: 'var(--cb-bg-elevated)', color: 'var(--cb-text-primary)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ANTI-DEPENDENCY & USAGE LIMITS */}
        <div className="glass-card">
          <div style={{ marginBottom: 'var(--cb-space-4)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 4px 0' }}>Anti-Dependency & Session Limits</h2>
            <p style={{ color: 'var(--cb-text-tertiary)', fontSize: 14 }}>
              Encourages real-world socializing by preventing extended back-to-back texting sessions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--cb-space-4)' }}>
            <div style={{ background: 'var(--cb-bg-muted)', padding: 16, borderRadius: 'var(--cb-radius-md)', border: '1px solid var(--cb-border)' }}>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Max Daily SMS Messages</label>
              <input 
                type="number" 
                min="10" 
                max="100"
                value={curfew.maxDailyMessages}
                onChange={e => handleCurfewChange('maxDailyMessages', parseInt(e.target.value) || 20)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--cb-border)', background: 'var(--cb-bg-elevated)', color: 'var(--cb-text-primary)' }}
              />
            </div>

            <div style={{ background: 'var(--cb-bg-muted)', padding: 16, borderRadius: 'var(--cb-radius-md)', border: '1px solid var(--cb-border)' }}>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Session Pause After (Minutes)</label>
              <input 
                type="number" 
                min="5" 
                max="60"
                value={curfew.cooldownAfterMinutes}
                onChange={e => handleCurfewChange('cooldownAfterMinutes', parseInt(e.target.value) || 15)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--cb-border)', background: 'var(--cb-bg-elevated)', color: 'var(--cb-text-primary)' }}
              />
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button 
            type="submit" 
            style={{ 
              padding: '14px 28px', 
              background: 'var(--cb-primary-gradient)', 
              color: 'white', 
              border: 'none', 
              borderRadius: 'var(--cb-radius-md)', 
              fontWeight: 600, 
              fontSize: 15, 
              cursor: 'pointer',
              boxShadow: 'var(--cb-shadow-glow)'
            }}
          >
            Save Boundary Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
