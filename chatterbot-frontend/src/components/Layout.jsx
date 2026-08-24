import React, { Suspense } from 'react'
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ChatterbotLogo } from './ChatterbotLogo.jsx'
import './Layout.css'

const navItems = [
  { path: '/dashboard',            label: 'Dashboard',  icon: DashboardIcon },
  { path: '/dashboard/teens',      label: 'Teens',      icon: UsersIcon },
  { path: '/dashboard/chat',       label: 'Assistant',  icon: ChatIcon },
  { path: '/dashboard/alerts',     label: 'Alerts',     icon: ShieldIcon },
  { path: '/dashboard/analytics',  label: 'Analytics',  icon: AnalyticsIcon },
  { path: '/dashboard/billing',    label: 'Billing',    icon: CreditCardIcon },
  { path: '/dashboard/settings',   label: 'Settings',   icon: SettingsIcon },
  { path: '/dashboard/support',    label: 'Support',    icon: SupportIcon },
]

function ChatIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
}
function DashboardIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
}
function UsersIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function ShieldIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function CreditCardIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
}
function SettingsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.86a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.14 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.46 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.86 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}
function SupportIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
}
function AnalyticsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
}
function LogoutIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}
function MenuIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
}
function CloseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => { setMobileMenuOpen(false) }, [location])

  const pageLabel = navItems.find((n) => n.path === location.pathname)?.label || 'Dashboard'
  const initials = (user?.first_name || 'U')[0].toUpperCase()

  return (
    <div className="layout-root">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="layout-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`layout-sidebar${mobileMenuOpen ? ' layout-sidebar--open' : ''}`}>
        {/* Brand */}
        <div className="layout-brand">
          <ChatterbotLogo size={36} />
          <div>
            <div className="layout-brand__name">Chatterbot</div>
            <div className="layout-brand__sub">Guardian Dashboard</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="layout-nav" aria-label="Dashboard navigation">
          <div className="layout-nav__section-label">Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => `layout-nav__item${isActive ? ' layout-nav__item--active' : ''}`}
            >
              <span className="layout-nav__icon"><item.icon /></span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="layout-sidebar__footer">
          <div className="layout-user">
            <div className="layout-user__avatar">{initials}</div>
            <div className="layout-user__info">
              <div className="layout-user__name">{user?.first_name || 'Guardian'}</div>
              <div className="layout-user__role">Account owner</div>
            </div>
          </div>
          <button className="layout-logout" onClick={logout} title="Sign out">
            <LogoutIcon />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="layout-main">
        {/* Top bar */}
        <header className="layout-topbar">
          <div className="layout-topbar__left">
            <button
              className="layout-topbar__menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <h1 className="layout-topbar__title">{pageLabel}</h1>
          </div>
          <div className="layout-topbar__right">
            <div className="layout-topbar__status">
              <span className="layout-topbar__status-dot" />
              All systems normal
            </div>
            <div className="layout-topbar__avatar">{initials}</div>
          </div>
        </header>

        {/* Page content */}
        <div className="layout-content">
          <Suspense fallback={<div className="page-loading">Loading…</div>}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}


