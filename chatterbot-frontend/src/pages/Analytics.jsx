import {
  ChartColumnIncreasing,
  ShieldAlert,
  SmilePlus,
  Users,
} from 'lucide-react'

import { useOverviewQuery } from '@/hooks/use-dashboard-data.js'
import './Analytics.css'

const STUB_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STUB_CONVOS = [3, 5, 2, 8, 4, 6, 9]
const STUB_TOPICS = [
  'School stress',
  'Anxiety',
  'Friendships',
  'Sleep',
  'Family',
]

const statIcons = {
  'Total Conversations': ChartColumnIncreasing,
  'Active Teens': Users,
  'Alerts This Month': ShieldAlert,
  'Avg Mood Score': SmilePlus,
}

export default function Analytics() {
  const { data: overview, isLoading } = useOverviewQuery()

  const activeTeens = overview?.teens?.length ?? 0
  const alertsThisMonth = overview?.recent_alerts?.length ?? 0
  const totalConvos = 24
  const avgMood = overview?.teens
    ? (() => {
        const scores = overview.teens
          .filter((teen) => teen.mood_avg)
          .map((teen) => teen.mood_avg)
        return scores.length
          ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
          : '—'
      })()
    : '—'

  const maxConvo = Math.max(...STUB_CONVOS)

  const stats = [
    { label: 'Total Conversations', value: totalConvos },
    { label: 'Active Teens', value: activeTeens },
    { label: 'Alerts This Month', value: alertsThisMonth },
    { label: 'Avg Mood Score', value: avgMood },
  ]

  return (
    <div className="analytics">
      <div className="analytics__header">
        <h1 className="analytics__title">Usage Analytics</h1>
        <p className="analytics__sub">
          A summary of activity across your teens.
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

      <div className="analytics__charts">
        <div className="analytics__chart-card">
          <h2 className="analytics__chart-title">
            Conversations (last 7 days)
          </h2>
          <svg
            className="analytics__bar-chart"
            viewBox="0 0 280 120"
            aria-label="Conversations per day"
          >
            {STUB_CONVOS.map((value, index) => {
              const barHeight = (value / maxConvo) * 80
              const x = index * 40 + 10
              return (
                <g key={STUB_DAYS[index]}>
                  <rect
                    x={x}
                    y={100 - barHeight}
                    width={28}
                    height={barHeight}
                    fill="var(--cb-primary)"
                    rx="4"
                    opacity="0.85"
                  />
                  <text
                    x={x + 14}
                    y={115}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#888"
                  >
                    {STUB_DAYS[index]}
                  </text>
                  <text
                    x={x + 14}
                    y={95 - barHeight}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--cb-primary)"
                    fontWeight="700"
                  >
                    {value}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className="analytics__chart-card">
          <h2 className="analytics__chart-title">Most discussed topics</h2>
          <ul className="analytics__topics">
            {STUB_TOPICS.map((topic, index) => (
              <li key={topic} className="analytics__topic-row">
                <span className="analytics__topic-rank">#{index + 1}</span>
                <span className="analytics__topic-name">{topic}</span>
                <div className="analytics__topic-bar">
                  <div
                    className="analytics__topic-fill"
                    style={{ width: `${100 - index * 15}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
