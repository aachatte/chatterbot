import { Link } from 'react-router-dom'

export default function Billing() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--cb-space-6)' }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            marginBottom: 'var(--cb-space-2)',
          }}
        >
          Pilot access
        </h1>
        <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15 }}>
          Review the access model for Chatterbot&apos;s controlled family pilot.
        </p>
      </div>

      <section
        style={{
          background: 'var(--cb-bg-elevated)',
          border: '1px solid var(--cb-border)',
          borderRadius: 'var(--cb-radius-xl)',
          padding: 'var(--cb-space-6)',
          marginBottom: 'var(--cb-space-5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--cb-space-4)',
            marginBottom: 'var(--cb-space-5)',
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
              Family pilot
            </h2>
            <p style={{ color: 'var(--cb-text-secondary)', fontSize: 14 }}>
              No credit card or paid subscription is required during the pilot.
            </p>
          </div>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--cb-radius-full)',
              fontSize: 13,
              fontWeight: 600,
              background: 'var(--cb-positive-soft)',
              color: 'var(--cb-positive)',
            }}
          >
            Pilot
          </span>
        </div>

        <p style={{ color: 'var(--cb-text-secondary)', lineHeight: 1.65 }}>
          Paid checkout, invoices, plan changes, and cancellation controls are
          not currently enabled. Families will receive clear notice before any
          paid plan is introduced.
        </p>
      </section>

      <section
        style={{
          background: 'var(--cb-bg-elevated)',
          border: '1px solid var(--cb-border)',
          borderRadius: 'var(--cb-radius-xl)',
          padding: 'var(--cb-space-6)',
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Need account help?
        </h2>
        <p
          style={{
            color: 'var(--cb-text-secondary)',
            lineHeight: 1.6,
            marginBottom: 18,
          }}
        >
          Contact the Chatterbot team for pilot access, account, or future
          billing questions.
        </p>
        <Link className="btn btn--primary" to="/dashboard/support">
          Contact support
        </Link>
      </section>
    </div>
  )
}
