import { Link } from 'react-router-dom'

const demoTeens = [
  { name: 'Maya', activity: '18 messages in the last 7 days', status: 'Consent verified' },
  { name: 'Ethan', activity: '12 messages in the last 7 days', status: 'Consent verified' },
]

export default function Demo() {
  return (
    <main style={{ background: 'var(--cb-bg)', minHeight: '100vh', padding: 'var(--cb-space-6) var(--cb-space-4)' }}>
      <div style={{ margin: '0 auto', maxWidth: 1040 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--cb-space-4)', flexWrap: 'wrap', marginBottom: 'var(--cb-space-6)' }}>
          <div>
            <Link to="/" style={{ color: 'var(--cb-primary)', fontWeight: 600 }}>← Back to Chatterbot</Link>
            <h1 style={{ fontSize: 32, marginTop: 'var(--cb-space-3)' }}>Guardian dashboard demo</h1>
          </div>
          <span style={{ background: 'var(--cb-warning-soft)', borderRadius: 'var(--cb-radius-full)', color: 'var(--cb-text-primary)', fontSize: 13, fontWeight: 700, padding: '8px 12px' }}>
            Demo mode — fictional data
          </span>
        </header>

        <div role="note" className="glass-card" style={{ background: 'var(--cb-bg-muted)', marginBottom: 'var(--cb-space-6)', padding: 'var(--cb-space-4)' }}>
          This demonstration does not send messages, evaluate safety signals, create accounts, or represent live monitoring. Chatterbot is not an emergency service.
        </div>

        <section aria-label="Demo summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 'var(--cb-space-4)', marginBottom: 'var(--cb-space-6)' }}>
          {[
            ['Active teen profiles', '2'],
            ['Messages this week', '30'],
            ['Active alerts', '0'],
            ['Consent status', 'Verified'],
          ].map(([label, value]) => (
            <div key={label} className="glass-card" style={{ padding: 'var(--cb-space-5)' }}>
              <div style={{ color: 'var(--cb-text-secondary)', fontSize: 14, marginBottom: 'var(--cb-space-2)' }}>{label}</div>
              <strong style={{ fontSize: 28 }}>{value}</strong>
            </div>
          ))}
        </section>

        <section className="glass-card">
          <h2 style={{ fontSize: 20, marginBottom: 'var(--cb-space-4)' }}>Illustrative teen activity</h2>
          <div style={{ display: 'grid', gap: 'var(--cb-space-3)' }}>
            {demoTeens.map((teen) => (
              <article key={teen.name} style={{ border: '1px solid var(--cb-border)', borderRadius: 'var(--cb-radius-lg)', padding: 'var(--cb-space-4)' }}>
                <strong>{teen.name}</strong>
                <p style={{ color: 'var(--cb-text-secondary)', marginTop: 'var(--cb-space-1)' }}>{teen.activity} · {teen.status}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
