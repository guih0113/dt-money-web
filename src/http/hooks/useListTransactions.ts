import { useQuery } from '@tanstack/react-query'
import type { ListTransactionsResponse } from '@/http/types/list-transactions'
import { getOrCreateSessionId } from '@/utils/sessionId' // ajuste o path conforme sua estrutura

export function useListTransactions(page: number, searchQuery?: string) {
  return useQuery<ListTransactionsResponse>({
    queryKey: ['list-transactions', page, searchQuery],

    queryFn: async () => {
      const sessionId = getOrCreateSessionId()
      
      // Definir cookie manualmente para garantir consistência
      document.cookie = `sessionId=${sessionId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=None; Secure`
      
      let url = `https://ignite-nodejs-02-api-rest-m3es.onrender.com/transactions?page=${page}`

      if (searchQuery) {
        url += `&query=${encodeURIComponent(searchQuery)}`
      }

      console.log('📡 GET transactions with sessionId:', sessionId)

      const response = await fetch(url, {
        headers: {
          'X-Session-ID': sessionId,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch transactions.')
      }
      
      const result = await response.json()
      console.log('📊 Fetched transactions:', result.transactions?.length || 0, 'items')
      
      return result
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  })
}