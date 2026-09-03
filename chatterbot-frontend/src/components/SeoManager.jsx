import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const DEFAULT_META = {
  title: 'Chatterbot | Guardian Dashboard',
  description: 'Chatterbot helps guardians support teens with proactive SMS check-ins and safety alerts.',
  robots: 'index, follow',
}

const ROUTE_META = {
  '/': {
    title: 'Chatterbot | a friend for teens. Peace of mind for parents',
    description: 'Daily SMS check-ins, guardian dashboards, and instant safety alerts to help families support teens.',
  },
  '/demo': {
    title: 'Chatterbot Demo | Guardian safety dashboard',
    description: 'See how Chatterbot conversations and alerts work in a live guardian dashboard demo.',
  },
  '/privacy': {
    title: 'Privacy Center | Chatterbot',
    description: 'Learn what data Chatterbot uses and how guardians can manage account and privacy preferences.',
  },
  '/terms': {
    title: 'Service Terms | Chatterbot',
    description: 'Read the terms for using Chatterbot responsibly as part of your family safety workflow.',
  },
  '/safety': {
    title: 'Safety and Escalation | Chatterbot',
    description: 'Understand how Chatterbot safety notifications fit into broader support and escalation plans.',
  },
  '/support': {
    title: 'Support Center | Chatterbot',
    description: 'Get help with enrollment, notifications, and account access in the Chatterbot support center.',
  },
  '/login': {
    title: 'Sign in | Chatterbot',
    description: 'Sign in to your Chatterbot guardian dashboard.',
    robots: 'noindex, nofollow',
  },
  '/register': {
    title: 'Get started | Chatterbot',
    description: 'Create a Chatterbot account and start your guardian trial.',
    robots: 'noindex, nofollow',
  },
}

function setOrCreateMeta(name, content, attr = 'name') {
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(pathname) {
  const href = `${window.location.origin}${pathname}`
  let tag = document.head.querySelector('link[rel="canonical"]')
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', 'canonical')
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

export default function SeoManager() {
  const { pathname } = useLocation()

  useEffect(() => {
    const isCareCircleInvite = pathname.startsWith('/care-circle/join/')
    const isDashboard = pathname.startsWith('/dashboard')
    const protectedMeta = isCareCircleInvite
      ? {
          title: 'Care Circle invitation | Chatterbot',
          description: 'Review a secure Chatterbot Care Circle invitation.',
          robots: 'noindex, nofollow',
        }
      : isDashboard
        ? { robots: 'noindex, nofollow' }
        : {}
    const meta = {
      ...DEFAULT_META,
      ...(ROUTE_META[pathname] || {}),
      ...protectedMeta,
    }
    document.title = meta.title

    setOrCreateMeta('description', meta.description)
    setOrCreateMeta('robots', meta.robots)
    setOrCreateMeta('og:title', meta.title, 'property')
    setOrCreateMeta('og:description', meta.description, 'property')
    setOrCreateMeta('og:type', 'website', 'property')
    setOrCreateMeta('og:url', `${window.location.origin}${pathname}`, 'property')
    setOrCreateMeta('twitter:card', 'summary_large_image')
    setOrCreateMeta('twitter:title', meta.title)
    setOrCreateMeta('twitter:description', meta.description)
    setCanonical(isCareCircleInvite || isDashboard ? '/' : pathname)
  }, [pathname])

  return null
}
