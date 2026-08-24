import React, { Suspense, lazy } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { path: '/dashboard/teens', label: 'Teens', icon: UsersIcon },
  { path: '/dashboard/chat', label: 'Assistant', icon: ChatIcon },
  { path: '/dashboard/alerts', label: 'Alerts', icon: ShieldIcon },
  { path: '/dashboard/billing', label: 'Billing', icon: CreditCardIcon },
  { path: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
  { path: '/dashboard/support', label: 'Support', icon: ChatIcon },
]

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function DashboardIcon() {
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
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.86a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.14 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.5a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    // Close menu when route changes
    setMobileMenuOpen(false)
  }, [location])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <style>{`
        @media (max-width: 767px) {
          .sidebar-desktop {
            position: fixed !important;
            left: 0;
            top: 0;
            width: 240px;
            height: 100vh;
            z-index: 40;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .sidebar-desktop.open {
            transform: translateX(0);
          }
          .sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 30;
            display: block;
          }
          .sidebar-overlay.hidden {
            display: none;
          }
        }
        
        @media (min-width: 768px) {
          .sidebar-desktop {
            position: relative !important;
            transform: translateX(0) !important;
            width: 240px;
          }
          .sidebar-overlay {
            display: none !important;
          }
          .mobile-menu-button {
            display: none !important;
          }
        }
      `}</style>

      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${!mobileMenuOpen ? 'hidden' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        style={{
          cursor: 'pointer'
        }}
      />

      {/* Sidebar */}
      <aside
        className={`sidebar-desktop ${mobileMenuOpen ? 'open' : ''}`}
        style={{
          width: '240px',
          background: 'var(--cb-bg-elevated)',
          borderRight: '1px solid var(--cb-border)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo Section */}
        <div style={{ padding: 'var(--cb-space-5)', borderBottom: '1px solid var(--cb-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-3)' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--cb-radius-md)',
                background: 'var(--cb-primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChatIcon />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Chatterbot</div>
              <div style={{ fontSize: 11, color: 'var(--cb-text-tertiary)' }}>Guardian Dashboard</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: 'var(--cb-space-3)', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--cb-space-3)',
                padding: 'var(--cb-space-3) var(--cb-space-4)',
                borderRadius: 'var(--cb-radius-md)',
                marginBottom: 'var(--cb-space-1)',
                color: isActive ? 'var(--cb-primary)' : 'var(--cb-text-secondary)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                fontWeight: isActive ? 500 : 400,
                borderLeft: isActive ? '2px solid var(--cb-primary)' : '2px solid transparent',
                paddingLeft: isActive ? 'calc(var(--cb-space-4) - 2px)' : 'var(--cb-space-4)',
              })}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div style={{ padding: 'var(--cb-space-4)', borderTop: '1px solid var(--cb-border)' }}>
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--cb-space-2)',
              width: '100%',
              padding: 'var(--cb-space-3) var(--cb-space-4)',
              borderRadius: 'var(--cb-radius-md)',
              color: 'var(--cb-text-secondary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: 14,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
              e.currentTarget.style.color = 'var(--cb-danger)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--cb-text-secondary)'
            }}
          >
            <LogoutIcon /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--cb-space-4) var(--cb-space-5)',
            borderBottom: '1px solid var(--cb-border)',
            background: 'var(--cb-bg-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-4)', flex: 1, minWidth: 0 }}>
            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--cb-radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--cb-bg)',
                border: '1px solid var(--cb-border)',
                cursor: 'pointer',
                color: 'var(--cb-text-primary)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--cb-primary)'
                e.currentTarget.style.borderColor = 'var(--cb-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--cb-bg)'
                e.currentTarget.style.borderColor = 'var(--cb-border)'
              }}
              title="Toggle menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <h1 style={{ fontSize: 18, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {navItems.find((n) => n.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-3)', fontSize: 14, color: 'var(--cb-text-secondary)', whiteSpace: 'nowrap' }}>
            {user?.first_name || 'User'}
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--cb-space-6)' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
