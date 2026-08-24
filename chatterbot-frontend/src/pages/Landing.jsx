import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [parentAlert, setParentAlert] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const playDemo = async (flow) => {
    setMessages([]);
    setParentAlert(null);
    setActiveScenario(flow);
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
      setMessages(prev => [...prev, { sender: 'bot', text: 'Practice will do that! Make sure to grab some water. Chilling for the rest of the night?' }]);
      await delay(2500);
      setMessages(prev => [...prev, { sender: 'teen', text: "No I have so much homework. I'm literally so overwhelmed by this history paper." }]);
      setIsTyping(true);
      await delay(2000);
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: 'History papers can pile up. 📚 Taking it one step at a time helps—do you know your topic yet?' }]);
      await delay(3000);
      setMessages(prev => [...prev, { sender: 'teen', text: "Yeah the industrial revolution but I can't find good sources and it's due Friday." }]);
      setIsTyping(true);
      await delay(2000);
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: "Deep breaths! Aim for two good sources tonight and the intro tomorrow. You've got this." }]);
    }
    else if (flow === 'friends') {
      await delay(800);
      setIsTyping(false);
      setMessages([{ sender: 'teen', text: "my best friend is being weird today and I'm really annoyed." }]);
      setIsTyping(true);
      await delay(1800);
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: "Friend drama is always tough. Have you talked to them directly about it?" }]);
      await delay(2000);
      setMessages(prev => [...prev, { sender: 'teen', text: "no I'm too scared they'll get mad and ice me out." }]);
      setIsTyping(true);
      await delay(2200);
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: "That's totally understandable. Writing out what you want to say in your notes app first can make it feel less scary." }]);
    }
    else if (flow === 'boredom') {
      await delay(800);
      setIsTyping(false);
      setMessages([{ sender: 'teen', text: "i am so bored and idk what to do right now." }]);
      setIsTyping(true);
      await delay(1500);
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: "I feel that! Sometimes doing one tiny thing builds momentum. Want a random mini-goal?" }]);
      await delay(1800);
      setMessages(prev => [...prev, { sender: 'teen', text: "sure what is it" }]);
      setIsTyping(true);
      await delay(2000);
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: "Drink a glass of water, find one song you haven't heard in a year, and listen to it. Tell me what song it is!" }]);
    }
  };

  const scenarios = [
    { id: 'nudge', emoji: '👋', label: 'Daily Check-in' },
    { id: 'friends', emoji: '💬', label: 'Peer Conflict' },
    { id: 'boredom', emoji: '🎯', label: 'Motivation Boost' },
  ];

  return (
    <div className="landing-root">

      {/* ── STICKY NAV ── */}
      <nav className={`landing-nav${navScrolled ? ' landing-nav--scrolled' : ''}`}>
        <div className="landing-nav__inner">
          <Link to="/" className="landing-nav__brand">
            <div className="landing-nav__logo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span>Chatterbot</span>
          </Link>
          <div className="landing-nav__links">
            <Link to="/login" className="landing-nav__link">Sign in</Link>
            <Link to="/demo" className="landing-nav__link landing-nav__link--demo">Live demo</Link>
            <Link to="/register" className="landing-nav__cta">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero">
        <div className="landing-hero__bg-grid" aria-hidden="true" />
        <div className="landing-hero__bg-blob landing-hero__bg-blob--1" aria-hidden="true" />
        <div className="landing-hero__bg-blob landing-hero__bg-blob--2" aria-hidden="true" />

        <div className="landing-hero__content">
          <div className="landing-hero__badge">
            <span className="pulse-dot pulse-dot--red" />
            Proactive adolescent support
          </div>

          <h1 className="landing-hero__heading">
            Support for the<br />
            <span className="landing-hero__heading-accent">digital generation.</span>
          </h1>

          <p className="landing-hero__sub">
            Daily SMS check-ins, guardian-configured boundaries, and instant safety
            alerts—no apps to download, no accounts for teens.
          </p>

          <div className="landing-hero__actions">
            <Link to="/register" className="btn btn--primary btn--lg">
              Start free trial
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/demo" className="btn btn--ghost btn--lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              View demo dashboard
            </Link>
          </div>

          <div className="landing-hero__stats">
            {[
              { value: 'Zero', label: 'apps to install' },
              { value: 'SMS', label: 'native, no bypass' },
              { value: '24 / 7', label: 'safety monitoring' },
              { value: '988', label: 'crisis protocol' },
            ].map(s => (
              <div className="landing-hero__stat" key={s.label}>
                <span className="landing-hero__stat-value">{s.value}</span>
                <span className="landing-hero__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE DEMO ── */}
      <section className="landing-demo">
        <div className="landing-demo__inner">
          <div className="landing-demo__left">
            <p className="landing-section-eyebrow">See it in action</p>
            <h2 className="landing-section-heading">A conversation that<br/>actually helps.</h2>
            <p className="landing-section-body">
              Chatterbot reaches out first—no teen-side app required. Select a scenario to watch the AI adapt to real situations teens face every day.
            </p>
            <p className="landing-demo__disclaimer">
              These conversations are illustrative only and do not represent live monitoring or emergency services.
            </p>

            <div className="landing-demo__scenarios">
              {scenarios.map(s => (
                <button
                  key={s.id}
                  onClick={() => playDemo(s.id)}
                  className={`landing-demo__scenario-btn${activeScenario === s.id ? ' landing-demo__scenario-btn--active' : ''}`}
                >
                  <span className="landing-demo__scenario-emoji">{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {parentAlert && (
              <div className="landing-demo__alert">
                <div className="landing-demo__alert-icon">⚠️</div>
                <div>
                  <div className="landing-demo__alert-title">{parentAlert.title}</div>
                  <div className="landing-demo__alert-body">{parentAlert.body}</div>
                  <div className="landing-demo__alert-badge">DASHBOARD SYNCED · SMS SENT</div>
                </div>
              </div>
            )}
          </div>

          {/* Phone mockup */}
          <div className="landing-phone">
            <div className="landing-phone__frame">
              <div className="landing-phone__notch" aria-hidden="true" />
              <div className="landing-phone__header">
                <div className="landing-phone__contact-dot" />
                <span>Chatterbot</span>
                <span className="landing-phone__status-dot" />
              </div>
              <div className="landing-phone__messages" ref={chatContainerRef}>
                {messages.length === 0 && !isTyping && (
                  <div className="landing-phone__empty">← Pick a scenario</div>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`landing-phone__bubble landing-phone__bubble--${m.sender}`}
                  >
                    {m.text}
                  </div>
                ))}
                {isTyping && (
                  <div className="landing-phone__bubble landing-phone__bubble--bot landing-phone__typing">
                    <span /><span /><span />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PILLARS / BENTO ── */}
      <section className="landing-pillars">
        <div className="landing-pillars__inner">
          <div className="landing-pillars__header">
            <p className="landing-section-eyebrow">How it works</p>
            <h2 className="landing-section-heading">Built on trust, not surveillance.</h2>
            <p className="landing-section-body" style={{ maxWidth: 560, margin: '0 auto' }}>
              Traditional monitoring apps spy on teens and erode trust. Chatterbot takes a
              radically different approach.
            </p>
          </div>

          <div className="landing-bento">
            <div className="landing-bento__card landing-bento__card--primary landing-bento__card--tall">
              <div className="landing-bento__icon landing-bento__icon--navy">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div className="landing-bento__number">01</div>
              <h3 className="landing-bento__title">The Teen Experience</h3>
              <p className="landing-bento__body">
                Chatterbot texts your teen first—no app required, no account to create.
                It acts as a supportive sounding board right inside the Messages app they
                already use. There's nothing to download or bypass.
              </p>
              <div className="landing-bento__pill">SMS-native</div>
            </div>

            <div className="landing-bento__card landing-bento__card--red">
              <div className="landing-bento__icon landing-bento__icon--red">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
              <div className="landing-bento__number">02</div>
              <h3 className="landing-bento__title">Guardian Dashboard</h3>
              <p className="landing-bento__body">
                A privacy-conscious portal gives you high-level summaries and instant
                safety alerts—without exposing full transcripts. Stay informed, not intrusive.
              </p>
              <div className="landing-bento__pill landing-bento__pill--red">Real-time alerts</div>
            </div>

            <div className="landing-bento__card landing-bento__card--light">
              <div className="landing-bento__icon landing-bento__icon--navy">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="landing-bento__number">03</div>
              <h3 className="landing-bento__title">Safety & Compliance</h3>
              <p className="landing-bento__body">
                Crisis language triggers an immediate multi-step response: a compassionate
                message to the teen, a 988 referral, and an automatic alert to your phone.
                Built on guardian consent and minimal data retention.
              </p>
              <div className="landing-bento__pill">988 integrated</div>
            </div>

            <div className="landing-bento__card landing-bento__card--dark landing-bento__card--wide">
              <div className="landing-bento__cta-content">
                <h3 className="landing-bento__cta-heading">Ready to get started?</h3>
                <p className="landing-bento__cta-body">Set up in under 5 minutes. No credit card required.</p>
              </div>
              <Link to="/register" className="btn btn--white btn--lg">
                Create free account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <div className="landing-nav__logo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span className="landing-footer__brand-name">Chatterbot</span>
          </div>
          <nav className="landing-footer__links" aria-label="Footer navigation">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/safety">Safety</Link>
            <Link to="/support">Support</Link>
            <Link to="/demo">Demo</Link>
          </nav>
          <p className="landing-footer__copy">
            &copy; {new Date().getFullYear()} Chatterbot Technologies, Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}
