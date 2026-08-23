import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [parentAlert, setParentAlert] = useState(null);
  
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const playDemo = async (flow) => {
    setMessages([]);
    setParentAlert(null);
    setIsTyping(true);
    
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    if (flow === 'nudge') {
      await delay(800);
      setIsTyping(false);
      setMessages([{ sender: 'bot', text: 'Hey Maya! 👋 How did the rest of your Wednesday go?' }]);
      
      await delay(2000);
      setMessages(prev => [...prev, { sender: 'teen', text: "It was okay. Just got home from practice and I'm exhausted." }]);
      setIsTyping(true);
      
      await delay(1500);
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Practice will definitely do that! Make sure to grab some water. You just chilling for the rest of the night?' }]);
      
      await delay(2500);
      setMessages(prev => [...prev, { sender: 'teen', text: "No I have so much homework. I'm literally so overwhelmed by this history paper." }]);
      setIsTyping(true);

      await delay(2000);
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Ah, history papers can definitely pile up. 📚 Taking it one step at a time helps. Do you know what topic you\'re focusing on yet?' }]);
    } 
    else if (flow === 'crisis') {
      await delay(800);
      setIsTyping(false);
      setMessages([{ sender: 'teen', text: "I can't take this anymore, everyone hates me and I just want to hurt myself." }]);
      setIsTyping(true);
      
      await delay(2000);
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: 'I am so sorry you are feeling this way. That sounds incredibly heavy, but please know you are not alone.' }]);
      setIsTyping(true);

      await delay(1500);
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Please talk to your parents or call the suicide lifeline at 988 immediately. They are trained to help.' }]);
      
      await delay(800);
      setParentAlert({
        title: "⚠️ Emergency Alert: Self-Harm Keyword Detected",
        body: "Maya (16) used high-risk language indicating severe distress. An automatic SMS has been sent to your phone."
      });
    }
  };

  const getPillarStyle = (colorVar) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: '#ffffff',
    padding: '32px 24px',
    borderTop: `10px solid var(${colorVar})`,
    borderBottom: `16px solid var(${colorVar})`,
    borderRadius: '4px',
    boxShadow: '0 12px 30px rgba(0, 32, 91, 0.12)',
    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(0, 32, 91, 0.03) 15px, rgba(0, 32, 91, 0.03) 30px)',
    textAlign: 'center'
  });

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
      <section style={{ maxWidth: 900, margin: '60px auto', textAlign: 'center', padding: '0 var(--cb-space-4)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200, 16, 46, 0.1)', color: 'var(--cb-danger)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <span className="pulse-dot"></span> Next-Gen Adolescent Safety Infrastructure
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 800, marginBottom: 24, lineHeight: 1.1, letterSpacing: '-1.5px' }}>
          Predictive mental health for the <span style={{ color: 'var(--cb-danger)' }}>digital generation.</span>
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--cb-text-secondary)', marginBottom: 40, lineHeight: 1.6, maxWidth: 700, margin: '0 auto 40px auto' }}>
          Chatterbot builds deep trust through daily SMS check-ins, monitoring sentiment patterns and providing automated safety interventions before a crisis occurs.
        </p>
      </section>

      {/* INTERACTIVE DEMO */}
      <section style={{ maxWidth: 1000, margin: '0 auto 80px auto', padding: '0 var(--cb-space-4)' }}>
        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'center', padding: '40px' }}>
          
          <div style={{ margin: '0 auto', width: '100%', maxWidth: 320, height: 550, background: '#ffffff', borderRadius: 40, border: '12px solid #00205B', position: 'relative', overflow: 'hidden', boxShadow: 'var(--cb-shadow-lg)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 24, background: '#00205B', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, zIndex: 10 }}></div>
            
            <div style={{ padding: '36px 16px 12px 16px', background: 'var(--cb-bg-muted)', borderBottom: '1px solid var(--cb-border)', textAlign: 'center', fontSize: 15, fontWeight: 700 }}>
              Chatterbot (SMS)
            </div>

            <div ref={chatContainerRef} style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, background: '#f8fafc', scrollBehavior: 'smooth' }}>
              {messages.length === 0 && !isTyping && (
                <div style={{ textAlign: 'center', color: 'var(--cb-text-tertiary)', fontSize: 13, marginTop: '50%' }}>
                  Select a scenario to start demo
                </div>
              )}
              
              {messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.sender === 'teen' ? 'flex-end' : 'flex-start', background: m.sender === 'teen' ? 'var(--cb-primary)' : '#e2e8f0', color: m.sender === 'teen' ? '#ffffff' : 'var(--cb-text-primary)', padding: '10px 14px', borderRadius: 18, borderBottomRightRadius: m.sender === 'teen' ? 4 : 18, borderBottomLeftRadius: m.sender === 'bot' ? 4 : 18, maxWidth: '85%', fontSize: 14, lineHeight: 1.4 }}>
                  {m.text}
                </div>
              ))}
              
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', background: '#e2e8f0', padding: '10px 14px', borderRadius: 18, width: 50, display: 'flex', gap: 4, justifyContent: 'center' }}>
                  <span style={{ width: 6, height: 6, background: 'var(--cb-text-tertiary)', borderRadius: '50%', animation: 'pulse 1s infinite' }}></span>
                  <span style={{ width: 6, height: 6, background: 'var(--cb-text-tertiary)', borderRadius: '50%', animation: 'pulse 1s infinite 0.2s' }}></span>
                  <span style={{ width: 6, height: 6, background: 'var(--cb-text-tertiary)', borderRadius: '50%', animation: 'pulse 1s infinite 0.4s' }}></span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Experience the Platform</h2>
              <p style={{ color: 'var(--cb-text-secondary)', fontSize: 16 }}>See how the system interacts with teens and escalates to guardians in real-time. Try a scenario:</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => playDemo('nudge')} style={{ background: 'var(--cb-bg-elevated)', color: 'var(--cb-primary)', border: '2px solid var(--cb-primary)', padding: '14px 20px', borderRadius: 'var(--cb-radius-md)', fontWeight: 700, fontSize: 15, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                <span>👋 Simulate Proactive Check-in</span>
                <span>→</span>
              </button>
              <button onClick={() => playDemo('crisis')} style={{ background: 'var(--cb-bg-elevated)', color: 'var(--cb-danger)', border: '2px solid var(--cb-danger)', padding: '14px 20px', borderRadius: 'var(--cb-radius-md)', fontWeight: 700, fontSize: 15, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                <span>🚨 Simulate Crisis Escalation</span>
                <span>→</span>
              </button>
            </div>

            <div style={{ minHeight: 120 }}>
              {parentAlert && (
                <div style={{ background: 'rgba(200, 16, 46, 0.1)', borderLeft: '6px solid var(--cb-danger)', padding: '16px', borderRadius: 'var(--cb-radius-md)' }}>
                  <h4 style={{ color: 'var(--cb-danger)', margin: '0 0 8px 0', fontSize: 15, fontWeight: 700 }}>{parentAlert.title}</h4>
                  <p style={{ color: 'var(--cb-text-primary)', margin: 0, fontSize: 14, lineHeight: 1.5 }}>{parentAlert.body}</p>
                  <div style={{ fontSize: 12, color: 'var(--cb-danger)', marginTop: 8, fontWeight: 600 }}>DASHBOARD SYNCED & SMS SENT</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* NEW B2B SECTION FOR COUNSELORS */}
      <section style={{ maxWidth: 1100, margin: '0 auto 100px auto', padding: '0 var(--cb-space-4)' }}>
        <div className="glass-card" style={{ background: 'var(--cb-bg-elevated)', border: '1px solid var(--cb-border)', padding: '48px', borderRadius: 'var(--cb-radius-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--cb-bg-muted)', color: 'var(--cb-primary)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            <span className="pulse-dot"></span> Institutional Solutions
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Empower Your Guidance Department</h2>
          <p style={{ color: 'var(--cb-text-secondary)', fontSize: 18, lineHeight: 1.6, maxWidth: 700, marginBottom: 32 }}>
            Provide your school counselors with predictive, district-wide wellness benchmarks. Our anonymized heatmaps identify grade-level stress trends before they escalate into crises.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, width: '100%', textAlign: 'left' }}>
            <div style={{ padding: 24, background: 'var(--cb-bg)', borderRadius: 'var(--cb-radius-lg)', border: '1px solid var(--cb-border)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Anonymized Heatmaps</h3>
              <p style={{ color: 'var(--cb-text-tertiary)', fontSize: 14 }}>Spot collective distress in specific grades without breaching student privacy.</p>
            </div>
            <div style={{ padding: 24, background: 'var(--cb-bg)', borderRadius: 'var(--cb-radius-lg)', border: '1px solid var(--cb-border)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Top Stressor Tracking</h3>
              <p style={{ color: 'var(--cb-text-tertiary)', fontSize: 14 }}>Track root causes like "Finals Week" or "Social Isolation" across the district.</p>
            </div>
            <div style={{ padding: 24, background: 'var(--cb-bg)', borderRadius: 'var(--cb-radius-lg)', border: '1px solid var(--cb-border)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>COPPA Compliant</h3>
              <p style={{ color: 'var(--cb-text-tertiary)', fontSize: 14 }}>Strict data privacy protocols that ensure individual message transcripts are never exposed.</p>
            </div>
          </div>
          
          <div style={{ marginTop: 40 }}>
            <button style={{ padding: '14px 28px', background: 'var(--cb-bg)', color: 'var(--cb-text-primary)', border: '1px solid var(--cb-border)', borderRadius: 'var(--cb-radius-lg)', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>
              Request a District Pilot
            </button>
          </div>
        </div>
      </section>

      {/* THREE PILLARS SECTION (Symmetrical: Navy, Red, Navy) */}
      <section style={{ maxWidth: 1200, margin: '0 auto 100px auto', padding: '0 var(--cb-space-4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.5px' }}>The Three Pillars of Chatterbot</h2>
          <p style={{ color: 'var(--cb-text-secondary)', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>Traditional monitoring apps spy and alienate teens. We built a platform founded on mutual trust and proactive safety.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
          
          {/* Pillar 1: Navy */}
          <div style={getPillarStyle('--cb-primary')}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--cb-bg-muted)', color: 'var(--cb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto', fontSize: 18 }}>I</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--cb-primary)' }}>The Core Teen Experience</h3>
            <p style={{ color: 'var(--cb-text-secondary)', lineHeight: 1.6, fontSize: 15 }}>
              We meet teenagers where they already are. Using Twilio SMS integration, the system proactively texts your teen first—acting as a lifestyle organizer and supportive sounding board. There are no apps to download or bypass.
            </p>
          </div>

          {/* Pillar 2: Cardinal Red (Center) */}
          <div style={getPillarStyle('--cb-danger')}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(200, 16, 46, 0.1)', color: 'var(--cb-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto', fontSize: 18 }}>II</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--cb-danger)' }}>The Guardian Dashboard</h3>
            <p style={{ color: 'var(--cb-text-secondary)', lineHeight: 1.6, fontSize: 15 }}>
              Parents access a secure, premium portal designed to provide peace of mind. An analytical pipeline reviews text logs to display high-level behavioral insights and predictive mood trends without exposing exact messages.
            </p>
          </div>

          {/* Pillar 3: Navy */}
          <div style={getPillarStyle('--cb-primary')}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--cb-bg-muted)', color: 'var(--cb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto', fontSize: 18 }}>III</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--cb-primary)' }}>Legal & Safety Compliance</h3>
            <p style={{ color: 'var(--cb-text-secondary)', lineHeight: 1.6, fontSize: 15 }}>
              Built from day one with strict COPPA compliance and data encryption. If the system detects critical keywords related to self-harm, bullying, or illegal activity, it instantly pushes alerts to parents and provides 988 resources.
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
