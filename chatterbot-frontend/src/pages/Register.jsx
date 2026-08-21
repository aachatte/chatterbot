import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  // Import loginAsDemo from your AuthContext
  const { loginAsDemo } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Normal registration logic would go here
      // await api.register(...)
      navigate('/dashboard')
    } catch (err) {
      setError(err.data?.error || 'Registration failed')
    }
    setLoading(false)
  }

  // Instant bypass function for investors/demos
  const handleDemoBypass = () => {
    loginAsDemo()
    navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--cb-space-4)', background: 'var(--cb-bg)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 460 }}>
        
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
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 'var(--cb-space-2)', color: 'var(--cb-text-primary)' }}>Create an account</h1>
          <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15 }}>Start protecting your family today</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--cb-space-3)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--cb-text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>First Name</label>
              <input 
                type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--cb-radius-md)', border: '2px solid var(--cb-border)', background: 'var(--cb-bg-elevated)', outline: 'none', fontSize: 15, color: 'var(--cb-text-primary)' }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--cb-text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Last Name</label>
              <input 
                type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--cb-radius-md)', border: '2px solid var(--cb-border)', background: 'var(--cb-bg-elevated)', outline: 'none', fontSize: 15, color: 'var(--cb-text-primary)' }} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--cb-text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Email</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--cb-radius-md)', border: '2px solid var(--cb-border)', background: 'var(--cb-bg-elevated)', outline: 'none', fontSize: 15, color: 'var(--cb-text-primary)' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--cb-text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Password</label>
            <input 
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--cb-radius-md)', border: '2px solid var(--cb-border)', background: 'var(--cb-bg-elevated)', outline: 'none', fontSize: 15, color: 'var(--cb-text-primary)' }}
            />
          </div>

          {error && <div style={{ color: 'var(--cb-danger)', fontSize: 14, textAlign: 'center', fontWeight: 600 }}>{error}</div>}

          <button 
            type="submit" disabled={loading} 
            style={{ 
              marginTop: '8px', padding: '14px', borderRadius: 'var(--cb-radius-md)', 
              background: 'var(--cb-primary-gradient)', color: 'white', border: 'none', 
              fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', 
              boxShadow: 'var(--cb-shadow-glow)' 
            }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          {/* Instant Demo Bypass Button */}
          <button 
            type="button" 
            onClick={handleDemoBypass}
            style={{ 
              padding: '12px', 
              borderRadius: 'var(--cb-radius-md)', 
              background: 'transparent', 
              color: 'var(--cb-primary)', 
              border: '2px dashed var(--cb-primary)', 
              fontWeight: 700, 
              fontSize: 14, 
              cursor: 'pointer',
              width: '100%'
            }}
          >
            ⚡ Access Demo Dashboard
          </button>
        </form>

        <div style={{ marginTop: 'var(--cb-space-5)', textAlign: 'center', fontSize: 14, color: 'var(--cb-text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--cb-primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
