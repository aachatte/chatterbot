import {
  BellRing,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  HeartHandshake,
  Link2,
  LockKeyhole,
  Mail,
  PauseCircle,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRoundCheck,
  UsersRound,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '@/services/api.js'
import './CareCircle.css'

const ROLE_OPTIONS = [
  { value: 'co_guardian', label: 'Co-guardian' },
  { value: 'family_member', label: 'Family member' },
  { value: 'counselor', label: 'Counselor' },
  { value: 'mentor', label: 'Mentor or coach' },
]

const ACCESS_OPTIONS = [
  {
    value: 'safety_only',
    title: 'Safety only',
    description: 'Receives urgent safety alerts when action may be needed.',
  },
  {
    value: 'signals',
    title: 'Support signals',
    description: 'Adds check-in status and broad wellbeing signals.',
  },
  {
    value: 'coordination',
    title: 'Care coordination',
    description:
      'Adds shared next steps and action notes for the trusted team.',
  },
]

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  role: 'family_member',
  relationship: '',
  access_level: 'safety_only',
  notify_safety_alerts: true,
  notify_checkin_updates: false,
}

const ROLE_LABELS = Object.fromEntries(
  ROLE_OPTIONS.map(({ value, label }) => [value, label])
)

const ACCESS_LABELS = Object.fromEntries(
  ACCESS_OPTIONS.map(({ value, title }) => [value, title])
)

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function formatActivityTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function getErrorMessage(error, fallback) {
  return error?.data?.error || error?.message || fallback
}

export default function CareCircle() {
  const [circle, setCircle] = useState(null)
  const [selectedTeenId, setSelectedTeenId] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState(EMPTY_FORM)
  const [shareInvite, setShareInvite] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [removingMember, setRemovingMember] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const loadCircle = useCallback(async (teenId, quiet = false) => {
    if (quiet) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const payload = await api.getCareCircle(teenId)
      setCircle(payload)
      setSelectedTeenId(
        payload.selected_teen?.id ? String(payload.selected_teen.id) : ''
      )
    } catch (loadError) {
      setError(
        getErrorMessage(loadError, 'Care Circle could not be loaded right now.')
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadCircle()
  }, [loadCircle])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setShowInvite(false)
      setShareInvite(null)
      setEditingMember(null)
      setRemovingMember(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const members = circle?.members || []
  const activeMembers = members.filter((member) => member.status === 'active')
  const pendingMembers = members.filter((member) => member.status === 'pending')
  const safetyRecipients = activeMembers.filter(
    (member) => member.notify_safety_alerts
  )
  const updateRecipients = activeMembers.filter(
    (member) => member.notify_checkin_updates
  )

  const setupSteps = [
    {
      label: 'Add a trusted adult',
      complete: members.length > 0,
    },
    {
      label: 'Connect a safety contact',
      complete: safetyRecipients.length > 0,
    },
    {
      label: 'Resolve pending invitations',
      complete: members.length > 0 && pendingMembers.length === 0,
    },
  ]
  const setupPercent = Math.round(
    (setupSteps.filter((step) => step.complete).length / setupSteps.length) *
      100
  )

  const selectedTeen = circle?.selected_teen

  const selectTeen = (event) => {
    const nextId = event.target.value
    setSelectedTeenId(nextId)
    setNotice('')
    loadCircle(nextId)
  }

  const createInvite = async (event) => {
    event.preventDefault()
    if (!selectedTeen) return
    setSubmitting(true)
    setError('')
    try {
      const response = await api.createCareCircleMember({
        ...inviteForm,
        teen_id: selectedTeen.id,
      })
      const url = `${window.location.origin}/care-circle/join/${response.invite_token}`
      setShowInvite(false)
      setShareInvite({ member: response.member, url })
      setInviteForm(EMPTY_FORM)
      setNotice(`${response.member.name} is ready to be invited.`)
      await loadCircle(selectedTeen.id, true)
    } catch (submitError) {
      setError(
        getErrorMessage(submitError, 'The invitation could not be created.')
      )
    } finally {
      setSubmitting(false)
    }
  }

  const refreshInvite = async (member) => {
    setSubmitting(true)
    setError('')
    try {
      const response = await api.refreshCareCircleInvitation(member.id)
      setShareInvite({
        member: response.member,
        url: `${window.location.origin}/care-circle/join/${response.invite_token}`,
      })
      setNotice(`A fresh invitation is ready for ${member.name}.`)
      await loadCircle(selectedTeen.id, true)
    } catch (submitError) {
      setError(
        getErrorMessage(submitError, 'The invitation could not be refreshed.')
      )
    } finally {
      setSubmitting(false)
    }
  }

  const saveMember = async (event) => {
    event.preventDefault()
    if (!editingMember) return
    setSubmitting(true)
    setError('')
    try {
      await api.updateCareCircleMember(editingMember.id, {
        role: editingMember.role,
        relationship: editingMember.relationship || '',
        phone: editingMember.phone || '',
        access_level: editingMember.access_level,
        notify_safety_alerts: editingMember.notify_safety_alerts,
        notify_checkin_updates: editingMember.notify_checkin_updates,
      })
      setNotice(`${editingMember.name}'s Care Circle access was updated.`)
      setEditingMember(null)
      await loadCircle(selectedTeen.id, true)
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'The member could not be updated.'))
    } finally {
      setSubmitting(false)
    }
  }

  const toggleMemberStatus = async (member) => {
    const nextStatus = member.status === 'paused' ? 'active' : 'paused'
    setSubmitting(true)
    setError('')
    try {
      await api.updateCareCircleMember(member.id, { status: nextStatus })
      setNotice(
        nextStatus === 'paused'
          ? `${member.name}'s signal access is paused.`
          : `${member.name} is active in the Care Circle again.`
      )
      await loadCircle(selectedTeen.id, true)
    } catch (submitError) {
      setError(
        getErrorMessage(submitError, 'The member status could not be changed.')
      )
    } finally {
      setSubmitting(false)
    }
  }

  const removeMember = async () => {
    if (!removingMember) return
    setSubmitting(true)
    setError('')
    try {
      await api.deleteCareCircleMember(removingMember.id)
      setNotice(`${removingMember.name} was removed from the Care Circle.`)
      setRemovingMember(null)
      await loadCircle(selectedTeen.id, true)
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'The member could not be removed.'))
    } finally {
      setSubmitting(false)
    }
  }

  const copyInvite = async () => {
    if (!shareInvite?.url) return
    try {
      await navigator.clipboard.writeText(shareInvite.url)
      setNotice('Secure invitation link copied.')
    } catch {
      setNotice('Select and copy the invitation link below.')
    }
  }

  if (loading && !circle) {
    return (
      <div
        className="care-circle care-circle--loading"
        aria-label="Loading Care Circle"
      >
        <div className="care-circle__skeleton care-circle__skeleton--title" />
        <div className="care-circle__skeleton care-circle__skeleton--hero" />
        <div className="care-circle__skeleton care-circle__skeleton--body" />
      </div>
    )
  }

  if (error && !circle) {
    return (
      <div className="care-circle__load-error">
        <HeartHandshake size={32} aria-hidden="true" />
        <h1>Care Circle is temporarily unavailable</h1>
        <p>{error}</p>
        <button
          type="button"
          className="cc-button cc-button--primary"
          onClick={() => loadCircle()}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="care-circle">
      <header className="care-circle__header">
        <div>
          <p className="care-circle__eyebrow">Trusted support network</p>
          <h1>Care Circle</h1>
          <p>
            Put the right adults around the right signals while Chatterbot stays
            a safe, familiar friend for your teen.
          </p>
        </div>
        <div className="care-circle__header-actions">
          {circle?.teens?.length > 1 && (
            <label className="care-circle__teen-picker">
              <span>Care Circle for</span>
              <select value={selectedTeenId} onChange={selectTeen}>
                {circle.teens.map((teen) => (
                  <option key={teen.id} value={teen.id}>
                    {teen.first_name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {selectedTeen && (
            <button
              type="button"
              className="cc-button cc-button--primary"
              onClick={() => {
                setInviteForm(EMPTY_FORM)
                setShowInvite(true)
              }}
            >
              <Plus size={17} aria-hidden="true" />
              Invite someone
            </button>
          )}
        </div>
      </header>

      {(notice || error) && (
        <div
          className={`care-circle__message${error ? ' care-circle__message--error' : ''}`}
          role={error ? 'alert' : 'status'}
        >
          {error || notice}
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => {
              setError('')
              setNotice('')
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {!selectedTeen ? (
        <section className="care-circle__empty">
          <div className="care-circle__empty-icon">
            <UsersRound size={30} aria-hidden="true" />
          </div>
          <h2>Add a teen before building a Care Circle</h2>
          <p>
            Each circle is centered on one teen so every permission and safety
            route stays clear.
          </p>
          <Link
            className="cc-button cc-button--primary"
            to="/dashboard/onboarding"
          >
            Start setup
          </Link>
        </section>
      ) : (
        <>
          <section className="care-circle__hero">
            <div className="care-circle__hero-copy">
              <span className="care-circle__hero-kicker">
                <ShieldCheck size={16} aria-hidden="true" />
                {selectedTeen.first_name}&apos;s trusted team
              </span>
              <h2>The right people, around the right signals.</h2>
              <p>
                Care Circle coordinates support without turning a teen&apos;s
                life into a feed. Members only receive the access you choose.
              </p>
              <div className="care-circle__hero-tags">
                <span>
                  <LockKeyhole size={14} /> No full transcripts
                </span>
                <span>
                  <UserRoundCheck size={14} /> Guardian approved
                </span>
                <span>
                  <BellRing size={14} /> Permissioned alerts
                </span>
              </div>
            </div>
            <div className="care-circle__setup-card">
              <div
                className="care-circle__setup-ring"
                style={{ '--cc-progress': `${setupPercent * 3.6}deg` }}
                aria-label={`${setupPercent}% of Care Circle setup complete`}
              >
                <div>
                  <strong>{setupPercent}%</strong>
                  <span>set up</span>
                </div>
              </div>
              <div className="care-circle__setup-list">
                {setupSteps.map((step) => (
                  <div
                    key={step.label}
                    className={step.complete ? 'is-complete' : ''}
                  >
                    <span>{step.complete ? <Check size={13} /> : null}</span>
                    {step.label}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            className="care-circle__stats"
            aria-label="Care Circle summary"
          >
            <div className="care-circle__stat">
              <span className="care-circle__stat-icon care-circle__stat-icon--blue">
                <UsersRound size={19} />
              </span>
              <div>
                <strong>{activeMembers.length + 1}</strong>
                <span>Connected adults</span>
              </div>
            </div>
            <div className="care-circle__stat">
              <span className="care-circle__stat-icon care-circle__stat-icon--gold">
                <Clock3 size={19} />
              </span>
              <div>
                <strong>{pendingMembers.length}</strong>
                <span>Pending invitations</span>
              </div>
            </div>
            <div className="care-circle__stat">
              <span className="care-circle__stat-icon care-circle__stat-icon--green">
                <ShieldCheck size={19} />
              </span>
              <div>
                <strong>{safetyRecipients.length + 1}</strong>
                <span>Safety contacts</span>
              </div>
            </div>
            <div className="care-circle__stat">
              <span className="care-circle__stat-icon care-circle__stat-icon--coral">
                <BellRing size={19} />
              </span>
              <div>
                <strong>{updateRecipients.length}</strong>
                <span>Update recipients</span>
              </div>
            </div>
          </section>

          <div className="care-circle__workspace">
            <main className="care-circle__main">
              <section className="cc-panel">
                <div className="cc-panel__header">
                  <div>
                    <p className="cc-panel__eyebrow">People</p>
                    <h2>{selectedTeen.first_name}&apos;s circle</h2>
                  </div>
                  {refreshing && (
                    <span className="care-circle__refreshing">
                      <RefreshCw size={13} /> Updating
                    </span>
                  )}
                </div>

                <div className="care-circle__members">
                  <article className="cc-member cc-member--owner">
                    <div className="cc-member__avatar">
                      {initials(circle.owner?.name)}
                      <span aria-label="Active" />
                    </div>
                    <div className="cc-member__identity">
                      <div className="cc-member__name-row">
                        <h3>{circle.owner?.name}</h3>
                        <span className="cc-status cc-status--active">You</span>
                      </div>
                      <p>{circle.owner?.email}</p>
                      <div className="cc-member__chips">
                        <span>Account guardian</span>
                        <span>Circle settings</span>
                        <span>Safety alerts</span>
                      </div>
                    </div>
                    <div className="cc-member__owner-mark">
                      <ShieldCheck size={17} />
                      Circle owner
                    </div>
                  </article>

                  {members.map((member) => (
                    <article
                      key={member.id}
                      className={`cc-member${member.status === 'paused' ? ' cc-member--paused' : ''}`}
                    >
                      <div
                        className={`cc-member__avatar cc-member__avatar--${member.role}`}
                      >
                        {initials(member.name)}
                        {member.status === 'active' && (
                          <span aria-label="Active" />
                        )}
                      </div>
                      <div className="cc-member__identity">
                        <div className="cc-member__name-row">
                          <h3>{member.name}</h3>
                          <span
                            className={`cc-status cc-status--${member.status}`}
                          >
                            {member.status}
                          </span>
                        </div>
                        <p>
                          {ROLE_LABELS[member.role] || 'Trusted adult'}
                          {member.relationship
                            ? ` · ${member.relationship}`
                            : ''}
                        </p>
                        <span className="cc-member__email">{member.email}</span>
                        {member.phone && (
                          <span className="cc-member__email">
                            {member.phone}
                          </span>
                        )}
                        <div className="cc-member__chips">
                          <span>
                            {ACCESS_LABELS[member.access_level] ||
                              'Safety only'}
                          </span>
                          {member.notify_safety_alerts && (
                            <span>Safety alerts</span>
                          )}
                          {member.notify_checkin_updates && (
                            <span>Check-in updates</span>
                          )}
                        </div>
                      </div>
                      <div className="cc-member__actions">
                        {member.status === 'pending' ? (
                          <button
                            type="button"
                            className="cc-icon-button"
                            title="Create a fresh invitation link"
                            aria-label={`Create a fresh invitation link for ${member.name}`}
                            disabled={submitting}
                            onClick={() => refreshInvite(member)}
                          >
                            <Link2 size={16} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="cc-icon-button"
                            title={
                              member.status === 'paused'
                                ? 'Restore access'
                                : 'Pause access'
                            }
                            aria-label={`${member.status === 'paused' ? 'Restore' : 'Pause'} access for ${member.name}`}
                            disabled={submitting}
                            onClick={() => toggleMemberStatus(member)}
                          >
                            {member.status === 'paused' ? (
                              <UserRoundCheck size={16} />
                            ) : (
                              <PauseCircle size={16} />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          className="cc-icon-button"
                          title="Edit access"
                          aria-label={`Edit access for ${member.name}`}
                          onClick={() => setEditingMember({ ...member })}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="cc-icon-button cc-icon-button--danger"
                          title="Remove from Care Circle"
                          aria-label={`Remove ${member.name} from Care Circle`}
                          onClick={() => setRemovingMember(member)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  ))}

                  {members.length === 0 && (
                    <div className="care-circle__members-empty">
                      <HeartHandshake size={28} aria-hidden="true" />
                      <div>
                        <h3>Start with one trusted adult</h3>
                        <p>
                          Add a co-guardian, counselor, family member, mentor,
                          or coach.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="cc-button cc-button--secondary"
                        onClick={() => setShowInvite(true)}
                      >
                        Invite someone
                      </button>
                    </div>
                  )}
                </div>
              </section>

              <section className="cc-panel">
                <div className="cc-panel__header">
                  <div>
                    <p className="cc-panel__eyebrow">Accountability</p>
                    <h2>Circle activity</h2>
                  </div>
                </div>
                {circle.activity?.length ? (
                  <ol className="care-circle__activity">
                    {circle.activity.map((item) => (
                      <li key={item.id}>
                        <span className="care-circle__activity-icon">
                          <CheckCircle2 size={15} />
                        </span>
                        <div>
                          <p>{item.detail}</p>
                          <span>
                            {item.actor_name} ·{' '}
                            {formatActivityTime(item.created_at)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="care-circle__activity-empty">
                    Invitations and permission changes will appear here.
                  </p>
                )}
              </section>
            </main>

            <aside className="care-circle__rail">
              <section className="cc-panel care-circle__routing">
                <div className="cc-panel__header">
                  <div>
                    <p className="cc-panel__eyebrow">Signal routing</p>
                    <h2>Who sees what</h2>
                  </div>
                </div>
                <div className="care-circle__route">
                  <span className="care-circle__route-icon care-circle__route-icon--urgent">
                    <ShieldCheck size={17} />
                  </span>
                  <div>
                    <strong>Urgent safety signal</strong>
                    <p>You{formatRecipientNames(safetyRecipients)}</p>
                  </div>
                </div>
                <div className="care-circle__route">
                  <span className="care-circle__route-icon care-circle__route-icon--update">
                    <BellRing size={17} />
                  </span>
                  <div>
                    <strong>Check-in update</strong>
                    <p>
                      {updateRecipients.length
                        ? updateRecipients
                            .map((member) => member.name)
                            .join(', ')
                        : 'No additional recipients'}
                    </p>
                  </div>
                </div>
                <div className="care-circle__route">
                  <span className="care-circle__route-icon care-circle__route-icon--locked">
                    <LockKeyhole size={17} />
                  </span>
                  <div>
                    <strong>Full conversation text</strong>
                    <p>Never shared through Care Circle</p>
                  </div>
                </div>
              </section>

              <section className="cc-panel care-circle__promise">
                <span className="care-circle__promise-mark">
                  <HeartHandshake size={21} />
                </span>
                <p className="cc-panel__eyebrow">The Care Circle promise</p>
                <h2>Support without surveillance.</h2>
                <p>
                  Chatterbot shares the smallest useful signal, shows every
                  permission clearly, and keeps changes accountable.
                </p>
                <ul>
                  <li>
                    <Check size={14} /> Teen-specific access
                  </li>
                  <li>
                    <Check size={14} /> Clear member roles
                  </li>
                  <li>
                    <Check size={14} /> Reversible permissions
                  </li>
                  <li>
                    <Check size={14} /> Visible activity history
                  </li>
                </ul>
              </section>
            </aside>
          </div>
        </>
      )}

      {showInvite && selectedTeen && (
        <Modal
          title={`Invite someone for ${selectedTeen.first_name}`}
          onClose={() => setShowInvite(false)}
        >
          <form className="cc-form" onSubmit={createInvite}>
            <p className="cc-form__intro">
              Create a secure link for one trusted adult. It expires after seven
              days.
            </p>
            <div className="cc-form__row">
              <label>
                <span>Name</span>
                <input
                  required
                  maxLength={120}
                  value={inviteForm.name}
                  onChange={(event) =>
                    setInviteForm((form) => ({
                      ...form,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Jordan Lee"
                  autoFocus
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  required
                  type="email"
                  maxLength={255}
                  value={inviteForm.email}
                  onChange={(event) =>
                    setInviteForm((form) => ({
                      ...form,
                      email: event.target.value,
                    }))
                  }
                  placeholder="jordan@example.com"
                />
              </label>
            </div>
            <label className="cc-form__single">
              <span>
                Mobile number <em>optional, for SMS safety alerts</em>
              </span>
              <input
                type="tel"
                value={inviteForm.phone}
                onChange={(event) =>
                  setInviteForm((form) => ({
                    ...form,
                    phone: event.target.value,
                  }))
                }
                placeholder="+1 (555) 000-0000"
              />
            </label>
            <div className="cc-form__row">
              <label>
                <span>Role</span>
                <select
                  value={inviteForm.role}
                  onChange={(event) =>
                    setInviteForm((form) => ({
                      ...form,
                      role: event.target.value,
                    }))
                  }
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>
                  Relationship <em>optional</em>
                </span>
                <input
                  maxLength={100}
                  value={inviteForm.relationship}
                  onChange={(event) =>
                    setInviteForm((form) => ({
                      ...form,
                      relationship: event.target.value,
                    }))
                  }
                  placeholder="Aunt, school counselor, coach"
                />
              </label>
            </div>
            <AccessPicker
              value={inviteForm.access_level}
              onChange={(access_level) =>
                setInviteForm((form) => ({
                  ...form,
                  access_level,
                  notify_checkin_updates:
                    access_level === 'safety_only'
                      ? false
                      : form.notify_checkin_updates,
                }))
              }
            />
            <NotificationControls value={inviteForm} onChange={setInviteForm} />
            <div className="cc-form__actions">
              <button
                type="button"
                className="cc-button cc-button--ghost"
                onClick={() => setShowInvite(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cc-button cc-button--primary"
                disabled={submitting}
              >
                {submitting ? 'Creating…' : 'Create secure invite'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {shareInvite && (
        <Modal
          title="Secure invitation ready"
          onClose={() => setShareInvite(null)}
          compact
        >
          <div className="cc-share">
            <span className="cc-share__icon">
              <Mail size={22} />
            </span>
            <h3>Invite {shareInvite.member.name}</h3>
            <p>
              Send this one-time link directly to them. It expires in seven days
              and can only activate this Care Circle role.
            </p>
            <label>
              <span>Invitation link</span>
              <input
                value={shareInvite.url}
                readOnly
                onFocus={(event) => event.target.select()}
              />
            </label>
            <button
              type="button"
              className="cc-button cc-button--primary"
              onClick={copyInvite}
            >
              <Copy size={16} /> Copy invitation link
            </button>
          </div>
        </Modal>
      )}

      {editingMember && (
        <Modal
          title={`Manage ${editingMember.name}`}
          onClose={() => setEditingMember(null)}
        >
          <form className="cc-form" onSubmit={saveMember}>
            <div className="cc-form__row">
              <label>
                <span>Role</span>
                <select
                  value={editingMember.role}
                  onChange={(event) =>
                    setEditingMember((member) => ({
                      ...member,
                      role: event.target.value,
                    }))
                  }
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>
                  Relationship <em>optional</em>
                </span>
                <input
                  maxLength={100}
                  value={editingMember.relationship || ''}
                  onChange={(event) =>
                    setEditingMember((member) => ({
                      ...member,
                      relationship: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <label className="cc-form__single">
              <span>
                Mobile number <em>optional, for SMS safety alerts</em>
              </span>
              <input
                type="tel"
                value={editingMember.phone || ''}
                onChange={(event) =>
                  setEditingMember((member) => ({
                    ...member,
                    phone: event.target.value,
                  }))
                }
                placeholder="+1 (555) 000-0000"
              />
            </label>
            <AccessPicker
              value={editingMember.access_level}
              onChange={(access_level) =>
                setEditingMember((member) => ({
                  ...member,
                  access_level,
                  notify_checkin_updates:
                    access_level === 'safety_only'
                      ? false
                      : member.notify_checkin_updates,
                }))
              }
            />
            <NotificationControls
              value={editingMember}
              onChange={setEditingMember}
            />
            <div className="cc-form__actions">
              <button
                type="button"
                className="cc-button cc-button--ghost"
                onClick={() => setEditingMember(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cc-button cc-button--primary"
                disabled={submitting}
              >
                {submitting ? 'Saving…' : 'Save access'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {removingMember && (
        <Modal
          title={`Remove ${removingMember.name}?`}
          onClose={() => setRemovingMember(null)}
          compact
        >
          <div className="cc-remove">
            <span className="cc-remove__icon">
              <Trash2 size={21} />
            </span>
            <p>
              They will stop receiving signals for {selectedTeen?.first_name}.
              This change will remain visible in the activity history.
            </p>
            <div className="cc-form__actions">
              <button
                type="button"
                className="cc-button cc-button--ghost"
                onClick={() => setRemovingMember(null)}
              >
                Keep member
              </button>
              <button
                type="button"
                className="cc-button cc-button--danger"
                disabled={submitting}
                onClick={removeMember}
              >
                {submitting ? 'Removing…' : 'Remove member'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function formatRecipientNames(recipients) {
  if (!recipients.length) return ''
  return `, ${recipients.map((member) => member.name).join(', ')}`
}

function Modal({ title, onClose, children, compact = false }) {
  return (
    <div
      className="cc-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className={`cc-modal__dialog${compact ? ' cc-modal__dialog--compact' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cc-modal-title"
      >
        <header>
          <h2 id="cc-modal-title">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose}>
            <X size={19} />
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}

function AccessPicker({ value, onChange }) {
  return (
    <fieldset className="cc-access-picker">
      <legend>What can they receive?</legend>
      {ACCESS_OPTIONS.map((option) => (
        <label
          key={option.value}
          className={value === option.value ? 'is-selected' : ''}
        >
          <input
            type="radio"
            name="access_level"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="cc-access-picker__check">
            {value === option.value ? <Check size={13} /> : null}
          </span>
          <span>
            <strong>{option.title}</strong>
            <small>{option.description}</small>
          </span>
        </label>
      ))}
      <p>
        <LockKeyhole size={13} /> Full conversation text is never included.
      </p>
    </fieldset>
  )
}

function NotificationControls({ value, onChange }) {
  return (
    <fieldset className="cc-notification-controls">
      <legend>Notifications</legend>
      <label>
        <input
          type="checkbox"
          checked={value.notify_safety_alerts}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              notify_safety_alerts: event.target.checked,
            }))
          }
        />
        <span>
          <strong>Urgent safety alerts</strong>
          <small>
            Send an SMS when a safety response may be needed and a mobile number
            is available.
          </small>
        </span>
      </label>
      <label>
        <input
          type="checkbox"
          checked={value.notify_checkin_updates}
          disabled={value.access_level === 'safety_only'}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              notify_checkin_updates: event.target.checked,
            }))
          }
        />
        <span>
          <strong>Check-in updates</strong>
          <small>
            {value.access_level === 'safety_only'
              ? 'Choose a broader access level to enable updates.'
              : 'Share completion status and broad wellbeing signals.'}
          </small>
        </span>
      </label>
    </fieldset>
  )
}
