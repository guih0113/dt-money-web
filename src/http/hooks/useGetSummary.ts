import { useQuery } from '@tanstack/react-query'
import type { GetSummaryResponse } from '../types/get-summary'

export function useGetSummary() {
  return useQuery<GetSummaryResponse>({
    queryKey: ['get-summary'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3333/transactions/summary', {
        credentials: 'include',
      })
      const result: GetSummaryResponse = await response.json()
      return result
    },
  })
}
