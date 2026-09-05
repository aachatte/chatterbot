import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

import { ChatterbotLogo } from '@/components/ChatterbotLogo.jsx'
import { staffApi } from '@/services/api.js'
import './StaffOperations.css'

export default function StaffLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (staffApi.hasSession()) {
    return <Navigate to="/staff/operations" replace />
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await staffApi.login(email, password)
      navigate('/staff/operations', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="staff-auth">
      <section className="staff-auth__card">
        <div className="staff-auth__brand">
          <ChatterbotLogo size={44} />
          <div>
            <strong>Chatterbot</strong>
            <span>Pilot operations</span>
          </div>
        </div>
        <div className="staff-auth__icon">
          <ShieldCheck size={24} />
        </div>
        <h1>Staff sign in</h1>
        <p>
          Use your individual staff account. Every operational change is
          recorded.
        </p>
        <form onSubmit={submit}>
          <label htmlFor="staff-email">Work email</label>
          <input
            id="staff-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label htmlFor="staff-password">Password</label>
          <input
            id="staff-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error && (
            <div className="staff-auth__error" role="alert">
              {error}
            </div>
          )}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in securely'}
          </button>
        </form>
      </section>
    </main>
  )
}
