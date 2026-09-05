import {
  ChartColumnIncreasing,
  ShieldAlert,
  SmilePlus,
  Users,
} from 'lucide-react'

import { useOverviewQuery } from '@/hooks/use-dashboard-data.js'
import './Analytics.css'

const statIcons = {
  'Active teens': Users,
  'Recent alerts': ShieldAlert,
  'Average mood': SmilePlus,
  'Messages · 7 days': ChartColumnIncreasing,
}

export default function Analytics() {
  const { data: overview, isLoading } = useOverviewQuery()
  const teens = overview?.teens ?? []
  const moodScores = teens
    .map((teen) => teen.mood_avg)
    .filter((score) => typeof score === 'number')
  const averageMood = moodScores.length
    ? (
        moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length
      ).toFixed(1)
    : '—'
  const stats = [
    { label: 'Active teens', value: teens.length },
    { label: 'Recent alerts', value: overview?.recent_alerts?.length ?? 0 },
    { label: 'Average mood', value: averageMood },
    {
      label: 'Messages · 7 days',
      value: overview?.summary?.total_messages_7d ?? 0,
    },
  ]

  return (
    <div className="analytics">
      <div className="analytics__header">
        <h1 className="analytics__title">Family insights</h1>
        <p className="analytics__sub">
          Live, high-level signals from your family account. No conversation
          transcripts or invented topic rankings.
        </p>
      </div>

      <div className="analytics__stats">
        {stats.map((stat) => {
          const Icon = statIcons[stat.label]
          return (
            <div key={stat.label} className="db-stat-card analytics__stat">
              <div className="analytics__stat-icon">
                <Icon size={18} aria-hidden="true" />
              </div>
              <div className="analytics__stat-value">
                {isLoading ? '…' : stat.value}
              </div>
              <div className="analytics__stat-label">{stat.label}</div>
            </div>
          )
        })}
      </div>

      <section className="analytics__chart-card">
        <h2 className="analytics__chart-title">How to read these signals</h2>
        <p className="analytics__sub">
          These totals support a guardian&apos;s judgment; they are not a
          clinical assessment and should never be used to rank teens or infer
          what was said in a private conversation.
        </p>
      </section>
    </div>
  )
}
