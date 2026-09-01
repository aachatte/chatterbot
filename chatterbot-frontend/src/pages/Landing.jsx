import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChatterbotLogo } from '../components/ChatterbotLogo.jsx';
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
            <ChatterbotLogo size={34} />
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

      {/* ── GAMIFICATION ── */}
      <section className="landing-gamification">
        <div className="landing-gamification__inner">
          <div className="landing-gamification__header">
            <p className="landing-section-eyebrow">Gamified support</p>
            <h2 className="landing-section-heading">Healthy habits that feel rewarding.</h2>
            <p className="landing-section-body">
              Chatterbot turns check-ins into a progress journey with streaks, points,
              and milestone badges so teens stay motivated to keep showing up.
            </p>
          </div>
          <div className="landing-gamification__grid">
            {[
              {
                icon: '🔥',
                title: 'Daily streaks',
                body: 'Build momentum with simple daily check-ins and celebrate consistency over perfection.',
                tag: 'Habit loop',
              },
              {
                icon: '🏅',
                title: 'Achievement badges',
                body: 'Unlock badges for positive milestones like stress coping, sleep goals, and reflection wins.',
                tag: 'Progress milestones',
              },
              {
                icon: '🎯',
                title: 'Mini challenges',
                body: 'Complete short wellness missions like hydration, breathing, or gratitude in under 2 minutes.',
                tag: 'Quick wins',
              },
            ].map((item) => (
              <article key={item.title} className="landing-gamification__card">
                <div className="landing-gamification__icon" aria-hidden="true">{item.icon}</div>
                <h3 className="landing-gamification__title">{item.title}</h3>
                <p className="landing-gamification__body">{item.body}</p>
                <div className="landing-gamification__tag">{item.tag}</div>
              </article>
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

      {/* ── FOR TEENS ── */}
      <section className="landing-teens">
        <div className="landing-teens__inner">
          <div className="landing-teens__content">
            <p className="landing-section-eyebrow" style={{ color: 'var(--cb-red)' }}>Built for kids too</p>
            <h2 className="landing-section-heading" style={{ color: 'var(--cb-navy)' }}>
              A smarter AI for younger minds.
            </h2>
            <p className="landing-section-body" style={{ color: '#444' }}>
              ChatGPT and Google are powerful — but they weren't designed for a 13-year-old wondering
              about anxiety, social pressure, or puberty. Chatterbot speaks at <strong>their level</strong>,
              in plain language, with age-appropriate context, no judgment, and guardrails that keep
              the conversation safe.
            </p>
            <ul className="landing-teens__list">
              {[
                { icon: '🧠', title: 'Age-calibrated answers', body: 'Responses are tuned to the teen\'s age — not a generic adult AI dump.' },
                { icon: '💬', title: 'Text, don\'t type an essay', body: 'No long prompts. Just text "I\'m stressed about school" and get real help.' },
                { icon: '🔒', title: 'Private from peers, visible to parents', body: 'Teens get a safe space. Guardians see summaries, not screenshots.' },
                { icon: '🚨', title: 'Knows when to escalate', body: 'If a conversation turns serious, Chatterbot alerts a guardian and suggests 988.' },
              ].map(item => (
                <li key={item.title} className="landing-teens__item">
                  <span className="landing-teens__item-icon">{item.icon}</span>
                  <div>
                    <strong className="landing-teens__item-title">{item.title}</strong>
                    <p className="landing-teens__item-body">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="landing-teens__visual">
            <div className="landing-teens__phone">
              <div className="landing-teens__phone-notch" />
              <div className="landing-teens__phone-screen">
                <div className="landing-teens__phone-label">Chatterbot</div>
                {[
                  { from: 'teen', text: 'why do i always feel nervous around people' },
                  { from: 'bot', text: 'That\'s social anxiety — it\'s really common for teens. Your brain is still learning how to read social situations, and that can feel overwhelming. You\'re definitely not alone in this 💙' },
                  { from: 'teen', text: 'it\'s like my heart races and i forget what to say' },
                  { from: 'bot', text: 'Totally makes sense. That\'s your fight-or-flight response kicking in — your brain thinks it\'s in danger even when it\'s not. It\'s annoying, but it\'s not something wrong with you.' },
                  { from: 'teen', text: 'ok so what do i actually do about it' },
                  { from: 'bot', text: 'Here are a few things that genuinely help:\n\n🫁 Box breathing — inhale 4s, hold 4s, exhale 4s. Does a lot.\n👀 Focus on one person, not the whole room.\n💭 Remind yourself: everyone\'s mostly thinking about themselves, not judging you.' },
                  { from: 'teen', text: 'the breathing thing sounds kinda dumb lol' },
                  { from: 'bot', text: 'Haha fair — it sounds too simple to work. But it literally slows your heart rate. Athletes use it before games. Give it 60 seconds next time you feel nervous and see what happens 😄' },
                ].map((msg, i) => (
                  <div key={i} className={`landing-teens__bubble landing-teens__bubble--${msg.from}`}>
                    {msg.text}
                  </div>
                ))}
              </div>
            </div>
            <div className="landing-teens__vs">
              <div className="landing-teens__vs-card landing-teens__vs-card--bad">
                <div className="landing-teens__vs-label">Generic AI</div>
                <p className="landing-teens__vs-text">"Social anxiety disorder (SAD) is characterized by intense fear of social situations and may require CBT, SSRIs, or exposure therapy as outlined in DSM-5 criteria..."</p>
                <div className="landing-teens__vs-tag landing-teens__vs-tag--bad">Not built for teens</div>
              </div>
              <div className="landing-teens__vs-card landing-teens__vs-card--good">
                <div className="landing-teens__vs-label">Chatterbot</div>
                <p className="landing-teens__vs-text">"That feeling is super normal. Here's what helps most teens..."</p>
                <div className="landing-teens__vs-tag landing-teens__vs-tag--good">Age-appropriate ✓</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF / PRESS ── */}
      <section className="landing-press">
        <div className="landing-press__inner">
          <p className="landing-press__label">Recognized by</p>
          <div className="landing-press__logos">
            {['TechCrunch', 'EdSurge', 'Common Sense Media', 'The74', 'ParentMap'].map(p => (
              <div key={p} className="landing-press__logo">{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM / MARKET ── */}
      <section className="landing-problem">
        <div className="landing-problem__inner">
          <div className="landing-problem__stats">
            {[
              { value: '1 in 5', label: 'teens experience a mental health disorder each year', source: 'CDC, 2023' },
              { value: '90%', label: 'of teens already text daily—no new app needed', source: 'Pew Research, 2024' },
              { value: '$280B', label: 'US adolescent mental health market by 2030', source: 'Grand View Research' },
              { value: '72%', label: 'of parents want earlier warning signals before a crisis', source: 'APA Family Survey, 2023' },
            ].map(s => (
              <div key={s.value} className="landing-problem__stat">
                <div className="landing-problem__stat-value">{s.value}</div>
                <div className="landing-problem__stat-label">{s.label}</div>
                <div className="landing-problem__stat-source">{s.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-resources">
        <div className="landing-resources__inner">
          <p className="landing-section-eyebrow">Free resources</p>
          <h2 className="landing-section-heading">Help is always one text away.</h2>
          <p className="landing-section-body" style={{ textAlign: 'center', marginBottom: 48 }}>
            Every Chatterbot subscription includes access to a curated library of age-appropriate mental health resources, hotlines, and self-help tools.
          </p>
          <div className="landing-resources__grid">
            {[
              { icon: '📞', title: '988 Suicide & Crisis Lifeline', body: '24/7 call or text. Free, confidential.' },
              { icon: '🗣️', title: 'Crisis Text Line', body: 'Text HOME to 741741 for immediate support.' },
              { icon: '🧠', title: 'Teen Mental Health', body: 'Articles on anxiety, depression, and stress written for teens.' },
              { icon: '😴', title: 'Sleep Foundation Teen Guide', body: 'Science-backed sleep tips for 13–17 year olds.' },
              { icon: '🤝', title: 'Anti-Bullying Resources', body: 'PACER Center resources for teens experiencing bullying.' },
              { icon: '🏫', title: 'School Support', body: 'How to talk to your school counselor. Guided scripts for teens.' },
            ].map((resource) => (
              <article key={resource.title} className="landing-resources__card">
                <div className="landing-resources__title-wrap">
                  <span className="landing-resources__icon" aria-hidden="true">{resource.icon}</span>
                  <h3 className="landing-resources__title">{resource.title}</h3>
                </div>
                <p className="landing-resources__body">{resource.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-school">
        <div className="landing-school__inner">
          <div className="landing-school__content">
            <p className="landing-section-eyebrow">For schools & institutions</p>
            <h2 className="landing-section-heading">Bring Chatterbot to your district.</h2>
            <p className="landing-section-body">
              Schools and counselors can partner with Chatterbot to extend mental health support beyond office hours. Counselors get opt-in crisis alert CC, and students get 24/7 support that complements — not replaces — professional care.
            </p>
            <a href="mailto:schools@chatterbot.ai" className="btn btn--primary btn--lg">Contact us for school pricing</a>
          </div>
          <div className="landing-school__features-card">
            <ul className="landing-school__features">
              {[
                'Counselor opt-in crisis CC',
                'FERPA-compliant data handling',
                'Bulk guardian enrollment',
                'District analytics dashboard',
                'Dedicated onboarding support',
              ].map((feature) => (
                <li key={feature} className="landing-school__feature">
                  <span className="landing-school__check" aria-hidden="true">✅</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="landing-referral">
        <div className="landing-referral__inner">
          <p className="landing-section-eyebrow">Refer a family</p>
          <h2 className="landing-section-heading">Share Chatterbot. Get a free month.</h2>
          <p className="landing-section-body" style={{ textAlign: 'center' }}>
            For every family you refer who signs up, you both get one month free. No limits.
          </p>
          <div className="landing-referral__card">
            <div className="landing-referral__code-box">XXXXXXXX</div>
            <button type="button" className="btn btn--outline-navy landing-referral__copy-btn">Copy link</button>
            <p className="landing-referral__share-text">Share your unique link with other parents</p>
          </div>
          <div className="landing-referral__steps">
            {[
              'Share your link with a parent',
              'They sign up for Chatterbot',
              'You both get a free month',
            ].map((step, index) => (
              <div key={step} className="landing-referral__step">
                <div className="landing-referral__step-icon" aria-hidden="true">🔗</div>
                <div className="landing-referral__step-number">{index + 1}</div>
                <p className="landing-referral__step-text">{step}</p>
              </div>
            ))}
          </div>
          <Link to="/dashboard" className="btn btn--primary btn--lg">Get my referral link</Link>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="landing-pricing">
        <div className="landing-pricing__inner">
          <p className="landing-section-eyebrow">Simple pricing</p>
          <h2 className="landing-section-heading">One family. One price.</h2>
          <p className="landing-section-body" style={{ textAlign: 'center', marginBottom: 48 }}>
            No per-message fees. No surprise charges. Cancel anytime.
          </p>
          <div className="landing-pricing__cards">
            <div className="landing-pricing__card">
              <div className="landing-pricing__plan">Individual</div>
              <div className="landing-pricing__price">$7<span>/mo</span></div>
              <div className="landing-pricing__desc">For one teen, one guardian</div>
              <ul className="landing-pricing__features">
                <li>✓ Daily SMS check-ins</li>
                <li>✓ Safety alert notifications</li>
                <li>✓ Guardian dashboard</li>
                <li>✓ Phone verification flow</li>
              </ul>
              <Link to="/register" className="btn btn--outline-navy btn--lg" style={{ width: '100%', justifyContent: 'center' }}>Start free trial</Link>
            </div>
            <div className="landing-pricing__card landing-pricing__card--featured">
              <div className="landing-pricing__badge">Most popular</div>
              <div className="landing-pricing__plan">Family</div>
              <div className="landing-pricing__price">$12<span>/mo</span></div>
              <div className="landing-pricing__desc">Up to 5 teen profiles</div>
              <ul className="landing-pricing__features">
                <li>✓ Everything in Individual</li>
                <li>✓ Up to 5 teen profiles</li>
                <li>✓ Priority support</li>
                <li>✓ Weekly digest emails</li>
              </ul>
              <Link to="/register" className="btn btn--primary btn--lg" style={{ width: '100%', justifyContent: 'center' }}>Start free trial</Link>
            </div>
            <div className="landing-pricing__card">
              <div className="landing-pricing__plan">Enterprise</div>
              <div className="landing-pricing__price">Custom</div>
              <div className="landing-pricing__desc">Schools, districts & health systems</div>
              <ul className="landing-pricing__features">
                <li>✓ Unlimited profiles</li>
                <li>✓ SSO & admin console</li>
                <li>✓ Dedicated support</li>
                <li>✓ Custom integrations</li>
              </ul>
              <Link to="/support" className="btn btn--outline-navy btn--lg" style={{ width: '100%', justifyContent: 'center' }}>Contact us</Link>
            </div>
          </div>
          <p className="landing-pricing__guarantee">
            🔒 30-day money-back guarantee · No credit card required to start · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="landing-compare">
        <div className="landing-compare__inner">
          <p className="landing-section-eyebrow">Why Chatterbot</p>
          <h2 className="landing-section-heading">Not a monitoring app.<br/>A relationship tool.</h2>
          <div className="landing-compare__table">
            <div className="landing-compare__header">
              <div />
              <div className="landing-compare__col-label">Traditional monitoring</div>
              <div className="landing-compare__col-label landing-compare__col-label--cb">Chatterbot</div>
            </div>
            {[
              ['Requires app install on teen\'s phone', true, false],
              ['Teen can detect & bypass the tool', true, false],
              ['Reads full message content', true, false],
              ['Proactively reaches out to teens', false, true],
              ['Guardian gets signals, not transcripts', false, true],
              ['SMS-native (no new accounts)', false, true],
              ['988 crisis protocol built in', false, true],
              ['Guardian consent + audit trail', false, true],
            ].map(([feature, traditional, chatterbot]) => (
              <div key={feature} className="landing-compare__row">
                <div className="landing-compare__feature">{feature}</div>
                <div className="landing-compare__cell">{traditional ? <span className="landing-compare__yes">✓</span> : <span className="landing-compare__no">✗</span>}</div>
                <div className="landing-compare__cell landing-compare__cell--cb">{chatterbot ? <span className="landing-compare__yes">✓</span> : <span className="landing-compare__no">✗</span>}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="landing-mission">
        <div className="landing-mission__inner">
          <div className="landing-mission__content">
            <p className="landing-section-eyebrow" style={{ color: 'rgba(255,255,255,0.5)' }}>Our mission</p>
            <h2 className="landing-mission__heading">We built Chatterbot because <span>teen mental health can't wait.</span></h2>
            <p className="landing-mission__body">
              Every day, 3,000 American teens attempt suicide. Most showed warning signs that went unnoticed. 
              Existing tools either invade privacy and destroy trust, or do nothing until a crisis hits.
            </p>
            <p className="landing-mission__body">
              Chatterbot sits in the middle: daily low-stakes check-ins that build a relationship with your teen, 
              guardian-facing signals that preserve that trust, and a crisis protocol that actually works.
            </p>
            <Link to="/safety" className="btn btn--ghost btn--lg">Read our safety approach →</Link>
          </div>
          <div className="landing-mission__numbers">
            {[
              { value: '3,000', label: 'teen suicide attempts per day in the US' },
              { value: '85%', label: 'of crisis cases showed prior warning signs' },
              { value: '0', label: 'apps your teen needs to download' },
            ].map(s => (
              <div key={s.value} className="landing-mission__number">
                <div className="landing-mission__number-value">{s.value}</div>
                <div className="landing-mission__number-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST SIGNALS ── */}
      <section className="landing-trust">
        <div className="landing-trust__inner">
          <p className="landing-section-eyebrow" style={{ textAlign: 'center' }}>Built with safeguards</p>
          <div className="landing-trust__grid">
            {[
              { icon: '🔐', title: 'Guardian consent required', body: 'No teen is enrolled without verified legal guardian authorization. Every step is auditable.' },
              { icon: '🏥', title: '988 crisis integration', body: 'Crisis language triggers an immediate multi-step response including a 988 Lifeline referral.' },
              { icon: '🔒', title: 'Privacy-first design', body: 'Guardians see behavioral signals and alerts—never full conversation transcripts.' },
              { icon: '📋', title: 'COPPA-aligned', body: 'Minimal data retention, explicit consent, guardian control. Designed for minors from day one.' },
              { icon: '🛡️', title: 'Twilio-verified delivery', body: 'SMS delivery and webhook security are powered by Twilio\'s enterprise-grade infrastructure.' },
              { icon: '👩‍⚕️', title: 'Clinical advisory board', body: 'Crisis response protocols reviewed by licensed mental health professionals.' },
            ].map(t => (
              <div key={t.title} className="landing-trust__card">
                <div className="landing-trust__icon">{t.icon}</div>
                <h3 className="landing-trust__title">{t.title}</h3>
                <p className="landing-trust__body">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="landing-final-cta">
        <div className="landing-final-cta__inner">
          <h2 className="landing-final-cta__heading">Start protecting your teen today.</h2>
          <p className="landing-final-cta__sub">Free 30-day trial. Setup takes under 5 minutes. No credit card required.</p>
          <div className="landing-final-cta__actions">
            <Link to="/register" className="btn btn--primary btn--lg">Create free account →</Link>
            <Link to="/demo" className="btn btn--ghost btn--lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              View investor demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <ChatterbotLogo size={28} />
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
