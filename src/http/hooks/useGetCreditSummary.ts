import { useQuery } from '@tanstack/react-query'
import type { GetCreditSummaryResponse } from '../types/get-credit-summary'
import { getOrCreateSessionId } from '@/utils/sessionId'

export function useGetCreditSummary() {
  return useQuery<GetCreditSummaryResponse>({
    queryKey: ['get-credit-summary'],
    queryFn: async () => {
      const sessionId = getOrCreateSessionId()
      
      document.cookie = `sessionId=${sessionId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=None; Secure`
      
      console.log('📡 GET credit summary with sessionId:', sessionId)
      
      const response = await fetch('https://ignite-nodejs-02-api-rest-m3es.onrender.com/transactions/summary/credit', {
        headers: {
          'X-Session-ID': sessionId,
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch credit summary.')
      }
      
      const result: GetCreditSummaryResponse = await response.json()
      console.log('📊 Credit summary result:', result.creditSummary)
      
      return result
    },
  })
}