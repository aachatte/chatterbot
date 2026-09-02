import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState(() => localStorage.getItem('cb_token'))

  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: api.getMe,
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60_000,
  })

  const setSession = useCallback(
    (session) => {
      localStorage.setItem('cb_token', session.access_token)
      setToken(session.access_token)
      queryClient.setQueryData(['auth', 'me', session.access_token], session)
    },
    [queryClient]
  )

  const logout = useCallback(() => {
    localStorage.removeItem('cb_token')
    setToken(null)
    queryClient.removeQueries({ queryKey: ['auth'] })
  }, [queryClient])

  const value = useMemo(
    () => ({
      user: data?.user ?? null,
      isAuthenticated: Boolean(token && data?.user),
      loading: token ? isLoading : false,
      setSession,
      logout,
    }),
    [data?.user, isLoading, logout, setSession, token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
