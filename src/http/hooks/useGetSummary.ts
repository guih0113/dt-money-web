import { useQuery } from '@tanstack/react-query'
import type { GetSummaryResponse } from '../types/get-summary'

export function useGetSummary() {
  return useQuery<GetSummaryResponse>({
    queryKey: ['get-summary'],
    queryFn: async () => {
      const response = await fetch('https://ignite-nodejs-02-api-rest-m3es.onrender.com/transactions/summary', {
        credentials: 'include',
      })
      const result: GetSummaryResponse = await response.json()
      return result
    },
  })
}
