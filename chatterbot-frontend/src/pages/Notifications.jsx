import { useEffect, useState } from 'react'
import { api } from '../services/api.js'

export default function Notifications() {
  const [alerts, setAlerts] = useState([])
  const [accountNotices, setAccountNotices] = useState([])
  const [prefs, setPrefs] = useState({
    crisis_alerts_enabled: true,
    crisis_alert_sms_enabled: true,
  })
  const [saving, setSaving] = useState(false)
  const [sendingDigest, setSendingDigest] = useState(false)
  const [banner, setBanner] = useState('')

  useEffect(() => {
    Promise.all([
      api.getAlerts(),
      api.getOverview(),
      api.getGuardianNotifications(),
    ])
      .then(([alertRes, overviewRes, notificationRes]) => {
        setAlerts((alertRes?.alerts || []).slice(0, 10))
        setAccountNotices(notificationRes?.notifications || [])
        const parent = overviewRes?.parent || {}
        setPrefs({
          crisis_alerts_enabled: parent.crisis_alerts_enabled !== false,
          crisis_alert_sms_enabled: parent.crisis_alert_sms_enabled !== false,
        })
      })
      .catch(() => {})
  }, [])

  const markNoticeRead = async (id) => {
    try {
      const response = await api.markGuardianNotificationRead(id)
      setAccountNotices((items) =>
        items.map((item) => (item.id === id ? response.notification : item))
      )
    } catch {
      setBanner('Could not update the notification.')
    }
  }

  const savePrefs = async () => {
    setSaving(true)
    setBanner('')
    try {
      await api.updateGuardianPreferences(prefs)
      setBanner('Notification preferences updated.')
    } catch (error) {
      setBanner(error?.data?.error || 'Could not update preferences.')
    } finally {
      setSaving(false)
    }
  }

  const sendDigestNow = async () => {
    setSendingDigest(true)
    setBanner('')
    try {
      const payload = await api.sendDigest()
      setBanner(
        `Digest generated for ${payload?.teens?.length || 0} teen profiles.`
      )
    } catch (error) {
      setBanner(error?.data?.error || 'Digest generation failed.')
    } finally {
      setSendingDigest(false)
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 6 }}>
          Notification center
        </h1>
        <p style={{ color: 'var(--cb-text-secondary)' }}>
          Control alert delivery and review your recent in-app notification
          stream.
        </p>
      </div>

      {banner && (
        <div
          role="status"
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 8,
            border: '1px solid var(--cb-border)',
            background: 'var(--cb-bg-muted)',
          }}
        >
          {banner}
        </div>
      )}

      <section
        style={{
          background: 'var(--cb-bg-elevated)',
          border: '1px solid var(--cb-border)',
          borderRadius: 'var(--cb-radius-xl)',
          padding: 16,
          marginBottom: 14,
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Delivery controls</h2>
        <label style={rowStyle}>
          <input
            type="checkbox"
            checked={prefs.crisis_alerts_enabled}
            onChange={() =>
              setPrefs((p) => ({
                ...p,
                crisis_alerts_enabled: !p.crisis_alerts_enabled,
              }))
            }
          />
          Enable crisis alerts
        </label>
        <label style={rowStyle}>
          <input
            type="checkbox"
            checked={prefs.crisis_alert_sms_enabled}
            onChange={() =>
              setPrefs((p) => ({
                ...p,
                crisis_alert_sms_enabled: !p.crisis_alert_sms_enabled,
              }))
            }
          />
          Enable crisis alert SMS delivery
        </label>
        <div
          style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}
        >
          <button
            onClick={savePrefs}
            disabled={saving}
            style={primaryButtonStyle}
          >
            {saving ? 'Saving…' : 'Save preferences'}
          </button>
          <button
            onClick={sendDigestNow}
            disabled={sendingDigest}
            style={ghostButtonStyle}
          >
            {sendingDigest ? 'Generating…' : 'Generate digest now'}
          </button>
        </div>
      </section>

      <section
        style={{
          background: 'var(--cb-bg-elevated)',
          border: '1px solid var(--cb-border)',
          borderRadius: 'var(--cb-radius-xl)',
          padding: 16,
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 10 }}>
          Recent notification stream
        </h2>
        {accountNotices.length > 0 && (
          <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            {accountNotices.map((notice) => (
              <div
                key={notice.id}
                style={{
                  border: '1px solid var(--cb-border)',
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <strong>{notice.title}</strong>
                  {!notice.read_at && (
                    <button
                      type="button"
                      onClick={() => markNoticeRead(notice.id)}
                      style={noticeButtonStyle}
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <p
                  style={{
                    margin: '6px 0 0',
                    color: 'var(--cb-text-secondary)',
                    fontSize: 13,
                  }}
                >
                  {notice.body}
                </p>
              </div>
            ))}
          </div>
        )}
        {alerts.length === 0 ? (
          accountNotices.length === 0 && (
            <p style={{ color: 'var(--cb-text-secondary)' }}>
              No recent notifications.
            </p>
          )
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  border: '1px solid var(--cb-border)',
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <strong>
                    {alert.teen_name} · {alert.severity}
                  </strong>
                  <span
                    style={{ fontSize: 12, color: 'var(--cb-text-secondary)' }}
                  >
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                </div>
                <p
                  style={{
                    margin: '6px 0 0',
                    color: 'var(--cb-text-secondary)',
                    fontSize: 13,
                  }}
                >
                  {alert.context_summary}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 6,
  color: 'var(--cb-text-secondary)',
  fontSize: 14,
}

const primaryButtonStyle = {
  padding: '10px 14px',
  borderRadius: 8,
  border: 'none',
  background: 'var(--cb-primary)',
  color: 'white',
  fontWeight: 600,
}

const ghostButtonStyle = {
  ...primaryButtonStyle,
  background: 'var(--cb-bg-elevated)',
  border: '1px solid var(--cb-border)',
  color: 'var(--cb-text-secondary)',
}

const noticeButtonStyle = {
  border: '1px solid var(--cb-border)',
  borderRadius: 7,
  background: 'var(--cb-bg-elevated)',
  color: 'var(--cb-text-secondary)',
  padding: '5px 8px',
  fontSize: 12,
  fontWeight: 600,
}
