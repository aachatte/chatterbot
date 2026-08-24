import React, { useState, useEffect } from 'react'
import { api } from '../services/api.js'

const MOCK_SUB = {
  plan_name: 'Guardian Premium',
  plan_tier: 'premium',
  status: 'active',
  amount: 1499,
  currency: 'usd',
  interval: 'month',
  current_period_end: '2026-09-13T00:00:00Z',
  cancel_at_period_end: false,
  is_active: true,
}

export default function Billing() {
  const [sub, setSub] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getOverview()
      .then(data => setSub(data.subscription))
      .catch(() => setSub(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: 'var(--cb-text-tertiary)', textAlign: 'center', padding: 'var(--cb-space-10)' }}>Loading...</div>

  const isPremium = sub?.is_active && sub?.plan_tier === 'premium'

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--cb-space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 'var(--cb-space-2)' }}>Billing</h1>
        <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15 }}>Manage your subscription and plan</p>
      </div>

      {/* Current plan */}
      <div style={{
        background: 'var(--cb-bg-elevated)',
        border: '1px solid var(--cb-border)',
        borderRadius: 'var(--cb-radius-xl)',
        padding: 'var(--cb-space-6)',
        marginBottom: 'var(--cb-space-5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--cb-space-5)' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--cb-space-1)' }}>
              {sub?.plan_name || 'Free plan'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--cb-text-secondary)' }}>
              {isPremium ? `Billed ${sub.interval}ly` : 'Basic monitoring for one teen'}
            </p>
          </div>
          <div style={{
            padding: '6px 14px',
            borderRadius: 'var(--cb-radius-full)',
            fontSize: 13,
            fontWeight: 600,
            background: isPremium ? 'var(--cb-positive-soft)' : 'var(--cb-bg-muted)',
            color: isPremium ? 'var(--cb-positive)' : 'var(--cb-text-tertiary)',
          }}>
            {sub?.status === 'active' ? 'Active' : sub?.status || 'Inactive'}
          </div>
        </div>

        {isPremium && (
          <div style={{
            padding: 'var(--cb-space-4)',
            borderRadius: 'var(--cb-radius-lg)',
            background: 'var(--cb-bg-muted)',
            marginBottom: 'var(--cb-space-5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--cb-space-2)' }}>
              <span style={{ fontSize: 14, color: 'var(--cb-text-secondary)' }}>Amount</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                ${(sub.amount / 100).toFixed(2)} / {sub.interval}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'var(--cb-text-secondary)' }}>Next billing date</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        )}

        {!isPremium && (
          <div style={{ marginBottom: 'var(--cb-space-5)' }}>
            <p style={{ fontSize: 14, color: 'var(--cb-text-secondary)', lineHeight: 1.6 }}>
              Upgrade to Guardian Premium to unlock the full dashboard: mood tracking, behavioral insights, activity analytics, and crisis alert history for unlimited teens.
            </p>
          </div>
        )}

        <p style={{ fontSize: 14, color: 'var(--cb-text-secondary)', lineHeight: 1.5 }}>
          Subscription changes are not available in the dashboard yet. Please contact support for billing assistance.
        </p>
      </div>

      {/* Features comparison */}
      <div style={{
        background: 'var(--cb-bg-elevated)',
        border: '1px solid var(--cb-border)',
        borderRadius: 'var(--cb-radius-xl)',
        padding: 'var(--cb-space-6)',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--cb-space-5)' }}>Plan comparison</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-3)' }}>
          {[
            { feature: 'SMS companion for teen', free: true, premium: true },
            { feature: 'Crisis keyword detection', free: true, premium: true },
            { feature: 'Parent SMS alerts', free: true, premium: true },
            { feature: 'Mood tracking dashboard', free: false, premium: true },
            { feature: 'Behavioral insights', free: false, premium: true },
            { feature: 'Activity analytics', free: false, premium: true },
            { feature: 'Alert history & resolution', free: false, premium: true },
            { feature: 'Unlimited teens', free: false, premium: true },
            { feature: 'Proactive nudge scheduling', free: false, premium: true },
          ].map(row => (
            <div key={row.feature} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--cb-space-2) 0', borderBottom: '1px solid var(--cb-border)' }}>
              <span style={{ fontSize: 14 }}>{row.feature}</span>
              <div style={{ display: 'flex', gap: 'var(--cb-space-6)' }}>
                <span style={{ fontSize: 13, color: row.free ? 'var(--cb-positive)' : 'var(--cb-text-quaternary)', width: 40, textAlign: 'center' }}>
                  {row.free ? <CheckIcon /> : '—'}
                </span>
                <span style={{ fontSize: 13, color: row.premium ? 'var(--cb-positive)' : 'var(--cb-text-quaternary)', width: 40, textAlign: 'center' }}>
                  {row.premium ? <CheckIcon /> : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--cb-space-6)', marginTop: 'var(--cb-space-3)', paddingRight: 'var(--cb-space-2)' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--cb-text-tertiary)', width: 40, textAlign: 'center' }}>Free</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--cb-text-primary)', width: 40, textAlign: 'center' }}>Premium</span>
        </div>
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
