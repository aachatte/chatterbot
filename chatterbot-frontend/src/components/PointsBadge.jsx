import React, { useEffect, useState } from 'react'
import { fetchMyGamification, claimDailyLoginReward } from '../services/gamification.js'
import './PointsBadge.css'

export default function PointsBadge() {
  const [state, setState] = useState({ loading: true, error: null, data: null })
  useEffect(() => {
    let mounted = true
    fetchMyGamification()
      .then((d) => mounted && setState({ loading: false, error: null, data: d }))
      .catch((err) => {
        // Silently handle error - don't break the dashboard
        if (mounted) {
          setState({ loading: false, error: null, data: { points: 0, level: 1, streak_count: 0, badges: [] } })
        }
      })
    return () => { mounted = false }
  }, [])

  const claim = async () => {
    try {
      setState((s) => ({ ...s, loading: true }))
      const res = await claimDailyLoginReward()
      // refresh
      const latest = await fetchMyGamification()
      setState({ loading: false, error: null, data: latest })
      // small feedback (replace with in-app toasts if available)
      alert(res.message || 'Reward claimed')
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message || 'Claim failed' }))
    }
  }

  if (state.loading) return <div className="points-badge">Loading gamification…</div>
  if (state.error) return null // Don't display error, just hide the widget

  const { points = 0, level = 1, streak_count = 0, badges = [] } = state.data || {}

  return (
    <div className="points-badge">
      <div className="points-header">
        <div className="points-value">{points}</div>
        <div className="points-meta">Level {level} • Streak {streak_count}d</div>
      </div>

      <div className="points-actions">
        <button className="btn btn--sm" onClick={claim}>Claim daily login</button>
      </div>

      <div className="badge-list">
        {badges.length === 0 ? <div className="badge-empty">No badges yet</div> : badges.map((b) => (
          <div key={b.code} className="badge-item" title={b.description}>
            {b.icon ? <img src={b.icon} alt={b.name} /> : <div className="badge-fallback">{b.name[0]}</div>}
            <div className="badge-name">{b.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
