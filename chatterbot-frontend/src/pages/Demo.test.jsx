import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Demo from '@/pages/Demo.jsx'

describe('Demo dashboard', () => {
  it('opens on the guardian command center and shows Chatterbot texting first', () => {
    render(
      <MemoryRouter>
        <Demo />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { name: 'Good afternoon, Alex.' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Support is steady and on track.')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /SMS experience/i }))

    expect(
      screen.getByText(
        'Hey Maya! Quick check in: how are you feeling about tomorrow?'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Teen phone preview · conversations are not shown to guardians'
      )
    ).toBeInTheDocument()
  })

  it('lets the guardian inspect and pause a Care Circle member', () => {
    render(
      <MemoryRouter>
        <Demo />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /Care Circle/i }))

    expect(
      screen.getByRole('heading', {
        name: 'The right people, around the right signals.',
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Full conversation text')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Pause access' }))

    expect(screen.getAllByText('Paused')).toHaveLength(2)
    expect(screen.queryByText('Alex and Sam')).not.toBeInTheDocument()
  })
})
