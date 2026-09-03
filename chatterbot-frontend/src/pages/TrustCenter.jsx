import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BellRing,
  Check,
  ChevronRight,
  Clock3,
  Database,
  Eye,
  HandHeart,
  KeyRound,
  LockKeyhole,
  MessageCircleHeart,
  Pause,
  ShieldCheck,
  Trash2,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react'
import { PublicFooter, PublicHeader } from '../components/PublicShell.jsx'
import './TrustCenter.css'

const visibilityRows = [
  {
    signal: 'Complete conversation text',
    teen: 'Visible',
    guardian: 'Not shared',
    circle: 'Not shared',
  },
  {
    signal: 'Check in completed',
    teen: 'Visible',
    guardian: 'Visible',
    circle: 'If permitted',
  },
  {
    signal: 'Broad support topic',
    teen: 'Visible before sharing',
    guardian: 'Summary only',
    circle: 'If permitted',
  },
  {
    signal: 'Urgent safety concern',
    teen: 'Notified',
    guardian: 'Immediate alert',
    circle: 'Safety roles only',
  },
  {
    signal: 'Account and consent changes',
    teen: 'Visible',
    guardian: 'Visible',
    circle: 'Not shared',
  },
]

const scenarios = [
  {
    id: 'school',
    label: 'School stress',
    level: 'Support',
    color: 'blue',
    quote: 'I am overwhelmed by this paper and do not know where to start.',
    steps: [
      [
        'Chatterbot responds',
        'Names the stress and helps choose one manageable next step.',
      ],
      [
        'A coping plan is created',
        'The teen chooses a small action and a time to follow up.',
      ],
      [
        'Guardian sees a broad signal',
        'Homework stress and coping plan created. No transcript is shown.',
      ],
      [
        'Chatterbot follows up',
        'The next check in asks whether the plan helped.',
      ],
    ],
  },
  {
    id: 'bullying',
    label: 'Bullying',
    level: 'Elevated',
    color: 'amber',
    quote: 'They keep posting about me and I am scared to go to school.',
    steps: [
      [
        'Chatterbot checks immediate safety',
        'Asks whether the teen feels safe right now.',
      ],
      [
        'Trusted adult options appear',
        'The teen can choose a parent, counselor, or another Care Circle adult.',
      ],
      [
        'A support signal is shared',
        'The chosen adult receives the concern category and recommended next step.',
      ],
      [
        'Follow up stays open',
        'The system checks that a human made contact and records the outcome.',
      ],
    ],
  },
  {
    id: 'loneliness',
    label: 'Loneliness',
    level: 'Support',
    color: 'blue',
    quote: 'I feel like nobody really wants me around lately.',
    steps: [
      [
        'Chatterbot listens',
        'Responds without pretending to be human or replacing real relationships.',
      ],
      [
        'Connection is encouraged',
        'Offers a simple way to contact someone the teen already trusts.',
      ],
      [
        'The teen chooses',
        'Nothing is shared unless the teen requests support or safety risk rises.',
      ],
      [
        'The pattern is revisited',
        'Repeated signals can prompt a careful support recommendation.',
      ],
    ],
  },
  {
    id: 'eating',
    label: 'Eating concern',
    level: 'Review',
    color: 'amber',
    quote: 'I have been skipping meals because eating makes me anxious.',
    steps: [
      [
        'Chatterbot avoids diagnosis',
        'Acknowledges the concern and does not offer weight or restriction advice.',
      ],
      [
        'A broader pattern check runs',
        'Looks for repeated concern signals across recent check ins.',
      ],
      [
        'Human support is recommended',
        'Encourages contact with a guardian or qualified professional.',
      ],
      [
        'A limited alert can be sent',
        'Shares the concern category and urgency, not the full conversation.',
      ],
    ],
  },
  {
    id: 'crisis',
    label: 'Immediate danger',
    level: 'Urgent',
    color: 'red',
    quote: 'I might hurt myself tonight.',
    steps: [
      [
        'Chatterbot shifts to safety',
        'Stops ordinary conversation and clearly states its limitations.',
      ],
      [
        'Immediate resources appear',
        'Encourages calling emergency services or contacting 988 in the United States.',
      ],
      [
        'The response team is alerted',
        'Primary guardian and approved safety contacts receive an urgent signal.',
      ],
      [
        'Acknowledgement is required',
        'The alert escalates to a backup contact when the primary does not respond.',
      ],
    ],
  },
]

const boundaries = [
  'Pretend to be a person or mental health professional',
  'Encourage romantic attachment or emotional dependence',
  'Reward a positive mood, disclosure volume, or time spent chatting',
  'Promise secrecy when an urgent safety concern is detected',
  'Sell teen information or use private conversations for advertising',
  'Give a guardian complete conversation transcripts',
  'Treat an automated signal as a diagnosis',
  'Replace emergency services or professional care',
]

const safetyFramework = [
  [
    'Explicit self harm language',
    'Recall and response quality',
    'Scenario suite and human review',
  ],
  [
    'Subtle distress patterns',
    'Missed signal rate',
    'Longitudinal conversation tests',
  ],
  ['Routine teen language', 'False alert rate', 'Age aware red team set'],
  [
    'Care Circle routing',
    'Delivery and acknowledgement time',
    'End to end notification drills',
  ],
  ['Model updates', 'Safety regression rate', 'Release gate before deployment'],
]

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`trust-toggle${checked ? ' trust-toggle--on' : ''}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span />
    </button>
  )
}

export default function TrustCenter() {
  const [activeScenario, setActiveScenario] = useState('school')
  const [checkInTime, setCheckInTime] = useState('4:00 PM')
  const [tone, setTone] = useState('Encouraging')
  const [paused, setPaused] = useState(false)
  const [weeklySignal, setWeeklySignal] = useState(true)
  const [circleUpdates, setCircleUpdates] = useState(true)
  const [notice, setNotice] = useState('')
  const scenario = useMemo(
    () => scenarios.find((item) => item.id === activeScenario),
    [activeScenario]
  )

  const showNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3200)
  }

  return (
    <div className="trust-root">
      <PublicHeader />

      <main>
        <section className="trust-hero">
          <div className="trust-shell trust-hero__grid">
            <div>
              <p className="trust-eyebrow">Trust Center</p>
              <h1>Safety should be understandable before it is needed.</h1>
              <p className="trust-hero__lede">
                See what Chatterbot shares, what stays protected, and how a
                concern moves from a conversation to real human support.
              </p>
              <div className="trust-hero__actions">
                <a
                  href="#agreement"
                  className="trust-button trust-button--primary"
                >
                  Explore the trust agreement
                </a>
                <Link
                  to="/partners"
                  className="trust-button trust-button--secondary"
                >
                  Bring Chatterbot to your community
                </Link>
              </div>
            </div>
            <div
              className="trust-hero__promise"
              aria-label="Chatterbot trust promise"
            >
              <div className="trust-hero__promise-icon">
                <ShieldCheck size={34} />
              </div>
              <span>The Chatterbot promise</span>
              <strong>Support without surveillance.</strong>
              <p>
                Parents receive the information needed to help. Teens can always
                understand what was shared and why.
              </p>
              <div className="trust-hero__promise-tags">
                <span>
                  <LockKeyhole size={15} /> No full transcripts
                </span>
                <span>
                  <UserRoundCheck size={15} /> Human follow through
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-section" id="agreement">
          <div className="trust-shell">
            <div className="trust-section__heading">
              <p className="trust-eyebrow">The Trust Agreement</p>
              <h2>Everyone knows who can see what.</h2>
              <p>
                These boundaries are shown during enrollment and remain
                available to the teen, guardian, and every approved Care Circle
                member.
              </p>
            </div>
            <div className="trust-table-wrap">
              <table className="trust-table">
                <thead>
                  <tr>
                    <th>Information</th>
                    <th>Teen</th>
                    <th>Guardian</th>
                    <th>Care Circle</th>
                  </tr>
                </thead>
                <tbody>
                  {visibilityRows.map((row) => (
                    <tr key={row.signal}>
                      <th>{row.signal}</th>
                      <td>{row.teen}</td>
                      <td>{row.guardian}</td>
                      <td>{row.circle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="trust-agreement__footer">
              <span>
                <Eye size={18} /> Teens can review every shared signal
              </span>
              <span>
                <KeyRound size={18} /> Access changes are recorded
              </span>
              <span>
                <LockKeyhole size={18} /> Roles receive only permitted
                information
              </span>
            </div>
          </div>
        </section>

        <section className="trust-section trust-section--navy" id="simulator">
          <div className="trust-shell">
            <div className="trust-section__heading trust-section__heading--light">
              <p className="trust-eyebrow">Safety response simulator</p>
              <h2>See exactly what happens next.</h2>
              <p>
                Select a fictional situation to see how Chatterbot responds,
                shares a limited signal, and brings in a human.
              </p>
            </div>
            <div className="safety-sim">
              <div
                className="safety-sim__choices"
                role="tablist"
                aria-label="Safety scenarios"
              >
                {scenarios.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={activeScenario === item.id}
                    className={activeScenario === item.id ? 'is-active' : ''}
                    onClick={() => setActiveScenario(item.id)}
                  >
                    <span
                      className={`safety-sim__level safety-sim__level--${item.color}`}
                    >
                      {item.level}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="safety-sim__stage" role="tabpanel">
                <div className="safety-sim__message">
                  <span>Fictional teen message</span>
                  <p>“{scenario.quote}”</p>
                </div>
                <div className="safety-sim__timeline">
                  {scenario.steps.map(([title, body], index) => (
                    <div key={title} className="safety-sim__step">
                      <span className="safety-sim__step-number">
                        {index + 1}
                      </span>
                      <div>
                        <strong>{title}</strong>
                        <p>{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="safety-sim__disclaimer">
                  This simulator explains the intended workflow. Automated
                  signals can be incomplete or incorrect and do not replace
                  human judgment or emergency care.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-section" id="teen-controls">
          <div className="trust-shell">
            <div className="trust-section__heading">
              <p className="trust-eyebrow">Teen Control Center</p>
              <h2>A supportive relationship the teen can shape.</h2>
              <p>
                This interactive preview gives the teen control over timing,
                tone, routine sharing, and access to real people.
              </p>
            </div>
            <div className="teen-control">
              <div className="teen-control__profile">
                <span className="teen-control__avatar">M</span>
                <div>
                  <strong>Maya&apos;s Chatterbot</strong>
                  <small>
                    {paused
                      ? 'Check ins paused'
                      : `Next check in today at ${checkInTime}`}
                  </small>
                </div>
                <span
                  className={`teen-control__status${paused ? ' is-paused' : ''}`}
                >
                  {paused ? 'Paused' : 'Active'}
                </span>
              </div>
              <div className="teen-control__grid">
                <div className="teen-control__panel">
                  <h3>
                    <Clock3 size={19} /> Check in preferences
                  </h3>
                  <label>
                    Preferred time
                    <select
                      value={checkInTime}
                      onChange={(event) => setCheckInTime(event.target.value)}
                    >
                      <option>4:00 PM</option>
                      <option>6:30 PM</option>
                      <option>8:00 PM</option>
                    </select>
                  </label>
                  <label>
                    Conversation tone
                    <select
                      value={tone}
                      onChange={(event) => setTone(event.target.value)}
                    >
                      <option>Encouraging</option>
                      <option>Calm and direct</option>
                      <option>Playful</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    className="teen-control__pause"
                    onClick={() => setPaused((value) => !value)}
                  >
                    <Pause size={17} />{' '}
                    {paused ? 'Resume check ins' : 'Pause for 24 hours'}
                  </button>
                </div>
                <div className="teen-control__panel">
                  <h3>
                    <Eye size={19} /> Sharing preferences
                  </h3>
                  <div className="teen-control__toggle-row">
                    <div>
                      <strong>Weekly support signal</strong>
                      <small>Share broad patterns with my guardian</small>
                    </div>
                    <Toggle
                      checked={weeklySignal}
                      onChange={setWeeklySignal}
                      label="Weekly support signal"
                    />
                  </div>
                  <div className="teen-control__toggle-row">
                    <div>
                      <strong>Care Circle updates</strong>
                      <small>
                        Share check in completion with approved adults
                      </small>
                    </div>
                    <Toggle
                      checked={circleUpdates}
                      onChange={setCircleUpdates}
                      label="Care Circle updates"
                    />
                  </div>
                  <p className="teen-control__safety-note">
                    <ShieldCheck size={16} /> Urgent safety signals follow the
                    family safety plan and cannot be disabled here.
                  </p>
                </div>
                <div className="teen-control__panel teen-control__panel--support">
                  <h3>
                    <HandHeart size={19} /> Real people are one tap away
                  </h3>
                  <p>
                    Choose who you want to hear from. They receive a simple
                    request to check in, not your conversation.
                  </p>
                  <div className="teen-control__people">
                    {['Mom', 'Sam · counselor', 'Priya · aunt'].map(
                      (person) => (
                        <button
                          type="button"
                          key={person}
                          onClick={() =>
                            showNotice(
                              `${person} received a request to check in.`
                            )
                          }
                        >
                          {person}
                          <ChevronRight size={16} />
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div className="teen-control__panel teen-control__panel--data">
                  <h3>
                    <Database size={19} /> My information
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      showNotice('Your sharing history is ready to review.')
                    }
                  >
                    <Eye size={17} /> Review sharing history
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      showNotice('A secure data download would be prepared.')
                    }
                  >
                    <Database size={17} /> Download my information
                  </button>
                  <button
                    type="button"
                    className="is-danger"
                    onClick={() =>
                      showNotice(
                        'A guardian review would be required before deletion.'
                      )
                    }
                  >
                    <Trash2 size={17} /> Request data deletion
                  </button>
                </div>
              </div>
              {notice && (
                <div className="trust-toast" role="status">
                  <Check size={17} /> {notice}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="trust-section trust-section--soft" id="care-plan">
          <div className="trust-shell">
            <div className="trust-section__heading">
              <p className="trust-eyebrow">Human escalation network</p>
              <h2>A safety signal never ends with a notification.</h2>
              <p>
                Each family defines who responds first, who serves as backup,
                and what happens when nobody acknowledges an urgent concern.
              </p>
            </div>
            <div className="response-plan">
              {[
                [
                  '01',
                  'Alex · parent',
                  'Primary responder',
                  'SMS and phone call',
                  '0 minutes',
                ],
                [
                  '02',
                  'Sam · counselor',
                  'Backup responder',
                  'SMS and email',
                  '5 minutes',
                ],
                [
                  '03',
                  'Local response plan',
                  'Emergency pathway',
                  'Family instructions',
                  '10 minutes',
                ],
              ].map(([num, person, role, channel, time], index) => (
                <div key={num} className="response-plan__step">
                  <span className="response-plan__number">{num}</span>
                  <div>
                    <strong>{person}</strong>
                    <small>{role}</small>
                  </div>
                  <div>
                    <span>Contact</span>
                    <strong>{channel}</strong>
                  </div>
                  <div>
                    <span>Escalates after</span>
                    <strong>{time}</strong>
                  </div>
                  {index < 2 && (
                    <ChevronRight className="response-plan__arrow" size={20} />
                  )}
                </div>
              ))}
            </div>
            <div className="response-plan__accountability">
              <span>
                <BellRing size={18} /> Delivery recorded
              </span>
              <span>
                <UserRoundCheck size={18} /> Acknowledgement required
              </span>
              <span>
                <UsersRound size={18} /> Backup routing enabled
              </span>
            </div>
          </div>
        </section>

        <section className="trust-section" id="progress">
          <div className="trust-shell progress-grid">
            <div className="trust-section__heading trust-section__heading--left">
              <p className="trust-eyebrow">Family progress report</p>
              <h2>Measure connection, not mood.</h2>
              <p>
                Chatterbot centers actions that strengthen support. It does not
                score whether a teen had a good week.
              </p>
              <ul className="progress-principles">
                <li>
                  <Check size={17} /> Reward healthy participation
                </li>
                <li>
                  <Check size={17} /> Never reward longer conversations
                </li>
                <li>
                  <Check size={17} /> Never rank teens against each other
                </li>
              </ul>
            </div>
            <div className="progress-report">
              <div className="progress-report__header">
                <div>
                  <span>This week</span>
                  <strong>Maya&apos;s support rhythm</strong>
                </div>
                <span>Aug 17 to 23</span>
              </div>
              <div className="progress-report__metrics">
                {[
                  ['5', 'Check ins completed'],
                  ['2', 'Coping tools practiced'],
                  ['1', 'Trusted adult connection'],
                  ['8 min', 'Care Circle response'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="progress-report__win">
                <MessageCircleHeart size={20} />
                <div>
                  <strong>Small win</strong>
                  <span>
                    Maya asked Sam for help before the school day started.
                  </span>
                </div>
              </div>
              <p>Conversation text is not included in this report.</p>
            </div>
          </div>
        </section>

        <section className="trust-section trust-section--ink" id="boundaries">
          <div className="trust-shell boundaries-grid">
            <div className="trust-section__heading trust-section__heading--left trust-section__heading--light">
              <p className="trust-eyebrow">Product boundaries</p>
              <h2>What Chatterbot will never do.</h2>
              <p>
                Clear limits are a product feature. These rules guide
                conversations, rewards, data use, and every safety workflow.
              </p>
            </div>
            <div className="boundaries-list">
              {boundaries.map((boundary) => (
                <div key={boundary}>
                  <span>Never</span>
                  <p>{boundary}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="trust-section" id="evidence">
          <div className="trust-shell">
            <div className="trust-section__heading">
              <p className="trust-eyebrow">Safety evaluation framework</p>
              <h2>Claims should be measured and published.</h2>
              <p>
                This is the testing framework Chatterbot can use before
                publishing verified performance results. It does not present
                invented outcomes.
              </p>
            </div>
            <div className="trust-table-wrap">
              <table className="trust-table trust-table--evidence">
                <thead>
                  <tr>
                    <th>Safety area</th>
                    <th>Measure</th>
                    <th>Evaluation method</th>
                  </tr>
                </thead>
                <tbody>
                  {safetyFramework.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell) => (
                        <td key={cell}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="evidence-status">
              <div>
                <span className="evidence-status__dot" />
                <div>
                  <strong>Prelaunch standard</strong>
                  <p>
                    Safety results remain unpublished until independently
                    reviewed.
                  </p>
                </div>
              </div>
              <div>
                <ShieldCheck size={22} />
                <div>
                  <strong>Release governance</strong>
                  <p>
                    Material model changes require regression testing and
                    documented approval.
                  </p>
                </div>
              </div>
              <div>
                <Database size={22} />
                <div>
                  <strong>Transparent reporting</strong>
                  <p>
                    Results should include misses, false alerts, limitations,
                    and evaluation dates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-cta">
          <div className="trust-shell trust-cta__inner">
            <div>
              <p className="trust-eyebrow">Build a trusted support system</p>
              <h2>Ready to see the complete product?</h2>
            </div>
            <div>
              <Link to="/demo" className="trust-button trust-button--light">
                Explore the live demo
              </Link>
              <Link
                to="/partners"
                className="trust-button trust-button--outline-light"
              >
                Partner with Chatterbot
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
