import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'
import { AppProviders } from '@/components/app-providers.jsx'
import { ThemeProvider } from '@/context/ThemeProvider'
import ErrorBoundary from '@/components/ErrorBoundary.jsx'
import { AuthProvider } from '@/context/AuthContext.jsx'
import { initializeObservability } from '@/lib/observability.js'
import logger from '@/services/logger.js'
import './index.css'

void initializeObservability()

logger.info('Application initializing', {
  environment: import.meta.env.MODE,
  version: import.meta.env.VITE_APP_VERSION || 'unknown',
})

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection', {
    reason: event.reason?.toString(),
    promise: event.promise,
  })
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <AppProviders>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </AppProviders>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
)
