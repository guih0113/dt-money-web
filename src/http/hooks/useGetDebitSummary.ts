import { useQuery } from '@tanstack/react-query'
import type { GetDebitSummaryResponse } from '../types/get-debit-summary'

export function useGetDebitSummary() {
  return useQuery<GetDebitSummaryResponse>({
    queryKey: ['get-debit-summary'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3333/transactions/summary/debit', {
        credentials: 'include',
      })
      const result: GetDebitSummaryResponse = await response.json()
      return result
    },
  })
}
