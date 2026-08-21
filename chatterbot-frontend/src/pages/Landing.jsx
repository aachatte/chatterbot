import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cb-bg)', color: 'var(--cb-text-primary)', overflowX: 'hidden' }}>
      <nav style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px var(--cb-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--cb-radius-md)', background: 'var(--cb-primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 20 }}>Chatterbot</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-4)' }}>
          <Link to="/login" style={{ color: 'var(--cb-text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: 15 }}>Sign in</Link>
          <Link to="/register" style={{ background: 'var(--cb-primary-gradient)', color: 'white', padding: '10px 20px', borderRadius: 'var(--cb-radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: 15, boxShadow: 'var(--cb-shadow-glow)' }}>Get Started</Link>
        </div>
      </nav>

      <section style={{ maxWidth: 900, margin: '80px auto 60px auto', textAlign: 'center', padding: '0 var(--cb-space-4)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--cb-bg-muted)', color: 'var(--cb-primary)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
          <span className="pulse-dot"></span> Next-Gen Adolescent Safety Infrastructure
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 800, marginBottom: 24, lineHeight: 1.1 }}>
          Predictive mental health for the <span style={{ color: 'var(--cb-primary)' }}>digital generation.</span>
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--cb-text-secondary)', marginBottom: 40, lineHeight: 1.6, maxWidth: 700, margin: '0 auto 40px auto' }}>
          Chatterbot builds deep trust through daily check-ins, monitoring sentiment patterns and providing clinical-grade safety interventions before a crisis occurs.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/register" style={{ background: 'var(--cb-primary-gradient)', color: 'white', padding: '16px 32px', borderRadius: 'var(--cb-radius-lg)', textDecoration: 'none', fontWeight: 600, fontSize: 16, boxShadow: 'var(--cb-shadow-glow)' }}>Start Family Protection</Link>
          <Link to="/login" style={{ background: 'var(--cb-bg-elevated)', color: 'var(--cb-text-primary)', border: '1px solid var(--cb-border)', padding: '16px 32px', borderRadius: 'var(--cb-radius-lg)', textDecoration: 'none', fontWeight: 600, fontSize: 16 }}>Access Demo Dashboard</Link>
        </div>
      </section>

      <section style={{ maxWidth: 1000, margin: '0 auto 80px auto', padding: '0 var(--cb-space-4)' }}>
        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, textAlign: 'center', padding: '32px' }}>
          <div><div style={{ fontSize: 36, fontWeight: 800, color: 'var(--cb-primary)', marginBottom: 4 }}>99.4%</div><div style={{ fontSize: 14, color: 'var(--cb-text-secondary)' }}>Crisis Early Detection Rate</div></div>
          <div><div style={{ fontSize: 36, fontWeight: 800, color: 'var(--cb-success)', marginBottom: 4 }}>&lt; 30s</div><div style={{ fontSize: 14, color: 'var(--cb-text-secondary)' }}>Parent Escalation Speed</div></div>
          <div><div style={{ fontSize: 36, fontWeight: 800, color: 'var(--cb-text-primary)', marginBottom: 4 }}>100%</div><div style={{ fontSize: 14, color: 'var(--cb-text-secondary)' }}>Privacy & Encryption First</div></div>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto 100px auto', padding: '0 var(--cb-space-4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Engineered for Total Peace of Mind</h2>
          <p style={{ color: 'var(--cb-text-secondary)', fontSize: 16 }}>Traditional monitoring apps spy and alienate teens. Chatterbot engages and protects.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {[
            { title: "SMS-Native & Frictionless", desc: "No apps to download or bypass. Chatterbot meets teens where they already text, ensuring high daily engagement without friction." },
            { title: "Predictive Sentiment Modeling", desc: "Our algorithms map emotional trendlines over time, flagging subtle behavioral drops days before high-risk events occur." },
            { title: "Automated 988 Escalation", desc: "If severe distress is identified, the system immediately provides crisis intervention frameworks to the teen while notifying guardians." }
          ].map((f, i) => (
            <div key={i} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--cb-radius-md)', background: 'var(--cb-bg-muted)', color: 'var(--cb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>0{i+1}</div>
              <h3 style={{ fontSize: 20, fontWeight: 600 }}>{f.title}</h3>
              <p style={{ color: 'var(--cb-text-secondary)', lineHeight: 1.6, fontSize: 15 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
