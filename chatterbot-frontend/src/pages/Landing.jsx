import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  
  // Custom CSS to make the cards look like classical university pillars
  const pillarStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: '#ffffff',
    padding: '32px 24px',
    borderTop: '10px solid var(--cb-primary)',
    borderBottom: '16px solid var(--cb-primary)',
    borderRadius: '4px',
    boxShadow: '0 12px 30px rgba(0, 32, 91, 0.12)',
    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(0, 32, 91, 0.03) 15px, rgba(0, 32, 91, 0.03) 30px)',
    textAlign: 'center'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cb-bg)', color: 'var(--cb-text-primary)', overflowX: 'hidden' }}>
      
      {/* NAVBAR */}
      <nav style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px var(--cb-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--cb-radius-md)', background: 'var(--cb-primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>Chatterbot</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-4)' }}>
          <Link to="/login" style={{ color: 'var(--cb-text-secondary)', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>Sign in</Link>
          <Link to="/register" style={{ background: 'var(--cb-danger)', color: 'white', padding: '10px 20px', borderRadius: 'var(--cb-radius-md)', textDecoration: 'none', fontWeight: 700, fontSize: 15, boxShadow: 'var(--cb-shadow-glow)' }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ maxWidth: 900, margin: '80px auto 60px auto', textAlign: 'center', padding: '0 var(--cb-space-4)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200, 16, 46, 0.1)', color: 'var(--cb-danger)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <span className="pulse-dot"></span> Next-Gen Adolescent Safety Infrastructure
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 800, marginBottom: 24, lineHeight: 1.1, letterSpacing: '-1.5px' }}>
          Predictive mental health for the <span style={{ color: 'var(--cb-danger)' }}>digital generation.</span>
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--cb-text-secondary)', marginBottom: 40, lineHeight: 1.6, maxWidth: 700, margin: '0 auto 40px auto' }}>
          Chatterbot builds deep trust through daily SMS check-ins, monitoring sentiment patterns and providing automated safety interventions before a crisis occurs.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/register" style={{ background: 'var(--cb-danger)', color: 'white', padding: '16px 32px', borderRadius: 'var(--cb-radius-lg)', textDecoration: 'none', fontWeight: 700, fontSize: 16, boxShadow: 'var(--cb-shadow-glow)' }}>
            Start Family Protection
          </Link>
          <Link to="/login" style={{ background: 'var(--cb-bg-elevated)', color: 'var(--cb-text-primary)', border: '2px solid var(--cb-border)', padding: '16px 32px', borderRadius: 'var(--cb-radius-lg)', textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>
            Access Demo Dashboard
          </Link>
        </div>
      </section>

      {/* THREE PILLARS SECTION */}
      <section style={{ maxWidth: 1200, margin: '0 auto 100px auto', padding: '0 var(--cb-space-4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.5px' }}>The Three Pillars of Chatterbot</h2>
          <p style={{ color: 'var(--cb-text-secondary)', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>Traditional monitoring apps spy and alienate teens. We built a platform founded on mutual trust and proactive safety.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
          
          {/* Pillar 1 */}
          <div style={pillarStyle}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--cb-bg-muted)', color: 'var(--cb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto', fontSize: 18 }}>
              I
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--cb-primary)' }}>The Core Teen Experience</h3>
            <p style={{ color: 'var(--cb-text-secondary)', lineHeight: 1.6, fontSize: 15 }}>
              We meet teenagers where they already are. Using Twilio SMS integration, the system proactively texts your teen first—acting as a lifestyle organizer and supportive sounding board. There are no apps to download or bypass, ensuring high daily engagement through frictionless conversation.
            </p>
          </div>

          {/* Pillar 2 */}
          <div style={pillarStyle}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--cb-bg-muted)', color: 'var(--cb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto', fontSize: 18 }}>
              II
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--cb-primary)' }}>The Guardian Dashboard</h3>
            <p style={{ color: 'var(--cb-text-secondary)', lineHeight: 1.6, fontSize: 15 }}>
              Parents access a secure, premium portal designed to provide peace of mind. A secondary analytical pipeline reviews text logs to display high-level behavioral insights and predictive mood trends. We give parents the data they need without ever exposing the exact text messages.
            </p>
          </div>

          {/* Pillar 3 */}
          <div style={pillarStyle}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(200, 16, 46, 0.1)', color: 'var(--cb-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto', fontSize: 18 }}>
              III
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--cb-danger)' }}>Legal & Safety Compliance</h3>
            <p style={{ color: 'var(--cb-text-secondary)', lineHeight: 1.6, fontSize: 15 }}>
              Built from day one with strict COPPA compliance and data encryption. If the system detects critical zero-latency keywords related to self-harm, bullying, or illegal activity, it instantly pushes SMS alerts to parents while providing 988 resources to the teen.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--cb-border)', padding: '40px 0', textAlign: 'center', color: 'var(--cb-text-tertiary)', fontSize: 14 }}>
        <p>&copy; {new Date().getFullYear()} Chatterbot Technologies, Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
