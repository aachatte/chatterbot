import { Link } from 'react-router-dom'

export default function Settings() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--cb-space-6)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 'var(--cb-space-2)' }}>Account and safety settings</h1>
        <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15 }}>
          Manage your account details and configure monitoring preferences for each enrolled teen.
        </p>
      </header>

      <section className="glass-card" style={{ marginBottom: 'var(--cb-space-5)' }}>
        <h2 style={{ fontSize: 20, marginBottom: 'var(--cb-space-2)' }}>Teen safety preferences</h2>
        <p style={{ color: 'var(--cb-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--cb-space-4)' }}>
          Review consent status, proactive nudges, monitoring preferences, and notification settings separately for each teen.
        </p>
        <Link to="/dashboard/teens" style={{ display: 'inline-block', background: 'var(--cb-primary)', borderRadius: 'var(--cb-radius-md)', color: 'white', fontWeight: 600, padding: '10px 16px', textDecoration: 'none' }}>
          Manage teen profiles
        </Link>
      </section>

      <section className="glass-card">
        <h2 style={{ fontSize: 20, marginBottom: 'var(--cb-space-2)' }}>Emergency support</h2>
        <p style={{ color: 'var(--cb-text-secondary)', lineHeight: 1.6 }}>
          Chatterbot is not an emergency service. If someone is in immediate danger, contact local emergency services. In the United States, call or text 988 for the Suicide & Crisis Lifeline.
        </p>
      </section>
    </div>
  )
}
