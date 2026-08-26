import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import './Onboarding.css'

const STEPS = ['Add your teen', 'Verify phone', 'Set preferences']

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [teenId, setTeenId] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [verifyCode, setVerifyCode] = useState('')
  const [prefs, setPrefs] = useState({
    crisis_alerts_enabled: true,
    crisis_alert_sms_enabled: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [healthChecks, setHealthChecks] = useState({
    profile_added: false,
    consent_verified: false,
    phone_verified: false,
    notifications_enabled: true,
  })
  const [inviteEmail, setInviteEmail] = useState('')
  const [invites, setInvites] = useState([])
  const [firstWeekChecklist, setFirstWeekChecklist] = useState({
    complete_consent: false,
    send_first_nudge: false,
    review_alert_settings: false,
    add_support_partner: false,
  })

  const activationScore = useMemo(() => {
    const checks = [
      healthChecks.profile_added,
      healthChecks.consent_verified,
      healthChecks.phone_verified,
      healthChecks.notifications_enabled,
      invites.length > 0,
      firstWeekChecklist.complete_consent,
      firstWeekChecklist.review_alert_settings,
    ]
    const complete = checks.filter(Boolean).length
    return Math.round((complete / checks.length) * 100)
  }, [healthChecks, invites, firstWeekChecklist])

  const handleAddTeen = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await api.addTeen(form.name.trim(), form.phone.trim())
      setTeenId(data.teen.id)
      setHealthChecks((prev) => ({ ...prev, profile_added: true }))
      setStep(1)
    } catch (e) {
      setError(e?.data?.error || 'Failed to add teen. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConsentVerification = async () => {
    if (!teenId) return
    setLoading(true)
    setError('')
    try {
      await api.confirmGuardianConsent(teenId)
      setHealthChecks((prev) => ({ ...prev, consent_verified: true }))
    } catch (e) {
      setError(e?.data?.error || 'Failed to confirm guardian consent.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendVerification = async () => {
    if (!teenId) return
    setLoading(true)
    setError('')
    try {
      await api.beginPhoneVerification(teenId)
      setVerificationSent(true)
    } catch (e) {
      setError(e?.data?.error || 'Failed to send verification code.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verifyCode.trim()) {
      setError('Enter the verification token.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.verifyPhone(teenId, verifyCode.trim())
      setHealthChecks((prev) => ({ ...prev, phone_verified: true }))
      setStep(2)
    } catch (e) {
      setError(e?.data?.error || 'Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePrefs = async () => {
    let saved = false
    setLoading(true)
    setError('')
    try {
      await api.updateGuardianPreferences(prefs)
      setHealthChecks((prev) => ({ ...prev, notifications_enabled: !!prefs.crisis_alert_sms_enabled }))
      setFirstWeekChecklist((prev) => ({ ...prev, review_alert_settings: true }))
      saved = true
    } catch (e) {
      setError(e?.data?.error || 'Could not save preferences, but setup can continue.')
    } finally {
      setLoading(false)
    }
    if (saved) navigate('/dashboard')
  }

  const inviteCollaborator = () => {
    const email = inviteEmail.trim()
    const atIndex = email.indexOf('@')
    const hasBasicEmailShape = atIndex > 0 && email.indexOf('.', atIndex) > atIndex + 1
    if (!email || !hasBasicEmailShape) return
    if (invites.includes(email)) {
      setInviteEmail('')
      return
    }
    setInvites((prev) => [...prev, email])
    setInviteEmail('')
    setFirstWeekChecklist((prev) => ({ ...prev, add_support_partner: true }))
  }

  return (
    <div className="onboarding">
      <div className="onboarding__card">
        <div className="onboarding__progress">
          {STEPS.map((label, i) => (
            <div key={label} className={`onboarding__step ${i === step ? 'onboarding__step--active' : ''} ${i < step ? 'onboarding__step--done' : ''}`}>
              <div className="onboarding__step-circle">{i < step ? '✓' : i + 1}</div>
              <span className="onboarding__step-label">{label}</span>
              {i < STEPS.length - 1 && <div className="onboarding__step-line" />}
            </div>
          ))}
        </div>

        <section style={{ border: '1px solid var(--cb-border)', borderRadius: 12, padding: 14, marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
            <div>
              <strong>Activation score</strong>
              <p style={{ margin: '4px 0 0', color: 'var(--cb-text-secondary)', fontSize: 13 }}>
                Complete setup milestones to unlock full safety workflows.
              </p>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{activationScore}%</div>
          </div>
          <div style={{ marginTop: 10, height: 8, borderRadius: 999, background: 'var(--cb-bg-muted)' }}>
            <div style={{ width: `${activationScore}%`, height: '100%', borderRadius: 999, background: 'var(--cb-primary)' }} />
          </div>
        </section>

        {error && <div className="onboarding__error">{error}</div>}

        {step === 0 && (
          <div className="onboarding__body">
            <h2 className="onboarding__heading">Add your teen</h2>
            <p className="onboarding__desc">We'll set up Chatterbot on their phone so they can start texting.</p>
            <label className="onboarding__label">Teen's name
              <input className="onboarding__input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Alex" />
            </label>
            <label className="onboarding__label">Teen's cell phone
              <input className="onboarding__input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" type="tel" />
            </label>
            <button className="onboarding__btn" onClick={handleAddTeen} disabled={loading}>
              {loading ? 'Adding…' : 'Continue →'}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="onboarding__body">
            <h2 className="onboarding__heading">Verify enrollment readiness</h2>
            <p className="onboarding__desc">Confirm consent and phone verification before monitoring goes live.</p>
            {!healthChecks.consent_verified && (
              <button className="onboarding__btn" onClick={handleConsentVerification} disabled={loading}>
                {loading ? 'Confirming…' : 'Confirm guardian consent'}
              </button>
            )}
            {!verificationSent ? (
              <button className="onboarding__btn" onClick={handleSendVerification} disabled={loading}>
                {loading ? 'Sending…' : 'Send verification text'}
              </button>
            ) : (
              <>
                <p className="onboarding__sent-note">✅ Verification text sent. Enter the code/token from the teen phone.</p>
                <label className="onboarding__label">Verification code or token
                  <input className="onboarding__input onboarding__input--code" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder="123456 / token" />
                </label>
                <button className="onboarding__btn" onClick={handleVerifyCode} disabled={loading}>
                  {loading ? 'Verifying…' : 'Verify →'}
                </button>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="onboarding__body">
            <h2 className="onboarding__heading">Set preferences and collaboration</h2>
            <p className="onboarding__desc">Configure notifications, invite support partners, and finish first-week milestones.</p>
            <div className="onboarding__toggles">
              {[
                { key: 'crisis_alerts_enabled', label: 'Enable crisis alerts', desc: 'Receive immediate crisis alerts in your dashboard.' },
                { key: 'crisis_alert_sms_enabled', label: 'Enable SMS alert delivery', desc: 'Send crisis alerts to your phone instantly.' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="onboarding__toggle-row">
                  <div className="onboarding__toggle-text">
                    <strong>{label}</strong>
                    <span>{desc}</span>
                  </div>
                  <div
                    className={`onboarding__toggle ${prefs[key] ? 'onboarding__toggle--on' : ''}`}
                    onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
                    role="switch"
                    aria-checked={prefs[key]}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setPrefs((p) => ({ ...p, [key]: !p[key] }))}
                  />
                </label>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--cb-border)', paddingTop: 14, marginTop: 6 }}>
              <h3 style={{ marginBottom: 8, fontSize: 15 }}>Family collaboration setup</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Invite co-guardian by email"
                  className="onboarding__input"
                  style={{ margin: 0 }}
                />
                <button type="button" className="onboarding__btn" onClick={inviteCollaborator}>Invite</button>
              </div>
              {invites.length > 0 && (
                <ul style={{ marginTop: 8, color: 'var(--cb-text-secondary)', fontSize: 13 }}>
                  {invites.map((invite) => <li key={invite}>{invite}</li>)}
                </ul>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--cb-border)', paddingTop: 14, marginTop: 6 }}>
              <h3 style={{ marginBottom: 8, fontSize: 15 }}>First 7 days success checklist</h3>
              {[
                ['complete_consent', 'Consent and phone verification complete'],
                ['send_first_nudge', 'Send first proactive nudge'],
                ['review_alert_settings', 'Review alert preferences'],
                ['add_support_partner', 'Add at least one support collaborator'],
              ].map(([key, label]) => (
                <label key={key} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={firstWeekChecklist[key]}
                    onChange={() => setFirstWeekChecklist((prev) => ({ ...prev, [key]: !prev[key] }))}
                  />
                  {label}
                </label>
              ))}
            </div>

            <button className="onboarding__btn" onClick={handleSavePrefs} disabled={loading}>
              {loading ? 'Saving…' : 'Finish setup 🎉'}
            </button>
          </div>
        )}

        <section style={{ marginTop: 16, borderTop: '1px solid var(--cb-border)', paddingTop: 14 }}>
          <h3 style={{ fontSize: 14, marginBottom: 8 }}>Real-time setup health checks</h3>
          <div style={{ display: 'grid', gap: 6, fontSize: 13, color: 'var(--cb-text-secondary)' }}>
            <div>{healthChecks.profile_added ? '✅' : '⏳'} Teen profile created</div>
            <div>{healthChecks.consent_verified ? '✅' : '⏳'} Guardian consent verified</div>
            <div>{healthChecks.phone_verified ? '✅' : '⏳'} Teen phone verified</div>
            <div>{healthChecks.notifications_enabled ? '✅' : '⚠️'} Crisis notifications enabled</div>
          </div>
        </section>
      </div>
    </div>
  )
}
