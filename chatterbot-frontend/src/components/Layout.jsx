import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquareText,
  Moon,
  Search,
  Settings,
  Shield,
  Sun,
  Users,
  X,
  ChartColumn,
  HeartHandshake,
  ClipboardCheck,
} from 'lucide-react'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useThemeToggle } from '@/context/ThemeProvider'

import { useAuth } from '@/context/AuthContext.jsx'
import { Button } from '@/components/ui/button'
import { ChatterbotLogo } from './ChatterbotLogo.jsx'
import './Layout.css'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/teens', label: 'Teens', icon: Users },
  {
    path: '/dashboard/care-circle',
    label: 'Care Circle',
    icon: HeartHandshake,
  },
  {
    path: '/dashboard/support-plan',
    label: 'Support Plan',
    icon: ClipboardCheck,
  },
  { path: '/dashboard/chat', label: 'Assistant', icon: MessageSquareText },
  { path: '/dashboard/alerts', label: 'Alerts', icon: Shield },
  { path: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { path: '/dashboard/analytics', label: 'Analytics', icon: ChartColumn },
  { path: '/dashboard/billing', label: 'Pilot Access', icon: CreditCard },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  { path: '/dashboard/support', label: 'Support', icon: LifeBuoy },
]

const quickActions = [
  {
    label: 'Open command center',
    path: '/dashboard',
    keywords: 'dashboard home command center',
  },
  {
    label: 'Triage alerts workspace',
    path: '/dashboard/alerts',
    keywords: 'alerts triage safety resolve',
  },
  {
    label: 'Manage teen profiles',
    path: '/dashboard/teens',
    keywords: 'teens profiles consent verification',
  },
  {
    label: 'Manage Care Circle',
    path: '/dashboard/care-circle',
    keywords: 'care circle trusted adults counselors permissions invitations',
  },
  {
    label: 'Configure family support plan',
    path: '/dashboard/support-plan',
    keywords: 'teen controls escalation response chain sharing progress',
  },
  {
    label: 'Notifications center',
    path: '/dashboard/notifications',
    keywords: 'notifications digest reminders',
  },
  {
    label: 'Start onboarding flow',
    path: '/dashboard/onboarding',
    keywords: 'onboarding setup activation',
  },
  {
    label: 'Open guardian assistant',
    path: '/dashboard/chat',
    keywords: 'assistant chat help',
  },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useThemeToggle()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  useEffect(() => {
    const handler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((prev) => !prev)
      }
      if (event.key === 'Escape') {
        setCommandOpen(false)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const pageLabel =
    navItems.find((item) => item.path === location.pathname)?.label ||
    'Dashboard'
  const initials = (user?.first_name || 'U')[0].toUpperCase()
  const filteredActions = useMemo(() => {
    const token = query.trim().toLowerCase()
    if (!token) return quickActions
    return quickActions.filter((item) =>
      `${item.label} ${item.keywords}`.toLowerCase().includes(token)
    )
  }, [query])

  const runAction = (path) => {
    setCommandOpen(false)
    setQuery('')
    navigate(path)
  }

  return (
    <div className="layout-root">
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="layout-overlay"
            onClick={() => setMobileMenuOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {commandOpen && (
          <motion.div
            className="layout-overlay"
            onClick={() => setCommandOpen(false)}
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              onClick={(event) => event.stopPropagation()}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              style={{
                width: 'min(640px, 92vw)',
                background: 'var(--cb-bg-elevated)',
                border: '1px solid var(--cb-border)',
                borderRadius: 14,
                margin: '12vh auto',
                padding: 14,
              }}
            >
              <label htmlFor="command-palette" className="sr-only">
                Search commands
              </label>
              <input
                id="command-palette"
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search commands (Ctrl/Cmd+K)"
                style={{
                  width: '100%',
                  borderRadius: 10,
                  border: '1px solid var(--cb-border)',
                  padding: '10px 12px',
                  marginBottom: 8,
                }}
              />
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {filteredActions.map((action) => (
                  <button
                    key={action.path}
                    onClick={() => runAction(action.path)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--cb-text-primary)',
                      padding: '10px 8px',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    {action.label}
                  </button>
                ))}
                {filteredActions.length === 0 && (
                  <p
                    style={{
                      color: 'var(--cb-text-secondary)',
                      padding: '10px 8px',
                      margin: 0,
                    }}
                  >
                    No commands found.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside
        className={`layout-sidebar${mobileMenuOpen ? ' layout-sidebar--open' : ''}`}
      >
        <div className="layout-brand">
          <ChatterbotLogo size={36} />
          <div>
            <div className="layout-brand__name">Chatterbot</div>
            <div className="layout-brand__sub">Guardian Dashboard</div>
          </div>
        </div>

        <nav className="layout-nav" aria-label="Dashboard navigation">
          <div className="layout-nav__section-label">Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `layout-nav__item${isActive ? ' layout-nav__item--active' : ''}`
              }
            >
              <span className="layout-nav__icon">
                <item.icon size={18} />
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="layout-sidebar__footer">
          <div className="layout-user">
            <div className="layout-user__avatar">{initials}</div>
            <div className="layout-user__info">
              <div className="layout-user__name">
                {user?.first_name || 'Guardian'}
              </div>
              <div className="layout-user__role">Account owner</div>
            </div>
          </div>
          <Button
            className="layout-logout"
            variant="ghost"
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </aside>

      <main className="layout-main">
        <header className="layout-topbar">
          <div className="layout-topbar__left">
            <button
              className="layout-topbar__menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="layout-topbar__title">{pageLabel}</h1>
          </div>
          <div className="layout-topbar__right" style={{ gap: 10 }}>
            <Button
              variant="outline"
              onClick={() => setCommandOpen(true)}
              aria-label="Open command palette"
            >
              <Search size={14} />
              Search · ⌘K
            </Button>
            <Button
              variant="outline"
              aria-label="Toggle color theme"
              onClick={toggleTheme}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </Button>
            <div className="layout-topbar__status">
              <span className="layout-topbar__status-dot" />
              All systems normal
            </div>
            <div className="layout-topbar__avatar">{initials}</div>
          </div>
        </header>

        <div className="layout-content">
          <Suspense fallback={<div className="page-loading">Loading…</div>}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
