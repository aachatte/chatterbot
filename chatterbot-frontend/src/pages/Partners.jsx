import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  Check,
  GraduationCap,
  HeartHandshake,
  Hospital,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { PublicFooter, PublicHeader } from '../components/PublicShell.jsx'
import './Partners.css'

const audiences = [
  {
    id: 'families',
    label: 'Families',
    icon: UsersRound,
    title: 'A healthier support rhythm at home',
    description:
      'Give your teen a consistent check in while keeping parents informed through limited, understandable signals.',
    outcomes: [
      'Teen directed check in preferences',
      'Guardian safety plan',
      'Private Care Circle invitations',
    ],
    launch: 'One family account can be ready in minutes.',
  },
  {
    id: 'schools',
    label: 'Schools',
    icon: GraduationCap,
    title: 'Extend student support between conversations',
    description:
      'Help counselors coordinate approved follow up without exposing student conversation transcripts.',
    outcomes: [
      'Counselor specific permissions',
      'Assigned safety acknowledgements',
      'Aggregate program reporting',
    ],
    launch: 'Start with a defined student cohort and named response team.',
  },
  {
    id: 'care',
    label: 'Care teams',
    icon: Hospital,
    title: 'Keep trusted adults aligned around the next step',
    description:
      'Support pediatric and youth care programs with consent aware signals and documented human follow through.',
    outcomes: [
      'Family approved routing',
      'Configurable escalation timing',
      'Exportable response history',
    ],
    launch: 'Pilot around one workflow before expanding access.',
  },
  {
    id: 'community',
    label: 'Youth groups',
    icon: HeartHandshake,
    title: 'Build a dependable bridge to community support',
    description:
      'Equip mentors and program leaders with narrowly scoped roles instead of broad access to teen information.',
    outcomes: [
      'Role based Care Circle access',
      'Simple check in requests',
      'Program specific resources',
    ],
    launch: 'Invite only the trusted adults each family approves.',
  },
]

const readiness = [
  [
    '01',
    'Define the promise',
    'Agree on age range, consent, information boundaries, and exactly what the program will not do.',
  ],
  [
    '02',
    'Map the response',
    'Name primary responders, backup contacts, local resources, and acknowledgement timing.',
  ],
  [
    '03',
    'Run a focused pilot',
    'Begin with a limited cohort, train every responder, and review safety outcomes before expansion.',
  ],
  [
    '04',
    'Measure responsibly',
    'Track connection, follow through, and response quality without ranking teens or rewarding disclosure.',
  ],
]

export default function Partners() {
  const [activeAudience, setActiveAudience] = useState('families')
  const audience = useMemo(
    () => audiences.find((item) => item.id === activeAudience),
    [activeAudience]
  )
  const AudienceIcon = audience.icon

  return (
    <div className="partners-root">
      <PublicHeader />
      <main>
        <section className="partners-hero">
          <div className="partners-shell partners-hero__grid">
            <div>
              <p className="partners-eyebrow">Chatterbot partnerships</p>
              <h1>One trusted support layer, shaped for every care setting.</h1>
              <p>
                Families stay in control. Teens understand the boundaries.
                Partners receive only the signals and actions their role
                requires.
              </p>
              <div className="partners-hero__actions">
                <a
                  href="#pilot"
                  className="partners-button partners-button--primary"
                >
                  Plan a pilot <ArrowRight size={17} />
                </a>
                <Link
                  to="/trust-center"
                  className="partners-button partners-button--secondary"
                >
                  Review the safety model
                </Link>
              </div>
            </div>
            <div className="partners-hero__board">
              <div className="partners-hero__board-top">
                <ShieldCheck size={21} />
                <span>Permissioned support network</span>
              </div>
              {[
                'Teen and guardian',
                'Primary responder',
                'Backup responder',
                'Program owner',
              ].map((role, index) => (
                <div className="partners-hero__role" key={role}>
                  <span>{index + 1}</span>
                  <strong>{role}</strong>
                  <small>
                    {index === 0
                      ? 'Sets the relationship'
                      : 'Receives a defined role'}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="partners-section">
          <div className="partners-shell">
            <div className="partners-section__heading">
              <p className="partners-eyebrow">Choose your setting</p>
              <h2>See how Chatterbot fits your community.</h2>
            </div>
            <div
              className="audience-tabs"
              role="tablist"
              aria-label="Partnership types"
            >
              {audiences.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeAudience === item.id}
                    className={activeAudience === item.id ? 'is-active' : ''}
                    onClick={() => setActiveAudience(item.id)}
                    key={item.id}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                )
              })}
            </div>
            <div className="audience-panel" role="tabpanel">
              <div className="audience-panel__icon">
                <AudienceIcon size={30} />
              </div>
              <div className="audience-panel__content">
                <span>{audience.label}</span>
                <h3>{audience.title}</h3>
                <p>{audience.description}</p>
                <strong>{audience.launch}</strong>
              </div>
              <ul>
                {audience.outcomes.map((outcome) => (
                  <li key={outcome}>
                    <Check size={17} />
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="partners-section partners-section--navy">
          <div className="partners-shell">
            <div className="partners-section__heading partners-section__heading--light">
              <p className="partners-eyebrow">Responsible rollout</p>
              <h2>A pilot plan that starts with trust.</h2>
              <p>
                Chatterbot should earn the right to expand through clear
                boundaries, trained responders, and measurable outcomes.
              </p>
            </div>
            <div className="readiness-grid">
              {readiness.map(([number, title, description]) => (
                <article key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="partners-section" id="pilot">
          <div className="partners-shell pilot-grid">
            <div className="partners-section__heading partners-section__heading--left">
              <p className="partners-eyebrow">Start a conversation</p>
              <h2>Design the right pilot together.</h2>
              <p>
                Tell us where Chatterbot could help. We will begin with the
                people, safeguards, and response workflow before discussing
                scale.
              </p>
              <div className="pilot-principles">
                <span>
                  <Building2 size={18} /> No invented compliance claims
                </span>
                <span>
                  <ShieldCheck size={18} /> Safety review before launch
                </span>
                <span>
                  <HeartHandshake size={18} /> Family consent built into
                  enrollment
                </span>
              </div>
            </div>
            <div className="pilot-success">
              <span>
                <HeartHandshake size={28} />
              </span>
              <h3>Talk with the Chatterbot team</h3>
              <p>
                Email us with your setting, proposed cohort, response team, and
                the outcome you want the pilot to support.
              </p>
              <a
                href={`mailto:schools@chatterbot.ai?subject=${encodeURIComponent(`Chatterbot ${audience.label} pilot inquiry`)}`}
                className="partners-button partners-button--primary"
              >
                Email the pilot team <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
