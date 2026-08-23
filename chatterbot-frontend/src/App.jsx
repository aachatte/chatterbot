import React from 'react'
import CounselorDashboard from './pages/CounselorDashboard.jsx'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Teens from './pages/Teens.jsx'
import TeenDetail from './pages/TeenDetail.jsx'
import Alerts from './pages/Alerts.jsx'
import AlertDetail from './pages/AlertDetail.jsx'
import Settings from './pages/Settings.jsx'
import Billing from './pages/Billing.jsx'
import DashboardChat from './pages/DashboardChat.jsx'

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
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="teens" element={<Teens />} />
        <Route path="teens/:id" element={<TeenDetail />} />
        <Route path="chat" element={<DashboardChat />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="alerts/:id" element={<AlertDetail />} />
        <Route path="settings" element={<Settings />} />
        <Route path="billing" element={<Billing />} />
        <Route path="counselor" element={<CounselorDashboard />} /> {/* <-- Add this line */}
        
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
