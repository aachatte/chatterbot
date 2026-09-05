import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'

const actionStyle = {
  display: 'inline-block',
  background: 'var(--cb-primary)',
  borderRadius: 'var(--cb-radius-md)',
  color: 'white',
  fontWeight: 600,
  padding: '10px 16px',
  textDecoration: 'none',
}

export default function Settings() {
  const [privacy, setPrivacy] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [notice, setNotice] = useState('')
  const loadPrivacy = () => api.getPrivacyOverview().then(setPrivacy)

  useEffect(() => {
    loadPrivacy().catch(() =>
      setNotice('Privacy controls could not be loaded.')
    )
    api
      .getReferrals()
      .then(setReferrals)
      .catch(() => {})
  }, [])

  const createReferral = async () => {
    try {
      const referral = await api.generateReferral()
      setReferrals((current) => [referral, ...current])
      setNotice(`Referral code ${referral.code} is ready to share.`)
    } catch (error) {
      setNotice(error?.data?.error || 'A referral code could not be created.')
    }
  }

  const downloadExport = async () => {
    try {
      const data = await api.exportGuardianData()
      const blob = new Blob([JSON.stringify(data.export, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `chatterbot-data-export-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(url)
      setNotice('Your privacy safe data export is ready.')
      await loadPrivacy()
    } catch (error) {
      setNotice(error?.data?.error || 'The export could not be created.')
    }
  }

  const cancelDeletion = async (requestId) => {
    try {
      await api.cancelDeletionRequest(requestId)
      setNotice('Deletion canceled and the teen profile reactivated.')
      await loadPrivacy()
    } catch (error) {
      setNotice(error?.data?.error || 'Deletion could not be canceled.')
    }
  }

  const scheduled = (privacy?.deletion_requests || []).filter(
    (item) => item.status === 'scheduled'
  )

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--cb-space-6)' }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 'var(--cb-space-2)',
          }}
        >
          Account, privacy, and safety
        </h1>
        <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15 }}>
          Manage family access, understand retention, and exercise your data
          rights.
        </p>
      </header>

      {notice && (
        <p role="status" className="glass-card" style={{ marginBottom: 16 }}>
          {notice}
        </p>
      )}

      <section
        className="glass-card"
        style={{ marginBottom: 'var(--cb-space-5)' }}
      >
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Privacy controls</h2>
        <p style={{ color: 'var(--cb-text-secondary)', lineHeight: 1.6 }}>
          Message text is redacted after{' '}
          {privacy?.message_retention_days ?? 'the configured retention period'}{' '}
          days. Guardian exports include account, enrollment, Care Circle, plan,
          and safety records but exclude teen message text.
        </p>
        <p
          style={{
            color: 'var(--cb-text-tertiary)',
            fontSize: 13,
            margin: '10px 0 16px',
          }}
        >
          Policy record: {privacy?.policy_version || 'Loading'}
        </p>
        <button type="button" onClick={downloadExport} style={actionStyle}>
          Download my data
        </button>
      </section>

      <section
        className="glass-card"
        style={{ marginBottom: 'var(--cb-space-5)' }}
      >
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Family referrals</h2>
        <p
          style={{
            color: 'var(--cb-text-secondary)',
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          Create a single-use pilot referral code for another family. Codes do
          not grant access to your account or any teen information.
        </p>
        <button type="button" onClick={createReferral} style={actionStyle}>
          Create referral code
        </button>
        {referrals.length > 0 && (
          <ul style={{ margin: '16px 0 0', paddingLeft: 20 }}>
            {referrals.map((referral) => (
              <li key={referral.id} style={{ marginTop: 8 }}>
                <strong>{referral.code}</strong> ·{' '}
                {referral.used ? 'Redeemed' : 'Available'}
              </li>
            ))}
          </ul>
        )}
      </section>

      {scheduled.map((item) => (
        <section
          className="glass-card"
          style={{ marginBottom: 'var(--cb-space-5)' }}
          key={item.id}
        >
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>
            Deletion scheduled for {item.teen_name}
          </h2>
          <p style={{ color: 'var(--cb-text-secondary)', marginBottom: 14 }}>
            Final deletion is scheduled for{' '}
            {new Date(item.scheduled_for).toLocaleString()}.
          </p>
          <button
            type="button"
            onClick={() => cancelDeletion(item.id)}
            style={actionStyle}
          >
            Cancel deletion
          </button>
        </section>
      ))}

      <section
        className="glass-card"
        style={{ marginBottom: 'var(--cb-space-5)' }}
      >
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>
          Controlled family pilot
        </h2>
        <p style={{ color: 'var(--cb-text-secondary)', lineHeight: 1.6 }}>
          {privacy?.pilot?.enabled
            ? `${privacy.pilot.active_families} of ${privacy.pilot.family_capacity} family spaces are active.`
            : 'Pilot capacity controls are not currently enabled.'}
        </p>
        {privacy?.pilot?.enrollment && (
          <p
            style={{
              color: 'var(--cb-text-tertiary)',
              fontSize: 13,
              marginTop: 10,
            }}
          >
            Family status: {privacy.pilot.enrollment.status} · Ready teen
            profiles:{' '}
            {privacy.pilot.enrollment.readiness?.ready_teen_count || 0}
          </p>
        )}
      </section>

      <section
        className="glass-card"
        style={{ marginBottom: 'var(--cb-space-5)' }}
      >
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>
          Teen safety preferences
        </h2>
        <p
          style={{
            color: 'var(--cb-text-secondary)',
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          Review consent, phone verification, nudges, and notification settings
          separately for each teen.
        </p>
        <Link to="/dashboard/teens" style={actionStyle}>
          Manage teen profiles
        </Link>
      </section>

      <section className="glass-card">
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Emergency support</h2>
        <p style={{ color: 'var(--cb-text-secondary)', lineHeight: 1.6 }}>
          Chatterbot is not an emergency service. If someone is in immediate
          danger, contact local emergency services. In the United States, call
          or text 988.
        </p>
      </section>
    </div>
  )
}
