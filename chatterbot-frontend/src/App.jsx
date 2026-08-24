import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Loading from './components/Loading.jsx'

const Landing = lazy(() => import('./pages/Landing.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Teens = lazy(() => import('./pages/Teens.jsx'))
const TeenDetail = lazy(() => import('./pages/TeenDetail.jsx'))
const Alerts = lazy(() => import('./pages/Alerts.jsx'))
const AlertDetail = lazy(() => import('./pages/AlertDetail.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Billing = lazy(() => import('./pages/Billing.jsx'))
const DashboardChat = lazy(() => import('./pages/DashboardChat.jsx'))
const PublicInfo = lazy(() => import('./pages/PublicInfo.jsx'))
const Demo = lazy(() => import('./pages/Demo.jsx'))
const Support = lazy(() => import('./pages/Support.jsx'))

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--cb-text-secondary)' }}>
        Loading...
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/privacy" element={<PublicInfo />} />
        <Route path="/terms" element={<PublicInfo />} />
        <Route path="/safety" element={<PublicInfo />} />
        <Route path="/support" element={<PublicInfo />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="teens" element={<Teens />} />
          <Route path="teens/:id" element={<TeenDetail />} />
          <Route path="chat" element={<DashboardChat />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="alerts/:id" element={<AlertDetail />} />
          <Route path="settings" element={<Settings />} />
          <Route path="support" element={<Support />} />
          <Route path="billing" element={<Billing />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
