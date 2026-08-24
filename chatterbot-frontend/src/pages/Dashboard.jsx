import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : 'No recent activity'
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getOverview()
      .then(setOverview)
      .catch((requestError) => setError(requestError.data?.error || 'Dashboard data is unavailable. Please try again.'))
  }, [])

  if (error) {
    return <div className="glass-card" role="alert">{error}</div>
  }

  if (!overview) {
    return <div className="page-loading" role="status">Loading dashboard...</div>
  }

  const { summary, teens, recent_alerts: recentAlerts } = overview
  const stats = [
    ['Active teens', summary.teen_count],
    ['Messages in the last 7 days', summary.total_messages_7d],
    ['Active safety alerts', summary.active_alerts],
    ['Total safety alerts', summary.total_crisis_alerts],
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 'var(--cb-space-8)' }}>
      <header style={{ marginBottom: 'var(--cb-space-6)' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 'var(--cb-space-2)' }}>Guardian dashboard</h1>
        <p style={{ color: 'var(--cb-text-secondary)', fontSize: 16 }}>
          Privacy-preserving activity summaries and safety alerts for your family.
        </p>
      </header>

      <section aria-label="Dashboard summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--cb-space-4)', marginBottom: 'var(--cb-space-6)' }}>
        {stats.map(([label, value]) => (
          <div key={label} className="glass-card" style={{ padding: 'var(--cb-space-5)' }}>
            <div style={{ color: 'var(--cb-text-secondary)', fontSize: 14, marginBottom: 'var(--cb-space-2)' }}>{label}</div>
            <div style={{ color: label.includes('Active safety') && value > 0 ? 'var(--cb-danger)' : 'var(--cb-text-primary)', fontSize: 32, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--cb-space-6)' }}>
        <section className="glass-card" aria-labelledby="teens-heading">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--cb-space-4)' }}>
            <h2 id="teens-heading" style={{ fontSize: 20 }}>Teen activity</h2>
            <Link to="/dashboard/teens" style={{ color: 'var(--cb-primary)', fontWeight: 600 }}>Manage teens</Link>
          </div>
          {teens.length === 0 ? (
            <p style={{ color: 'var(--cb-text-secondary)' }}>Add a teen after completing consent verification to begin.</p>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--cb-space-3)' }}>
              {teens.map((teen) => (
                <Link key={teen.id} to={`/dashboard/teens/${teen.id}`} style={{ border: '1px solid var(--cb-border)', borderRadius: 'var(--cb-radius-lg)', color: 'inherit', padding: 'var(--cb-space-4)', textDecoration: 'none' }}>
                  <strong>{teen.first_name}</strong>
                  <div style={{ color: 'var(--cb-text-secondary)', fontSize: 14, marginTop: 'var(--cb-space-1)' }}>
                    {teen.message_count_7d} messages in the last 7 days · {teen.mood_label} activity
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="glass-card" aria-labelledby="alerts-heading">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--cb-space-4)' }}>
            <h2 id="alerts-heading" style={{ fontSize: 20 }}>Recent safety alerts</h2>
            <Link to="/dashboard/alerts" style={{ color: 'var(--cb-primary)', fontWeight: 600 }}>View all</Link>
          </div>
          {recentAlerts.length === 0 ? (
            <p style={{ color: 'var(--cb-text-secondary)' }}>No safety alerts have been recorded.</p>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--cb-space-3)' }}>
              {recentAlerts.map((alert) => (
                <Link key={alert.id} to={`/dashboard/alerts/${alert.id}`} style={{ borderLeft: '4px solid var(--cb-danger)', background: 'var(--cb-danger-soft)', borderRadius: 'var(--cb-radius-md)', color: 'inherit', padding: 'var(--cb-space-4)', textDecoration: 'none' }}>
                  <strong>{alert.severity} safety alert</strong>
                  <div style={{ color: 'var(--cb-text-secondary)', fontSize: 14, marginTop: 'var(--cb-space-1)' }}>
                    {formatDate(alert.created_at)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
