import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const { register, error } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const result = await register(form)
    setIsLoading(false)
    if (result.success) {
      navigate('/')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--cb-radius-lg)',
    border: '1px solid var(--cb-border)',
    background: 'var(--cb-bg)',
    color: 'var(--cb-text-primary)',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color var(--cb-transition-fast)',
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
        maxWidth: 440,
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 'var(--cb-space-2)' }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15 }}>
            Start protecting your family with Chatterbot
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cb-space-3)', marginBottom: 'var(--cb-space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 'var(--cb-space-2)', color: 'var(--cb-text-secondary)' }}>
                First name
              </label>
              <input name="first_name" value={form.first_name} onChange={handleChange} required placeholder="Jane" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--cb-text-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--cb-border)'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 'var(--cb-space-2)', color: 'var(--cb-text-secondary)' }}>
                Last name
              </label>
              <input name="last_name" value={form.last_name} onChange={handleChange} required placeholder="Doe" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--cb-text-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--cb-border)'} />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--cb-space-4)' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 'var(--cb-space-2)', color: 'var(--cb-text-secondary)' }}>
              Email
            </label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="parent@example.com" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--cb-text-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--cb-border)'} />
          </div>

          <div style={{ marginBottom: 'var(--cb-space-4)' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 'var(--cb-space-2)', color: 'var(--cb-text-secondary)' }}>
              Phone (for crisis alerts)
            </label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--cb-text-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--cb-border)'} />
          </div>

          <div style={{ marginBottom: 'var(--cb-space-5)' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 'var(--cb-space-2)', color: 'var(--cb-text-secondary)' }}>
              Password
            </label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--cb-text-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--cb-border)'} />
            <p style={{ fontSize: 12, color: 'var(--cb-text-tertiary)', marginTop: 'var(--cb-space-2)' }}>
              Must be at least 8 characters
            </p>
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
            }}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: 'var(--cb-space-6)', textAlign: 'center', fontSize: 14, color: 'var(--cb-text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--cb-text-primary)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
