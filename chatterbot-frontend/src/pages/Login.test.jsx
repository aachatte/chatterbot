import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import Login from '@/pages/Login.jsx'

const mutateAsync = vi.fn()

vi.mock('@/context/AuthContext.jsx', () => ({
  useAuth: () => ({
    setSession: vi.fn(),
    logout: vi.fn(),
    user: null,
  }),
}))

vi.mock('@/hooks/use-auth-mutations.js', () => ({
  useLoginMutation: () => ({
    mutateAsync,
    isPending: false,
    error: null,
  }),
}))

describe('Login', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
  })

  it('renders validation-friendly inputs', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { name: 'Welcome back' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('shows validation messages before submitting invalid credentials', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'invalid' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'short' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(
        screen.getByText('Enter a valid email address')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Password must be at least 8 characters')
      ).toBeInTheDocument()
    })
    expect(mutateAsync).not.toHaveBeenCalled()
  })
})
