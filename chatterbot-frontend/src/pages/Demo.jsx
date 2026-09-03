import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BellRing,
  Check,
  CircleDollarSign,
  ClipboardCheck,
  HeartHandshake,
  House,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react'
import { ChatterbotLogo } from '../components/ChatterbotLogo.jsx'
import dailySparkBadge from '../assets/badges/daily-spark.webp'
import calmNavigatorBadge from '../assets/badges/calm-navigator.webp'
import momentumMakerBadge from '../assets/badges/momentum-maker.webp'
import './Demo.css'

/* ── Fictional data ─────────────────────────────────────── */
const TEENS = [
  {
    id: 1,
    name: 'Maya',
    age: 16,
    messages7d: 24,
    mood: 'On a roll',
    consent: 'Verified',
    phone: '(601) 555-0142',
    enrolled: 'Aug 12, 2024',
    lastActive: '2 hours ago',
    streak: 18,
    avatarEmoji: '🌈',
  },
  {
    id: 2,
    name: 'Ethan',
    age: 14,
    messages7d: 17,
    mood: 'Steady',
    consent: 'Verified',
    phone: '(601) 555-0189',
    enrolled: 'Aug 14, 2024',
    lastActive: '5 hours ago',
    streak: 11,
    avatarEmoji: '⚡',
  },
]

const ALERTS = [
  {
    id: 1,
    teen: 'Maya',
    severity: 'High',
    status: 'Resolved',
    keywords: 'Urgent wellbeing signal',
    created: 'Aug 18, 2024 · 9:42 PM',
    acknowledged: 'Aug 18, 2024 · 9:45 PM',
    resolved: 'Aug 18, 2024 · 10:02 PM',
    notes:
      'Parent spoke with Maya. Situation de-escalated. Scheduled therapist follow-up.',
  },
  {
    id: 2,
    teen: 'Ethan',
    severity: 'Medium',
    status: 'Acknowledged',
    keywords: 'Elevated distress signal',
    created: 'Aug 20, 2024 · 3:14 PM',
    acknowledged: 'Aug 20, 2024 · 3:20 PM',
    resolved: null,
    notes: '',
  },
]

const ACTIVITY = [
  {
    type: 'message',
    teen: 'Maya',
    text: 'Small win: check-in done',
    time: '2h ago',
  },
  {
    type: 'alert',
    teen: 'Maya',
    text: 'Guardian safety alert reviewed',
    time: 'Aug 18',
  },
  {
    type: 'message',
    teen: 'Ethan',
    text: 'Quick mood check reply sent',
    time: 'Aug 20',
  },
  {
    type: 'enroll',
    teen: 'Ethan',
    text: 'Phone verification completed',
    time: 'Aug 14',
  },
  {
    type: 'message',
    teen: 'Maya',
    text: 'Enrolled and consent verified',
    time: 'Aug 12',
  },
]

const BILLING = {
  plan: 'Family Plan',
  price: '$12 / month',
  nextBilling: 'Sep 14, 2024',
  teens: 2,
  maxTeens: 5,
  status: 'Active',
}

const GAMIFICATION_OVERVIEW = {
  activeChallenges: 3,
  pointsEarned7d: 540,
  badgesUnlocked30d: 6,
  avgStreak: 14,
}

const GAMIFICATION_CHALLENGES = [
  {
    id: 1,
    name: 'Hydration Hero',
    teen: 'Maya',
    progress: '5 / 7 days',
    reward: '+120 XP',
    status: 'On a roll',
    mascot: 'Daily Spark',
    badgeImage: dailySparkBadge,
  },
  {
    id: 2,
    name: 'Mindful Minute',
    teen: 'Ethan',
    progress: '7 / 7 days',
    reward: 'New badge',
    status: 'Completed',
    mascot: 'Calm Navigator',
    badgeImage: calmNavigatorBadge,
  },
  {
    id: 3,
    name: 'Sleep Streak',
    teen: 'Maya',
    progress: '4 / 5 nights',
    reward: '+80 XP',
    status: 'On a roll',
    mascot: 'Momentum Maker',
    badgeImage: momentumMakerBadge,
  },
]

const GAMIFICATION_LEADERBOARD = [
  {
    rank: 1,
    teen: 'Maya',
    points: 1820,
    streak: 18,
    badge: 'Daily Spark',
    badgeImage: dailySparkBadge,
    mascot: 'Daily Spark',
  },
  {
    rank: 2,
    teen: 'Ethan',
    points: 1490,
    streak: 11,
    badge: 'Calm Navigator',
    badgeImage: calmNavigatorBadge,
    mascot: 'Calm Navigator',
  },
]

const CARE_CIRCLE_MEMBERS = [
  {
    id: 1,
    name: 'Alex Johnson',
    initials: 'AJ',
    role: 'Account guardian',
    relationship: 'Parent',
    status: 'Active',
    access: 'Circle settings',
    safety: true,
    updates: true,
  },
  {
    id: 2,
    name: 'Sam Carter',
    initials: 'SC',
    role: 'Counselor',
    relationship: 'School counselor',
    status: 'Active',
    access: 'Support signals',
    safety: true,
    updates: true,
  },
  {
    id: 3,
    name: 'Priya Shah',
    initials: 'PS',
    role: 'Family member',
    relationship: 'Aunt',
    status: 'Pending',
    access: 'Safety only',
    safety: true,
    updates: false,
  },
]

const GAMIFICATION_VIBES = [
  { id: 'bright', label: 'Bright' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'sunset', label: 'Sunset' },
]

const GAMIFICATION_MODES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

const CHAT_CONVO = [
  {
    sender: 'bot',
    text: 'Hey Maya! Quick check in: how are you feeling about tomorrow?',
    time: '4:00 PM',
  },
  {
    sender: 'maya',
    text: "I'm kind of nervous about my math test tomorrow.",
    time: '4:02 PM',
  },
  {
    sender: 'bot',
    text: 'That makes sense. Small wins help—want to pick one quick review move?',
    time: '4:02 PM',
  },
  {
    sender: 'maya',
    text: "Yeah I went over my notes. I just don't feel confident.",
    time: '4:04 PM',
  },
  {
    sender: 'bot',
    text: 'You’re not alone. Try just 3 practice questions tonight, then rest. You got this. 🧠',
    time: '4:04 PM',
  },
  { sender: 'maya', text: 'okay yeah I can do that', time: '4:05 PM' },
  {
    sender: 'bot',
    text: 'Love it. Small win locked in—let me know tomorrow!',
    time: '4:05 PM',
  },
]

/* ── Tab definitions ────────────────────────────────────── */
const TABS = [
  { id: 'overview', label: 'Overview', icon: House },
  { id: 'teens', label: 'Teens', icon: UsersRound },
  { id: 'careCircle', label: 'Care Circle', icon: HeartHandshake },
  { id: 'alerts', label: 'Safety', icon: ShieldCheck },
  { id: 'gamification', label: 'Rewards', icon: Sparkles },
  { id: 'chat', label: 'SMS experience', icon: MessageCircleHeart },
  { id: 'enrollment', label: 'Enrollment', icon: ClipboardCheck },
  { id: 'billing', label: 'Billing', icon: CircleDollarSign },
]

const FEATURE_EXPLAINERS = {
  overview: {
    title: 'Guardian command center',
    bullets: [
      'See the week at a glance without reading conversations',
      'Check in rhythm and broad wellbeing stay easy to understand',
      'Important next steps rise above routine activity',
      'The interface shares signals, not surveillance',
    ],
  },
  teens: {
    title: 'Teen Profiles',
    bullets: [
      'Each teen gets a personal profile with their own history',
      'Streaks make momentum visible through small wins',
      'Mood labels come from trends—not raw message content',
      'Guardians can tune alerts per teen',
    ],
  },
  alerts: {
    title: 'Safety response',
    bullets: [
      'AI detects crisis language in real-time and escalates immediately',
      'Alert states: Triggered → Parent Notified → Acknowledged → Resolved',
      'Guardian must acknowledge before resolving—creating an audit trail',
      'Integration with 988 Suicide & Crisis Lifeline is part of the AI response',
    ],
  },
  gamification: {
    title: 'Healthy momentum',
    bullets: [
      'Wellness challenges turn daily habits into visible progress',
      'Mascots, badges, and streaks celebrate small wins',
      'Color vibes keep the demo playful without changing guardian controls',
      'Momentum trends help spot dips early',
    ],
  },
  chat: {
    title: 'Teen SMS experience',
    bullets: [
      'Chatterbot texts the teen first—no app download required',
      'Conversations happen in native SMS, which teens already use daily',
      'Chatterbot responds like a calm, familiar friend',
      'This preview shows the teen experience, not guardian transcript access',
    ],
  },
  careCircle: {
    title: 'Care Circle',
    bullets: [
      'Guardians choose the trusted adults around each teen',
      'Every member receives only the signals selected for their role',
      'Invitations expire and access can be paused at any time',
      'Full conversation text is never shared through Care Circle',
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
      "Teen's phone number is verified via a one-time SMS code (expires in 15 min)",
      'Consent status is stored and auditable—required before AI contact begins',
      'COPPA/FERPA-aligned design: minimal data, explicit consent, guardian control',
    ],
  },
}

/* ── Sub-views ──────────────────────────────────────────── */
function OverviewTab() {
  return (
    <div className="demo-overview">
      <section className="demo-week-card">
        <div className="demo-week-card__topline">
          <div>
            <span className="demo-section-label">Maya&apos;s week</span>
            <h2>Support is steady and on track.</h2>
          </div>
          <span className="demo-system-status">
            <span /> All systems active
          </span>
        </div>

        <div className="demo-week-card__profile">
          <div className="demo-avatar demo-avatar--lg">M</div>
          <div>
            <strong>Maya Johnson</strong>
            <span>Last check in today at 4:18 PM</span>
          </div>
          <span className="demo-badge demo-badge--green">Steady</span>
        </div>

        <div className="demo-week-card__metrics">
          <div>
            <span>Check in streak</span>
            <strong>18 days</strong>
            <small>Personal best</small>
          </div>
          <div>
            <span>Weekly pulse</span>
            <strong>Positive</strong>
            <small>4 of 5 check ins</small>
          </div>
        </div>

        <div className="demo-week-card__moment">
          <span className="demo-week-card__check">
            <Check size={18} aria-hidden="true" />
          </span>
          <div>
            <strong>Today&apos;s check in completed</strong>
            <span>Homework stress · coping plan created</span>
          </div>
          <time>4:18 PM</time>
        </div>

        <div className="demo-week-card__next">
          <span>Next scheduled check in</span>
          <strong>Tomorrow · 4:00 PM</strong>
        </div>
      </section>

      <div className="demo-stats">
        {[
          { label: 'Check ins this week', value: '9', sub: 'across 2 teens' },
          { label: 'Care Circle', value: '2', sub: 'connected adults' },
          {
            label: 'Safety review',
            value: '1',
            sub: 'requires attention',
            danger: true,
          },
          { label: 'Current streak', value: '18d', sub: 'new personal best' },
        ].map((s) => (
          <div
            key={s.label}
            className={`demo-stat-card${s.danger ? ' demo-stat-card--danger' : ''}`}
          >
            <div className="demo-stat-card__label">{s.label}</div>
            <div className="demo-stat-card__value">{s.value}</div>
            <div className="demo-stat-card__sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="demo-overview__grid">
        <div className="demo-card">
          <div className="demo-card__header">
            <div>
              <span className="demo-section-label">Family</span>
              <span className="demo-card__title">Support overview</span>
            </div>
            <span className="demo-card__action">2 active teens</span>
          </div>
          {TEENS.map((t) => (
            <div key={t.id} className="demo-teen-row">
              <div className="demo-avatar">{t.name[0]}</div>
              <div>
                <div className="demo-teen-name">{t.name}</div>
                <div className="demo-teen-meta">
                  {t.streak} day rhythm · {t.mood}
                </div>
              </div>
              <div
                className="demo-avatar demo-avatar--sm demo-avatar--mascot"
                aria-hidden="true"
              >
                {t.avatarEmoji}
              </div>
              <span className="demo-badge demo-badge--green">Verified</span>
            </div>
          ))}
        </div>

        <div className="demo-card">
          <div className="demo-card__header">
            <div>
              <span className="demo-section-label">Safety</span>
              <span className="demo-card__title">Signals requiring care</span>
            </div>
            <span className="demo-card__action">No transcripts</span>
          </div>
          {ALERTS.map((a) => (
            <div key={a.id} className="demo-alert-row">
              <span
                className={`demo-badge ${a.severity === 'High' ? 'demo-badge--red' : 'demo-badge--yellow'}`}
              >
                {a.severity}
              </span>
              <div>
                <div className="demo-alert-title">{a.keywords}</div>
                <div className="demo-alert-meta">
                  {a.teen} · {a.created.split(' · ')[0]}
                </div>
              </div>
              <span
                className={`demo-badge ${a.status === 'Resolved' ? 'demo-badge--green' : 'demo-badge--yellow'}`}
              >
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="demo-card">
        <div className="demo-card__header">
          <div>
            <span className="demo-section-label">Accountability</span>
            <span className="demo-card__title">Recent activity</span>
          </div>
        </div>
        {ACTIVITY.map((item, i) => (
          <div key={i} className="demo-activity-row">
            <div
              className={`demo-activity-dot${item.type === 'alert' ? ' demo-activity-dot--red' : ''}`}
            />
            <span className="demo-activity-text">
              <strong>{item.teen}</strong> — {item.text}
            </span>
            <span className="demo-activity-time">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CareCircleTab() {
  const [selectedId, setSelectedId] = useState(2)
  const [paused, setPaused] = useState(false)
  const selected = CARE_CIRCLE_MEMBERS.find(
    (member) => member.id === selectedId
  )
  const selectedStatus =
    selected.id === 2 && paused ? 'Paused' : selected.status

  return (
    <div className="demo-circle">
      <section className="demo-circle__hero">
        <div>
          <span className="demo-section-label">Maya&apos;s trusted team</span>
          <h2>The right people, around the right signals.</h2>
          <p>
            Alex decides who can help and what they can receive. Maya&apos;s
            complete conversations stay out of the dashboard.
          </p>
        </div>
        <div className="demo-circle__score">
          <strong>67%</strong>
          <span>circle ready</span>
          <small>1 invitation pending</small>
        </div>
      </section>

      <div className="demo-circle__layout">
        <section className="demo-card demo-circle__members">
          <div className="demo-card__header">
            <div>
              <span className="demo-section-label">People</span>
              <span className="demo-card__title">Care Circle members</span>
            </div>
            <span className="demo-card__action">3 people</span>
          </div>
          <div className="demo-circle__member-list">
            {CARE_CIRCLE_MEMBERS.map((member) => {
              const status =
                member.id === 2 && paused ? 'Paused' : member.status
              return (
                <button
                  type="button"
                  key={member.id}
                  className={`demo-circle__member${selectedId === member.id ? ' demo-circle__member--selected' : ''}`}
                  onClick={() => setSelectedId(member.id)}
                  aria-pressed={selectedId === member.id}
                >
                  <span className="demo-circle__member-avatar">
                    {member.initials}
                  </span>
                  <span className="demo-circle__member-copy">
                    <strong>{member.name}</strong>
                    <small>
                      {member.role} · {member.relationship}
                    </small>
                  </span>
                  <span
                    className={`demo-circle__status demo-circle__status--${status.toLowerCase()}`}
                  >
                    {status}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="demo-card demo-circle__access">
          <div className="demo-card__header">
            <div>
              <span className="demo-section-label">Selected member</span>
              <span className="demo-card__title">{selected.name}</span>
            </div>
            <span
              className={`demo-circle__status demo-circle__status--${selectedStatus.toLowerCase()}`}
            >
              {selectedStatus}
            </span>
          </div>
          <div className="demo-circle__access-level">
            <ShieldCheck size={20} aria-hidden="true" />
            <div>
              <span>Access level</span>
              <strong>{selected.access}</strong>
            </div>
          </div>
          <div className="demo-circle__permissions">
            <div>
              <span className={selected.safety ? 'is-on' : ''}>
                {selected.safety ? <Check size={14} /> : null}
              </span>
              <div>
                <strong>Urgent safety signals</strong>
                <small>Minimal alert with no conversation text</small>
              </div>
            </div>
            <div>
              <span className={selected.updates ? 'is-on' : ''}>
                {selected.updates ? <Check size={14} /> : null}
              </span>
              <div>
                <strong>Check in updates</strong>
                <small>Completion status and broad wellbeing signals</small>
              </div>
            </div>
          </div>
          {selected.id === 2 && (
            <button
              type="button"
              className="demo-btn demo-btn--outline"
              onClick={() => setPaused((current) => !current)}
            >
              {paused ? 'Restore access' : 'Pause access'}
            </button>
          )}
          {selected.status === 'Pending' && (
            <button
              type="button"
              className="demo-btn demo-btn--outline"
              disabled
            >
              Invitation pending
            </button>
          )}
        </section>
      </div>

      <section className="demo-card demo-circle__routing">
        <div className="demo-card__header">
          <div>
            <span className="demo-section-label">Signal routing</span>
            <span className="demo-card__title">Who sees what</span>
          </div>
        </div>
        <div className="demo-circle__route-grid">
          <div>
            <BellRing size={18} aria-hidden="true" />
            <span>Urgent safety signal</span>
            <strong>{paused ? 'Alex' : 'Alex and Sam'}</strong>
          </div>
          <div>
            <UserRoundCheck size={18} aria-hidden="true" />
            <span>Check in update</span>
            <strong>{paused ? 'Alex' : 'Alex and Sam'}</strong>
          </div>
          <div className="demo-circle__route-locked">
            <ShieldCheck size={18} aria-hidden="true" />
            <span>Full conversation text</span>
            <strong>Never shared</strong>
          </div>
        </div>
      </section>
    </div>
  )
}

function TeensTab() {
  const [selected, setSelected] = useState(TEENS[0])
  return (
    <div className="demo-teens">
      <div className="demo-teens__sidebar">
        {TEENS.map((t) => (
          <button
            key={t.id}
            className={`demo-teens__btn${selected.id === t.id ? ' demo-teens__btn--active' : ''}`}
            onClick={() => setSelected(t)}
          >
            <div className="demo-avatar demo-avatar--sm">{t.avatarEmoji}</div>
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
            <div className="demo-avatar demo-avatar--lg">
              {selected.avatarEmoji}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>
                {selected.name}
              </div>
              <div className="demo-teen-meta">
                Age {selected.age} · Enrolled {selected.enrolled}
              </div>
            </div>
          </div>
          <span className="demo-badge demo-badge--green">
            ✓ Consent Verified
          </span>
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
          {[
            'Immediate SMS on any safety alert',
            'Daily summary email',
            'Weekly digest email',
          ].map((p) => (
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
        {ALERTS.map((a) => (
          <button
            key={a.id}
            className={`demo-alert-btn${selected.id === a.id ? ' demo-alert-btn--active' : ''}`}
            onClick={() => setSelected(a)}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 14 }}>{a.teen}</span>
              <span
                className={`demo-badge ${a.severity === 'High' ? 'demo-badge--red' : 'demo-badge--yellow'}`}
              >
                {a.severity}
              </span>
            </div>
            <div className="demo-teen-meta">{a.keywords}</div>
            <div className="demo-teen-meta" style={{ marginTop: 4 }}>
              {a.created.split(' · ')[0]}
            </div>
          </button>
        ))}
      </div>

      <div className="demo-card demo-alerts__detail">
        <div className="demo-card__header">
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>
              Alert #{selected.id} — {selected.teen}
            </div>
            <div className="demo-teen-meta">{selected.created}</div>
          </div>
          <span
            className={`demo-badge ${selected.status === 'Resolved' ? 'demo-badge--green' : 'demo-badge--yellow'}`}
          >
            {selected.status}
          </span>
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
              <div className="demo-detail-cell__value" style={{ fontSize: 14 }}>
                {v}
              </div>
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
          {['Triggered', 'Parent Notified', 'Acknowledged', 'Resolved'].map(
            (step, i) => {
              const steps = {
                Resolved: 4,
                Acknowledged: 3,
                'Parent Notified': 2,
                Triggered: 1,
              }
              const current = steps[selected.status] || 1
              const done = i + 1 <= current
              return (
                <div
                  key={step}
                  className={`demo-workflow-step${done ? ' demo-workflow-step--done' : ''}`}
                >
                  <div className="demo-workflow-step__dot">
                    {done ? '✓' : i + 1}
                  </div>
                  <div className="demo-workflow-step__label">{step}</div>
                </div>
              )
            }
          )}
        </div>
      </div>
    </div>
  )
}

function GamificationTab() {
  const [mode, setMode] = useState('light')
  const [vibe, setVibe] = useState('bright')

  return (
    <div
      className={`demo-gamification demo-gamification--${mode} demo-gamification--${vibe}`}
    >
      <div className="demo-gamification__theme-bar">
        <div className="demo-gamification__theme-group">
          <span className="demo-section-label" style={{ marginBottom: 0 }}>
            Light / dark
          </span>
          <div className="demo-gamification__theme-buttons">
            {GAMIFICATION_MODES.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`demo-gamification__theme-btn${mode === option.id ? ' demo-gamification__theme-btn--active' : ''}`}
                onClick={() => setMode(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="demo-gamification__theme-group">
          <span className="demo-section-label" style={{ marginBottom: 0 }}>
            Color vibe
          </span>
          <div className="demo-gamification__theme-buttons">
            {GAMIFICATION_VIBES.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`demo-gamification__theme-btn${vibe === option.id ? ' demo-gamification__theme-btn--active' : ''}`}
                onClick={() => setVibe(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="demo-stats">
        {[
          {
            label: 'Live challenges',
            value: `${GAMIFICATION_OVERVIEW.activeChallenges}`,
            sub: 'this week',
          },
          {
            label: 'XP · 7 days',
            value: `${GAMIFICATION_OVERVIEW.pointsEarned7d}`,
            sub: 'team total',
          },
          {
            label: 'Badges · 30 days',
            value: `${GAMIFICATION_OVERVIEW.badgesUnlocked30d}`,
            sub: 'fresh unlocks',
          },
          {
            label: 'Average streak',
            value: `${GAMIFICATION_OVERVIEW.avgStreak}d`,
            sub: 'across profiles',
          },
        ].map((s) => (
          <div key={s.label} className="demo-stat-card demo-stat-card--teen">
            <div className="demo-stat-card__label">{s.label}</div>
            <div className="demo-stat-card__value">{s.value}</div>
            <div className="demo-stat-card__sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="demo-overview__grid">
        <div className="demo-card">
          <div className="demo-card__header">
            <span className="demo-card__title">Weekly challenges</span>
          </div>
          <div className="demo-gamification__challenge-list">
            {GAMIFICATION_CHALLENGES.map((challenge) => (
              <div
                key={challenge.id}
                className="demo-gamification__challenge-row"
              >
                <div>
                  <div className="demo-teen-name">{challenge.name}</div>
                  <div className="demo-teen-meta">
                    {challenge.teen} · {challenge.progress}
                  </div>
                  <div className="demo-gamification__mascot">
                    <img src={challenge.badgeImage} alt="" />
                    <span>{challenge.mascot}</span>
                  </div>
                </div>
                <div className="demo-gamification__challenge-right">
                  <span
                    className={`demo-badge ${challenge.status === 'Completed' ? 'demo-badge--green' : 'demo-badge--yellow'}`}
                  >
                    {challenge.status}
                  </span>
                  <span className="demo-gamification__reward">
                    {challenge.reward}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="demo-card">
          <div className="demo-card__header">
            <span className="demo-card__title">Top streaks</span>
          </div>
          <div className="demo-gamification__leaderboard">
            {GAMIFICATION_LEADERBOARD.map((entry) => (
              <div
                key={entry.rank}
                className="demo-gamification__leaderboard-row"
              >
                <span className="demo-gamification__rank">#{entry.rank}</span>
                <div className="demo-gamification__avatar">
                  <img src={entry.badgeImage} alt={`${entry.badge} badge`} />
                </div>
                <div>
                  <div className="demo-teen-name">{entry.teen}</div>
                  <div className="demo-teen-meta">
                    {entry.badge} · {entry.streak} day streak · {entry.mascot}
                  </div>
                </div>
                <div className="demo-gamification__points">
                  {entry.points} XP
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatTab() {
  const bottomRef = useRef(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: 'auto' })
  }, [])
  return (
    <div className="demo-chat-layout">
      <div className="demo-chat__sidebar">
        <div className="demo-section-label">Teen profiles</div>
        {TEENS.map((t) => (
          <div
            key={t.id}
            className={`demo-chat__contact${t.id === 1 ? ' demo-chat__contact--active' : ''}`}
          >
            <div className="demo-avatar demo-avatar--sm">{t.name[0]}</div>
            <div>
              <div className="demo-teen-name">{t.name}</div>
              <div className="demo-teen-meta">Last active {t.lastActive}</div>
            </div>
          </div>
        ))}
        <div className="demo-chat__disclaimer">
          Teen phone preview. Guardians receive activity signals, not this
          conversation.
        </div>
      </div>

      <div className="demo-card demo-chat__window">
        <div className="demo-chat__header">
          <div className="demo-avatar demo-avatar--sm">🌈</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              Maya&apos;s Chatterbot thread
            </div>
            <div className="demo-teen-meta">SMS · fictional example</div>
          </div>
          <span
            className="demo-badge demo-badge--green"
            style={{ marginLeft: 'auto' }}
          >
            You got this
          </span>
        </div>
        <div className="demo-chat__messages">
          {CHAT_CONVO.map((m, i) => (
            <div
              key={i}
              className={`demo-chat__bubble demo-chat__bubble--${m.sender}`}
            >
              <div className="demo-chat__bubble-text">{m.text}</div>
              <div className="demo-chat__bubble-time">{m.time}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="demo-chat__input-bar">
          <div className="demo-chat__input-mock">
            Teen phone preview · conversations are not shown to guardians
          </div>
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
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>
              {BILLING.plan}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--cb-primary)',
                marginTop: 4,
              }}
            >
              {BILLING.price}
            </div>
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
          <button className="demo-btn demo-btn--outline" disabled>
            Change plan
          </button>
          <button className="demo-btn demo-btn--ghost" disabled>
            Cancel subscription
          </button>
        </div>
      </div>

      <div className="demo-card">
        <div className="demo-card__header">
          <span className="demo-card__title">Plan comparison</span>
        </div>
        <div className="demo-plan-grid">
          {[
            {
              name: 'Individual',
              price: '$7/mo',
              teens: 1,
              features: [
                'Daily check-ins',
                'Safety alerts',
                'Guardian dashboard',
              ],
            },
            {
              name: 'Family',
              price: '$12/mo',
              teens: 5,
              features: [
                'Everything in Individual',
                'Up to 5 teen profiles',
                'Priority support',
              ],
              current: true,
            },
            {
              name: 'Interactive Plus',
              price: 'Custom',
              teens: '∞',
              features: [
                'Unlimited profiles',
                'SSO & admin console',
                'Dedicated support',
              ],
            },
          ].map((p) => (
            <div
              key={p.name}
              className={`demo-plan-card${p.current ? ' demo-plan-card--current' : ''}`}
            >
              {p.current && (
                <div className="demo-plan-card__badge">Current</div>
              )}
              <div className="demo-plan-card__name">{p.name}</div>
              <div className="demo-plan-card__price">{p.price}</div>
              <div className="demo-plan-card__teens">
                Up to {p.teens} teen{p.teens !== 1 ? 's' : ''}
              </div>
              <ul className="demo-plan-card__features">
                {p.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
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
          {[
            'Guardian authority',
            'Teen details',
            'Phone verification',
            'Consent complete',
          ].map((s, i) => (
            <div
              key={s}
              className={`demo-enroll-step${step === i + 1 ? ' demo-enroll-step--active' : step > i + 1 ? ' demo-enroll-step--done' : ''}`}
            >
              <div className="demo-enroll-step__num">
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <div className="demo-enroll-step__label">{s}</div>
            </div>
          ))}
        </div>

        <div className="demo-enrollment__panel">
          {step === 1 && (
            <div>
              <h3 className="demo-enrollment__panel-title">
                Confirm guardian authority
              </h3>
              <p className="demo-enrollment__panel-body">
                Before creating a teen profile, you must confirm you are the
                legal parent or guardian of this minor. This is required by our
                Terms of Service and applicable law.
              </p>
              <label className="demo-pref-row" style={{ marginTop: 16 }}>
                <input type="checkbox" defaultChecked readOnly />
                <span>
                  I am the legal parent or guardian of this minor and have the
                  authority to enroll them.
                </span>
              </label>
              <button
                className="demo-btn demo-btn--primary"
                onClick={() => setStep(2)}
                style={{ marginTop: 20 }}
              >
                Confirm & continue →
              </button>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3 className="demo-enrollment__panel-title">Teen details</h3>
              <div className="demo-form-grid">
                <div className="demo-field">
                  <label>First name</label>
                  <input className="demo-input" defaultValue="Maya" readOnly />
                </div>
                <div className="demo-field">
                  <label>Last name</label>
                  <input
                    className="demo-input"
                    defaultValue="Johnson"
                    readOnly
                  />
                </div>
                <div className="demo-field">
                  <label>Date of birth</label>
                  <input
                    className="demo-input"
                    defaultValue="2008-03-14"
                    readOnly
                  />
                </div>
                <div className="demo-field">
                  <label>Mobile number</label>
                  <input
                    className="demo-input"
                    defaultValue="(601) 555-0142"
                    readOnly
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  className="demo-btn demo-btn--ghost"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>
                <button
                  className="demo-btn demo-btn--primary"
                  onClick={() => setStep(3)}
                >
                  Send verification SMS →
                </button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h3 className="demo-enrollment__panel-title">
                Phone verification
              </h3>
              <p className="demo-enrollment__panel-body">
                A 6-digit code was sent to Maya's phone{' '}
                <strong>(601) 555-0142</strong>. The code expires in 15 minutes.
                Maya must share this code with you to complete enrollment.
              </p>
              <div
                className="demo-field"
                style={{ maxWidth: 200, marginTop: 16 }}
              >
                <label>Verification code</label>
                <input
                  className="demo-input demo-input--code"
                  defaultValue="483 291"
                  readOnly
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  className="demo-btn demo-btn--ghost"
                  onClick={() => setStep(2)}
                >
                  ← Back
                </button>
                <button
                  className="demo-btn demo-btn--primary"
                  onClick={() => setStep(4)}
                >
                  Verify & complete →
                </button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="demo-enrollment__success">
              <div className="demo-enrollment__success-icon">✅</div>
              <h3>Enrollment complete!</h3>
              <p>
                Maya is now enrolled. Chatterbot will send her first check-in
                message tonight. You will receive safety alerts immediately if
                any concerning language is detected.
              </p>
              <button
                className="demo-btn demo-btn--primary"
                onClick={() => setStep(1)}
                style={{ marginTop: 20 }}
              >
                ← Restart demo
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="demo-card demo-enrollment__explainer">
        <div className="demo-card__title" style={{ marginBottom: 16 }}>
          Why this flow matters
        </div>
        <div className="demo-enrollment__points">
          {[
            [
              '🔐',
              'Guardian authority',
              'Only legal guardians can enroll minors—protecting both families and Chatterbot from liability.',
            ],
            [
              '📱',
              'Phone ownership verification',
              'The teen must share their code with the guardian, confirming the guardian controls the enrollment.',
            ],
            [
              '⏱️',
              '15-minute expiry',
              'Codes expire quickly to prevent stale or intercepted tokens from being used.',
            ],
            [
              '📋',
              'Auditable consent',
              'Every consent action is timestamped and stored, creating a defensible record.',
            ],
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

  const tabContent = {
    overview: <OverviewTab />,
    teens: <TeensTab />,
    careCircle: <CareCircleTab />,
    alerts: <AlertsTab />,
    gamification: <GamificationTab />,
    chat: <ChatTab />,
    billing: <BillingTab />,
    enrollment: <EnrollmentTab />,
  }

  return (
    <div className="demo-root">
      {/* Top bar */}
      <header className="demo-header">
        <div className="demo-header__inner">
          <div className="demo-header__brand">
            <ChatterbotLogo size={30} />
            <span className="demo-header__brand-name">Chatterbot</span>
            <span className="demo-header__badge">Interactive Demo</span>
          </div>
          <div className="demo-header__right">
            <span className="demo-header__fictional">
              ⚠ Fictional data — illustrative only
            </span>
            <Link to="/" className="demo-header__back">
              ← Back to site
            </Link>
          </div>
        </div>
      </header>

      {/* Guardian command bar */}
      <section className="demo-command-bar">
        <div className="demo-command-bar__inner">
          <div>
            <p className="demo-command-bar__eyebrow">Guardian command center</p>
            <h1>Good afternoon, Alex.</h1>
            <p>
              See what matters, support the next step, and keep trust intact.
            </p>
          </div>
          <div className="demo-command-bar__controls">
            <span className="demo-system-status demo-system-status--dark">
              <span /> All systems active
            </span>
            <label>
              <span>Viewing</span>
              <select defaultValue="maya" aria-label="Teen profile">
                <option value="maya">Maya</option>
                <option value="ethan">Ethan</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* Tab bar */}
      <div className="demo-tabbar">
        <div className="demo-tabbar__inner">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`demo-tab${activeTab === t.id ? ' demo-tab--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
              aria-pressed={activeTab === t.id}
            >
              <t.icon size={16} aria-hidden="true" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="demo-body">
        <div className="demo-body__inner">
          {/* Tab content */}
          <main className="demo-content">{tabContent[activeTab]}</main>

          {/* Feature explainer */}
          <aside className="demo-explainer">
            <div className="demo-explainer__label">What this shows</div>
            <h2 className="demo-explainer__title">{explainer.title}</h2>
            <ul className="demo-explainer__list">
              {explainer.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <div className="demo-explainer__cta">
              <Link
                to="/register"
                className="demo-btn demo-btn--primary"
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                Start with Chatterbot →
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer disclaimer */}
      <footer className="demo-footer">
        This demonstration uses entirely fictional data. It does not send
        messages, evaluate safety signals, create accounts, or represent live
        monitoring. Chatterbot is not an emergency service. In a real emergency,
        call 911 or text 988.
      </footer>
    </div>
  )
}
