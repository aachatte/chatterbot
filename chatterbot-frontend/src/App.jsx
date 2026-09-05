import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Loading from './components/Loading.jsx'
import SeoManager from './components/SeoManager.jsx'
import { SpeedInsights } from '@vercel/speed-insights/react'

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
const Analytics = lazy(() => import('./pages/Analytics.jsx'))
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'))
const ConversationHistory = lazy(
  () => import('./pages/ConversationHistory.jsx')
)
const Notifications = lazy(() => import('./pages/Notifications.jsx'))
const CareCircle = lazy(() => import('./pages/CareCircle.jsx'))
const JoinCareCircle = lazy(() => import('./pages/JoinCareCircle.jsx'))
const TrustCenter = lazy(() => import('./pages/TrustCenter.jsx'))
const Partners = lazy(() => import('./pages/Partners.jsx'))
const SupportPlan = lazy(() => import('./pages/SupportPlan.jsx'))
const StaffLogin = lazy(() => import('./pages/StaffLogin.jsx'))
const StaffOperations = lazy(() => import('./pages/StaffOperations.jsx'))

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: 'var(--cb-text-secondary)',
        }}
      >
        Loading...
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <SeoManager />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/privacy" element={<PublicInfo />} />
        <Route path="/terms" element={<PublicInfo />} />
        <Route path="/safety" element={<PublicInfo />} />
        <Route path="/support" element={<PublicInfo />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/trust-center" element={<TrustCenter />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/care-circle/join/:token" element={<JoinCareCircle />} />
        <Route path="/staff" element={<StaffLogin />} />
        <Route path="/staff/operations" element={<StaffOperations />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="teens" element={<Teens />} />
          <Route path="teens/:id" element={<TeenDetail />} />
          <Route
            path="teens/:id/conversations"
            element={<ConversationHistory />}
          />
          <Route path="chat" element={<DashboardChat />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="alerts/:id" element={<AlertDetail />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="care-circle" element={<CareCircle />} />
          <Route path="support-plan" element={<SupportPlan />} />
          <Route path="settings" element={<Settings />} />
          <Route path="support" element={<Support />} />
          <Route path="billing" element={<Billing />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="onboarding" element={<Onboarding />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SpeedInsights />
    </Suspense>
  )
}

export default App
