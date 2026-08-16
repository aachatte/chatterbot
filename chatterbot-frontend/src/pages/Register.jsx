import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const { register } = useAuth() // Ensure your AuthContext exposes a register function

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      // Pass the fields exactly as your backend expects them
      await register({ first_name: firstName, last_name: lastName, email, phone, password })
      navigate('/')
    } catch (err) {
      setError(err.data?.error || 'Registration failed')
    }
    setLoading(false)
  }

  // Reusable inline style for inputs to keep the code clean
  const baseInputStyle = {
    width: '100%', 
    padding: '14px 20px', 
    borderRadius: 'var(--cb-radius-md)', 
    border: '2px solid var(--cb-border)', 
    background: 'var(--cb-bg-elevated)', 
    outline: 'none', 
    fontSize: 16, 
    color: 'var(--cb-text-primary)'
  }

  const handleFocus = (e) => e.target.style.borderColor = 'var(--cb-primary)'
  const handleBlur = (e) => e.target.style.borderColor = 'var(--cb-border)'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--cb-space-6) var(--cb-space-4)' }}>
      {/* Slightly wider glass-card to accommodate the side-by-side name fields */}
      <div className="glass-card" style={{ width: '100%', maxWidth: 500 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--cb-space-6)' }}>
          <div style={{ 
            width: 48, height: 48, borderRadius: 'var(--cb-radius-md)', 
            background: 'var(--cb-primary-gradient)', color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto var(--cb-space-4)', boxShadow: 'var(--cb-shadow-glow)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 'var(--cb-space-2)' }}>Create your account</h1>
          <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15 }}>Start protecting your family with Chatterbot</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-5)' }}>
          
          {/* Side-by-side Name Fields */}
          <div style={{ display: 'flex', gap: 'var(--cb-space-4)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--cb-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>First name</label>
              <input 
                type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                style={baseInputStyle} onFocus={handleFocus} onBlur={handleBlur}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--cb-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last name</label>
              <input 
                type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                style={baseInputStyle} onFocus={handleFocus} onBlur={handleBlur}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--cb-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={baseInputStyle} onFocus={handleFocus} onBlur={handleBlur}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--cb-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone (for crisis alerts)</label>
            <input 
              type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              style={baseInputStyle} onFocus={handleFocus} onBlur={handleBlur}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--cb-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
            <input 
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              style={baseInputStyle} onFocus={handleFocus} onBlur={handleBlur}
            />
            <p style={{ fontSize: 12, color: 'var(--cb-text-tertiary)', marginTop: '8px' }}>Must be at least 8 characters</p>
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: 'var(--cb-space-6)', textAlign: 'center', fontSize: 14, color: 'var(--cb-text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--cb-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
