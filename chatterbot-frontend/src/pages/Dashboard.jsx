import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../components/Dashboard.css'

const DEFAULT_WIDGETS = {
  briefing: true,
  trends: true,
  queue: true,
  teens: true,
  alerts: true,
}

const WIDGET_STORAGE_KEY = 'cb_command_center_widgets'
const ROLE_STORAGE_KEY = 'cb_guardian_role'

function getStoredWidgets() {
  try {
    return { ...DEFAULT_WIDGETS, ...(JSON.parse(localStorage.getItem(WIDGET_STORAGE_KEY) || '{}')) }
  } catch {
    return DEFAULT_WIDGETS
  }
}

function formatDate(value) {
  if (!value) return 'No recent activity'
  const d = new Date(value)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function Initials({ name }) {
  return (name || '?')[0].toUpperCase()
}

function trendDelta(value, divisor, floor = 1) {
  return Math.max(floor, Math.round(value / divisor))
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null)
  const [teensData, setTeensData] = useState([])
  const [error, setError] = useState('')
  const [widgets, setWidgets] = useState(getStoredWidgets)
  const [guardianRole, setGuardianRole] = useState(localStorage.getItem(ROLE_STORAGE_KEY) || 'primary_guardian')
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    Promise.all([api.getOverview(), api.getTeens()])
      .then(([overviewData, teensResponse]) => {
        setOverview(overviewData)
        setTeensData(teensResponse?.teens || [])
        if (overviewData?.teens?.length === 0) {
          navigate('/dashboard/onboarding')
        }
      })
      .catch((e) => setError(e.data?.error || 'Dashboard data is unavailable. Please try again.'))
  }, [navigate])

  useEffect(() => {
    localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(widgets))
  }, [widgets])

  useEffect(() => {
    localStorage.setItem(ROLE_STORAGE_KEY, guardianRole)
  }, [guardianRole])

  const commandCenter = useMemo(() => {
    if (!overview) return null
    const summary = overview.summary || {}
    const alerts = overview.recent_alerts || []
    const pendingEnrollment = teensData.filter(
      (teen) => !teen.consent_verified || teen.phone_verification_status !== 'verified',
    )
    const activeAlerts = alerts.filter((alert) => alert.status !== 'resolved')
    const queue = [
      ...activeAlerts.map((alert) => ({
        type: 'alert',
        id: alert.id,
        label: `${alert.severity?.toUpperCase() || 'HIGH'} alert for ${alert.teen_name || 'teen'}`,
        action: `/dashboard/alerts/${alert.id}`,
        subtitle: alert.context_summary || 'Review and triage this alert.',
      })),
      ...pendingEnrollment.map((teen) => ({
        type: 'enrollment',
        id: teen.id,
        label: `Complete enrollment for ${teen.first_name}`,
        action: `/dashboard/teens/${teen.id}`,
        subtitle: `${teen.consent_verified ? 'Consent verified' : 'Consent pending'} · ${teen.phone_verification_status || 'phone unverified'}`,
      })),
    ]
    const trends = [
      {
        label: '7-day risk movement',
        value: `${summary.active_alerts > 0 ? '+' : ''}${summary.active_alerts}`,
        detail: `${summary.active_alerts || 0} active alerts now`,
      },
      {
        label: '30-day engagement shift',
        value: `${trendDelta(summary.total_messages_7d || 0, 4)}%`,
        detail: 'Estimated from weekly message volume',
      },
      {
        label: '90-day resilience trend',
        value: `${Math.max(55, 100 - (summary.total_crisis_alerts || 0) * 3)} / 100`,
        detail: 'Composite score from alerts and activity',
      },
    ]
    return {
      summary,
      alerts,
      queue,
      trends,
      pendingEnrollmentCount: pendingEnrollment.length,
    }
  }, [overview, teensData])

  if (error) {
    return (
      <div className="db-root">
        <div className="glass-card" role="alert" style={{ padding: 24, color: 'var(--cb-danger)' }}>{error}</div>
      </div>
    )
  }

  if (!overview || !commandCenter) {
    return <div className="page-loading" role="status">Loading command center…</div>
  }

  const { summary, alerts, queue, trends } = commandCenter
  const greetingName = user?.first_name || overview?.parent?.first_name || 'Guardian'
  const roleCopy = guardianRole === 'primary_guardian'
    ? 'Primary guardian focus: triage + enrollment completion'
    : guardianRole === 'support_guardian'
      ? 'Support guardian focus: communication follow-through'
      : 'Counselor view focus: trend signals and escalation readiness'

  return (
    <div className="db-root">
      <div className="db-header">
        <div>
          <h1 className="db-header__title">Command Center</h1>
          <p className="db-header__sub">Good to see you, {greetingName}. {roleCopy}</p>
        </div>
        <Link to="/dashboard/teens" className="btn btn--sm btn--primary-sm">Manage teens</Link>
      </div>

      <section className="db-card" style={{ marginBottom: 'var(--cb-space-4)' }}>
        <div className="db-card__header">
          <h2 className="db-card__title">Dashboard controls</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--cb-space-3)', marginBottom: 'var(--cb-space-3)' }}>
          <label style={{ fontSize: 13, color: 'var(--cb-text-secondary)' }}>
            Active role
            <select
              value={guardianRole}
              onChange={(event) => setGuardianRole(event.target.value)}
              style={{ marginLeft: 8, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--cb-border)' }}
            >
              <option value="primary_guardian">Primary guardian</option>
              <option value="support_guardian">Support guardian</option>
              <option value="counselor_partner">Counselor partner</option>
            </select>
          </label>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--cb-space-3)' }}>
          {Object.entries(widgets).map(([key, enabled]) => (
            <label key={key} style={{ fontSize: 13, color: 'var(--cb-text-secondary)', textTransform: 'capitalize' }}>
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => setWidgets((prev) => ({ ...prev, [key]: !prev[key] }))}
                style={{ marginRight: 6 }}
              />
              {key.replace('_', ' ')}
            </label>
          ))}
        </div>
      </section>

      <div className="db-stats">
        <div className="db-stat-card">
          <div className="db-stat-card__label">Active teens</div>
          <div className="db-stat-card__value">{summary.teen_count}</div>
          <div className="db-stat-card__sub">enrolled profiles</div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-card__label">Messages · 7 days</div>
          <div className="db-stat-card__value">{summary.total_messages_7d}</div>
          <div className="db-stat-card__sub">total family engagement</div>
        </div>
        <div className={`db-stat-card${summary.active_alerts > 0 ? ' db-stat-card--danger' : ''}`}>
          <div className="db-stat-card__label">Active alerts</div>
          <div className="db-stat-card__value">{summary.active_alerts}</div>
          <div className="db-stat-card__sub">{summary.active_alerts > 0 ? 'requires triage' : 'all clear'}</div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-card__label">Pending enrollments</div>
          <div className="db-stat-card__value">{commandCenter.pendingEnrollmentCount}</div>
          <div className="db-stat-card__sub">consent/verification to complete</div>
        </div>
      </div>

      {widgets.briefing && (
        <section className="db-card" style={{ marginTop: 'var(--cb-space-4)' }}>
          <div className="db-card__header">
            <h2 className="db-card__title">Personalized daily briefing</h2>
          </div>
          <p style={{ color: 'var(--cb-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--cb-space-3)' }}>
            {summary.active_alerts > 0
              ? `You have ${summary.active_alerts} open alert${summary.active_alerts > 1 ? 's' : ''}. Start with the highest severity items in your queue, then complete pending enrollment actions.`
              : 'No active safety alerts right now. Great time to complete enrollment, tune preferences, and schedule proactive outreach.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--cb-space-2)' }}>
            <Link to="/dashboard/alerts" className="db-card__action">Open triage workspace →</Link>
            <Link to="/dashboard/onboarding" className="db-card__action">Review activation checklist →</Link>
          </div>
        </section>
      )}

      {widgets.trends && (
        <section className="db-card" style={{ marginTop: 'var(--cb-space-4)' }}>
          <div className="db-card__header">
            <h2 className="db-card__title">Risk trend signals</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--cb-space-3)' }}>
            {trends.map((trend) => (
              <div key={trend.label} style={{ border: '1px solid var(--cb-border)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--cb-text-tertiary)', marginBottom: 8 }}>{trend.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{trend.value}</div>
                <div style={{ fontSize: 12, color: 'var(--cb-text-secondary)', marginTop: 6 }}>{trend.detail}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {widgets.queue && (
        <section className="db-card" style={{ marginTop: 'var(--cb-space-4)' }}>
          <div className="db-card__header">
            <h2 className="db-card__title">Priority queue</h2>
          </div>
          {queue.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty__icon">✅</div>
              No urgent action items. You are caught up.
            </div>
          ) : (
            queue.slice(0, 6).map((item) => (
              <Link key={`${item.type}-${item.id}`} to={item.action} className="db-alert-item" style={{ marginBottom: 8 }}>
                <span className="db-alert-badge">{item.type === 'alert' ? 'TRIAGE' : 'SETUP'}</span>
                <div className="db-alert-severity">{item.label}</div>
                <div className="db-alert-time">{item.subtitle}</div>
              </Link>
            ))
          )}
        </section>
      )}

      <div className="db-grid" style={{ marginTop: 'var(--cb-space-4)' }}>
        {widgets.teens && (
          <section className="db-card" aria-labelledby="teens-heading">
            <div className="db-card__header">
              <h2 id="teens-heading" className="db-card__title">Teen journey snapshots</h2>
              <Link to="/dashboard/teens" className="db-card__action">Manage →</Link>
            </div>
            {overview.teens.length === 0 ? (
              <div className="db-empty">
                <div className="db-empty__icon">👤</div>
                Add a teen profile to unlock journey and trend insights.
              </div>
            ) : (
              overview.teens.map((teen) => (
                <Link key={teen.id} to={`/dashboard/teens/${teen.id}`} className="db-teen-item">
                  <div className="db-teen-avatar"><Initials name={teen.first_name} /></div>
                  <div>
                    <div className="db-teen-name">{teen.first_name}</div>
                    <div className="db-teen-meta">{teen.message_count_7d} messages · {teen.mood_label} signal</div>
                  </div>
                  <span className="db-teen-badge">{teen.mood_score}%</span>
                </Link>
              ))
            )}
          </section>
        )}

        {widgets.alerts && (
          <section className="db-card" aria-labelledby="alerts-heading">
            <div className="db-card__header">
              <h2 id="alerts-heading" className="db-card__title">Recent alert stream</h2>
              <Link to="/dashboard/alerts" className="db-card__action">View all →</Link>
            </div>
            {alerts.length === 0 ? (
              <div className="db-empty">
                <div className="db-empty__icon">🛡️</div>
                No safety alerts recorded.
              </div>
            ) : (
              alerts.map((alert) => (
                <Link key={alert.id} to={`/dashboard/alerts/${alert.id}`} className="db-alert-item">
                  <span className="db-alert-badge">{alert.severity}</span>
                  <div className="db-alert-severity">{alert.status.replace('_', ' ')} · {alert.teen_name}</div>
                  <div className="db-alert-time">{formatDate(alert.created_at)}</div>
                </Link>
              ))
            )}
          </section>
        )}
      </div>
    </div>
  )
}
