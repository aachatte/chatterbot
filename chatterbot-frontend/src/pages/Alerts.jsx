import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'

const VIEW_STORAGE_KEY = 'cb_alert_saved_views'
const OWNER_STORAGE_KEY = 'cb_alert_owner_map'

function loadSavedViews() {
  try {
    return JSON.parse(localStorage.getItem(VIEW_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function loadOwnerMap() {
  try {
    return JSON.parse(localStorage.getItem(OWNER_STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function urgencyFrom(alert) {
  if (alert.status === 'triggered' || alert.severity === 'critical') return 'Immediate'
  if (alert.status === 'parent_notified' || alert.severity === 'high') return 'High'
  if (alert.status === 'acknowledged') return 'Medium'
  return 'Low'
}

function confidenceFrom(alert) {
  const base = alert.severity === 'critical' ? 92 : alert.severity === 'high' ? 84 : alert.severity === 'medium' ? 73 : 62
  return `${base}%`
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [bulkNotes, setBulkNotes] = useState('')
  const [bulkBusy, setBulkBusy] = useState(false)
  const [savedViews, setSavedViews] = useState(loadSavedViews)
  const [ownerMap, setOwnerMap] = useState(loadOwnerMap)
  const [viewName, setViewName] = useState('')
  const [playbook, setPlaybook] = useState('checkin_call')
  const [followUpAt, setFollowUpAt] = useState('')
  const [banner, setBanner] = useState('')

  useEffect(() => {
    api.getAlerts()
      .then(data => setAlerts(data.alerts || []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(savedViews))
  }, [savedViews])

  useEffect(() => {
    localStorage.setItem(OWNER_STORAGE_KEY, JSON.stringify(ownerMap))
  }, [ownerMap])

  const filtered = useMemo(() => {
    return alerts.filter((alert) => {
      if (statusFilter !== 'all' && alert.status !== statusFilter) return false
      if (severityFilter !== 'all' && alert.severity !== severityFilter) return false
      const target = `${alert.teen_name || ''} ${alert.context_summary || ''} ${alert.status || ''}`.toLowerCase()
      return target.includes(search.trim().toLowerCase())
    })
  }, [alerts, statusFilter, severityFilter, search])

  const allVisibleSelected = filtered.length > 0 && filtered.every((a) => selected.includes(a.id))

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(filtered.map((a) => a.id))
      setSelected((prev) => prev.filter((id) => !visibleIds.has(id)))
      return
    }
    const merged = new Set([...selected, ...filtered.map((a) => a.id)])
    setSelected([...merged])
  }

  const applyBulkAction = async (action) => {
    if (selected.length === 0 || bulkBusy) return
    setBulkBusy(true)
    try {
      for (const id of selected) {
        if (action === 'acknowledge') {
          await api.acknowledgeAlert(id, bulkNotes)
        } else {
          await api.resolveAlert(id, bulkNotes)
        }
      }
      const refreshed = await api.getAlerts()
      setAlerts(refreshed.alerts || [])
      setBanner(`${selected.length} alert${selected.length > 1 ? 's' : ''} ${action === 'acknowledge' ? 'acknowledged' : 'resolved'}.`)
      setSelected([])
      setBulkNotes('')
    } catch (error) {
      setBanner(error?.data?.error || 'Bulk action failed.')
    } finally {
      setBulkBusy(false)
    }
  }

  const saveCurrentView = () => {
    const name = viewName.trim()
    if (!name) return
    const next = [
      ...savedViews.filter((view) => view.name !== name),
      { name, statusFilter, severityFilter, search },
    ]
    setSavedViews(next)
    setViewName('')
    setBanner(`Saved view "${name}".`)
  }

  const applySavedView = (view) => {
    setStatusFilter(view.statusFilter)
    setSeverityFilter(view.severityFilter)
    setSearch(view.search)
    setBanner(`Applied view "${view.name}".`)
  }

  if (loading) return <div style={{ color: 'var(--cb-text-tertiary)', textAlign: 'center', padding: 'var(--cb-space-10)' }}>Loading triage workspace...</div>

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--cb-space-5)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 6 }}>Alert triage workspace</h1>
        <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15 }}>
          Triage by urgency, assign owners, apply bulk workflows, and run structured response playbooks.
        </p>
      </div>

      {banner && (
        <div role="status" style={{ marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid var(--cb-border)', background: 'var(--cb-bg-muted)', color: 'var(--cb-text-secondary)' }}>
          {banner}
        </div>
      )}

      <section style={{ background: 'var(--cb-bg-elevated)', border: '1px solid var(--cb-border)', borderRadius: 'var(--cb-radius-xl)', padding: 'var(--cb-space-4)', marginBottom: 'var(--cb-space-4)' }}>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1.5fr repeat(3, minmax(120px, 1fr))' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teen, context, status"
            aria-label="Search alerts"
            style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--cb-border)' }}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={controlStyle}>
            {['all', 'triggered', 'parent_notified', 'acknowledged', 'resolved'].map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}
          </select>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} style={controlStyle}>
            {['all', 'critical', 'high', 'medium', 'low'].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <button onClick={toggleSelectAllVisible} style={buttonGhostStyle}>
            {allVisibleSelected ? 'Clear visible' : 'Select visible'}
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          <input
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            placeholder="Save current filter view"
            style={{ ...controlStyle, minWidth: 220 }}
            aria-label="Saved view name"
          />
          <button onClick={saveCurrentView} style={buttonGhostStyle}>Save view</button>
          {savedViews.map((view) => (
            <button key={view.name} onClick={() => applySavedView(view)} style={chipButtonStyle}>{view.name}</button>
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--cb-bg-elevated)', border: '1px solid var(--cb-border)', borderRadius: 'var(--cb-radius-xl)', padding: 'var(--cb-space-4)', marginBottom: 'var(--cb-space-4)' }}>
        <h2 style={{ fontSize: 16, marginBottom: 10 }}>Bulk operations</h2>
        <textarea
          value={bulkNotes}
          onChange={(e) => setBulkNotes(e.target.value)}
          rows={2}
          placeholder="Add shared notes for selected alerts"
          style={{ width: '100%', marginBottom: 10, border: '1px solid var(--cb-border)', borderRadius: 10, padding: 10 }}
        />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button disabled={selected.length === 0 || bulkBusy} onClick={() => applyBulkAction('acknowledge')} style={buttonPrimaryStyle}>
            {bulkBusy ? 'Processing...' : `Acknowledge selected (${selected.length})`}
          </button>
          <button disabled={selected.length === 0 || bulkBusy} onClick={() => applyBulkAction('resolve')} style={buttonPositiveStyle}>
            {bulkBusy ? 'Processing...' : `Resolve selected (${selected.length})`}
          </button>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--cb-space-4)', marginBottom: 'var(--cb-space-4)' }}>
        <div style={{ background: 'var(--cb-bg-elevated)', border: '1px solid var(--cb-border)', borderRadius: 'var(--cb-radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: 12, borderBottom: '1px solid var(--cb-border)', fontSize: 13, fontWeight: 600, color: 'var(--cb-text-tertiary)', display: 'grid', gridTemplateColumns: '40px 1.4fr 0.8fr 0.8fr 0.8fr 0.8fr' }}>
            <span />
            <span>Alert</span>
            <span>Status</span>
            <span>Urgency</span>
            <span>Confidence</span>
            <span>Owner</span>
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--cb-text-secondary)' }}>No alerts match this triage view.</div>
          ) : (
            filtered.map((alert) => (
              <div key={alert.id} style={{ padding: 12, display: 'grid', gridTemplateColumns: '40px 1.4fr 0.8fr 0.8fr 0.8fr 0.8fr', gap: 8, borderTop: '1px solid var(--cb-border)', alignItems: 'center' }}>
                <input type="checkbox" checked={selected.includes(alert.id)} onChange={() => toggleSelect(alert.id)} aria-label={`Select alert ${alert.id}`} />
                <div>
                  <Link to={`/dashboard/alerts/${alert.id}`} style={{ fontWeight: 600, textDecoration: 'none', color: 'var(--cb-text-primary)' }}>
                    {alert.teen_name} · {alert.severity} alert
                  </Link>
                  <div style={{ fontSize: 12, color: 'var(--cb-text-secondary)' }}>{alert.context_summary}</div>
                </div>
                <span style={statusBadgeStyle(alert.status)}>{alert.status.replace('_', ' ')}</span>
                <span style={{ fontSize: 13 }}>{urgencyFrom(alert)}</span>
                <span style={{ fontSize: 13 }}>{confidenceFrom(alert)}</span>
                <select
                  value={ownerMap[alert.id] || 'unassigned'}
                  onChange={(event) => setOwnerMap((prev) => ({ ...prev, [alert.id]: event.target.value }))}
                  style={controlStyle}
                >
                  <option value="unassigned">Unassigned</option>
                  <option value="primary_guardian">Primary guardian</option>
                  <option value="support_guardian">Support guardian</option>
                  <option value="counselor">Counselor</option>
                </select>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-4)' }}>
          <div style={{ background: 'var(--cb-bg-elevated)', border: '1px solid var(--cb-border)', borderRadius: 'var(--cb-radius-xl)', padding: 14 }}>
            <h3 style={{ marginBottom: 8, fontSize: 15 }}>Resolution playbook</h3>
            <select value={playbook} onChange={(e) => setPlaybook(e.target.value)} style={{ ...controlStyle, width: '100%', marginBottom: 10 }}>
              <option value="checkin_call">Immediate guardian check-in call</option>
              <option value="school_escalation">School counselor escalation</option>
              <option value="wellness_plan">72-hour wellness follow-up plan</option>
            </select>
            <label style={{ fontSize: 12, color: 'var(--cb-text-secondary)' }}>
              Follow-up reminder
              <input
                type="datetime-local"
                value={followUpAt}
                onChange={(e) => setFollowUpAt(e.target.value)}
                style={{ ...controlStyle, width: '100%', marginTop: 6 }}
              />
            </label>
            <p style={{ marginTop: 10, fontSize: 12, color: 'var(--cb-text-secondary)' }}>
              Suggested step: {playbook === 'checkin_call' ? 'Call guardian/teen now and capture acknowledgement notes.' : playbook === 'school_escalation' ? 'Prepare counselor brief with privacy-safe summary and status timeline.' : 'Schedule two check-ins over 72h and monitor status transitions.'}
            </p>
          </div>

          <div style={{ background: 'var(--cb-bg-elevated)', border: '1px solid var(--cb-border)', borderRadius: 'var(--cb-radius-xl)', padding: 14 }}>
            <h3 style={{ marginBottom: 8, fontSize: 15 }}>Escalation ladder</h3>
            <ol style={{ margin: 0, paddingLeft: 16, color: 'var(--cb-text-secondary)', lineHeight: 1.6 }}>
              <li>Guardian triage and acknowledgement</li>
              <li>Teen check-in and supportive intervention</li>
              <li>Counselor coordination if risk persists</li>
              <li>Emergency services for immediate harm risk</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}

const controlStyle = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid var(--cb-border)',
  background: 'var(--cb-bg)',
}

const buttonGhostStyle = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid var(--cb-border)',
  background: 'var(--cb-bg-elevated)',
  color: 'var(--cb-text-secondary)',
}

const chipButtonStyle = {
  ...buttonGhostStyle,
  borderRadius: 999,
  fontSize: 12,
}

const buttonPrimaryStyle = {
  padding: '10px 14px',
  border: 'none',
  borderRadius: 8,
  background: 'var(--cb-primary)',
  color: 'white',
  fontWeight: 600,
}

const buttonPositiveStyle = {
  ...buttonPrimaryStyle,
  background: 'var(--cb-positive)',
}

const statusBadgeStyle = (status) => ({
  fontSize: 11,
  textTransform: 'capitalize',
  padding: '3px 8px',
  borderRadius: 999,
  display: 'inline-block',
  color: status === 'resolved' ? 'var(--cb-positive)' : 'var(--cb-warning)',
  background: status === 'resolved' ? 'var(--cb-positive-soft)' : 'var(--cb-warning-soft)',
})
