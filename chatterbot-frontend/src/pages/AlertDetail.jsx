import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'

const MOCK_ALERT = {
  id: 1,
  teen_id: 1,
  teen_name: 'Maya',
  status: 'parent_notified',
  severity: 'medium',
  keywords_matched: ['stressed', 'overwhelmed', "can't take it"],

  context_summary: 'Chatterbot detected signs of academic stress from Maya around a history paper deadline. The AI provided supportive guidance and broke down the assignment into smaller tasks. No self-harm language was detected.',
  parent_notified_at: '2026-08-10T14:31:00Z',
  created_at: '2026-08-10T14:30:00Z',
}

export default function AlertDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(false)
  const [acknowledging, setAcknowledging] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    api.getAlert(id)
      .then(data => setAlert(data.alert))
      .catch(() => setAlert(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleAcknowledge = async () => {
    setAcknowledging(true)
    try {
      const data = await api.acknowledgeAlert(id, notes)
      setAlert(data.alert)
    } catch (err) {
      alert(err.data?.error || 'Failed to acknowledge alert')
    } finally {
      setAcknowledging(false)
    }
  }

  const handleResolve = async () => {
    setResolving(true)
    try {
      await api.resolveAlert(id, notes)
      setAlert(prev => ({ ...prev, status: 'resolved', resolved_at: new Date().toISOString() }))
    } catch (err) {
      alert(err.data?.error || 'Failed to resolve')
    } finally {
      setResolving(false)
    }
  }

  if (loading) return <div style={{ color: 'var(--cb-text-tertiary)', textAlign: 'center', padding: 'var(--cb-space-10)' }}>Loading...</div>
  if (!alert) return <div style={{ color: 'var(--cb-text-tertiary)', textAlign: 'center' }}>Alert not found</div>

  const severityColor = alert.severity === 'critical' || alert.severity === 'high' ? 'var(--cb-danger)' : 'var(--cb-warning)'

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <button onClick={() => navigate('/dashboard/alerts')} style={{
        fontSize: 14, color: 'var(--cb-text-secondary)', marginBottom: 'var(--cb-space-4)',
        display: 'flex', alignItems: 'center', gap: 'var(--cb-space-2)',
      }}>
        <ArrowLeft /> Back to alerts
      </button>

      <div style={{
        background: 'var(--cb-bg-elevated)',
        border: '1px solid var(--cb-border)',
        borderRadius: 'var(--cb-radius-xl)',
        padding: 'var(--cb-space-6)',
        marginBottom: 'var(--cb-space-5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-3)', marginBottom: 'var(--cb-space-5)' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 'var(--cb-radius-lg)',
            background: `color-mix(in srgb, ${severityColor} 12%, transparent)`,
            color: severityColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600 }}>
              {alert.severity === 'critical' ? 'Critical alert' : 'Safety alert'} — {alert.teen_name}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--cb-text-tertiary)', marginTop: 2 }}>
              Alert #{alert.id} · {new Date(alert.created_at).toLocaleString()}
            </p>
          </div>
          <span style={{
            marginLeft: 'auto',
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 'var(--cb-radius-full)',
            background: alert.status === 'resolved' ? 'var(--cb-positive-soft)' : 'var(--cb-danger-soft)',
            color: alert.status === 'resolved' ? 'var(--cb-positive)' : 'var(--cb-danger)',
            textTransform: 'capitalize',
          }}>
            {alert.status.replace('_', ' ')}
          </span>
        </div>

        <div style={{ marginBottom: 'var(--cb-space-5)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--cb-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--cb-space-3)' }}>
            Context summary
          </h3>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--cb-text-secondary)' }}>
            {alert.context_summary}
          </p>
        </div>

        <div style={{ marginBottom: 'var(--cb-space-5)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--cb-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--cb-space-3)' }}>
            Keywords detected
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--cb-space-2)' }}>
            {alert.keywords_matched.map(kw => (
              <span key={kw} style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 'var(--cb-radius-sm)',
                background: 'var(--cb-bg-muted)',
                color: 'var(--cb-text-secondary)',
                fontFamily: 'monospace',
              }}>
                {kw}
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 'var(--cb-space-5)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--cb-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--cb-space-3)' }}>
            Notification log
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-3)', fontSize: 14 }}>
              <CheckIcon />
              <span>Chatterbot detected concerning language</span>
              <span style={{ marginLeft: 'auto', color: 'var(--cb-text-tertiary)', fontSize: 12 }}>
                {new Date(alert.created_at).toLocaleTimeString()}
              </span>
            </div>
            {alert.parent_notified_at && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-3)', fontSize: 14 }}>
                <CheckIcon />
                <span>Parent notified via SMS</span>
                <span style={{ marginLeft: 'auto', color: 'var(--cb-text-tertiary)', fontSize: 12 }}>
                  {new Date(alert.parent_notified_at).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {alert.status !== 'resolved' && (
          <div style={{
            borderTop: '1px solid var(--cb-border)',
            paddingTop: 'var(--cb-space-5)',
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--cb-space-3)' }}>Resolve alert</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add resolution notes (optional)..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--cb-radius-lg)',
                border: '1px solid var(--cb-border)',
                background: 'var(--cb-bg)',
                color: 'var(--cb-text-primary)',
                fontSize: 14,
                resize: 'vertical',
                marginBottom: 'var(--cb-space-3)',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 'var(--cb-space-3)', flexWrap: 'wrap' }}>
            {alert.status !== 'acknowledged' && <button
              onClick={handleAcknowledge}
              disabled={acknowledging}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--cb-radius-lg)',
                background: 'var(--cb-primary)',
                color: 'white',
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
              }}
            >
              {acknowledging ? 'Acknowledging...' : 'Acknowledge alert'}
            </button>}
            <button
              onClick={handleResolve}
              disabled={resolving}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--cb-radius-lg)',
                background: 'var(--cb-positive)',
                color: 'white',
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
                opacity: resolving ? 0.7 : 1,
                cursor: resolving ? 'not-allowed' : 'pointer',
              }}
            >
              {resolving ? 'Resolving...' : 'Mark as resolved'}
            </button>
            </div>
          </div>
        )}

        {alert.status === 'resolved' && alert.resolved_at && (
          <div style={{
            borderTop: '1px solid var(--cb-border)',
            paddingTop: 'var(--cb-space-5)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--cb-space-3)',
          }}>
            <CheckIcon color="var(--cb-positive)" />
            <span style={{ fontSize: 14, color: 'var(--cb-positive)', fontWeight: 500 }}>
              Resolved on {new Date(alert.resolved_at).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function CheckIcon({ color = 'var(--cb-positive)' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
