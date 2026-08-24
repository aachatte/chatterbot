import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Demo.css'

/* ── Fictional data ─────────────────────────────────────── */
const TEENS = [
  { id: 1, name: 'Maya', age: 16, messages7d: 24, mood: 'Engaged', consent: 'Verified', phone: '(601) 555-0142', enrolled: 'Aug 12, 2024', lastActive: '2 hours ago', streak: 18 },
  { id: 2, name: 'Ethan', age: 14, messages7d: 17, mood: 'Neutral', consent: 'Verified', phone: '(601) 555-0189', enrolled: 'Aug 14, 2024', lastActive: '5 hours ago', streak: 11 },
]

const ALERTS = [
  { id: 1, teen: 'Maya', severity: 'High', status: 'Resolved', keywords: 'Self-harm language detected', created: 'Aug 18, 2024 · 9:42 PM', acknowledged: 'Aug 18, 2024 · 9:45 PM', resolved: 'Aug 18, 2024 · 10:02 PM', notes: 'Parent spoke with Maya. Situation de-escalated. Scheduled therapist follow-up.' },
  { id: 2, teen: 'Ethan', severity: 'Medium', status: 'Acknowledged', keywords: 'Expressions of hopelessness', created: 'Aug 20, 2024 · 3:14 PM', acknowledged: 'Aug 20, 2024 · 3:20 PM', resolved: null, notes: '' },
]

const ACTIVITY = [
  { type: 'message', teen: 'Maya', text: 'Completed daily check-in', time: '2h ago' },
  { type: 'alert',   teen: 'Maya', text: 'Safety alert resolved by parent', time: 'Aug 18' },
  { type: 'message', teen: 'Ethan', text: 'Replied to wellness prompt', time: 'Aug 20' },
  { type: 'enroll',  teen: 'Ethan', text: 'Phone verification completed', time: 'Aug 14' },
  { type: 'message', teen: 'Maya', text: 'Enrolled and consent verified', time: 'Aug 12' },
]

const BILLING = {
  plan: 'Family Plan',
  price: '$12 / month',
  nextBilling: 'Sep 14, 2024',
  teens: 2,
  maxTeens: 5,
  status: 'Active',
}

const CHAT_CONVO = [
  { sender: 'maya', text: "I'm kind of nervous about my math test tomorrow.", time: '4:02 PM' },
  { sender: 'bot',  text: "Totally understandable! A little pre-test nerves can actually help you focus. Have you done a quick review of the topics covered?", time: '4:02 PM' },
  { sender: 'maya', text: "Yeah I went over my notes. I just don't feel confident.", time: '4:04 PM' },
  { sender: 'bot',  text: "That feeling is really common, especially before big tests. Here's what actually helps: do 3 practice problems tonight—not all night, just 3. Then get a full 8 hours. Your brain consolidates learning while you sleep. 🧠", time: '4:04 PM' },
  { sender: 'maya', text: "okay yeah I can do that", time: '4:05 PM' },
  { sender: 'bot',  text: "You've got this, Maya. Let me know how it goes tomorrow!", time: '4:05 PM' },
]

/* ── Tab definitions ────────────────────────────────────── */
const TABS = [
  { id: 'overview',    label: 'Overview',      icon: '📊' },
  { id: 'teens',       label: 'Teens',         icon: '👥' },
  { id: 'alerts',      label: 'Alerts',        icon: '🛡️' },
  { id: 'chat',        label: 'AI Assistant',  icon: '💬' },
  { id: 'billing',     label: 'Billing',       icon: '💳' },
  { id: 'enrollment',  label: 'Enrollment',    icon: '✅' },
]

const FEATURE_EXPLAINERS = {
  overview: {
    title: 'Dashboard Overview',
    bullets: [
      'Real-time snapshot of all teen activity across your family',
      'Safety alert counter surfaces urgent issues immediately',
      'Activity feed shows a chronological log of all system events',
      'No conversation content is shown—only high-level behavioral signals',
    ],
  },
  teens: {
    title: 'Teen Profiles',
    bullets: [
      'Each teen has an isolated profile with their own consent status and activity history',
      'Engagement streak tracks consecutive days of check-in participation',
      'Mood label is derived from message sentiment trends—not raw content',
      'Guardians can update notification preferences per teen',
    ],
  },
  alerts: {
    title: 'Safety Alert Workflow',
    bullets: [
      'AI detects crisis language in real-time and escalates immediately',
      'Alert states: Triggered → Parent Notified → Acknowledged → Resolved',
      'Guardian must acknowledge before resolving—creating an audit trail',
      'Integration with 988 Suicide & Crisis Lifeline is part of the AI response',
    ],
  },
  chat: {
    title: 'AI Check-in Assistant',
    bullets: [
      'Chatterbot texts the teen first—no app download required',
      'Conversations happen in native SMS, which teens already use daily',
      'AI adapts tone based on the teen\'s mood signals and previous messages',
      'All content is private to the teen—guardians see signals, not transcripts',
    ],
  },
  billing: {
    title: 'Subscription & Billing',
    bullets: [
      'Family plan covers up to 5 teen profiles for a flat monthly fee',
      'No per-message or per-alert charges—predictable pricing',
      'Stripe-powered secure checkout and invoice management',
      'Cancel or change plan anytime from the dashboard',
    ],
  },
  enrollment: {
    title: 'Guardian Enrollment Flow',
    bullets: [
      'Guardian confirms legal authority before any teen profile is created',
      'Teen\'s phone number is verified via a one-time SMS code (expires in 15 min)',
      'Consent status is stored and auditable—required before AI contact begins',
      'COPPA/FERPA-aligned design: minimal data, explicit consent, guardian control',
    ],
  },
}

/* ── Sub-views ──────────────────────────────────────────── */
function OverviewTab() {
  return (
    <div className="demo-overview">
      <div className="demo-stats">
        {[
          { label: 'Active teens', value: '2', sub: 'enrolled & verified' },
          { label: 'Messages · 7 days', value: '41', sub: 'across all teens' },
          { label: 'Active alerts', value: '1', sub: 'requires attention', danger: true },
          { label: 'Total alerts', value: '2', sub: 'all time' },
        ].map(s => (
          <div key={s.label} className={`demo-stat-card${s.danger ? ' demo-stat-card--danger' : ''}`}>
            <div className="demo-stat-card__label">{s.label}</div>
            <div className="demo-stat-card__value">{s.value}</div>
            <div className="demo-stat-card__sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="demo-overview__grid">
        <div className="demo-card">
          <div className="demo-card__header">
            <span className="demo-card__title">Teen activity</span>
            <span className="demo-card__action">Manage →</span>
          </div>
          {TEENS.map(t => (
            <div key={t.id} className="demo-teen-row">
              <div className="demo-avatar">{t.name[0]}</div>
              <div>
                <div className="demo-teen-name">{t.name}</div>
                <div className="demo-teen-meta">{t.messages7d} messages · {t.mood}</div>
              </div>
              <span className="demo-badge demo-badge--green">Verified</span>
            </div>
          ))}
        </div>

        <div className="demo-card">
          <div className="demo-card__header">
            <span className="demo-card__title">Safety alerts</span>
            <span className="demo-card__action">View all →</span>
          </div>
          {ALERTS.map(a => (
            <div key={a.id} className="demo-alert-row">
              <span className={`demo-badge ${a.severity === 'High' ? 'demo-badge--red' : 'demo-badge--yellow'}`}>{a.severity}</span>
              <div>
                <div className="demo-alert-title">{a.keywords}</div>
                <div className="demo-alert-meta">{a.teen} · {a.created.split(' · ')[0]}</div>
              </div>
              <span className={`demo-badge ${a.status === 'Resolved' ? 'demo-badge--green' : 'demo-badge--yellow'}`}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="demo-card">
        <div className="demo-card__header"><span className="demo-card__title">Recent activity</span></div>
        {ACTIVITY.map((item, i) => (
          <div key={i} className="demo-activity-row">
            <div className={`demo-activity-dot${item.type === 'alert' ? ' demo-activity-dot--red' : ''}`} />
            <span className="demo-activity-text"><strong>{item.teen}</strong> — {item.text}</span>
            <span className="demo-activity-time">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TeensTab() {
  const [selected, setSelected] = useState(TEENS[0])
  return (
    <div className="demo-teens">
      <div className="demo-teens__sidebar">
        {TEENS.map(t => (
          <button key={t.id} className={`demo-teens__btn${selected.id === t.id ? ' demo-teens__btn--active' : ''}`} onClick={() => setSelected(t)}>
            <div className="demo-avatar demo-avatar--sm">{t.name[0]}</div>
            <div>
              <div className="demo-teen-name">{t.name}</div>
              <div className="demo-teen-meta">Age {t.age}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="demo-card demo-teens__detail">
        <div className="demo-card__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="demo-avatar demo-avatar--lg">{selected.name[0]}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>{selected.name}</div>
              <div className="demo-teen-meta">Age {selected.age} · Enrolled {selected.enrolled}</div>
            </div>
          </div>
          <span className="demo-badge demo-badge--green">✓ Consent Verified</span>
        </div>

        <div className="demo-detail-grid">
          {[
            ['Messages (7 days)', selected.messages7d],
            ['Check-in streak', `${selected.streak} days`],
            ['Mood signal', selected.mood],
            ['Last active', selected.lastActive],
          ].map(([k, v]) => (
            <div key={k} className="demo-detail-cell">
              <div className="demo-detail-cell__label">{k}</div>
              <div className="demo-detail-cell__value">{v}</div>
            </div>
          ))}
        </div>

        <div className="demo-section-label">Notification preferences</div>
        <div className="demo-prefs">
          {['Immediate SMS on any safety alert', 'Daily summary email', 'Weekly digest email'].map(p => (
            <label key={p} className="demo-pref-row">
              <input type="checkbox" defaultChecked readOnly />
              <span>{p}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function AlertsTab() {
  const [selected, setSelected] = useState(ALERTS[0])
  return (
    <div className="demo-alerts-layout">
      <div className="demo-alerts__list">
        {ALERTS.map(a => (
          <button key={a.id} className={`demo-alert-btn${selected.id === a.id ? ' demo-alert-btn--active' : ''}`} onClick={() => setSelected(a)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{a.teen}</span>
              <span className={`demo-badge ${a.severity === 'High' ? 'demo-badge--red' : 'demo-badge--yellow'}`}>{a.severity}</span>
            </div>
            <div className="demo-teen-meta">{a.keywords}</div>
            <div className="demo-teen-meta" style={{ marginTop: 4 }}>{a.created.split(' · ')[0]}</div>
          </button>
        ))}
      </div>

      <div className="demo-card demo-alerts__detail">
        <div className="demo-card__header">
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Alert #{selected.id} — {selected.teen}</div>
            <div className="demo-teen-meta">{selected.created}</div>
          </div>
          <span className={`demo-badge ${selected.status === 'Resolved' ? 'demo-badge--green' : 'demo-badge--yellow'}`}>{selected.status}</span>
        </div>

        <div className="demo-alert-detail__keywords">
          <div className="demo-section-label">Detected signal</div>
          <div className="demo-alert-detail__kw-box">{selected.keywords}</div>
        </div>

        <div className="demo-detail-grid">
          {[
            ['Severity', selected.severity],
            ['Triggered', selected.created],
            ['Acknowledged', selected.acknowledged],
            ['Resolved', selected.resolved || '—'],
          ].map(([k, v]) => (
            <div key={k} className="demo-detail-cell">
              <div className="demo-detail-cell__label">{k}</div>
              <div className="demo-detail-cell__value" style={{ fontSize: 14 }}>{v}</div>
            </div>
          ))}
        </div>

        {selected.notes && (
          <>
            <div className="demo-section-label">Resolution notes</div>
            <div className="demo-alert-detail__notes">{selected.notes}</div>
          </>
        )}

        <div className="demo-alert-detail__workflow">
          {['Triggered', 'Parent Notified', 'Acknowledged', 'Resolved'].map((step, i) => {
            const steps = { 'Resolved': 4, 'Acknowledged': 3, 'Parent Notified': 2, 'Triggered': 1 }
            const current = steps[selected.status] || 1
            const done = i + 1 <= current
            return (
              <div key={step} className={`demo-workflow-step${done ? ' demo-workflow-step--done' : ''}`}>
                <div className="demo-workflow-step__dot">{done ? '✓' : i + 1}</div>
                <div className="demo-workflow-step__label">{step}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ChatTab() {
  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [])
  return (
    <div className="demo-chat-layout">
      <div className="demo-chat__sidebar">
        <div className="demo-section-label">Teen profiles</div>
        {TEENS.map(t => (
          <div key={t.id} className={`demo-chat__contact${t.id === 1 ? ' demo-chat__contact--active' : ''}`}>
            <div className="demo-avatar demo-avatar--sm">{t.name[0]}</div>
            <div>
              <div className="demo-teen-name">{t.name}</div>
              <div className="demo-teen-meta">Last active {t.lastActive}</div>
            </div>
          </div>
        ))}
        <div className="demo-chat__disclaimer">
          Guardians do not see conversation content. Activity signals only.
        </div>
      </div>

      <div className="demo-card demo-chat__window">
        <div className="demo-chat__header">
          <div className="demo-avatar demo-avatar--sm">M</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Maya's AI Thread</div>
            <div className="demo-teen-meta">SMS · fictional example</div>
          </div>
          <span className="demo-badge demo-badge--green" style={{ marginLeft: 'auto' }}>Active</span>
        </div>
        <div className="demo-chat__messages">
          {CHAT_CONVO.map((m, i) => (
            <div key={i} className={`demo-chat__bubble demo-chat__bubble--${m.sender}`}>
              <div className="demo-chat__bubble-text">{m.text}</div>
              <div className="demo-chat__bubble-time">{m.time}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="demo-chat__input-bar">
          <div className="demo-chat__input-mock">This is a read-only view — SMS conversations happen on the teen's phone</div>
        </div>
      </div>
    </div>
  )
}

function BillingTab() {
  return (
    <div className="demo-billing">
      <div className="demo-card demo-billing__plan">
        <div className="demo-billing__plan-header">
          <div>
            <div className="demo-section-label">Current plan</div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>{BILLING.plan}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--cb-primary)', marginTop: 4 }}>{BILLING.price}</div>
          </div>
          <span className="demo-badge demo-badge--green">Active</span>
        </div>
        <div className="demo-detail-grid">
          {[
            ['Teen slots used', `${BILLING.teens} of ${BILLING.maxTeens}`],
            ['Next billing date', BILLING.nextBilling],
            ['Payment method', 'Visa ···· 4242'],
            ['Invoices', '3 available'],
          ].map(([k, v]) => (
            <div key={k} className="demo-detail-cell">
              <div className="demo-detail-cell__label">{k}</div>
              <div className="demo-detail-cell__value">{v}</div>
            </div>
          ))}
        </div>
        <div className="demo-billing__actions">
          <button className="demo-btn demo-btn--outline" disabled>Change plan</button>
          <button className="demo-btn demo-btn--ghost" disabled>Cancel subscription</button>
        </div>
      </div>

      <div className="demo-card">
        <div className="demo-card__header"><span className="demo-card__title">Plan comparison</span></div>
        <div className="demo-plan-grid">
          {[
            { name: 'Individual', price: '$7/mo', teens: 1, features: ['Daily check-ins', 'Safety alerts', 'Guardian dashboard'] },
            { name: 'Family', price: '$12/mo', teens: 5, features: ['Everything in Individual', 'Up to 5 teen profiles', 'Priority support'], current: true },
            { name: 'Enterprise', price: 'Custom', teens: '∞', features: ['Unlimited profiles', 'SSO & admin console', 'Dedicated support'] },
          ].map(p => (
            <div key={p.name} className={`demo-plan-card${p.current ? ' demo-plan-card--current' : ''}`}>
              {p.current && <div className="demo-plan-card__badge">Current</div>}
              <div className="demo-plan-card__name">{p.name}</div>
              <div className="demo-plan-card__price">{p.price}</div>
              <div className="demo-plan-card__teens">Up to {p.teens} teen{p.teens !== 1 ? 's' : ''}</div>
              <ul className="demo-plan-card__features">
                {p.features.map(f => <li key={f}>✓ {f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EnrollmentTab() {
  const [step, setStep] = useState(1)
  return (
    <div className="demo-enrollment">
      <div className="demo-card demo-enrollment__flow">
        <div className="demo-card__header">
          <span className="demo-card__title">Guardian enrollment flow</span>
          <span className="demo-teen-meta">Step {step} of 4</span>
        </div>

        <div className="demo-enrollment__steps">
          {['Guardian authority', 'Teen details', 'Phone verification', 'Consent complete'].map((s, i) => (
            <div key={s} className={`demo-enroll-step${step === i + 1 ? ' demo-enroll-step--active' : step > i + 1 ? ' demo-enroll-step--done' : ''}`}>
              <div className="demo-enroll-step__num">{step > i + 1 ? '✓' : i + 1}</div>
              <div className="demo-enroll-step__label">{s}</div>
            </div>
          ))}
        </div>

        <div className="demo-enrollment__panel">
          {step === 1 && (
            <div>
              <h3 className="demo-enrollment__panel-title">Confirm guardian authority</h3>
              <p className="demo-enrollment__panel-body">Before creating a teen profile, you must confirm you are the legal parent or guardian of this minor. This is required by our Terms of Service and applicable law.</p>
              <label className="demo-pref-row" style={{ marginTop: 16 }}>
                <input type="checkbox" defaultChecked readOnly />
                <span>I am the legal parent or guardian of this minor and have the authority to enroll them.</span>
              </label>
              <button className="demo-btn demo-btn--primary" onClick={() => setStep(2)} style={{ marginTop: 20 }}>Confirm & continue →</button>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3 className="demo-enrollment__panel-title">Teen details</h3>
              <div className="demo-form-grid">
                <div className="demo-field"><label>First name</label><input className="demo-input" defaultValue="Maya" readOnly /></div>
                <div className="demo-field"><label>Last name</label><input className="demo-input" defaultValue="Johnson" readOnly /></div>
                <div className="demo-field"><label>Date of birth</label><input className="demo-input" defaultValue="2008-03-14" readOnly /></div>
                <div className="demo-field"><label>Mobile number</label><input className="demo-input" defaultValue="(601) 555-0142" readOnly /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button className="demo-btn demo-btn--ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="demo-btn demo-btn--primary" onClick={() => setStep(3)}>Send verification SMS →</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h3 className="demo-enrollment__panel-title">Phone verification</h3>
              <p className="demo-enrollment__panel-body">A 6-digit code was sent to Maya's phone <strong>(601) 555-0142</strong>. The code expires in 15 minutes. Maya must share this code with you to complete enrollment.</p>
              <div className="demo-field" style={{ maxWidth: 200, marginTop: 16 }}>
                <label>Verification code</label>
                <input className="demo-input demo-input--code" defaultValue="483 291" readOnly />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button className="demo-btn demo-btn--ghost" onClick={() => setStep(2)}>← Back</button>
                <button className="demo-btn demo-btn--primary" onClick={() => setStep(4)}>Verify & complete →</button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="demo-enrollment__success">
              <div className="demo-enrollment__success-icon">✅</div>
              <h3>Enrollment complete!</h3>
              <p>Maya is now enrolled. Chatterbot will send her first check-in message tonight. You will receive safety alerts immediately if any concerning language is detected.</p>
              <button className="demo-btn demo-btn--primary" onClick={() => setStep(1)} style={{ marginTop: 20 }}>← Restart demo</button>
            </div>
          )}
        </div>
      </div>

      <div className="demo-card demo-enrollment__explainer">
        <div className="demo-card__title" style={{ marginBottom: 16 }}>Why this flow matters</div>
        <div className="demo-enrollment__points">
          {[
            ['🔐', 'Guardian authority', 'Only legal guardians can enroll minors—protecting both families and Chatterbot from liability.'],
            ['📱', 'Phone ownership verification', 'The teen must share their code with the guardian, confirming the guardian controls the enrollment.'],
            ['⏱️', '15-minute expiry', 'Codes expire quickly to prevent stale or intercepted tokens from being used.'],
            ['📋', 'Auditable consent', 'Every consent action is timestamped and stored, creating a defensible record.'],
          ].map(([icon, title, body]) => (
            <div key={title} className="demo-enrollment__point">
              <div className="demo-enrollment__point-icon">{icon}</div>
              <div>
                <div className="demo-enrollment__point-title">{title}</div>
                <div className="demo-enrollment__point-body">{body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Root component ─────────────────────────────────────── */
export default function Demo() {
  const [activeTab, setActiveTab] = useState('overview')
  const explainer = FEATURE_EXPLAINERS[activeTab]

  const tabContent = { overview: <OverviewTab />, teens: <TeensTab />, alerts: <AlertsTab />, chat: <ChatTab />, billing: <BillingTab />, enrollment: <EnrollmentTab /> }

  return (
    <div className="demo-root">
      {/* Top bar */}
      <header className="demo-header">
        <div className="demo-header__inner">
          <div className="demo-header__brand">
            <div className="demo-header__logo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <span className="demo-header__brand-name">Chatterbot</span>
            <span className="demo-header__badge">Investor Demo</span>
          </div>
          <div className="demo-header__right">
            <span className="demo-header__fictional">⚠ Fictional data — illustrative only</span>
            <Link to="/" className="demo-header__back">← Back to site</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="demo-hero">
        <div className="demo-hero__inner">
          <p className="demo-hero__eyebrow">Full product walkthrough</p>
          <h1 className="demo-hero__heading">The complete Chatterbot platform, <span>feature by feature.</span></h1>
          <p className="demo-hero__sub">Every tab below is a live interactive demo of the real product. Select a feature to explore it—and read the explainer to understand the product thesis behind it.</p>
        </div>
      </section>

      {/* Tab bar */}
      <div className="demo-tabbar">
        <div className="demo-tabbar__inner">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`demo-tab${activeTab === t.id ? ' demo-tab--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="demo-body">
        <div className="demo-body__inner">
          {/* Feature explainer */}
          <aside className="demo-explainer">
            <div className="demo-explainer__label">Feature explainer</div>
            <h2 className="demo-explainer__title">{explainer.title}</h2>
            <ul className="demo-explainer__list">
              {explainer.bullets.map(b => <li key={b}>{b}</li>)}
            </ul>
            <div className="demo-explainer__cta">
              <Link to="/register" className="demo-btn demo-btn--primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Get started free →
              </Link>
            </div>
          </aside>

          {/* Tab content */}
          <main className="demo-content">
            {tabContent[activeTab]}
          </main>
        </div>
      </div>

      {/* Footer disclaimer */}
      <footer className="demo-footer">
        This demonstration uses entirely fictional data. It does not send messages, evaluate safety signals, create accounts, or represent live monitoring. Chatterbot is not an emergency service. In a real emergency, call 911 or text 988.
      </footer>
    </div>
  )
}
