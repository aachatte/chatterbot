import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import '../components/Dashboard.css'

function formatDate(value) {
  if (!value) return 'No recent activity'
  const d = new Date(value)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function Initials({ name }) {
  return (name || '?')[0].toUpperCase()
}

const activityFeed = [
  { type: 'message', text: 'Maya completed her daily check-in', time: '2m ago' },
  { type: 'message', text: 'Ethan replied to a wellness prompt', time: '1h ago' },
  { type: 'alert',   text: 'Safety keyword flagged — reviewed & resolved', time: '3h ago' },
  { type: 'message', text: 'Maya started a new conversation thread', time: 'Yesterday' },
]

export default function Dashboard() {
  const [overview, setOverview] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.getOverview()
      .then((data) => {
        setOverview(data)
        // Redirect new users with no teens to onboarding
        if (data?.teens?.length === 0) {
          navigate('/dashboard/onboarding')
        }
      })
      .catch((e) => setError(e.data?.error || 'Dashboard data is unavailable. Please try again.'))
  }, [])

  if (error) {
    return (
      <div className="db-root">
        <div className="glass-card" role="alert" style={{ padding: 24, color: 'var(--cb-danger)' }}>{error}</div>
      </div>
    )
  }

  if (!overview) {
    return <div className="page-loading" role="status">Loading dashboard…</div>
  }

  const { summary, teens, recent_alerts: recentAlerts } = overview

  return (
    <div className="db-root">
      {/* Header */}
      <div className="db-header">
        <div>
          <h1 className="db-header__title">Guardian Dashboard</h1>
          <p className="db-header__sub">Privacy-preserving activity summaries and safety alerts for your family.</p>
        </div>
        <Link to="/dashboard/teens/new" className="btn btn--sm btn--primary-sm">+ Add teen</Link>
      </div>

      {/* Stat cards */}
      <div className="db-stats">
        <div className="db-stat-card">
          <div className="db-stat-card__label">Active teens</div>
          <div className="db-stat-card__value">{summary.teen_count}</div>
          <div className="db-stat-card__sub">enrolled & verified</div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-card__label">Messages · 7 days</div>
          <div className="db-stat-card__value">{summary.total_messages_7d}</div>
          <div className="db-stat-card__sub">across all teens</div>
        </div>
        <div className={`db-stat-card${summary.active_alerts > 0 ? ' db-stat-card--danger' : ''}`}>
          <div className="db-stat-card__label">Active alerts</div>
          <div className="db-stat-card__value">{summary.active_alerts}</div>
          <div className="db-stat-card__sub">{summary.active_alerts > 0 ? 'requires attention' : 'all clear'}</div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-card__label">Total alerts</div>
          <div className="db-stat-card__value">{summary.total_crisis_alerts}</div>
          <div className="db-stat-card__sub">all time</div>
        </div>
      </div>

      {/* Main grid */}
      <div className="db-grid">
        {/* Teen activity */}
        <section className="db-card" aria-labelledby="teens-heading">
          <div className="db-card__header">
            <h2 id="teens-heading" className="db-card__title">Teen activity</h2>
            <Link to="/dashboard/teens" className="db-card__action">Manage →</Link>
          </div>
          {teens.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty__icon">👤</div>
              Add a teen after completing consent verification to begin.
            </div>
          ) : (
            teens.map((teen) => (
              <Link key={teen.id} to={`/dashboard/teens/${teen.id}`} className="db-teen-item">
                <div className="db-teen-avatar"><Initials name={teen.first_name} /></div>
                <div>
                  <div className="db-teen-name">{teen.first_name}</div>
                  <div className="db-teen-meta">{teen.message_count_7d} messages · {teen.mood_label} activity</div>
                </div>
                <span className="db-teen-badge">Verified</span>
              </Link>
            ))
          )}
        </section>

        {/* Recent alerts */}
        <section className="db-card" aria-labelledby="alerts-heading">
          <div className="db-card__header">
            <h2 id="alerts-heading" className="db-card__title">Safety alerts</h2>
            <Link to="/dashboard/alerts" className="db-card__action">View all →</Link>
          </div>
          {recentAlerts.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty__icon">🛡️</div>
              No safety alerts recorded.
            </div>
          ) : (
            recentAlerts.map((alert) => (
              <Link key={alert.id} to={`/dashboard/alerts/${alert.id}`} className="db-alert-item">
                <span className="db-alert-badge">{alert.severity}</span>
                <div className="db-alert-severity">{alert.severity} alert</div>
                <div className="db-alert-time">{formatDate(alert.created_at)}</div>
              </Link>
            ))
          )}
        </section>
      </div>

      {/* Recent activity feed */}
      <section className="db-card" aria-label="Recent activity">
        <div className="db-card__header">
          <h2 className="db-card__title">Recent activity</h2>
        </div>
        {activityFeed.map((item, i) => (
          <div key={i} className="db-activity-row">
            <div className={`db-activity-dot${item.type === 'alert' ? ' db-activity-dot--alert' : ''}`} />
            <span className="db-activity-text">{item.text}</span>
            <span className="db-activity-time">{item.time}</span>
          </div>
        ))}
      </section>
    </div>
  )
}
