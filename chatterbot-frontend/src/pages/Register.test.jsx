import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import Register from '@/pages/Register.jsx'

const mutateAsync = vi.fn()

vi.mock('@/context/AuthContext.jsx', () => ({
  useAuth: () => ({
    setSession: vi.fn(),
    logout: vi.fn(),
    user: null,
  }),
}))

vi.mock('@/hooks/use-auth-mutations.js', () => ({
  useRegisterMutation: () => ({
    mutateAsync,
    isPending: false,
    error: null,
  }),
}))

describe('Register', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
  })

  it('renders registration inputs', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { name: 'Create an account' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('First Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create account' })
    ).toBeInTheDocument()
  })

  it('validates required registration fields', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'bad' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'short' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument()
      expect(screen.getByText('Last name is required')).toBeInTheDocument()
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
