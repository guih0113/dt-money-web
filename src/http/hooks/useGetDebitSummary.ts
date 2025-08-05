import { useQuery } from '@tanstack/react-query'
import type { GetDebitSummaryResponse } from '../types/get-debit-summary'
import { getOrCreateSessionId } from '@/utils/sessionId'

export function useGetDebitSummary() {
  return useQuery<GetDebitSummaryResponse>({
    queryKey: ['get-debit-summary'],
    queryFn: async () => {
      const sessionId = getOrCreateSessionId()
      
      document.cookie = `sessionId=${sessionId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=None; Secure`
      
      console.log('📡 GET debit summary with sessionId:', sessionId)
      
      const response = await fetch('https://ignite-nodejs-02-api-rest-m3es.onrender.com/transactions/summary/debit', {
        headers: {
          'X-Session-ID': sessionId,
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch debit summary.')
      }
      
      const result: GetDebitSummaryResponse = await response.json()
      console.log('📊 Debit summary result:', result.debitSummary)
      
      return result
    },
  })
}