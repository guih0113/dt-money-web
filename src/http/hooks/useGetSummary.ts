import { useQuery } from '@tanstack/react-query'
import type { GetSummaryResponse } from '../types/get-summary'
import { getOrCreateSessionId } from '@/utils/sessionId'

export function useGetSummary() {
  return useQuery<GetSummaryResponse>({
    queryKey: ['get-summary'],
    queryFn: async () => {
      const sessionId = getOrCreateSessionId()
      
      document.cookie = `sessionId=${sessionId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=None; Secure`
      
      console.log('📡 GET summary with sessionId:', sessionId)
      
      const response = await fetch('https://ignite-nodejs-02-api-rest-m3es.onrender.com/transactions/summary', {
        headers: {
          'X-Session-ID': sessionId,
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch summary.')
      }
      
      const result: GetSummaryResponse = await response.json()
      console.log('📊 Summary result:', result.summary)
      
      return result
    },
  })
}