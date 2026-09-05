import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import StaffLogin from '@/pages/StaffLogin.jsx'

const { login } = vi.hoisted(() => ({ login: vi.fn() }))

vi.mock('@/services/api.js', () => ({
  staffApi: {
    hasSession: () => false,
    login,
  },
}))

describe('StaffLogin', () => {
  beforeEach(() => {
    login.mockReset()
  })

  it('identifies individual staff access and authenticates credentials', async () => {
    login.mockResolvedValue({})
    render(
      <MemoryRouter>
        <StaffLogin />
      </MemoryRouter>
    )

    expect(
      screen.getByText(/Every operational change is recorded/)
    ).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Work email'), {
      target: { value: 'operator@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'strong-staff-password' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in securely' }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith(
        'operator@example.com',
        'strong-staff-password'
      )
    })
  })
})
