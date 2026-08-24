import { useState } from 'react'
import { api } from '../services/api.js'

export default function Support() {
  const [form, setForm] = useState({ category: 'general', subject: '', message: '' })
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setStatus('')
    try {
      const data = await api.createSupportRequest(form)
      setStatus(`Request #${data.request.id} is open for staff follow-up.`)
      setForm({ category: 'general', subject: '', message: '' })
    } catch (error) {
      setStatus(error.data?.error || 'Unable to submit your request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--cb-space-6)' }}>
        <h1 style={{ fontSize: 28, marginBottom: 'var(--cb-space-2)' }}>Support</h1>
        <p style={{ color: 'var(--cb-text-secondary)' }}>Submit an account, billing, or technical request for staff follow-up.</p>
      </header>
      <div className="glass-card">
        <p style={{ color: 'var(--cb-text-secondary)', fontSize: 14, lineHeight: 1.5, marginBottom: 'var(--cb-space-5)' }}>
          Do not use this form for an emergency. Contact local emergency services; in the United States, call or text 988 for crisis support.
        </p>
        <form onSubmit={submit}>
          <label style={labelStyle}>Category
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} style={inputStyle}>
              <option value="general">General</option>
              <option value="account">Account</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
            </select>
          </label>
          <label style={labelStyle}>Subject
            <input required maxLength={200} value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} style={inputStyle} />
          </label>
          <label style={labelStyle}>How can we help?
            <textarea required maxLength={4000} rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} style={inputStyle} />
          </label>
          <button type="submit" disabled={submitting} style={{ background: 'var(--cb-primary)', border: 'none', borderRadius: 'var(--cb-radius-md)', color: 'white', fontWeight: 600, padding: '11px 16px' }}>
            {submitting ? 'Submitting...' : 'Submit request'}
          </button>
          {status && <p role="status" style={{ color: 'var(--cb-text-secondary)', marginTop: 'var(--cb-space-3)' }}>{status}</p>}
        </form>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 'var(--cb-space-4)' }
const inputStyle = { background: 'var(--cb-bg)', border: '1px solid var(--cb-border)', borderRadius: 'var(--cb-radius-md)', display: 'block', marginTop: 'var(--cb-space-2)', padding: '10px 12px', width: '100%' }
