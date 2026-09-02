import { useQuery } from '@tanstack/react-query'

import { api } from '@/services/api.js'

export function useOverviewQuery() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: api.getOverview,
  })
}
