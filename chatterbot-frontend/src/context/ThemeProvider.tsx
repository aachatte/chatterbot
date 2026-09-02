import { useMemo } from 'react'
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

type ProviderProps = Pick<
  ThemeProviderProps,
  'attribute' | 'children' | 'defaultTheme' | 'enableSystem'
>

export function ThemeProvider({
  children,
  attribute = 'data-theme',
  defaultTheme = 'system',
  enableSystem = true,
}: ProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
    >
      {children}
    </NextThemesProvider>
  )
}

export function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return useMemo(
    () => ({
      isDark: resolvedTheme === 'dark',
      toggleTheme: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
    }),
    [resolvedTheme, setTheme]
  )
}
