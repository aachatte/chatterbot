import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cb-bg)', color: 'var(--cb-text-primary)', padding: 'var(--cb-space-6)' }}>
      {/* Navbar */}
      <nav style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--cb-space-6)' }}>
        <div style={{ fontWeight: 700, fontSize: 24 }}>Chatterbot</div>
        <div style={{ display: 'flex', gap: 'var(--cb-space-4)' }}>
          <Link to="/login" style={{ color: 'var(--cb-text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Login</Link>
          <Link to="/register" style={{ background: 'var(--cb-primary)', color: 'white', padding: '8px 16px', borderRadius: 'var(--cb-radius-md)', textDecoration: 'none', fontWeight: 600 }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 800, margin: '100px auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 56, fontWeight: 800, marginBottom: 'var(--cb-space-4)', lineHeight: 1.1 }}>
          Proactive mental health for the <span style={{ color: 'var(--cb-primary)' }}>digital generation.</span>
        </h1>
        <p style={{ fontSize: 20, color: 'var(--cb-text-secondary)', marginBottom: 'var(--cb-space-6)' }}>
          Chatterbot is the first AI companion that checks in on your teen daily, builds trust, and alerts you only when safety is at risk.
        </p>
        <Link to="/register" style={{ background: 'var(--cb-primary-gradient)', color: 'white', padding: '16px 32px', borderRadius: 'var(--cb-radius-lg)', textDecoration: 'none', fontWeight: 600, fontSize: 18, boxShadow: 'var(--cb-shadow-glow)' }}>
          Start Protecting Your Family
        </Link>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--cb-space-6)' }}>
        {[
          { title: "No App Install", desc: "Works entirely over SMS. Your teen doesn't have to change their habits." },
          { title: "Privacy First", desc: "We track mood trends, not content. Parents get alerts, not transcripts." },
          { title: "Proactive Prevention", desc: "The bot initiates daily check-ins, catching distress before it becomes a crisis." }
        ].map(f => (
          <div key={f.title} className="glass-card">
            <h3 style={{ marginBottom: 'var(--cb-space-3)' }}>{f.title}</h3>
            <p style={{ color: 'var(--cb-text-secondary)' }}>{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
