import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const { login, loginAsDemo } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.data?.error || 'Login failed')
    }
    setLoading(false)
  }

  const handleDemoBypass = () => {
    loginAsDemo()
    navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--cb-space-4)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 420 }}>
        
        {/* Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--cb-space-6)' }}>
          <div style={{ 
            width: 48, height: 48, borderRadius: 'var(--cb-radius-md)', 
            background: 'var(--cb-primary-gradient)', color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto var(--cb-space-4)', boxShadow: 'var(--cb-shadow-glow)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 'var(--cb-space-2)' }}>Welcome back</h1>
          <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15 }}>Sign in to your Guardian Dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-5)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--cb-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '14px 20px', 
                borderRadius: 'var(--cb-radius-md)', 
                border: '2px solid var(--cb-border)', 
                background: 'var(--cb-bg-elevated)', 
                outline: 'none', 
                fontSize: 16, 
                color: 'var(--cb-text-primary)'
              }} 
              onFocus={e => e.target.style.borderColor = 'var(--cb-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--cb-border)'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--cb-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
            <input 
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '14px 20px', 
                borderRadius: 'var(--cb-radius-md)', 
                border: '2px solid var(--cb-border)', 
                background: 'var(--cb-bg-elevated)', 
                outline: 'none', 
                fontSize: 16, 
                color: 'var(--cb-text-primary)'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--cb-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--cb-border)'}
            />
          </div>

          {error && <div style={{ color: 'var(--cb-danger)', fontSize: 14, textAlign: 'center', fontWeight: 500 }}>{error}</div>}

          <button 
            type="submit" disabled={loading} 
            style={{ 
              marginTop: '8px', 
              padding: '14px', 
              borderRadius: 'var(--cb-radius-md)', 
              background: 'var(--cb-primary-gradient)', 
              color: 'white', 
              border: 'none', 
              fontWeight: 600, 
              fontSize: 16, 
              cursor: loading ? 'not-allowed' : 'pointer', 
              boxShadow: 'var(--cb-shadow-glow)', 
              transition: 'transform 0.1s' 
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Render Offline Demo Bypass Button */}
          <button 
            type="button" 
            onClick={handleDemoBypass}
            style={{ 
              padding: '12px', 
              borderRadius: 'var(--cb-radius-md)', 
              background: 'transparent', 
              color: 'var(--cb-text-secondary)', 
              border: '1px dashed var(--cb-border)', 
              fontWeight: 500, 
              fontSize: 14, 
              cursor: 'pointer',
              width: '100%',
              transition: 'background 0.1s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cb-bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            ⚡ Bypass Login (Render Offline Demo)
          </button>
        </form>

        <div style={{ marginTop: 'var(--cb-space-6)', textAlign: 'center', fontSize: 14, color: 'var(--cb-text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--cb-primary)', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
        </div>
      </div>
    </div>
  )
}
