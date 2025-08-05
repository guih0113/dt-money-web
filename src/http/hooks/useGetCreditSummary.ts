import { useQuery } from '@tanstack/react-query'
import type { GetCreditSummaryResponse } from '../types/get-credit-summary'

export function useGetCreditSummary() {
  return useQuery<GetCreditSummaryResponse>({
    queryKey: ['get-credit-summary'],
    queryFn: async () => {
      const response = await fetch('https://ignite-nodejs-02-api-rest-m3es.onrender.com/transactions/summary/credit', {
        credentials: 'include',
      })
      const result: GetCreditSummaryResponse = await response.json()
      return result
    },
  })
}
