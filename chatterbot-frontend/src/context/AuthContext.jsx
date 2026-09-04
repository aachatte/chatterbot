import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState(null)
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => {
    let active = true
    localStorage.removeItem('cb_token')
    api
      .refreshSession()
      .then((session) => {
        if (!active) return
        api.setAccessToken(session.access_token)
        setToken(session.access_token)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setBootstrapping(false)
      })
    return () => {
      active = false
    }
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: api.getMe,
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60_000,
  })

  const setSession = useCallback(
    (session) => {
      api.setAccessToken(session.access_token)
      setToken(session.access_token)
      queryClient.setQueryData(['auth', 'me', session.access_token], session)
    },
    [queryClient]
  )

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } finally {
      api.setAccessToken(null)
      localStorage.removeItem('cb_token')
      setToken(null)
      queryClient.removeQueries({ queryKey: ['auth'] })
    }
  }, [queryClient])

  useEffect(() => {
    if (!token) return undefined
    const timer = window.setTimeout(async () => {
      try {
        const session = await api.refreshSession()
        setSession(session)
      } catch {
        await logout()
      }
    }, 55 * 60_000)
    return () => window.clearTimeout(timer)
  }, [logout, setSession, token])

  const value = useMemo(
    () => ({
      user: data?.user ?? null,
      isAuthenticated: Boolean(token && data?.user),
      loading: bootstrapping || (token ? isLoading : false),
      setSession,
      logout,
    }),
    [bootstrapping, data?.user, isLoading, logout, setSession, token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
