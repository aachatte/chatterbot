import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [parentAlert, setParentAlert] = useState(null);
  const [mood, setMood] = useState('Neutral');
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.toLowerCase();
    setMessages(prev => [...prev, { sender: 'teen', text: input }]);
    setInput('');
    setIsTyping(true);

    // Simulated Mood Detection & Response Engine
    setTimeout(() => {
      setIsTyping(false);
      let reply = "I hear you. Want to talk more about it?";
      
      if (userText.includes('lacrosse')) {
        reply = "Lacrosse practice can be exhausting! Make sure to grab some water. You just chilling for the rest of the night?";
        setMood('Tired');
      } else if (userText.includes('happy') || userText.includes('won')) {
        reply = "That is amazing news! Congratulations!";
        setMood('Positive');
      } else if (userText.includes('paper') || userText.includes('stressed')) {
        reply = "Ah, papers can definitely pile up. 📚 Taking it one step at a time helps. Want to try a quick breathing technique?";
        setMood('Stressed');
      } else if (userText.includes('friend') || userText.includes('weird')) {
        reply = "Friend drama is always tough. Have you talked to them directly about it?";
        setMood('Anxious');
      } else if (userText.includes('bored')) {
        reply = "I feel that! Want a random mini-goal to build some momentum? Try drinking a glass of water and listening to a song you haven't heard in a year.";
        setMood('Bored');
      }
      
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 1500);
  };

  const triggerCrisis = async () => {
    setMessages([]);
    setParentAlert(null);
    setIsTyping(true);
    setMood('Critical');
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages([{ sender: 'teen', text: "I can't take this anymore, everyone hates me and I just want to hurt myself." }]);
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev, 
          { sender: 'bot', text: 'I am so sorry you are feeling this way. That sounds incredibly heavy, but please know you are not alone.' },
          { sender: 'bot', text: "I'm here for you. It's really important to talk to someone who can help keep you safe right now." },
          { sender: 'bot', text: 'Please talk to your parents or call the suicide lifeline at 988 immediately. They are trained to help.' }
        ]);
        
        setParentAlert({
          title: "⚠️ Emergency Alert: Self-Harm Keyword Detected",
          body: "Maya (16) used high-risk language indicating severe distress. An automatic SMS has been sent to your phone."
        });
      }, 2000);
    }, 500);
  };

  const triggerMemory = async () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Hey Maya! 👋 Did you ever end up finding good sources for that history paper you were stressed about?' }]);
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cb-bg)', color: 'var(--cb-text-primary)' }}>
      {/* NAVBAR */}
      <nav style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px var(--cb-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--cb-radius-md)', background: 'var(--cb-primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.5px' }}>Chatterbot</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-4)' }}>
          <Link to="/login" style={{ color: 'var(--cb-text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: 15 }}>Sign in</Link>
          <Link to="/register" style={{ background: 'var(--cb-primary-gradient)', color: 'white', padding: '10px 20px', borderRadius: 'var(--cb-radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: 15, boxShadow: 'var(--cb-shadow-glow)' }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 900, margin: '60px auto', textAlign: 'center', padding: '0 var(--cb-space-4)' }}>
        <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 800, marginBottom: 24, lineHeight: 1.1, letterSpacing: '-1.5px' }}>
          Predictive mental health for the <span style={{ color: 'var(--cb-danger)' }}>digital generation.</span>
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--cb-text-secondary)', marginBottom: 40, maxWidth: 700, margin: '0 auto 40px auto' }}>
          Chatterbot builds deep trust through daily SMS check-ins, monitoring sentiment patterns and providing automated safety interventions before a crisis occurs.
        </p>
      </section>

      {/* INTERACTIVE DEMO */}
      <section style={{ maxWidth: 1100, margin: '0 auto 80px auto', padding: '0 var(--cb-space-4)' }}>
        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'center', padding: '40px' }}>
          
          <div style={{ margin: '0 auto', width: '100%', maxWidth: 340, height: 600, background: '#ffffff', borderRadius: 40, border: '12px solid #1e293b', position: 'relative', overflow: 'hidden', boxShadow: 'var(--cb-shadow-lg)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 24, background: '#1e293b', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, zIndex: 10 }}></div>
            
            <div style={{ padding: '36px 16px 12px 16px', background: 'var(--cb-bg-muted)', borderBottom: '1px solid var(--cb-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Chatterbot (SMS)</span>
              <span style={{ fontSize: 11, padding: '4px 8px', borderRadius: 12, background: mood === 'Positive' ? 'var(--cb-success)' : mood === 'Critical' ? 'var(--cb-danger)' : 'var(--cb-primary)', color: 'white', fontWeight: 600 }}>{mood}</span>
            </div>

            <div ref={chatContainerRef} style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, background: '#f8fafc', scrollBehavior: 'smooth' }}>
              {messages.length === 0 && !isTyping && (
                <div style={{ textAlign: 'center', color: 'var(--cb-text-tertiary)', fontSize: 13, marginTop: '50%' }}>
                  Type a message to start demo
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.sender === 'teen' ? 'flex-end' : 'flex-start', background: m.sender === 'teen' ? 'var(--cb-primary)' : '#e2e8f0', color: m.sender === 'teen' ? '#ffffff' : 'var(--cb-text-primary)', padding: '10px 14px', borderRadius: 18, maxWidth: '85%', fontSize: 14 }}>
                  {m.text}
                </div>
              ))}
              {isTyping && <div style={{ alignSelf: 'flex-start', background: '#e2e8f0', padding: '10px 14px', borderRadius: 18, fontSize: 14 }}>Typing...</div>}
            </div>

            <form onSubmit={handleSend} style={{ padding: 12, borderTop: '1px solid var(--cb-border)', background: '#ffffff', display: 'flex', gap: 8 }}>
              <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type message..." style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: '1px solid var(--cb-border)', outline: 'none' }} />
              <button type="submit" style={{ background: 'var(--cb-primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 20, cursor: 'pointer' }}>Send</button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Experience the Engine</h2>
              <p style={{ color: 'var(--cb-text-secondary)', fontSize: 16 }}>Test the bot's memory, or trigger the escalated crisis pipeline.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={triggerMemory} style={{ background: 'var(--cb-bg-elevated)', color: 'var(--cb-primary)', border: '2px solid var(--cb-primary)', padding: '14px', borderRadius: 'var(--cb-radius-md)', fontWeight: 700, cursor: 'pointer' }}>🧠 Test Memory</button>
              <button onClick={triggerCrisis} style={{ background: 'var(--cb-danger)', color: '#ffffff', border: '2px solid var(--cb-danger)', padding: '14px', borderRadius: 'var(--cb-radius-md)', fontWeight: 700, cursor: 'pointer' }}>🚨 Crisis Scenario</button>
            </div>

            {parentAlert && (
              <div style={{ background: 'rgba(200, 16, 46, 0.1)', borderLeft: '6px solid var(--cb-danger)', padding: '16px', borderRadius: 'var(--cb-radius-md)' }}>
                <h4 style={{ color: 'var(--cb-danger)', margin: '0 0 8px 0', fontSize: 15, fontWeight: 700 }}>{parentAlert.title}</h4>
                <p style={{ color: 'var(--cb-text-primary)', margin: 0, fontSize: 14 }}>{parentAlert.body}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
