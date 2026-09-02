import logger from '@/services/logger.js'

let initialized = false

export async function initializeObservability() {
  if (initialized) {
    return
  }

  const sentryDsn = import.meta.env.VITE_SENTRY_DSN
  if (sentryDsn) {
    const Sentry = await import('@sentry/react')
    Sentry.init({
      dsn: sentryDsn,
      tracesSampleRate: Number(
        import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0
      ),
    })
  }

  const posthogKey = import.meta.env.VITE_POSTHOG_KEY
  if (posthogKey) {
    const { default: posthog } = await import('posthog-js')
    posthog.init(posthogKey, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
      capture_pageview: true,
      persistence: 'localStorage',
    })
  }

  const reportMetric = (metric) => {
    logger.info('web-vitals', {
      name: metric.name,
      rating: metric.rating,
      value: metric.value,
    })
  }

  const { onCLS, onINP, onLCP } = await import('web-vitals')
  onCLS(reportMetric)
  onINP(reportMetric)
  onLCP(reportMetric)
  initialized = true
}
