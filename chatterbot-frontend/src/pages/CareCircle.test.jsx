import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'

import CareCircle from '@/pages/CareCircle.jsx'
import JoinCareCircle from '@/pages/JoinCareCircle.jsx'
import { api } from '@/services/api.js'

vi.mock('@/services/api.js', () => ({
  api: {
    getCareCircle: vi.fn(),
    createCareCircleMember: vi.fn(),
    updateCareCircleMember: vi.fn(),
    deleteCareCircleMember: vi.fn(),
    refreshCareCircleInvitation: vi.fn(),
    getCareCircleInvitation: vi.fn(),
    acceptCareCircleInvitation: vi.fn(),
  },
}))

const circlePayload = {
  teens: [{ id: 1, first_name: 'Maya', consent_verified: true }],
  selected_teen: { id: 1, first_name: 'Maya', consent_verified: true },
  owner: {
    id: 4,
    name: 'Alex Rivera',
    email: 'alex@example.com',
    role: 'account_guardian',
    status: 'active',
  },
  members: [
    {
      id: 9,
      teen_id: 1,
      name: 'Sam Carter',
      email: 'sam@example.com',
      role: 'counselor',
      relationship: 'School counselor',
      access_level: 'signals',
      status: 'active',
      notify_safety_alerts: true,
      notify_checkin_updates: true,
    },
  ],
  activity: [
    {
      id: 11,
      action: 'invitation_accepted',
      detail: 'Sam Carter joined the Care Circle.',
      actor_name: 'Sam Carter',
      created_at: '2026-09-03T10:00:00',
    },
  ],
}

describe('CareCircle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.getCareCircle.mockResolvedValue(circlePayload)
  })

  it('shows members, routing, and privacy guardrails', async () => {
    render(
      <MemoryRouter>
        <CareCircle />
      </MemoryRouter>
    )

    expect(
      await screen.findByRole('heading', { name: 'Care Circle' })
    ).toBeInTheDocument()
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument()
    expect(screen.getAllByText('Sam Carter')).toHaveLength(2)
    expect(screen.getByText('Full conversation text')).toBeInTheDocument()
    expect(
      screen.getByText('Never shared through Care Circle')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Sam Carter joined the Care Circle.')
    ).toBeInTheDocument()
  })

  it('creates a secure invitation from the member form', async () => {
    api.createCareCircleMember.mockResolvedValue({
      invite_token: 'secure-token-for-test',
      member: {
        ...circlePayload.members[0],
        id: 12,
        name: 'Jordan Lee',
        email: 'jordan@example.com',
        status: 'pending',
      },
    })

    render(
      <MemoryRouter>
        <CareCircle />
      </MemoryRouter>
    )

    await screen.findByRole('heading', { name: 'Care Circle' })
    fireEvent.click(screen.getByRole('button', { name: 'Invite someone' }))
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Jordan Lee' },
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'jordan@example.com' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Create secure invite' })
    )

    await waitFor(() => {
      expect(api.createCareCircleMember).toHaveBeenCalledWith(
        expect.objectContaining({
          teen_id: 1,
          name: 'Jordan Lee',
          email: 'jordan@example.com',
          access_level: 'safety_only',
        })
      )
    })
    expect(
      await screen.findByRole('heading', { name: 'Secure invitation ready' })
    ).toBeInTheDocument()
  })
})

describe('JoinCareCircle', () => {
  it('reviews and accepts an invitation', async () => {
    api.getCareCircleInvitation.mockResolvedValue({
      invitation: {
        member_name: 'Sam Carter',
        guardian_first_name: 'Alex',
        teen_first_name: 'Maya',
        role: 'counselor',
        relationship: 'School counselor',
        access_level: 'signals',
        notify_safety_alerts: true,
        notify_checkin_updates: true,
      },
    })
    api.acceptCareCircleInvitation.mockResolvedValue({
      message: 'You are now part of the Care Circle.',
    })

    render(
      <MemoryRouter initialEntries={['/care-circle/join/test-token']}>
        <Routes>
          <Route path="/care-circle/join/:token" element={<JoinCareCircle />} />
        </Routes>
      </MemoryRouter>
    )

    expect(
      await screen.findByRole('heading', { name: 'Show up when it matters.' })
    ).toBeInTheDocument()
    expect(screen.getByText('No full transcripts')).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'Accept Care Circle invitation' })
    )

    expect(
      await screen.findByRole('heading', { name: "You're in the circle." })
    ).toBeInTheDocument()
    expect(api.acceptCareCircleInvitation).toHaveBeenCalledWith('test-token')
  })
})
