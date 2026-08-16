import React, { createContext, useContext, useState, useEffect } from 'react'
import { api, ApiError } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('cb_token'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (token) {
      api.getMe()
        .then(data => setUser(data.user))
        .catch(() => {
          localStorage.removeItem('cb_token')
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    setError(null)
    try {
      const data = await api.login(email, password)
      localStorage.setItem('cb_token', data.access_token)
      setToken(data.access_token)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      setError(err.data?.error || 'Login failed')
      return { success: false, error: err.data?.error }
    }
  }

  const register = async (formData) => {
    setError(null)
    try {
      const data = await api.register(formData)
      localStorage.setItem('cb_token', data.access_token)
      setToken(data.access_token)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      setError(err.data?.error || 'Registration failed')
      return { success: false, error: err.data?.error }
    }
  }

  const logout = () => {
    localStorage.removeItem('cb_token')
    setToken(null)
    setUser(null)
    setError(null)
  }

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
