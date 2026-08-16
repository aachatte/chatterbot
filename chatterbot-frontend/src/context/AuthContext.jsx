import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const demoMode = localStorage.getItem('cb_demo')
    const token = localStorage.getItem('cb_token')

    if (demoMode === 'true') {
      setUser({ first_name: 'Demo', last_name: 'Parent', email: 'demo@chatterbot.com' })
    } else if (token) {
      // Keep existing token session handling if needed
      setUser({ first_name: 'User', last_name: '', email: 'user@chatterbot.com' })
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Regular login flow simulation or real API call
    localStorage.setItem('cb_token', 'mock_token')
    setUser({ first_name: 'User', last_name: '', email })
  }

  const loginAsDemo = () => {
    localStorage.setItem('cb_demo', 'true')
    setUser({ first_name: 'Demo', last_name: 'Parent', email: 'demo@chatterbot.com' })
  }

  const logout = () => {
    localStorage.removeItem('cb_token')
    localStorage.removeItem('cb_demo')
    setUser(null)
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
