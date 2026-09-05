import { Link, useLocation } from 'react-router-dom'

const pages = {
  privacy: {
    title: 'Privacy center',
    intro:
      'Understand what information Chatterbot processes and how guardians can manage it.',
    sections: [
      [
        'Information we use',
        'Chatterbot processes the account, enrollment, SMS, and safety-notification information needed to provide the service. Guardian dashboards are designed to show summaries rather than conversation transcripts.',
      ],
      [
        'Your choices',
        'Guardians can review teen enrollment details, pause monitoring preferences, and request account or data support through the authenticated dashboard.',
      ],
      [
        'SMS choices',
        'A teen can text STOP to pause Chatterbot messages, START to resume after opting out, or HELP for support and crisis resources. Ordinary conversation content is not processed while the number is opted out.',
      ],
      [
        'Data rights',
        'Privacy rights and retention obligations vary by location. This page is product guidance, not a substitute for a reviewed privacy notice.',
      ],
    ],
  },
  terms: {
    title: 'Service terms',
    intro: 'Important conditions for using Chatterbot responsibly.',
    sections: [
      [
        'Not emergency care',
        'Chatterbot is not an emergency service, clinical provider, or substitute for professional care. Contact local emergency services for immediate danger; in the United States, call or text 988 for crisis support.',
      ],
      [
        'Guardian responsibilities',
        'The account holder is responsible for confirming they have authority to enroll a teen, providing accurate contact information, and reviewing safety notifications promptly.',
      ],
      [
        'Product availability',
        'Features, data availability, and notification delivery can be affected by third-party networks and services. Do not rely on this service as the sole source of safety support.',
      ],
    ],
  },
  safety: {
    title: 'Safety and escalation',
    intro:
      'How to use safety notifications as one part of a broader support plan.',
    sections: [
      [
        'When an alert arrives',
        'Review the alert, contact the teen or the designated trusted adult when appropriate, and document follow-up through the alert workflow.',
      ],
      [
        'Urgent situations',
        'If there is an immediate risk of harm, call local emergency services. In the United States, call or text 988 for the Suicide & Crisis Lifeline.',
      ],
      [
        'Limitations',
        'Automated signals can be incomplete or incorrect. Use your judgment and professional support when deciding how to respond.',
      ],
    ],
  },
  support: {
    title: 'Support center',
    intro:
      'Find help with enrollment, safety notifications, and account access.',
    sections: [
      [
        'Account and enrollment',
        'Sign in to review enrollment and consent status for each teen. Keep guardian phone numbers and notification preferences current.',
      ],
      [
        'Safety support',
        'Use the alert timeline to record follow-up. For an emergency, use local emergency services rather than waiting for an in-app response.',
      ],
      [
        'Service support',
        'Support requests and account recovery are available to authenticated guardians through the dashboard as those capabilities are enabled for your account.',
      ],
    ],
  },
}

export default function PublicInfo() {
  const page = useLocation().pathname.slice(1)
  const content = pages[page] || pages.privacy

  return (
    <main
      style={{
        background: 'var(--cb-bg)',
        minHeight: '100vh',
        padding: 'var(--cb-space-8) var(--cb-space-4)',
      }}
    >
      <div style={{ margin: '0 auto', maxWidth: 760 }}>
        <Link to="/" style={{ color: 'var(--cb-primary)', fontWeight: 600 }}>
          ← Back to Chatterbot
        </Link>
        <h1
          style={{
            fontSize: 36,
            margin: 'var(--cb-space-6) 0 var(--cb-space-3)',
          }}
        >
          {content.title}
        </h1>
        <p
          style={{
            color: 'var(--cb-text-secondary)',
            fontSize: 18,
            lineHeight: 1.6,
            marginBottom: 'var(--cb-space-6)',
          }}
        >
          {content.intro}
        </p>
        <div style={{ display: 'grid', gap: 'var(--cb-space-4)' }}>
          {content.sections.map(([heading, body]) => (
            <section
              key={heading}
              className="glass-card"
              style={{ padding: 'var(--cb-space-5)' }}
            >
              <h2 style={{ fontSize: 20, marginBottom: 'var(--cb-space-2)' }}>
                {heading}
              </h2>
              <p style={{ color: 'var(--cb-text-secondary)', lineHeight: 1.6 }}>
                {body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
