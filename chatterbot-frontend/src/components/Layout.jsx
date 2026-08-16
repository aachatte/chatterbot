import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const navItems = [
  { path: '/', label: 'Dashboard', icon: DashboardIcon },
  { path: '/teens', label: 'Teens', icon: UsersIcon },
  { path: '/alerts', label: 'Alerts', icon: ShieldIcon },
  { path: '/billing', label: 'Billing', icon: CreditCardIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
]

function DashboardIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function CreditCardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const activeAlerts = 0 // Would come from context or API

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: 'var(--cb-bg-elevated)',
        borderRight: '1px solid var(--cb-border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease-out',
      }} className="sidebar-desktop">
        <style>{`
          @media (min-width: 768px) {
            .sidebar-desktop {
              position: relative !important;
              transform: translateX(0) !important;
            }
          }
        `}</style>

        {/* Logo */}
        <div style={{
          padding: 'var(--cb-space-5) var(--cb-space-5)',
          borderBottom: '1px solid var(--cb-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-3)' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--cb-radius-md)',
              background: 'var(--cb-text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}>Chatterbot</div>
              <div style={{ fontSize: 11, color: 'var(--cb-text-tertiary)', marginTop: 2 }}>Guardian Dashboard</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: 'var(--cb-space-3)', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--cb-space-3)',
                padding: '10px 12px',
                borderRadius: 'var(--cb-radius-md)',
                color: isActive ? 'var(--cb-text-primary)' : 'var(--cb-text-secondary)',
                background: isActive ? 'var(--cb-bg-muted)' : 'transparent',
                fontSize: 14,
                fontWeight: 500,
                transition: 'all var(--cb-transition-fast)',
                marginBottom: 2,
                textDecoration: 'none',
              })}
            >
              <item.icon />
              <span>{item.label}</span>
              {item.path === '/alerts' && activeAlerts > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--cb-danger)',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 'var(--cb-radius-full)',
                }}>{activeAlerts}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{
          padding: 'var(--cb-space-4)',
          borderTop: '1px solid var(--cb-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-3)', marginBottom: 'var(--cb-space-3)' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--cb-radius-full)',
              background: 'var(--cb-bg-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--cb-text-primary)',
            }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.first_name} {user?.last_name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--cb-text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--cb-space-2)',
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--cb-radius-md)',
              color: 'var(--cb-text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all var(--cb-transition-fast)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cb-bg-muted)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogoutIcon />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 40,
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, marginLeft: 0 }}>
        {/* Mobile header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--cb-space-4) var(--cb-space-5)',
          borderBottom: '1px solid var(--cb-border)',
          background: 'var(--cb-bg-elevated)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-3)' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 'var(--cb-radius-md)',
                background: 'var(--cb-bg-muted)',
                color: 'var(--cb-text-secondary)',
              }}
              className="mobile-only"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 style={{ fontSize: 18, fontWeight: 500 }}>
              {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-3)' }}>
            <button style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--cb-radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cb-text-secondary)',
              background: 'var(--cb-bg-muted)',
              position: 'relative',
            }}>
              <BellIcon />
              {activeAlerts > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--cb-danger)',
                }} />
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--cb-space-6)',
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
