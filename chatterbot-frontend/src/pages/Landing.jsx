import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChatterbotLogo } from '../components/ChatterbotLogo.jsx'
import dailySparkBadge from '../assets/badges/daily-spark.webp'
import calmNavigatorBadge from '../assets/badges/calm-navigator.webp'
import momentumMakerBadge from '../assets/badges/momentum-maker.webp'
import './Landing.css'

export default function Landing() {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [parentAlert, setParentAlert] = useState(null)
  const [activeScenario, setActiveScenario] = useState(null)
  const chatContainerRef = useRef(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const playDemo = async (flow) => {
    setMessages([])
    setParentAlert(null)
    setActiveScenario(flow)
    setIsTyping(true)
    const delay = (ms) => new Promise((res) => setTimeout(res, ms))

    if (flow === 'nudge') {
      await delay(800)
      setIsTyping(false)
      setMessages([
        {
          sender: 'bot',
          text: 'Hey Maya! 👋 How did the rest of your Wednesday go?',
        },
      ])
      await delay(2000)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'teen',
          text: "It was okay. Just got home from practice and I'm exhausted.",
        },
      ])
      setIsTyping(true)
      await delay(1500)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Practice will do that! Make sure to grab some water. Chilling for the rest of the night?',
        },
      ])
      await delay(2500)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'teen',
          text: "No I have so much homework. I'm literally so overwhelmed by this history paper.",
        },
      ])
      setIsTyping(true)
      await delay(2000)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'History papers can pile up. 📚 Taking it one step at a time helps—do you know your topic yet?',
        },
      ])
      await delay(3000)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'teen',
          text: "Yeah the industrial revolution but I can't find good sources and it's due Friday.",
        },
      ])
      setIsTyping(true)
      await delay(2000)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "Deep breaths! Aim for two good sources tonight and the intro tomorrow. You've got this.",
        },
      ])
    } else if (flow === 'friends') {
      await delay(800)
      setIsTyping(false)
      setMessages([
        {
          sender: 'teen',
          text: "my best friend is being weird today and I'm really annoyed.",
        },
      ])
      setIsTyping(true)
      await delay(1800)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Friend drama is always tough. Have you talked to them directly about it?',
        },
      ])
      await delay(2000)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'teen',
          text: "no I'm too scared they'll get mad and ice me out.",
        },
      ])
      setIsTyping(true)
      await delay(2200)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "That's totally understandable. Writing out what you want to say in your notes app first can make it feel less scary.",
        },
      ])
    } else if (flow === 'boredom') {
      await delay(800)
      setIsTyping(false)
      setMessages([
        { sender: 'teen', text: 'i am so bored and idk what to do right now.' },
      ])
      setIsTyping(true)
      await delay(1500)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'I feel that! Sometimes doing one tiny thing builds momentum. Want a random mini-goal?',
        },
      ])
      await delay(1800)
      setMessages((prev) => [
        ...prev,
        { sender: 'teen', text: 'sure what is it' },
      ])
      setIsTyping(true)
      await delay(2000)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "Drink a glass of water, find one song you haven't heard in a year, and listen to it. Tell me what song it is!",
        },
      ])
    }
  }

  const scenarios = [
    { id: 'nudge', emoji: '👋', label: 'Daily Check-in' },
    { id: 'friends', emoji: '💬', label: 'Peer Conflict' },
    { id: 'boredom', emoji: '🎯', label: 'Motivation Boost' },
  ]

  return (
    <div className="landing-root">
      {/* ── STICKY NAV ── */}
      <nav className="landing-nav">
        <div className="landing-nav__inner">
          <Link to="/" className="landing-nav__brand">
            <ChatterbotLogo size={34} />
            <span>Chatterbot</span>
          </Link>
          <div className="landing-nav__links">
            <a href="#platform" className="landing-nav__link">
              Platform
            </a>
            <Link to="/trust-center" className="landing-nav__link">
              Trust Center
            </Link>
            <Link to="/partners" className="landing-nav__link">
              Partners
            </Link>
            <Link to="/login" className="landing-nav__link">
              Sign in
            </Link>
            <Link
              to="/demo"
              className="landing-nav__link landing-nav__link--demo"
            >
              Live demo
            </Link>
            <Link to="/register" className="landing-nav__cta">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero">
        <div className="landing-hero__bg-grid" aria-hidden="true" />
        <div
          className="landing-hero__bg-blob landing-hero__bg-blob--1"
          aria-hidden="true"
        />
        <div
          className="landing-hero__bg-blob landing-hero__bg-blob--2"
          aria-hidden="true"
        />

        <div className="landing-hero__shell">
          <div className="landing-hero__content">
            <div className="landing-hero__badge">
              <span className="landing-hero__badge-mark" aria-hidden="true" />
              The teen wellbeing support layer
            </div>

            <h1 className="landing-hero__heading">
              A friend for teens.{' '}
              <span className="landing-hero__heading-accent">Peace of mind for parents</span>
            </h1>

            <p className="landing-hero__sub">
              Chatterbot starts each SMS check-in and shares only the signals that
              matter, giving teens room to talk and parents a trusted path to support.
            </p>

            <div className="landing-hero__actions">
              <Link to="/register" className="btn btn--primary btn--lg">
                Start with Chatterbot
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/demo" className="btn btn--ghost btn--lg">
                Explore the live product
              </Link>
            </div>

            <div className="landing-hero__assurance">
              <span>Zero teen-side downloads</span>
              <span>Consent-led onboarding</span>
              <span>Privacy-conscious by design</span>
            </div>
          </div>

          <div className="landing-command" aria-label="Guardian command center preview">
            <div className="landing-command__topbar">
              <div>
                <span className="landing-command__eyebrow">Guardian command center</span>
                <strong>Good afternoon, Alex</strong>
              </div>
              <span className="landing-command__live">
                <i aria-hidden="true" /> All systems active
              </span>
            </div>
            <div className="landing-command__profile">
              <div className="landing-command__avatar">M</div>
              <div>
                <strong>Maya’s week</strong>
                <span>Last check-in today at 4:18 PM</span>
              </div>
              <span className="landing-command__steady">Steady</span>
            </div>
            <div className="landing-command__metrics">
              <div>
                <span>Check-in streak</span>
                <strong>12 days</strong>
                <small>Personal best</small>
              </div>
              <div>
                <span>Weekly pulse</span>
                <strong>Positive</strong>
                <small>4 of 5 check-ins</small>
              </div>
            </div>
            <div className="landing-command__signal">
              <div className="landing-command__signal-icon">✓</div>
              <div>
                <strong>Today’s check-in completed</strong>
                <span>Homework stress · coping plan created</span>
              </div>
              <span>4:18 PM</span>
            </div>
            <div className="landing-command__footer">
              <span>Next scheduled check-in</span>
              <strong>Tomorrow · 4:00 PM</strong>
            </div>
          </div>
        </div>
        <div className="landing-hero__stats">
          {[
            { value: 'SMS native', label: 'No new teen app' },
            { value: 'Signal based', label: 'Not transcript based' },
            { value: 'Always on', label: 'Between-session support' },
            { value: 'Action ready', label: 'Clear escalation paths' },
          ].map((s) => (
            <div className="landing-hero__stat" key={s.label}>
              <span className="landing-hero__stat-value">{s.value}</span>
              <span className="landing-hero__stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── GAMIFICATION ── */}
      <section className="landing-gamification" id="platform">
        <div className="landing-gamification__inner">
          <div className="landing-gamification__header">
            <p className="landing-section-eyebrow">A healthier engagement loop</p>
            <h2 className="landing-section-heading">
              Progress teens can see and feel.
            </h2>
            <p className="landing-section-body">
              Chatterbot rewards the actions that matter: checking in, naming a
              feeling, practicing a coping skill, and coming back tomorrow. No
              leaderboards. No shame. Just visible momentum.
            </p>
          </div>
          <div className="landing-gamification__grid">
            {[
              {
                image: dailySparkBadge,
                title: 'Daily Spark',
                body: 'Build a steady check-in habit one honest conversation at a time.',
                tag: 'Consistency',
                unlock: '7 day check-in streak',
                progress: 86,
              },
              {
                image: calmNavigatorBadge,
                title: 'Calm Navigator',
                body: 'Recognize moments when a teen pauses, reflects, and chooses a coping tool.',
                tag: 'Self regulation',
                unlock: 'Complete 5 reset exercises',
                progress: 64,
              },
              {
                image: momentumMakerBadge,
                title: 'Momentum Maker',
                body: 'Celebrate small wellness goals that turn intention into repeatable action.',
                tag: 'Healthy action',
                unlock: 'Finish 10 mini challenges',
                progress: 42,
              },
            ].map((item) => (
              <article key={item.title} className="landing-gamification__card">
                <div className="landing-gamification__art">
                  <img src={item.image} alt={`${item.title} achievement badge`} />
                  <span>{item.tag}</span>
                </div>
                <h3 className="landing-gamification__title">{item.title}</h3>
                <p className="landing-gamification__body">{item.body}</p>
                <div className="landing-gamification__progress-copy">
                  <span>{item.unlock}</span>
                  <strong>{item.progress}%</strong>
                </div>
                <div className="landing-gamification__progress" aria-hidden="true">
                  <span style={{ width: `${item.progress}%` }} />
                </div>
              </article>
            ))}
          </div>
          <div className="landing-gamification__why">
            <div className="landing-gamification__why-label">Designed with intention</div>
            <div className="landing-gamification__why-items">
              {[
                {
                  stat: 'Private by default',
                  desc: 'Progress is personal. There are no public scores or social comparisons.',
                },
                {
                  stat: 'Effort over outcomes',
                  desc: 'Badges reward healthy participation, never a “good” mood or perfect week.',
                },
                {
                  stat: 'Guardian aware',
                  desc: 'Guardians see momentum without gaining access to private conversations.',
                },
              ].map((item, idx) => (
                <div key={idx} className="landing-gamification__why-item">
                  <span className="landing-gamification__why-stat">
                    {item.stat}
                  </span>
                  <span className="landing-gamification__why-desc">
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE DEMO ── */}
      <section className="landing-demo">
        <div className="landing-demo__inner">
          <div className="landing-demo__left">
            <p className="landing-section-eyebrow">See it in action</p>
            <h2 className="landing-section-heading">
              A conversation that
              <br />
              actually helps.
            </h2>
            <p className="landing-section-body">
              Chatterbot reaches out first—no teen-side app required. Select a
              scenario to watch the AI adapt to real situations teens face every
              day.
            </p>
            <p className="landing-demo__disclaimer">
              These conversations are illustrative only and do not represent
              live monitoring or emergency services.
            </p>

            <div className="landing-demo__scenarios">
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => playDemo(s.id)}
                  className={`landing-demo__scenario-btn${activeScenario === s.id ? ' landing-demo__scenario-btn--active' : ''}`}
                >
                  <span className="landing-demo__scenario-emoji">
                    {s.emoji}
                  </span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {parentAlert && (
              <div className="landing-demo__alert">
                <div className="landing-demo__alert-icon">⚠️</div>
                <div>
                  <div className="landing-demo__alert-title">
                    {parentAlert.title}
                  </div>
                  <div className="landing-demo__alert-body">
                    {parentAlert.body}
                  </div>
                  <div className="landing-demo__alert-badge">
                    DASHBOARD SYNCED · SMS SENT
                  </div>
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
                    <span />
                    <span />
                    <span />
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
            <h2 className="landing-section-heading">
              Built on trust, not surveillance.
            </h2>
            <p
              className="landing-section-body"
              style={{ maxWidth: 560, margin: '0 auto' }}
            >
              Traditional monitoring apps spy on teens and erode trust.
              Chatterbot takes a radically different approach.
            </p>
          </div>

          <div className="landing-bento">
            <div className="landing-bento__card landing-bento__card--primary landing-bento__card--tall">
              <div className="landing-bento__icon landing-bento__icon--navy">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="landing-bento__number">01</div>
              <h3 className="landing-bento__title">The Teen Experience</h3>
              <p className="landing-bento__body">
                Chatterbot texts your teen first—no app required, no account to
                create. It acts as a supportive sounding board right inside the
                Messages app they already use. There's nothing to download or
                bypass.
              </p>
              <div className="landing-bento__pill">SMS-native</div>
            </div>

            <div className="landing-bento__card landing-bento__card--red">
              <div className="landing-bento__icon landing-bento__icon--red">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <div className="landing-bento__number">02</div>
              <h3 className="landing-bento__title">Guardian Dashboard</h3>
              <p className="landing-bento__body">
                A privacy-conscious portal gives you high-level summaries and
                instant safety alerts—without exposing full transcripts. Stay
                informed, not intrusive.
              </p>
              <div className="landing-bento__pill landing-bento__pill--red">
                Real-time alerts
              </div>
            </div>

            <div className="landing-bento__card landing-bento__card--light">
              <div className="landing-bento__icon landing-bento__icon--navy">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="landing-bento__number">03</div>
              <h3 className="landing-bento__title">Safety & Compliance</h3>
              <p className="landing-bento__body">
                Crisis language triggers an immediate multi-step response: a
                compassionate message to the teen, a 988 referral, and an
                automatic alert to your phone. Built on guardian consent and
                minimal data retention.
              </p>
              <div className="landing-bento__pill">988 integrated</div>
            </div>

            <div className="landing-bento__card landing-bento__card--dark landing-bento__card--wide">
              <div className="landing-bento__cta-content">
                <h3 className="landing-bento__cta-heading">
                  Ready to get started?
                </h3>
                <p className="landing-bento__cta-body">
                  Set up in under 5 minutes. No credit card required.
                </p>
              </div>
              <Link to="/register" className="btn btn--white btn--lg">
                Create free account
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR TEENS ── */}
      <section className="landing-teens">
        <div className="landing-teens__inner">
          <div className="landing-teens__content">
            <p className="landing-section-eyebrow landing-teens__eyebrow">
              Teen-first by design
            </p>
            <h2 className="landing-section-heading landing-teens__heading">
              Actually helpful. Never awkward.
            </h2>
            <p className="landing-section-body landing-teens__copy">
              When life feels messy, teens don't need a lecture or a wall of AI
              jargon. Chatterbot keeps it calm, clear, and age-appropriate so
              support feels easy to text back to.
            </p>
            <ul className="landing-teens__list">
              {[
                {
                  icon: '🧠',
                  title: 'Advice that fits',
                  body: "Support matches the teen's age, situation, and what they actually said.",
                },
                {
                  icon: '💬',
                  title: 'Easy to answer',
                  body: 'A quick honest text is enough to get grounded, useful support back.',
                },
                {
                  icon: '🔒',
                  title: 'A safe friend, with clear guardrails',
                  body: "Teens aren't watched line by line. Guardians get signals and safety alerts, not full transcripts.",
                },
                {
                  icon: '🚨',
                  title: 'Fast help when it matters',
                  body: 'If risk rises, Chatterbot escalates quickly with crisis guidance and guardian alerts.',
                },
              ].map((item) => (
                <li key={item.title} className="landing-teens__item">
                  <span className="landing-teens__item-icon">{item.icon}</span>
                  <div>
                    <strong className="landing-teens__item-title">
                      {item.title}
                    </strong>
                    <p className="landing-teens__item-body">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="landing-teens__visual">
            <div className="landing-teens__vs">
              <div className="landing-teens__vs-card landing-teens__vs-card--bad">
                <div className="landing-teens__vs-label">Generic AI</div>
                <p className="landing-teens__vs-text">
                  "Social anxiety can involve physiological arousal, avoidance
                  behaviors, and evidence-based treatment pathways..."
                </p>
                <div className="landing-teens__vs-tag landing-teens__vs-tag--bad">
                  Feels like homework
                </div>
              </div>
              <div className="landing-teens__vs-card landing-teens__vs-card--good">
                <div className="landing-teens__vs-label">Chatterbot</div>
                <p className="landing-teens__vs-text">
                  "You're not weird for feeling that. Want a quick reset you can
                  try before class?"
                </p>
                <div className="landing-teens__vs-tag landing-teens__vs-tag--good">
                  Built for teens ✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ECOSYSTEM ── */}
      <section className="landing-press">
        <div className="landing-press__inner">
          <p className="landing-press__label">One support layer. Every care setting.</p>
          <div className="landing-press__logos">
            {[
              'Families',
              'Schools',
              'Counselors',
              'Care teams',
              'Community programs',
            ].map((p) => (
              <div key={p} className="landing-press__logo">
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM LAYER ── */}
      <section className="landing-problem" id="safety">
        <div className="landing-problem__inner">
          <div className="landing-problem__header">
            <p className="landing-section-eyebrow">The Chatterbot advantage</p>
            <h2 className="landing-section-heading">From daily signal to coordinated action.</h2>
            <p className="landing-section-body">
              Most tools own one moment. Chatterbot connects the full support
              loop without asking teens to change how they communicate.
            </p>
          </div>
          <div className="landing-problem__stats">
            {[
              {
                value: '01',
                label: 'Engage naturally',
                source: 'Proactive SMS check-ins meet teens in an everyday channel.',
              },
              {
                value: '02',
                label: 'Understand patterns',
                source: 'Context and mood signals build a clearer longitudinal view.',
              },
              {
                value: '03',
                label: 'Guide the next step',
                source: 'Age-aware support turns difficult moments into manageable actions.',
              },
              {
                value: '04',
                label: 'Escalate responsibly',
                source: 'Consent, ownership checks, and audit trails support accountable response.',
              },
            ].map((s) => (
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
          <h2 className="landing-section-heading">
            Help is always one text away.
          </h2>
          <p
            className="landing-section-body"
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            Every Chatterbot subscription includes access to a curated library
            of age-appropriate mental health resources, hotlines, and self-help
            tools.
          </p>
          <div className="landing-resources__grid">
            {[
              {
                icon: '📞',
                title: '988 Suicide & Crisis Lifeline',
                body: '24/7 call or text. Free, confidential.',
              },
              {
                icon: '🗣️',
                title: 'Crisis Text Line',
                body: 'Text HOME to 741741 for immediate support.',
              },
              {
                icon: '🧠',
                title: 'Teen Mental Health',
                body: 'Articles on anxiety, depression, and stress written for teens.',
              },
              {
                icon: '😴',
                title: 'Sleep Foundation Teen Guide',
                body: 'Science-backed sleep tips for 13–17 year olds.',
              },
              {
                icon: '🤝',
                title: 'Anti-Bullying Resources',
                body: 'PACER Center resources for teens experiencing bullying.',
              },
              {
                icon: '🏫',
                title: 'School Support',
                body: 'How to talk to your school counselor. Guided scripts for teens.',
              },
            ].map((resource) => (
              <article key={resource.title} className="landing-resources__card">
                <div className="landing-resources__title-wrap">
                  <span className="landing-resources__icon" aria-hidden="true">
                    {resource.icon}
                  </span>
                  <h3 className="landing-resources__title">{resource.title}</h3>
                </div>
                <p className="landing-resources__body">{resource.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-school" id="schools">
        <div className="landing-school__inner">
          <div className="landing-school__content">
            <p className="landing-section-eyebrow">
              For schools & institutions
            </p>
            <h2 className="landing-section-heading">
              Bring Chatterbot to your district.
            </h2>
            <p className="landing-section-body">
              Schools and counselors can partner with Chatterbot to extend
              mental health support beyond office hours. Counselors get opt-in
              crisis alert CC, and students get 24/7 support that complements —
              not replaces — professional care.
            </p>
            <a
              href="mailto:schools@chatterbot.ai"
              className="btn btn--primary btn--lg"
            >
              Contact us for school pricing
            </a>
          </div>
          <div className="landing-school__features-card">
            <ul className="landing-school__features">
              {[
                'Counselor opt-in crisis CC',
                'Privacy review ready workflows',
                'Bulk guardian enrollment',
                'District analytics dashboard',
                'Dedicated onboarding support',
              ].map((feature) => (
                <li key={feature} className="landing-school__feature">
                  <span className="landing-school__check" aria-hidden="true">
                    ✅
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="landing-referral">
        <div className="landing-referral__inner">
          <p className="landing-section-eyebrow">Care Circle</p>
          <h2 className="landing-section-heading">
            The right people, aligned around the right signal.
          </h2>
          <p className="landing-section-body" style={{ textAlign: 'center' }}>
            Give guardians, counselors, and approved supporters a shared view
            of next steps—while keeping each teen’s private conversations private.
          </p>
          <div className="landing-referral__network" aria-label="Care Circle workflow">
            <div className="landing-referral__person landing-referral__person--guardian">
              <span>AG</span>
              <strong>Guardian</strong>
              <small>Controls consent</small>
            </div>
            <div className="landing-referral__hub">
              <ChatterbotLogo size={38} />
              <strong>Care Circle</strong>
              <small>Permissioned signals</small>
            </div>
            <div className="landing-referral__person landing-referral__person--counselor">
              <span>SC</span>
              <strong>Counselor</strong>
              <small>Receives handoffs</small>
            </div>
          </div>
          <div className="landing-referral__steps">
            {[
              'Guardian chooses who can participate',
              'Chatterbot routes privacy-safe signals',
              'Every action stays visible and accountable',
            ].map((step, index) => (
              <div key={step} className="landing-referral__step">
                <div className="landing-referral__step-number">{index + 1}</div>
                <p className="landing-referral__step-text">{step}</p>
              </div>
            ))}
          </div>
          <Link to="/demo" className="btn btn--primary btn--lg">
            Explore the care workflow
          </Link>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="landing-pricing">
        <div className="landing-pricing__inner">
          <p className="landing-section-eyebrow">Simple pricing</p>
          <h2 className="landing-section-heading">One family. One price.</h2>
          <p
            className="landing-section-body"
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            No per-message fees. No surprise charges. Cancel anytime.
          </p>
          <div className="landing-pricing__cards">
            <div className="landing-pricing__card">
              <div className="landing-pricing__plan">Individual</div>
              <div className="landing-pricing__price">
                $7<span>/mo</span>
              </div>
              <div className="landing-pricing__desc">
                For one teen, one guardian
              </div>
              <ul className="landing-pricing__features">
                <li>✓ Daily SMS check-ins</li>
                <li>✓ Safety alert notifications</li>
                <li>✓ Guardian dashboard</li>
                <li>✓ Phone verification flow</li>
              </ul>
              <Link
                to="/register"
                className="btn btn--outline-navy btn--lg"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Start free trial
              </Link>
            </div>
            <div className="landing-pricing__card landing-pricing__card--featured">
              <div className="landing-pricing__badge">Most popular</div>
              <div className="landing-pricing__plan">Family</div>
              <div className="landing-pricing__price">
                $12<span>/mo</span>
              </div>
              <div className="landing-pricing__desc">Up to 5 teen profiles</div>
              <ul className="landing-pricing__features">
                <li>✓ Everything in Individual</li>
                <li>✓ Up to 5 teen profiles</li>
                <li>✓ Priority support</li>
                <li>✓ Weekly digest emails</li>
              </ul>
              <Link
                to="/register"
                className="btn btn--primary btn--lg"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Start free trial
              </Link>
            </div>
            <div className="landing-pricing__card">
              <div className="landing-pricing__plan">Organizations</div>
              <div className="landing-pricing__price">Custom</div>
              <div className="landing-pricing__desc">
                Schools, districts & health systems
              </div>
              <ul className="landing-pricing__features">
                <li>✓ Unlimited profiles</li>
                <li>✓ SSO & admin console</li>
                <li>✓ Dedicated support</li>
                <li>✓ Custom integrations</li>
              </ul>
              <Link
                to="/support"
                className="btn btn--outline-navy btn--lg"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Contact us
              </Link>
            </div>
          </div>
          <p className="landing-pricing__guarantee">
            🔒 30-day money-back guarantee · No credit card required to start ·
            Cancel anytime
          </p>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="landing-compare">
        <div className="landing-compare__inner">
          <p className="landing-section-eyebrow">Why Chatterbot</p>
          <h2 className="landing-section-heading">
            Not a monitoring app.
            <br />A relationship tool.
          </h2>
          <div className="landing-compare__table">
            <div className="landing-compare__header">
              <div />
              <div className="landing-compare__col-label">
                Traditional monitoring
              </div>
              <div className="landing-compare__col-label landing-compare__col-label--cb">
                Chatterbot
              </div>
            </div>
            {[
              ["Requires app install on teen's phone", true, false],
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
                <div className="landing-compare__cell">
                  {traditional ? (
                    <span className="landing-compare__yes">✓</span>
                  ) : (
                    <span className="landing-compare__no">✗</span>
                  )}
                </div>
                <div className="landing-compare__cell landing-compare__cell--cb">
                  {chatterbot ? (
                    <span className="landing-compare__yes">✓</span>
                  ) : (
                    <span className="landing-compare__no">✗</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="landing-mission">
        <div className="landing-mission__inner">
          <div className="landing-mission__content">
            <p
              className="landing-section-eyebrow"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Our mission
            </p>
            <h2 className="landing-mission__heading">
              The space between “I’m fine” and{' '}
              <span>“I need help” matters.</span>
            </h2>
            <p className="landing-mission__body">
              Support should not begin only after a crisis. It should be built
              through familiar, low-pressure moments that make it easier to
              speak honestly and ask for help.
            </p>
            <p className="landing-mission__body">
              Chatterbot creates that connective tissue: consistent check-ins
              for teens, useful signals for guardians, and accountable pathways
              when a situation needs more support.
            </p>
            <Link to="/safety" className="btn btn--ghost btn--lg">
              Read our safety approach →
            </Link>
          </div>
          <div className="landing-mission__numbers">
            {[
              {
                value: 'Daily',
                label: 'small moments that build trust over time',
              },
              {
                value: 'Private',
                label: 'signals for guardians, not conversation transcripts',
              },
              { value: 'Ready', label: 'clear escalation paths when risk rises' },
            ].map((s) => (
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
          <p
            className="landing-section-eyebrow"
            style={{ textAlign: 'center' }}
          >
            The complete support platform
          </p>
          <h2 className="landing-section-heading" style={{ textAlign: 'center' }}>
            Trust is a feature everyone can see.
          </h2>
          <p className="landing-section-body landing-trust__intro">
            Chatterbot gives teens clear choices, parents understandable signals,
            and every trusted adult a defined responsibility.
          </p>
          <div className="landing-trust__grid">
            {[
              {
                icon: '01',
                title: 'Shared Trust Agreement',
                body: 'Teens and parents see the same explanation of what stays protected, what can be shared, and why.',
              },
              {
                icon: '02',
                title: 'Safety response simulator',
                body: 'Families can explore how school stress, bullying, and urgent concerns move toward human support.',
              },
              {
                icon: '03',
                title: 'Teen Control Center',
                body: 'Teens shape check in timing, conversation tone, routine sharing, and requests for a trusted adult.',
              },
              {
                icon: '04',
                title: 'Human response chain',
                body: 'Every family names a primary responder, backup contact, and final pathway before a difficult moment.',
              },
              {
                icon: '05',
                title: 'Shared signal history',
                body: 'Teens and guardians can review the same record of what was shared, with whom, and when.',
              },
              {
                icon: '06',
                title: 'Family progress reports',
                body: 'Progress measures healthy action and real connection, never whether a teen had a positive mood.',
              },
              {
                icon: '07',
                title: 'Visible product boundaries',
                body: 'Chatterbot does not pretend to be human, encourage dependence, diagnose, or reveal full transcripts.',
              },
              {
                icon: '08',
                title: 'Responsible partner pilots',
                body: 'Families, schools, care teams, and youth groups begin with consent, trained responders, and measured outcomes.',
              },
            ].map((t) => (
              <div key={t.title} className="landing-trust__card">
                <div className="landing-trust__icon">{t.icon}</div>
                <h3 className="landing-trust__title">{t.title}</h3>
                <p className="landing-trust__body">{t.body}</p>
              </div>
            ))}
          </div>
          <div className="landing-trust__action">
            <Link to="/trust-center" className="btn btn--primary btn--lg">
              Explore the Trust Center →
            </Link>
            <Link to="/demo" className="btn btn--ghost btn--lg">
              Try every feature in the demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="landing-final-cta">
        <div className="landing-final-cta__inner">
          <h2 className="landing-final-cta__heading">
            Give your teen another place to turn.
          </h2>
          <p className="landing-final-cta__sub">
            Start with one thoughtful check-in and build a healthier support
            rhythm from there.
          </p>
          <div className="landing-final-cta__actions">
            <Link to="/register" className="btn btn--primary btn--lg">
              Create free account →
            </Link>
            <Link to="/demo" className="btn btn--ghost btn--lg">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
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
            <Link to="/trust-center">Trust Center</Link>
            <Link to="/partners">Partners</Link>
            <Link to="/support">Support</Link>
            <Link to="/demo">Demo</Link>
          </nav>
          <p className="landing-footer__copy">
            &copy; {new Date().getFullYear()} Chatterbot Technologies, Inc.
          </p>
        </div>
      </footer>
    </div>
  )
}
