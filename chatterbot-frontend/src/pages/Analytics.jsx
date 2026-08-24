import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import './Analytics.css';

const STUB_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STUB_CONVOS = [3, 5, 2, 8, 4, 6, 9];
const STUB_TOPICS = ['School stress', 'Anxiety', 'Friendships', 'Sleep', 'Family'];

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    api.getOverview().then(setOverview).catch(() => {});
  }, []);

  const activeTeens = overview?.teens?.length ?? 0;
  const alertsThisMonth = overview?.recent_alerts?.length ?? 0;
  const totalConvos = 24; // stub
  const avgMood = overview?.teens
    ? (() => {
        const scores = overview.teens.filter(t => t.mood_avg).map(t => t.mood_avg);
        return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';
      })()
    : '—';

  const maxConvo = Math.max(...STUB_CONVOS);

  const stats = [
    { label: 'Total Conversations', value: totalConvos, icon: '💬' },
    { label: 'Active Teens', value: activeTeens, icon: '👤' },
    { label: 'Alerts This Month', value: alertsThisMonth, icon: '🚨' },
    { label: 'Avg Mood Score', value: avgMood, icon: '😊' },
  ];

  return (
    <div className="analytics">
      <div className="analytics__header">
        <h1 className="analytics__title">Usage Analytics</h1>
        <p className="analytics__sub">A summary of activity across your teens.</p>
      </div>

      <div className="analytics__stats">
        {stats.map(s => (
          <div key={s.label} className="db-stat-card analytics__stat">
            <div className="analytics__stat-icon">{s.icon}</div>
            <div className="analytics__stat-value">{s.value}</div>
            <div className="analytics__stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="analytics__charts">
        <div className="analytics__chart-card">
          <h2 className="analytics__chart-title">Conversations (last 7 days)</h2>
          <svg className="analytics__bar-chart" viewBox="0 0 280 120" aria-label="Conversations per day">
            {STUB_CONVOS.map((val, i) => {
              const barH = (val / maxConvo) * 80;
              const x = i * 40 + 10;
              return (
                <g key={i}>
                  <rect
                    x={x} y={100 - barH} width={28} height={barH}
                    fill="var(--cb-navy)" rx="4" opacity="0.85"
                  />
                  <text x={x + 14} y={115} textAnchor="middle" fontSize="10" fill="#888">
                    {STUB_DAYS[i]}
                  </text>
                  <text x={x + 14} y={95 - barH} textAnchor="middle" fontSize="10" fill="var(--cb-navy)" fontWeight="700">
                    {val}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="analytics__chart-card">
          <h2 className="analytics__chart-title">Most discussed topics</h2>
          <ul className="analytics__topics">
            {STUB_TOPICS.map((topic, i) => (
              <li key={topic} className="analytics__topic-row">
                <span className="analytics__topic-rank">#{i + 1}</span>
                <span className="analytics__topic-name">{topic}</span>
                <div className="analytics__topic-bar">
                  <div
                    className="analytics__topic-fill"
                    style={{ width: `${100 - i * 15}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
