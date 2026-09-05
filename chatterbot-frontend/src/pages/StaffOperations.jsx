import { useCallback, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  MessageCircle,
  ShieldCheck,
  Users,
} from 'lucide-react'

import { staffApi } from '@/services/api.js'
import './StaffOperations.css'

const metricCards = (metrics) => [
  {
    label: 'Families ready',
    value: metrics?.activation?.families_ready ?? 0,
    detail: `${metrics?.activation?.family_readiness_rate ?? 0}% of enrolled families`,
    icon: Users,
  },
  {
    label: 'Engaged teens',
    value: metrics?.engagement?.engaged_teens ?? 0,
    detail: `${metrics?.engagement?.inbound_messages ?? 0} inbound messages`,
    icon: MessageCircle,
  },
  {
    label: 'Safety alerts',
    value: metrics?.safety?.alerts_created ?? 0,
    detail: `${metrics?.safety?.resolution_rate ?? 0}% resolved`,
    icon: ShieldCheck,
  },
  {
    label: 'Provider failures',
    value: metrics?.reliability?.provider_failures ?? 0,
    detail: `${metrics?.reliability?.open_operational_events ?? 0} open events`,
    icon: Activity,
  },
]

export default function StaffOperations() {
  const navigate = useNavigate()
  const profile = staffApi.profile()
  const [metrics, setMetrics] = useState(null)
  const [operations, setOperations] = useState([])
  const [pilot, setPilot] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    try {
      const [metricData, operationData, pilotData] = await Promise.all([
        staffApi.getMetrics(30),
        staffApi.getOperations(),
        staffApi.getPilot(),
      ])
      setMetrics(metricData)
      setOperations(operationData.events || [])
      setPilot(pilotData)
      setError('')
    } catch (requestError) {
      if (requestError.status === 401) {
        staffApi.setAccessToken(null)
        navigate('/staff', { replace: true })
        return
      }
      setError(requestError.message || 'Unable to load pilot operations')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    load()
  }, [load])

  if (!staffApi.hasSession()) {
    return <Navigate to="/staff" replace />
  }

  const resolveEvent = async (event) => {
    const note = window.prompt('Add a short resolution note')
    if (!note?.trim()) return
    setBusyId(event.id)
    try {
      await staffApi.resolveOperation(event.id, note.trim())
      await load()
    } catch (requestError) {
      setError(requestError.message || 'Unable to resolve this event')
    } finally {
      setBusyId(null)
    }
  }

  const togglePilot = async () => {
    const nextEnabled = !pilot.enabled
    const reason = window.prompt(
      nextEnabled
        ? 'Why is the pilot resuming?'
        : 'Why is the pilot being paused?'
    )
    if (!reason?.trim()) return
    try {
      await staffApi.updatePilot(nextEnabled, reason.trim())
      await load()
    } catch (requestError) {
      setError(requestError.message || 'Unable to update the pilot')
    }
  }

  const logout = async () => {
    await staffApi.logout()
    navigate('/staff', { replace: true })
  }

  return (
    <main className="staff-console">
      <header className="staff-console__header">
        <div>
          <span className="staff-console__eyebrow">
            Controlled family pilot
          </span>
          <h1>Operations center</h1>
          <p>
            Privacy safe signals for launch decisions and incident response.
          </p>
        </div>
        <div className="staff-console__identity">
          <div>
            <strong>{profile?.name || 'Staff member'}</strong>
            <span>{profile?.role || 'staff'}</span>
          </div>
          <button onClick={logout} aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {error && (
        <div className="staff-console__error" role="alert">
          {error}
        </div>
      )}

      <section className="staff-console__status">
        <div
          className={`staff-console__pilot ${pilot?.enabled ? 'is-live' : 'is-paused'}`}
        >
          {pilot?.enabled ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}
          <div>
            <strong>{pilot?.enabled ? 'Pilot active' : 'Pilot paused'}</strong>
            <span>{pilot?.reason || 'No status note recorded'}</span>
          </div>
          {profile?.role === 'admin' && (
            <button onClick={togglePilot}>
              {pilot?.enabled ? 'Pause pilot' : 'Resume pilot'}
            </button>
          )}
        </div>
      </section>

      <section
        className="staff-console__metrics"
        aria-label="Thirty day pilot metrics"
      >
        {metricCards(metrics).map(({ label, value, detail, icon: Icon }) => (
          <article key={label}>
            <div className="staff-console__metric-icon">
              <Icon size={19} />
            </div>
            <span>{label}</span>
            <strong>{loading ? '…' : value}</strong>
            <small>{detail}</small>
          </article>
        ))}
      </section>

      <section className="staff-console__queue">
        <div className="staff-console__section-heading">
          <div>
            <span>Live queue</span>
            <h2>Operational events</h2>
          </div>
          <button onClick={load}>Refresh</button>
        </div>
        {operations.length === 0 ? (
          <div className="staff-console__empty">
            <CheckCircle2 size={24} />
            <strong>No open events</strong>
            <span>The operational queue is clear.</span>
          </div>
        ) : (
          <div className="staff-console__event-list">
            {operations.map((event) => (
              <article key={event.id}>
                <div className={`staff-console__severity is-${event.severity}`}>
                  {event.severity}
                </div>
                <div className="staff-console__event-copy">
                  <strong>{event.code.replaceAll('_', ' ')}</strong>
                  <span>
                    {event.category} · {event.source}
                  </span>
                  <small>{new Date(event.created_at).toLocaleString()}</small>
                </div>
                {['operator', 'safety_lead', 'admin'].includes(
                  profile?.role
                ) && (
                  <button
                    disabled={busyId === event.id}
                    onClick={() => resolveEvent(event)}
                  >
                    {busyId === event.id ? 'Saving…' : 'Resolve'}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
