import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const result = await login(email, password)
    setIsLoading(false)
    if (result.success) {
      navigate('/')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--cb-space-4)',
      background: 'var(--cb-bg)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'var(--cb-bg-elevated)',
        border: '1px solid var(--cb-border)',
        borderRadius: 'var(--cb-radius-xl)',
        padding: 'var(--cb-space-8)',
        boxShadow: 'var(--cb-shadow-lg)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--cb-space-8)' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--cb-radius-lg)',
            background: 'var(--cb-text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--cb-space-4)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 'var(--cb-space-2)' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15 }}>
            Sign in to your Guardian Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--cb-space-4)' }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 'var(--cb-space-2)',
              color: 'var(--cb-text-secondary)',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="parent@example.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--cb-radius-lg)',
                border: '1px solid var(--cb-border)',
                background: 'var(--cb-bg)',
                color: 'var(--cb-text-primary)',
                fontSize: 15,
                outline: 'none',
                transition: 'border-color var(--cb-transition-fast)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--cb-text-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--cb-border)'}
            />
          </div>

          <div style={{ marginBottom: 'var(--cb-space-5)' }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 'var(--cb-space-2)',
              color: 'var(--cb-text-secondary)',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--cb-radius-lg)',
                border: '1px solid var(--cb-border)',
                background: 'var(--cb-bg)',
                color: 'var(--cb-text-primary)',
                fontSize: 15,
                outline: 'none',
                transition: 'border-color var(--cb-transition-fast)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--cb-text-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--cb-border)'}
            />
          </div>

          {error && (
            <div style={{
              padding: 'var(--cb-space-3)',
              borderRadius: 'var(--cb-radius-md)',
              background: 'var(--cb-danger-soft)',
              color: 'var(--cb-danger)',
              fontSize: 13,
              marginBottom: 'var(--cb-space-4)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--cb-radius-lg)',
              background: 'var(--cb-text-primary)',
              color: 'var(--cb-bg-elevated)',
              fontSize: 15,
              fontWeight: 500,
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'opacity var(--cb-transition-fast)',
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{
          marginTop: 'var(--cb-space-6)',
          textAlign: 'center',
          fontSize: 14,
          color: 'var(--cb-text-secondary)',
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{
            color: 'var(--cb-text-primary)',
            fontWeight: 500,
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}>
            Create one
          </Link>
        </div>
      </div>
    </div>
  )
}
