import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { ThemeProvider } from '@/components/theme-provider.jsx'
import { queryClient } from '@/lib/query-client.js'

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
