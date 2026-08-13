import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'

/* ─── Mock data fallback ─── */
const MOCK_DATA = {
  summary: {
    teen_count: 2,
    total_messages_7d: 342,
    total_crisis_alerts: 0,
    active_alerts: 0,
  },
  teens: [
    {
      id: 1,
      first_name: 'Maya',
      age: 16,
      grade: '11th',
      mood_score: 72,
      mood_label: 'positive',
      message_count_7d: 187,
      activity_by_day: { Mon: 25, Tue: 32, Wed: 18, Thu: 28, Fri: 35, Sat: 22, Sun: 27 },
      last_interaction_at: '2026-08-13T07:30:00Z',
      crisis_alert_count: 0,
      interests: ['lacrosse', 'debate', 'music'],
    },
    {
      id: 2,
      first_name: 'Ethan',
      age: 14,
      grade: '9th',
      mood_score: 58,
      mood_label: 'neutral',
      message_count_7d: 155,
      activity_by_day: { Mon: 20, Tue: 28, Wed: 15, Thu: 22, Fri: 30, Sat: 18, Sun: 22 },
      last_interaction_at: '2026-08-12T22:15:00Z',
      crisis_alert_count: 0,
      interests: ['basketball', 'gaming', 'coding'],
    },
  ],
  recent_alerts: [],
  has_premium: true,
}

/* ─── Icons ─── */
function TeenAvatar({ name, size = 40 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'var(--cb-bg-strong)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size > 30 ? 16 : 13,
      fontWeight: 600,
      color: 'var(--cb-text-primary)',
      flexShrink: 0,
    }}>
      {name[0]}
    </div>
  )
}

function ArrowUpRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  )
}

function AlertTriangle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function CheckCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function MessageCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function ShieldCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 12 15 16 10" />
    </svg>
  )
}

/* ─── Mood Bar ─── */
function MoodBar({ score, label }) {
  const color = score >= 70 ? 'var(--cb-positive)' : score >= 40 ? 'var(--cb-warning)' : 'var(--cb-danger)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-3)' }}>
      <div style={{
        flex: 1,
        height: 8,
        borderRadius: 'var(--cb-radius-full)',
        background: 'var(--cb-bg-muted)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${score}%`,
          height: '100%',
          borderRadius: 'var(--cb-radius-full)',
          background: color,
          transition: 'width 0.6s ease-out',
        }} />
      </div>
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color,
        minWidth: 36,
        textAlign: 'right',
      }}>{score}%</span>
    </div>
  )
}

/* ─── Activity Mini Chart ─── */
function ActivityChart({ data }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const maxVal = Math.max(...Object.values(data), 1)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48 }}>
        {days.map(day => {
          const val = data[day] || 0
          const pct = (val / maxVal) * 100
          return (
            <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: '100%',
                height: `${Math.max(pct, 8)}%`,
                minHeight: 4,
                borderRadius: '2px 2px 0 0',
                background: val > 0 ? 'var(--cb-text-quaternary)' : 'var(--cb-bg-strong)',
                transition: 'height 0.3s ease-out',
              }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {days.map(d => (
          <span key={d} style={{ fontSize: 10, color: 'var(--cb-text-quaternary)', flex: 1, textAlign: 'center' }}>{d}</span>
        ))}
      </div>
    </div>
  )
}

/* ─── Stat Card ─── */
function StatCard({ icon, label, value, subtext, color }) {
  return (
    <div style={{
      background: 'var(--cb-bg-elevated)',
      border: '1px solid var(--cb-border)',
      borderRadius: 'var(--cb-radius-xl)',
      padding: 'var(--cb-space-5)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-3)', marginBottom: 'var(--cb-space-3)' }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--cb-radius-md)',
          background: `color-mix(in srgb, ${color} 12%, transparent)`,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 13, color: 'var(--cb-text-secondary)', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.1, marginBottom: 'var(--cb-space-1)' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--cb-text-tertiary)' }}>{subtext}</div>
    </div>
  )
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getOverview()
      .then(setData)
      .catch(err => {
        console.log('Using mock data:', err.message)
        setData(MOCK_DATA)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--cb-text-tertiary)' }}>
        Loading dashboard...
      </div>
    )
  }

  const { summary, teens, recent_alerts, has_premium } = data

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--cb-space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 'var(--cb-space-2)' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15 }}>
          Overview of your family's activity and wellbeing
        </p>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--cb-space-4)',
        marginBottom: 'var(--cb-space-6)',
      }}>
        <StatCard
          icon={<UsersIcon />}
          label="Active teens"
          value={summary.teen_count}
          subtext="Connected to Chatterbot"
          color="var(--cb-chart-1)"
        />
        <StatCard
          icon={<MessageCircle />}
          label="Messages (7d)"
          value={summary.total_messages_7d}
          subtext="Across all conversations"
          color="var(--cb-chart-4)"
        />
        <StatCard
          icon={summary.active_alerts > 0 ? <AlertTriangle /> : <ShieldCheck />}
          label="Crisis alerts"
          value={summary.active_alerts}
          subtext={summary.active_alerts > 0 ? 'Requires attention' : 'All clear'}
          color={summary.active_alerts > 0 ? 'var(--cb-danger)' : 'var(--cb-positive)'}
        />
        <StatCard
          icon={<CheckCircle />}
          label="Plan"
          value={has_premium ? 'Premium' : 'Free'}
          subtext={has_premium ? 'Guardian Dashboard active' : 'Upgrade for insights'}
          color="var(--cb-positive)"
        />
      </div>

      {/* Teens Grid */}
      <div style={{ marginBottom: 'var(--cb-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--cb-space-4)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 500 }}>Your teens</h2>
          <Link to="/teens" style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--cb-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--cb-space-1)',
          }}>
            View all <ArrowUpRight />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--cb-space-4)',
        }}>
          {teens.map(teen => (
            <Link
              key={teen.id}
              to={`/teens/${teen.id}`}
              style={{
                background: 'var(--cb-bg-elevated)',
                border: '1px solid var(--cb-border)',
                borderRadius: 'var(--cb-radius-xl)',
                padding: 'var(--cb-space-5)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'box-shadow var(--cb-transition-fast), border-color var(--cb-transition-fast)',
                display: 'block',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = 'var(--cb-shadow-md)'
                e.currentTarget.style.borderColor = 'var(--cb-border-strong)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'var(--cb-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-3)', marginBottom: 'var(--cb-space-4)' }}>
                <TeenAvatar name={teen.first_name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{teen.first_name}</div>
                  <div style={{ fontSize: 13, color: 'var(--cb-text-tertiary)' }}>
                    {teen.grade} · {teen.age} years old
                  </div>
                </div>
                <div style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--cb-radius-full)',
                  fontSize: 12,
                  fontWeight: 500,
                  background: teen.mood_label === 'positive' ? 'var(--cb-positive-soft)' :
                    teen.mood_label === 'neutral' ? 'var(--cb-warning-soft)' : 'var(--cb-danger-soft)',
                  color: teen.mood_label === 'positive' ? 'var(--cb-positive)' :
                    teen.mood_label === 'neutral' ? 'var(--cb-warning)' : 'var(--cb-danger)',
                }}>
                  {teen.mood_label}
                </div>
              </div>

              <div style={{ marginBottom: 'var(--cb-space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--cb-space-2)' }}>
                  <span style={{ fontSize: 12, color: 'var(--cb-text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Weekly mood
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--cb-text-tertiary)' }}>
                    {teen.message_count_7d} messages
                  </span>
                </div>
                <MoodBar score={teen.mood_score} label={teen.mood_label} />
              </div>

              <ActivityChart data={teen.activity_by_day} />

              {teen.interests?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--cb-space-2)', marginTop: 'var(--cb-space-4)' }}>
                  {teen.interests.map(interest => (
                    <span key={interest} style={{
                      fontSize: 12,
                      padding: '4px 10px',
                      borderRadius: 'var(--cb-radius-sm)',
                      background: 'var(--cb-bg-muted)',
                      color: 'var(--cb-text-secondary)',
                      fontWeight: 500,
                    }}>
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      {recent_alerts.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--cb-space-4)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 500 }}>Recent alerts</h2>
            <Link to="/alerts" style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--cb-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--cb-space-1)',
            }}>
              View all <ArrowUpRight />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-3)' }}>
            {recent_alerts.map(alert => (
              <Link
                key={alert.id}
                to={`/alerts/${alert.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--cb-space-3)',
                  padding: 'var(--cb-space-4)',
                  borderRadius: 'var(--cb-radius-lg)',
                  background: 'var(--cb-bg-elevated)',
                  border: '1px solid var(--cb-border)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--cb-radius-md)',
                  background: 'var(--cb-danger-soft)',
                  color: 'var(--cb-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <AlertTriangle />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>
                    {alert.severity === 'critical' ? 'Critical alert' : 'Safety alert'} — {alert.teen_name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--cb-text-secondary)', lineHeight: 1.4 }}>
                    {alert.context_summary}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--cb-text-tertiary)', marginTop: 'var(--cb-space-2)' }}>
                    {new Date(alert.created_at).toLocaleString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recent_alerts.length === 0 && (
        <div style={{
          background: 'var(--cb-bg-elevated)',
          border: '1px solid var(--cb-border)',
          borderRadius: 'var(--cb-radius-xl)',
          padding: 'var(--cb-space-8)',
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
            <ShieldCheck />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 'var(--cb-space-2)' }}>
            All clear
          </h3>
          <p style={{ fontSize: 14, color: 'var(--cb-text-secondary)', maxWidth: 400, margin: '0 auto' }}>
            No crisis alerts have been triggered. Chatterbot is actively monitoring for safety keywords and will notify you immediately if anything concerning is detected.
          </p>
        </div>
      )}
    </div>
  )
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
