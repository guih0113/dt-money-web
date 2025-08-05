import { useQuery } from '@tanstack/react-query'
import type { ListTransactionsResponse } from '@/http/types/list-transactions'

export function useListTransactions(page: number, searchQuery?: string) {
  return useQuery<ListTransactionsResponse>({
    // queryKey deve incluir todas as dependências que afetam os dados.
    // Assim, o React Query refaz a requisição quando a página ou o termo de busca mudam.
    queryKey: ['list-transactions', page, searchQuery],

    queryFn: async () => {
      let url = `https://ignite-nodejs-02-api-rest-m3es.onrender.com/transactions?page=${page}`

      // Adiciona o parâmetro 'query' APENAS se um termo de busca for fornecido.
      // É crucial usar encodeURIComponent para tratar caracteres especiais na URL.
      if (searchQuery) {
        url += `&query=${encodeURIComponent(searchQuery)}`
      }

      const response = await fetch(url, {
        credentials: 'include', // Mantém o envio de cookies de sessão
      })

      if (!response.ok) {
        throw new Error('Failed to fetch transactions.')
      }
      return response.json()
    },
    placeholderData: (previousData) => previousData, // Mantém os dados anteriores enquanto busca novos
    staleTime: 1000 * 60 * 5,
  })
}
