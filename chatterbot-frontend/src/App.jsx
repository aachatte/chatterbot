import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Loading from './components/Loading.jsx'
import Layout from './components/Layout.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

// Lazy load heavy components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Teens = lazy(() => import('./pages/Teens.jsx'))
const TeenDetail = lazy(() => import('./pages/TeenDetail.jsx'))
const Alerts = lazy(() => import('./pages/Alerts.jsx'))
const AlertDetail = lazy(() => import('./pages/AlertDetail.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Billing = lazy(() => import('./pages/Billing.jsx'))
const DashboardChat = lazy(() => import('./pages/DashboardChat.jsx'))

/**
 * Protected route component that checks authentication status
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <Loading />
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

/**
 * Main App component with error boundaries and code splitting
 */
function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Dashboard Routes with Suspense boundaries */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={
            <Suspense fallback={<Loading />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="teens" element={
            <Suspense fallback={<Loading />}>
              <Teens />
            </Suspense>
          } />
          <Route path="teens/:id" element={
            <Suspense fallback={<Loading />}>
              <TeenDetail />
            </Suspense>
          } />
          <Route path="chat" element={
            <Suspense fallback={<Loading />}>
              <DashboardChat />
            </Suspense>
          } />
          <Route path="alerts" element={
            <Suspense fallback={<Loading />}>
              <Alerts />
            </Suspense>
          } />
          <Route path="alerts/:id" element={
            <Suspense fallback={<Loading />}>
              <AlertDetail />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<Loading />}>
              <Settings />
            </Suspense>
          } />
          <Route path="billing" element={
            <Suspense fallback={<Loading />}>
              <Billing />
            </Suspense>
          } />
        </Route>
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
