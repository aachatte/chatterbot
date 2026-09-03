import React, { useEffect, useState } from 'react'
import { fetchMyGamification, claimDailyLoginReward } from '../services/gamification.js'
import dailySparkBadge from '../assets/badges/daily-spark.webp'
import calmNavigatorBadge from '../assets/badges/calm-navigator.webp'
import momentumMakerBadge from '../assets/badges/momentum-maker.webp'
import './PointsBadge.css'

const MASCOTS = [
  { name: 'Daily Spark', image: dailySparkBadge },
  { name: 'Calm Navigator', image: calmNavigatorBadge },
  { name: 'Momentum Maker', image: momentumMakerBadge },
]

function pickMascot(seed) {
  const text = String(seed || '')
  const total = text.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return MASCOTS[total % MASCOTS.length]
}

export default function PointsBadge() {
  const [state, setState] = useState({ loading: true, error: null, data: null })
  const [claiming, setClaiming] = useState(false)
  const [feedback, setFeedback] = useState('')
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
      setClaiming(true)
      setFeedback('')
      const res = await claimDailyLoginReward()
      const latest = await fetchMyGamification()
      setState({ loading: false, error: null, data: latest })
      setFeedback(res.message || 'Small win claimed')
    } catch (err) {
      setFeedback(err.message || 'Unable to claim this win')
    } finally {
      setClaiming(false)
    }
  }

  if (state.loading) return <div className="points-badge">Loading your small wins…</div>
  if (state.error) return null // Don't display error, just hide the widget

  const { points = 0, level = 1, streak_count = 0, badges = [] } = state.data || {}
  const streakMascot = pickMascot(`streak-${level}-${streak_count}`)

  return (
    <div className="points-badge">
      <div className="points-header">
        <div className="points-value">{points}</div>
        <div className="points-meta">Level {level} • Streak {streak_count}d • {streakMascot.name}</div>
        <div className="points-streak-avatar">
          <img src={streakMascot.image} alt={`${streakMascot.name} badge`} />
        </div>
      </div>

      <div className="points-actions">
        <button className="btn btn--sm" onClick={claim} disabled={claiming}>
          {claiming ? 'Claiming…' : 'Claim small win'}
        </button>
        {feedback && <span className="points-feedback" role="status">{feedback}</span>}
      </div>

      <div className="badge-list">
        {badges.length === 0 ? <div className="badge-empty">No badges yet — your next small win is close.</div> : badges.map((b) => {
          const mascot = pickMascot(b.code || b.name)
          return (
          <div key={b.code} className="badge-item" title={b.description}>
            {b.icon && /^(https?:|\/)/.test(b.icon) ? (
              <img src={b.icon} alt={b.name} />
            ) : (
              <div className="badge-fallback">
                <img src={mascot.image} alt={`${mascot.name} badge`} />
              </div>
            )}
            <div className="badge-name">{b.name}</div>
            <div className="badge-mascot">{mascot.name}</div>
          </div>
          )
        })}
      </div>
    </div>
  )
}
