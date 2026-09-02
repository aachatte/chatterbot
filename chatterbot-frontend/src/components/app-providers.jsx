import { QueryClientProvider } from '@tanstack/react-query'

import { queryClient } from '@/lib/query-client.js'
import { Toaster } from '@/components/ui/toast'

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}
