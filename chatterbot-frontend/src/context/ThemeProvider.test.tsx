import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useThemeToggle } from '@/context/ThemeProvider'

const setTheme = vi.fn()

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
  useTheme: () => ({
    resolvedTheme: 'dark',
    setTheme,
  }),
}))

function ToggleHarness() {
  const { isDark, toggleTheme } = useThemeToggle()
  return (
    <button type="button" onClick={toggleTheme} data-dark={String(isDark)}>
      toggle
    </button>
  )
}

describe('useThemeToggle', () => {
  it('toggles dark theme to light', () => {
    render(<ToggleHarness />)

    expect(screen.getByRole('button').getAttribute('data-dark')).toBe('true')
    fireEvent.click(screen.getByRole('button'))

    expect(setTheme).toHaveBeenCalledWith('light')
  })
})
