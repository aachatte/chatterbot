import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'

export default function Settings() {
  const { user, logout } = useAuth()
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  })
  const [saving, setSaving] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '' })
  const [changingPassword, setChangingPassword] = useState(false)

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateMe(form)
      alert('Profile updated')
    } catch (err) {
      alert(err.data?.error || 'Update failed')
    }
    setSaving(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setChangingPassword(true)
    try {
      await api.changePassword(passwordForm)
      alert('Password changed successfully')
      setPasswordForm({ current_password: '', new_password: '' })
    } catch (err) {
      alert(err.data?.error || 'Password change failed')
    }
    setChangingPassword(false)
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
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--cb-space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 'var(--cb-space-2)' }}>Settings</h1>
        <p style={{ color: 'var(--cb-text-secondary)', fontSize: 15 }}>Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div style={{
        background: 'var(--cb-bg-elevated)',
        border: '1px solid var(--cb-border)',
        borderRadius: 'var(--cb-radius-xl)',
        padding: 'var(--cb-space-6)',
        marginBottom: 'var(--cb-space-5)',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--cb-space-5)' }}>Profile</h2>
        <form onSubmit={handleProfileUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cb-space-4)', marginBottom: 'var(--cb-space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 'var(--cb-space-2)', color: 'var(--cb-text-secondary)' }}>First name</label>
              <input value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 'var(--cb-space-2)', color: 'var(--cb-text-secondary)' }}>Last name</label>
              <input value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 'var(--cb-space-5)' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 'var(--cb-space-2)', color: 'var(--cb-text-secondary)' }}>Phone (for crisis alerts)</label>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" style={inputStyle} />
          </div>
          <button type="submit" disabled={saving} style={{
            padding: '10px 20px',
            borderRadius: 'var(--cb-radius-lg)',
            background: 'var(--cb-text-primary)',
            color: 'var(--cb-bg-elevated)',
            fontSize: 14,
            fontWeight: 500,
            border: 'none',
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div style={{
        background: 'var(--cb-bg-elevated)',
        border: '1px solid var(--cb-border)',
        borderRadius: 'var(--cb-radius-xl)',
        padding: 'var(--cb-space-6)',
        marginBottom: 'var(--cb-space-5)',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--cb-space-5)' }}>Change password</h2>
        <form onSubmit={handlePasswordChange}>
          <div style={{ marginBottom: 'var(--cb-space-4)' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 'var(--cb-space-2)', color: 'var(--cb-text-secondary)' }}>Current password</label>
            <input type="password" value={passwordForm.current_password} onChange={e => setPasswordForm(p => ({ ...p, current_password: e.target.value }))} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: 'var(--cb-space-5)' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 'var(--cb-space-2)', color: 'var(--cb-text-secondary)' }}>New password</label>
            <input type="password" value={passwordForm.new_password} onChange={e => setPasswordForm(p => ({ ...p, new_password: e.target.value }))} required minLength={8} style={inputStyle} />
          </div>
          <button type="submit" disabled={changingPassword} style={{
            padding: '10px 20px',
            borderRadius: 'var(--cb-radius-lg)',
            background: 'var(--cb-text-primary)',
            color: 'var(--cb-bg-elevated)',
            fontSize: 14,
            fontWeight: 500,
            border: 'none',
            opacity: changingPassword ? 0.7 : 1,
          }}>
            {changingPassword ? 'Changing...' : 'Change password'}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div style={{
        background: 'var(--cb-bg-elevated)',
        border: '1px solid var(--cb-border)',
        borderRadius: 'var(--cb-radius-xl)',
        padding: 'var(--cb-space-6)',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--cb-space-5)', color: 'var(--cb-danger)' }}>Danger zone</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>Sign out</div>
            <div style={{ fontSize: 13, color: 'var(--cb-text-tertiary)' }}>End your current session</div>
          </div>
          <button onClick={logout} style={{
            padding: '10px 20px',
            borderRadius: 'var(--cb-radius-lg)',
            border: '1px solid var(--cb-danger)',
            color: 'var(--cb-danger)',
            fontSize: 14,
            fontWeight: 500,
            background: 'transparent',
            cursor: 'pointer',
          }}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
