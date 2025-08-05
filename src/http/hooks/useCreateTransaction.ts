import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateTransactionFormData } from '../types/create-transaction'
import type { GetCreditSummaryResponse } from '../types/get-credit-summary'
import type { GetDebitSummaryResponse } from '../types/get-debit-summary'
import type { GetSummaryResponse } from '../types/get-summary'
import type { ListTransactionsResponse } from '../types/list-transactions'

export function useCreateTransaction(currentPage: number, currentSearchQuery?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTransactionFormData) => {
      const response = await fetch('https://ignite-nodejs-02-api-rest-m3es.onrender.com/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create transaction.')
      }

      const result = await response.json()
      return result
    },

    onMutate({ title, description, amount, type }) {
      // Cancelar queries para evitar que fetches antigos sobrescrevam o update otimista
      queryClient.cancelQueries({ queryKey: ['list-transactions'] })
      queryClient.cancelQueries({ queryKey: ['get-summary'] })
      queryClient.cancelQueries({ queryKey: ['get-debit-summary'] })
      queryClient.cancelQueries({ queryKey: ['get-credit-summary'] })

      const signedAmount = type === 'debit' ? Number(amount) * -1 : Number(amount)
      
      // Criar a transação otimista com ID temporário
      const newTransaction = {
        id: `temp-${Date.now()}`, // ID temporário único
        title,
        description,
        amount: signedAmount,
        created_at: new Date().toISOString(),
        session_id: 'temp-session',
      }

      // Armazenar estados anteriores de TODAS as páginas que podem ser afetadas
      const previousData: Record<string, any> = {}
      
      // Atualizar todas as queries de lista que estão em cache
      queryClient.getQueriesData({ queryKey: ['list-transactions'] }).forEach(([queryKey, data]) => {
        const key = JSON.stringify(queryKey)
        previousData[key] = data
        
        const [, page, searchQuery] = queryKey as [string, number, string | undefined]
        
        queryClient.setQueryData<ListTransactionsResponse>(queryKey as any, (old) => {
          if (!old) return old
          
          // Se for a primeira página OU se não há pesquisa (ou a pesquisa atual coincide)
          const shouldAddTransaction = page === 1 && (!currentSearchQuery || searchQuery === currentSearchQuery)
          
          if (!shouldAddTransaction) {
            // Para outras páginas, apenas atualiza o total
            const newTotal = (old.total ?? 0) + 1
            const newTotalPages = Math.ceil(newTotal / old.pageSize)
            
            return {
              ...old,
              total: newTotal,
              totalPages: newTotalPages,
            }
          }
          
          // Para a primeira página, adiciona a nova transação
          const updatedTransactions = [newTransaction, ...old.transactions].slice(0, old.pageSize)
          const newTotal = (old.total ?? 0) + 1
          const newTotalPages = Math.ceil(newTotal / old.pageSize)

          return {
            ...old,
            transactions: updatedTransactions,
            total: newTotal,
            totalPages: newTotalPages,
          }
        })
      })

      // Função para atualizar os caches de summary
      const updateSummaryCache = <T extends GetSummaryResponse | GetDebitSummaryResponse | GetCreditSummaryResponse>(
        queryKey: string[],
        currentAmountKey: keyof T,
        change: number,
      ) => {
        const prevData = queryClient.getQueryData<T>(queryKey)
        const prevAmount = (prevData?.[currentAmountKey] as { amount: number } | undefined)?.amount ?? 0
        const currentAmount = prevAmount + change

        queryClient.setQueryData<T>(queryKey, (old) => ({
          ...old,
          [currentAmountKey]: { amount: currentAmount },
        } as T))
        
        return prevData
      }

      // Atualizar summaries
      const previousSummary = updateSummaryCache(['get-summary'], 'summary', signedAmount)
      
      const previousDebitSummary = type === 'debit' 
        ? updateSummaryCache(['get-debit-summary'], 'debitSummary', signedAmount)
        : queryClient.getQueryData<GetDebitSummaryResponse>(['get-debit-summary'])
      
      const previousCreditSummary = type === 'credit' 
        ? updateSummaryCache(['get-credit-summary'], 'creditSummary', signedAmount)
        : queryClient.getQueryData<GetCreditSummaryResponse>(['get-credit-summary'])

      return { 
        newTransaction, 
        previousData,
        previousSummary, 
        previousDebitSummary, 
        previousCreditSummary 
      }
    },

    onError(_error, _variables, context) {
      if (!context) return
      
      // Reverter todas as queries de lista
      Object.entries(context.previousData).forEach(([keyStr, data]) => {
        const queryKey = JSON.parse(keyStr)
        queryClient.setQueryData(queryKey, data)
      })
      
      // Reverter summaries
      if (context.previousSummary) {
        queryClient.setQueryData<GetSummaryResponse>(['get-summary'], context.previousSummary)
      }
      if (context.previousDebitSummary) {
        queryClient.setQueryData<GetDebitSummaryResponse>(['get-debit-summary'], context.previousDebitSummary)
      }
      if (context.previousCreditSummary) {
        queryClient.setQueryData<GetCreditSummaryResponse>(['get-credit-summary'], context.previousCreditSummary)
      }
    },

    onSuccess(_data, _variables, context) {
      // IMPORTANTE: Não invalidar imediatamente para não conflitar com optimistic update
      // Em vez disso, fazer um refetch mais inteligente
      
      // Aguardar um pouco para garantir que o servidor processou
      setTimeout(() => {
        // Invalidar apenas as queries que precisam ser atualizadas
        queryClient.invalidateQueries({ 
          queryKey: ['list-transactions'],
          refetchType: 'active' // Só refetch das queries ativas
        })
        queryClient.invalidateQueries({ 
          queryKey: ['get-summary'],
          refetchType: 'active'
        })
        queryClient.invalidateQueries({ 
          queryKey: ['get-debit-summary'],
          refetchType: 'active'
        })
        queryClient.invalidateQueries({ 
          queryKey: ['get-credit-summary'],
          refetchType: 'active'
        })
      }, 100) // 100ms delay para garantir sincronização
    },
  })
}