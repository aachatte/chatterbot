import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'

const MOCK_ALERTS = [
  {
    id: 1,
    teen_id: 1,
    teen_name: 'Maya',
    status: 'resolved',
    severity: 'medium',
    keywords_matched: ['stressed', 'overwhelmed'],
    context_summary: 'Chatterbot detected signs of academic stress from Maya around a history paper deadline. The conversation was de-escalated successfully.',
    created_at: '2026-08-10T14:30:00Z',
    resolved_at: '2026-08-10T16:00:00Z',
  },
]

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getAlerts()
      .then(data => setAlerts(data.alerts))
      .catch(() => setAlerts(MOCK_ALERTS))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.status === filter)

  const severityColor = (s) => {
    if (s === 'critical') return 'var(--cb-danger)'
    if (s === 'high') return 'var(--cb-danger)'
    if (s === 'medium') return 'var(--cb-warning)'
    return 'var(--cb-text-tertiary)'
  }

  if (loading) return <div style={{ color: 'var(--cb-text-tertiary)', textAlign: 'center', padding: 'var(--cb-space-10)' }}>Loading...</div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--cb-space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 'var(--cb-space-2)' }}>Crisis alerts</h1>
        <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15 }}>
          Review and manage safety alerts. Message content is never displayed.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--cb-space-2)', marginBottom: 'var(--cb-space-5)' }}>
        {['all', 'triggered', 'parent_notified', 'resolved'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--cb-radius-full)',
              fontSize: 13,
              fontWeight: 500,
              border: '1px solid var(--cb-border)',
              background: filter === f ? 'var(--cb-text-primary)' : 'var(--cb-bg-elevated)',
              color: filter === f ? 'var(--cb-bg-elevated)' : 'var(--cb-text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--cb-transition-fast)',
              textTransform: 'capitalize',
            }}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{
          background: 'var(--cb-bg-elevated)',
          border: '1px solid var(--cb-border)',
          borderRadius: 'var(--cb-radius-xl)',
          padding: 'var(--cb-space-10)',
          textAlign: 'center',
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--cb-radius-full)',
            background: 'var(--cb-positive-soft)',
            color: 'var(--cb-positive)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--cb-space-4)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 'var(--cb-space-2)' }}>No alerts</h3>
          <p style={{ fontSize: 14, color: 'var(--cb-text-secondary)' }}>
            No {filter !== 'all' ? filter.replace('_', ' ') : ''} alerts found.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-3)' }}>
          {filtered.map(alert => (
            <Link
              key={alert.id}
              to={`/alerts/${alert.id}`}
              style={{
                background: 'var(--cb-bg-elevated)',
                border: '1px solid var(--cb-border)',
                borderRadius: 'var(--cb-radius-xl)',
                padding: 'var(--cb-space-5)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                transition: 'box-shadow var(--cb-transition-fast)',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--cb-shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--cb-space-4)' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--cb-radius-md)',
                  background: `color-mix(in srgb, ${severityColor(alert.severity)} 12%, transparent)`,
                  color: severityColor(alert.severity),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-2)', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{alert.teen_name}</span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 'var(--cb-radius-sm)',
                      background: `color-mix(in srgb, ${severityColor(alert.severity)} 12%, transparent)`,
                      color: severityColor(alert.severity),
                      textTransform: 'uppercase',
                    }}>
                      {alert.severity}
                    </span>
                    <span style={{
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 'var(--cb-radius-sm)',
                      background: alert.status === 'resolved' ? 'var(--cb-positive-soft)' : 'var(--cb-warning-soft)',
                      color: alert.status === 'resolved' ? 'var(--cb-positive)' : 'var(--cb-warning)',
                      textTransform: 'capitalize',
                    }}>
                      {alert.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--cb-text-secondary)', lineHeight: 1.5, marginBottom: 'var(--cb-space-2)' }}>
                    {alert.context_summary}
                  </p>
                  <div style={{ fontSize: 12, color: 'var(--cb-text-quaternary)' }}>
                    {new Date(alert.created_at).toLocaleString()}
                    {alert.resolved_at && ` · Resolved ${new Date(alert.resolved_at).toLocaleString()}`}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
