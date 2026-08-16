import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'

const MOCK_TEEN_DETAIL = {
  teen: { id: 1, first_name: 'Maya', phone: '+1 (555) 123-4567', age: 16, grade: '11th', interests: ['lacrosse', 'debate', 'music'], schedule: { lacrosse: 'Mon/Wed 4:30pm', debate: 'Tue/Thu 3:00pm' }, is_active: true, consent_verified: true, proactive_nudges_enabled: true, nudge_frequency: 'moderate', crisis_keywords_enabled: true },
  dashboard_summary: { mood_score: 72, mood_label: 'positive', message_count_7d: 187, activity_by_day: { Mon: 25, Tue: 32, Wed: 18, Thu: 28, Fri: 35, Sat: 22, Sun: 27 } },
  conversations: [
    { id: 1, started_at: '2026-08-13T06:00:00Z', last_message_at: '2026-08-13T07:30:00Z', message_count: 12, is_crisis_flagged: false },
    { id: 2, started_at: '2026-08-12T18:00:00Z', last_message_at: '2026-08-12T22:00:00Z', message_count: 8, is_crisis_flagged: false },
  ],
  alerts: [],
}

export default function TeenDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [nudgeMsg, setNudgeMsg] = useState('')
  const [sendingNudge, setSendingNudge] = useState(false)

  useEffect(() => {
    api.getTeen(id)
      .then(setData)
      .catch(() => setData(MOCK_TEEN_DETAIL))
      .finally(() => setLoading(false))
  }, [id])

  const handleUpdate = async (updates) => {
    setSaving(true)
    try {
      const res = await api.updateTeen(id, updates)
      setData(prev => ({ ...prev, teen: res.teen }))
    } catch (err) {
      alert(err.data?.error || 'Update failed')
    }
    setSaving(false)
  }

  const handleNudge = async (e) => {
    e.preventDefault()
    setSendingNudge(true)
    try {
      await api.sendNudge(id, nudgeMsg)
      setNudgeMsg('')
      alert('Nudge sent!')
    } catch (err) {
      alert(err.data?.error || 'Failed to send nudge')
    }
    setSendingNudge(false)
  }

  if (loading) return <div style={{ color: 'var(--cb-text-tertiary)', textAlign: 'center', padding: 'var(--cb-space-10)' }}>Loading...</div>
  if (!data) return <div style={{ color: 'var(--cb-text-tertiary)', textAlign: 'center' }}>Teen not found</div>

  const { teen, dashboard_summary, conversations, alerts } = data
  const moodColor = dashboard_summary.mood_score >= 70 ? 'var(--cb-positive)' : dashboard_summary.mood_score >= 40 ? 'var(--cb-warning)' : 'var(--cb-danger)'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => navigate('/teens')} style={{
        fontSize: 14,
        color: 'var(--cb-text-secondary)',
        marginBottom: 'var(--cb-space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--cb-space-2)',
      }}>
        <ArrowLeft /> Back to teens
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-4)', marginBottom: 'var(--cb-space-6)' }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--cb-bg-strong)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          fontWeight: 600,
        }}>
          {teen.first_name[0]}
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>{teen.first_name}</h1>
          <p style={{ color: 'var(--cb-text-tertiary)', fontSize: 14 }}>{teen.grade} · {teen.age} years old · {teen.phone}</p>
        </div>
        <div style={{
          marginLeft: 'auto',
          padding: '6px 14px',
          borderRadius: 'var(--cb-radius-full)',
          fontSize: 13,
          fontWeight: 600,
          background: `color-mix(in srgb, ${moodColor} 12%, transparent)`,
          color: moodColor,
        }}>
          {dashboard_summary.mood_label} · {dashboard_summary.mood_score}%
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'var(--cb-bg-elevated)',
        border: '1px solid var(--cb-border)',
        borderRadius: 'var(--cb-radius-xl)',
        padding: 'var(--cb-space-5)',
        marginBottom: 'var(--cb-space-5)',
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 'var(--cb-space-4)' }}>Send a proactive nudge</h3>
        <form onSubmit={handleNudge} style={{ display: 'flex', gap: 'var(--cb-space-3)' }}>
          <input
            value={nudgeMsg}
            onChange={e => setNudgeMsg(e.target.value)}
            placeholder={`Hey ${teen.first_name}! Just checking in...`}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--cb-radius-lg)',
              border: '1px solid var(--cb-border)',
              background: 'var(--cb-bg)',
              color: 'var(--cb-text-primary)',
              fontSize: 15,
              outline: 'none',
            }}
          />
          <button type="submit" disabled={sendingNudge || !nudgeMsg.trim()} style={{
            padding: '10px 18px',
            borderRadius: 'var(--cb-radius-lg)',
            background: 'var(--cb-text-primary)',
            color: 'var(--cb-bg-elevated)',
            fontSize: 14,
            fontWeight: 500,
            border: 'none',
            opacity: sendingNudge || !nudgeMsg.trim() ? 0.6 : 1,
          }}>
            {sendingNudge ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>

      {/* Settings */}
      <div style={{
        background: 'var(--cb-bg-elevated)',
        border: '1px solid var(--cb-border)',
        borderRadius: 'var(--cb-radius-xl)',
        padding: 'var(--cb-space-5)',
        marginBottom: 'var(--cb-space-5)',
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 'var(--cb-space-4)' }}>Settings</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-4)' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Proactive nudges</div>
              <div style={{ fontSize: 13, color: 'var(--cb-text-tertiary)' }}>Allow Chatterbot to text first</div>
            </div>
            <Toggle
              checked={teen.proactive_nudges_enabled}
              onChange={() => handleUpdate({ proactive_nudges_enabled: !teen.proactive_nudges_enabled })}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Crisis keyword detection</div>
              <div style={{ fontSize: 13, color: 'var(--cb-text-tertiary)' }}>Monitor for self-harm and bullying language</div>
            </div>
            <Toggle
              checked={teen.crisis_keywords_enabled}
              onChange={() => handleUpdate({ crisis_keywords_enabled: !teen.crisis_keywords_enabled })}
            />
          </label>

          <div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 'var(--cb-space-2)' }}>Nudge frequency</div>
            <select
              value={teen.nudge_frequency}
              onChange={e => handleUpdate({ nudge_frequency: e.target.value })}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--cb-radius-md)',
                border: '1px solid var(--cb-border)',
                background: 'var(--cb-bg)',
                color: 'var(--cb-text-primary)',
                fontSize: 14,
              }}
            >
              <option value="low">Low (1-2 per day)</option>
              <option value="moderate">Moderate (3-4 per day)</option>
              <option value="high">High (5+ per day)</option>
            </select>
          </div>

          {saving && <span style={{ fontSize: 12, color: 'var(--cb-text-tertiary)' }}>Saving...</span>}
        </div>
      </div>

      {/* Conversations (privacy-safe) */}
      <div style={{
        background: 'var(--cb-bg-elevated)',
        border: '1px solid var(--cb-border)',
        borderRadius: 'var(--cb-radius-xl)',
        padding: 'var(--cb-space-5)',
        marginBottom: 'var(--cb-space-5)',
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 'var(--cb-space-4)' }}>Recent conversations</h3>
        <p style={{ fontSize: 13, color: 'var(--cb-text-tertiary)', marginBottom: 'var(--cb-space-4)' }}>
          Message content is never displayed to protect {teen.first_name}'s privacy.
        </p>
        {conversations.length === 0 ? (
          <p style={{ color: 'var(--cb-text-tertiary)', fontSize: 14 }}>No conversations yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-3)' }}>
            {conversations.map(conv => (
              <div key={conv.id} style={{
                padding: 'var(--cb-space-4)',
                borderRadius: 'var(--cb-radius-lg)',
                background: 'var(--cb-bg-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {conv.message_count} messages
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--cb-text-tertiary)', marginTop: 2 }}>
                    Last active {new Date(conv.last_message_at).toLocaleDateString()}
                  </div>
                </div>
                {conv.is_crisis_flagged && (
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--cb-radius-sm)',
                    background: 'var(--cb-danger-soft)',
                    color: 'var(--cb-danger)',
                    fontSize: 12,
                    fontWeight: 500,
                  }}>
                    Crisis flagged
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{
          background: 'var(--cb-bg-elevated)',
          border: '1px solid var(--cb-border)',
          borderRadius: 'var(--cb-radius-xl)',
          padding: 'var(--cb-space-5)',
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 'var(--cb-space-4)' }}>Crisis alerts</h3>
          {alerts.map(alert => (
            <div key={alert.id} style={{
              padding: 'var(--cb-space-4)',
              borderRadius: 'var(--cb-radius-lg)',
              background: 'var(--cb-danger-soft)',
              marginBottom: 'var(--cb-space-3)',
            }}>
              <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--cb-danger)', marginBottom: 2 }}>
                {alert.severity} alert
              </div>
              <div style={{ fontSize: 13, color: 'var(--cb-text-secondary)' }}>
                {alert.context_summary}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: 44,
        height: 24,
        borderRadius: 'var(--cb-radius-full)',
        background: checked ? 'var(--cb-text-primary)' : 'var(--cb-bg-strong)',
        position: 'relative',
        transition: 'background var(--cb-transition-fast)',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: 'white',
        position: 'absolute',
        top: 2,
        left: checked ? 22 : 2,
        transition: 'left var(--cb-transition-fast)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
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
