import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      if (!localStorage.getItem('cb_token')) {
        setLoading(false)
        return
      }

      try {
        const data = await api.getMe()
        setUser(data.user)
      } catch {
        localStorage.removeItem('cb_token')
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const setSession = (data) => {
    localStorage.setItem('cb_token', data.access_token)
    setUser(data.user)
  }

  const login = async (email, password) => {
    const data = await api.login(email, password)
    setSession(data)
  }

  const register = async (registration) => {
    const data = await api.register(registration)
    setSession(data)
  }

  const logout = () => {
    localStorage.removeItem('cb_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
