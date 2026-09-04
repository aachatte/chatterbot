import { useEffect, useMemo, useState } from 'react'
import {
  BellRing,
  Check,
  Clock3,
  Download,
  Eye,
  HandHeart,
  LockKeyhole,
  MessageCircleHeart,
  ShieldCheck,
  Trash2,
  UserRoundCheck,
} from 'lucide-react'
import './SupportPlan.css'
import { api } from '../services/api.js'

const defaultPlan = {
  checkInTime: '4:00 PM',
  tone: 'Encouraging',
  paused: false,
  weeklySignal: true,
  circleUpdates: true,
  primaryWindow: '5 minutes',
  backupWindow: '10 minutes',
  contacts: [
    {
      id: 1,
      name: 'Alex Johnson',
      role: 'Parent',
      stage: 'Primary',
      channel: 'SMS and call',
    },
    {
      id: 2,
      name: 'Sam Carter',
      role: 'School counselor',
      stage: 'Backup',
      channel: 'SMS and email',
    },
    {
      id: 3,
      name: 'Local response plan',
      role: 'Emergency pathway',
      stage: 'Final',
      channel: 'Family instructions',
    },
  ],
}

const sharedSignals = [
  {
    date: 'Today · 4:18 PM',
    title: 'Check in completed',
    detail: 'Completion only',
    audience: 'Guardian',
  },
  {
    date: 'Tuesday · 7:32 PM',
    title: 'Support requested',
    detail: 'School stress · no transcript',
    audience: 'Sam and guardian',
  },
  {
    date: 'Monday · 4:22 PM',
    title: 'Coping plan created',
    detail: 'Broad progress signal',
    audience: 'Guardian',
  },
]

const progress = [
  { value: '5', label: 'Check ins completed', note: 'One more than last week' },
  {
    value: '2',
    label: 'Coping tools practiced',
    note: 'Breathing and planning',
  },
  { value: '1', label: 'Trusted adult connection', note: 'Requested by Maya' },
  {
    value: '8 min',
    label: 'Average response',
    note: 'Care Circle follow through',
  },
]

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`support-switch${checked ? ' is-on' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  )
}

export default function SupportPlan() {
  const [activeTab, setActiveTab] = useState('controls')
  const [plan, setPlan] = useState(defaultPlan)
  const [notice, setNotice] = useState('')
  const [teenId, setTeenId] = useState(null)
  const [teenName, setTeenName] = useState('your teen')
  const [saving, setSaving] = useState(false)

  const showNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3000)
  }

  useEffect(() => {
    let active = true
    api
      .getTeens()
      .then(async ({ teens = [] }) => {
        const teen = teens[0]
        if (!teen || !active) return
        const [saved, circle] = await Promise.all([
          api.getSafetyPlan(teen.id),
          api.getCareCircle(teen.id),
        ])
        if (!active) return
        const contacts = [
          circle.owner && {
            id: `guardian-${circle.owner.id}`,
            name: circle.owner.name,
            role: 'Primary guardian',
            stage: 'Primary',
            channel: 'SMS and call',
          },
          ...(circle.members || [])
            .filter((member) => member.status === 'active' && member.phone)
            .map((member) => ({
              id: `member-${member.id}`,
              name: member.name,
              role: member.relationship || member.role.replaceAll('_', ' '),
              stage: 'Backup',
              channel: 'SMS',
            })),
          {
            id: 'emergency-pathway',
            name: 'Local response plan',
            role: 'Emergency pathway',
            stage: 'Final',
            channel: 'Family instructions',
          },
        ].filter(Boolean)
        setTeenId(teen.id)
        setTeenName(teen.first_name)
        setPlan((current) => ({
          ...current,
          ...(saved.safety_plan?.plan || {}),
          contacts,
        }))
      })
      .catch(() => showNotice('Could not load the saved family plan.'))
    return () => {
      active = false
    }
  }, [])

  const update = (key, value) =>
    setPlan((current) => ({ ...current, [key]: value }))
  const savePlan = async () => {
    if (!teenId || saving) return
    setSaving(true)
    try {
      const serverPlan = Object.fromEntries(
        Object.entries(plan).filter(([key]) => key !== 'contacts')
      )
      const result = await api.saveSafetyPlan(teenId, serverPlan, true)
      showNotice(
        `Response plan saved securely. Version ${result.safety_plan.version}.`
      )
    } catch (error) {
      showNotice(error?.data?.error || 'Could not save the response plan.')
    } finally {
      setSaving(false)
    }
  }
  const planReadiness = useMemo(() => {
    const checks = [
      plan.contacts.some((contact) => contact.stage === 'Primary'),
      plan.contacts.some((contact) => contact.stage === 'Backup'),
      plan.contacts.some((contact) => contact.stage === 'Final'),
    ]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [plan.contacts])

  return (
    <div className="support-plan">
      <header className="support-plan__header">
        <div>
          <p>Family support system</p>
          <h1>Support Plan</h1>
          <span>
            Give {teenName} control over Chatterbot while making every human
            response clear and accountable.
          </span>
        </div>
        <div className="support-plan__readiness">
          <span>Plan readiness</span>
          <strong>{planReadiness}%</strong>
          <div>
            <i style={{ width: `${planReadiness}%` }} />
          </div>
        </div>
      </header>

      <nav className="support-plan__tabs" aria-label="Support plan sections">
        {[
          ['controls', 'Teen controls'],
          ['response', 'Response chain'],
          ['sharing', 'Sharing history'],
          ['progress', 'Family progress'],
        ].map(([id, label]) => (
          <button
            type="button"
            className={activeTab === id ? 'is-active' : ''}
            aria-current={activeTab === id ? 'page' : undefined}
            onClick={() => setActiveTab(id)}
            key={id}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === 'controls' && (
        <div className="support-plan__grid">
          <section className="support-card">
            <div className="support-card__title">
              <Clock3 size={20} />
              <div>
                <h2>Check in preferences</h2>
                <p>Maya can shape when and how Chatterbot reaches out.</p>
              </div>
            </div>
            <label className="support-field">
              Preferred time
              <select
                value={plan.checkInTime}
                onChange={(event) => update('checkInTime', event.target.value)}
              >
                <option>4:00 PM</option>
                <option>6:30 PM</option>
                <option>8:00 PM</option>
              </select>
            </label>
            <label className="support-field">
              Conversation tone
              <select
                value={plan.tone}
                onChange={(event) => update('tone', event.target.value)}
              >
                <option>Encouraging</option>
                <option>Calm and direct</option>
                <option>Playful</option>
              </select>
            </label>
            <button
              className="support-action"
              type="button"
              onClick={() => update('paused', !plan.paused)}
            >
              {plan.paused ? <Check size={17} /> : <Clock3 size={17} />}
              {plan.paused ? 'Resume check ins' : 'Pause for 24 hours'}
            </button>
          </section>
          <section className="support-card">
            <div className="support-card__title">
              <Eye size={20} />
              <div>
                <h2>Routine sharing</h2>
                <p>Maya can choose which broad updates are shared.</p>
              </div>
            </div>
            <div className="support-setting">
              <div>
                <strong>Weekly support signal</strong>
                <span>Broad patterns, never conversation text</span>
              </div>
              <Switch
                checked={plan.weeklySignal}
                onChange={(value) => update('weeklySignal', value)}
                label="Weekly support signal"
              />
            </div>
            <div className="support-setting">
              <div>
                <strong>Care Circle completion updates</strong>
                <span>Let approved adults know a check in happened</span>
              </div>
              <Switch
                checked={plan.circleUpdates}
                onChange={(value) => update('circleUpdates', value)}
                label="Care Circle completion updates"
              />
            </div>
            <div className="support-card__safety">
              <ShieldCheck size={18} />
              <p>
                <strong>Safety boundary</strong> Urgent safety signals follow
                the family response plan and cannot be disabled here.
              </p>
            </div>
          </section>
          <section className="support-card support-card--wide">
            <div className="support-card__title">
              <HandHeart size={20} />
              <div>
                <h2>Ask a real person</h2>
                <p>
                  Maya can request human support without sharing her
                  conversation.
                </p>
              </div>
            </div>
            <div className="support-people">
              {plan.contacts
                .filter((contact) => contact.stage !== 'Final')
                .map((contact) => (
                  <button
                    type="button"
                    onClick={() =>
                      showNotice(
                        `${contact.name} received a request to check in.`
                      )
                    }
                    key={contact.id}
                  >
                    <span>
                      {contact.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                    <div>
                      <strong>{contact.name}</strong>
                      <small>{contact.role}</small>
                    </div>
                    <MessageCircleHeart size={18} />
                  </button>
                ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'response' && (
        <div className="response-builder">
          <section className="support-card response-builder__main">
            <div className="support-card__title">
              <BellRing size={20} />
              <div>
                <h2>Urgent response chain</h2>
                <p>Every urgent signal requires a named next step.</p>
              </div>
            </div>
            <div className="response-builder__list">
              {plan.contacts.map((contact, index) => (
                <div className="response-contact" key={contact.id}>
                  <span className="response-contact__number">{index + 1}</span>
                  <div>
                    <strong>{contact.name}</strong>
                    <small>{contact.role}</small>
                  </div>
                  <label>
                    Role
                    <select
                      value={contact.stage}
                      onChange={(event) =>
                        update(
                          'contacts',
                          plan.contacts.map((item) =>
                            item.id === contact.id
                              ? { ...item, stage: event.target.value }
                              : item
                          )
                        )
                      }
                    >
                      <option>Primary</option>
                      <option>Backup</option>
                      <option>Final</option>
                    </select>
                  </label>
                  <label>
                    Channel
                    <select
                      value={contact.channel}
                      onChange={(event) =>
                        update(
                          'contacts',
                          plan.contacts.map((item) =>
                            item.id === contact.id
                              ? { ...item, channel: event.target.value }
                              : item
                          )
                        )
                      }
                    >
                      <option>SMS</option>
                      <option>SMS and call</option>
                      <option>SMS and email</option>
                      <option>Family instructions</option>
                    </select>
                  </label>
                </div>
              ))}
            </div>
            <div className="response-builder__add">
              <p>
                Responders come from the verified Care Circle. Add or remove
                trusted adults there so delivery status stays accountable.
              </p>
            </div>
          </section>
          <aside className="support-card response-builder__rules">
            <h2>Escalation timing</h2>
            <label className="support-field">
              Alert backup after
              <select
                value={plan.primaryWindow}
                onChange={(event) =>
                  update('primaryWindow', event.target.value)
                }
              >
                <option>3 minutes</option>
                <option>5 minutes</option>
                <option>10 minutes</option>
              </select>
            </label>
            <label className="support-field">
              Start final pathway after
              <select
                value={plan.backupWindow}
                onChange={(event) => update('backupWindow', event.target.value)}
              >
                <option>5 minutes</option>
                <option>10 minutes</option>
                <option>15 minutes</option>
              </select>
            </label>
            <div className="response-builder__check">
              <UserRoundCheck size={18} />
              <div>
                <strong>Acknowledgement required</strong>
                <span>
                  The chain continues until an approved adult accepts
                  responsibility.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={savePlan}
              disabled={saving || !teenId}
              className="support-primary"
            >
              {saving ? 'Saving...' : 'Save and activate plan'}
            </button>
          </aside>
        </div>
      )}

      {activeTab === 'sharing' && (
        <section className="support-card support-sharing">
          <div className="support-card__title">
            <LockKeyhole size={20} />
            <div>
              <h2>What was shared and why</h2>
              <p>
                Maya and her guardian can review the same plain language
                history.
              </p>
            </div>
          </div>
          <div className="support-sharing__head">
            <span>Shared signal</span>
            <span>Information included</span>
            <span>Audience</span>
          </div>
          {sharedSignals.map((signal) => (
            <div className="support-sharing__row" key={signal.date}>
              <div>
                <strong>{signal.title}</strong>
                <small>{signal.date}</small>
              </div>
              <span>{signal.detail}</span>
              <span>{signal.audience}</span>
            </div>
          ))}
          <div className="support-sharing__actions">
            <button
              type="button"
              onClick={() =>
                showNotice(
                  'A sharing history download would be prepared securely.'
                )
              }
            >
              <Download size={17} /> Download history
            </button>
            <button
              type="button"
              onClick={() =>
                showNotice('A deletion request would begin guardian review.')
              }
            >
              <Trash2 size={17} /> Request data deletion
            </button>
          </div>
        </section>
      )}

      {activeTab === 'progress' && (
        <div className="support-progress">
          <section className="support-card support-progress__overview">
            <div className="support-card__title">
              <MessageCircleHeart size={20} />
              <div>
                <h2>Maya&apos;s support rhythm</h2>
                <p>
                  This week measures healthy action, not whether Maya felt
                  positive.
                </p>
              </div>
            </div>
            <div className="support-progress__metrics">
              {progress.map((metric) => (
                <div key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                  <small>{metric.note}</small>
                </div>
              ))}
            </div>
            <div className="support-progress__win">
              <Check size={19} />
              <div>
                <strong>Small win this week</strong>
                <p>
                  Maya asked a trusted adult for help before a stressful school
                  day.
                </p>
              </div>
            </div>
          </section>
          <aside className="support-card support-progress__principles">
            <h2>Healthy reward rules</h2>
            {[
              'Reward checking in, asking for help, and practicing a coping tool',
              'Never reward a positive mood or more disclosure',
              'Never compare one teen with another',
              'Never optimize for longer conversations',
            ].map((rule) => (
              <div key={rule}>
                <Check size={16} />
                {rule}
              </div>
            ))}
          </aside>
        </div>
      )}

      {notice && (
        <div className="support-plan__toast" role="status">
          <Check size={17} />
          {notice}
        </div>
      )}
    </div>
  )
}
