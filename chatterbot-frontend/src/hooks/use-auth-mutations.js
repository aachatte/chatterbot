import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/context/AuthContext.jsx'
import { api } from '@/services/api.js'

function getMessage(error, fallback) {
  return error?.data?.error || error?.message || fallback
}

export function useLoginMutation() {
  const { setSession } = useAuth()

  return useMutation({
    mutationFn: ({ email, password }) => api.login(email, password),
    onSuccess: (data) => {
      setSession(data)
      toast.success('Welcome back')
    },
    onError: (error) => {
      toast.error(getMessage(error, 'Login failed'))
    },
  })
}

export function useRegisterMutation() {
  const { setSession } = useAuth()

  return useMutation({
    mutationFn: (payload) =>
      api.register({
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        password: payload.password,
      }),
    onSuccess: (data) => {
      setSession(data)
      toast.success('Account created')
    },
    onError: (error) => {
      toast.error(getMessage(error, 'Registration failed'))
    },
  })
}
