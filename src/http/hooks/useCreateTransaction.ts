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
      // Debug: verificar cookies antes da requisição
      console.log('🍪 Cookies before request:', document.cookie)
      
      const response = await fetch('https://ignite-nodejs-02-api-rest-m3es.onrender.com/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      // Debug: verificar cookies após a requisição
      console.log('🍪 Cookies after request:', document.cookie)
      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error('Failed to create transaction.')
      }

      // Como o backend retorna apenas status 201 sem body, 
      // não precisamos fazer parse de JSON
      return { success: true }
    },

    onMutate({ title, description, amount, type }) {
      console.log('🚀 Starting optimistic update...')
      
      // Cancelar queries para evitar que fetches antigos sobrescrevam o update otimista
      queryClient.cancelQueries({ queryKey: ['list-transactions'] })
      queryClient.cancelQueries({ queryKey: ['get-summary'] })
      queryClient.cancelQueries({ queryKey: ['get-debit-summary'] })
      queryClient.cancelQueries({ queryKey: ['get-credit-summary'] })

      const signedAmount = type === 'debit' ? Number(amount) * -1 : Number(amount)
      
      // Criar a transação otimista - IMPORTANTE: não definir session_id
      // Deixar que o servidor atribua o sessionId correto
      const newTransaction = {
        id: `temp-${Date.now()}-${Math.random()}`, // ID temporário único
        title,
        description,
        amount: signedAmount,
        created_at: new Date().toISOString(),
        // Não incluir session_id - será definido pelo servidor
      }

      // Armazenar estados anteriores
      const snapshots: Record<string, any> = {}
      
      // Função para fazer snapshot de uma query
      const takeSnapshot = (queryKey: any[]) => {
        const key = JSON.stringify(queryKey)
        const data = queryClient.getQueryData(queryKey)
        snapshots[key] = data
        return data
      }

      // Fazer snapshots de todas as queries que vamos modificar
      const currentListQueryKey = ['list-transactions', currentPage, currentSearchQuery]
      takeSnapshot(currentListQueryKey)
      takeSnapshot(['get-summary'])
      takeSnapshot(['get-debit-summary'])
      takeSnapshot(['get-credit-summary'])

      // Atualizar a lista atual apenas se estivermos na primeira página
      if (currentPage === 1) {
        queryClient.setQueryData<ListTransactionsResponse>(currentListQueryKey, (old) => {
          if (!old) {
            console.log('📝 Creating new list with optimistic transaction')
            return {
              transactions: [newTransaction],
              total: 1,
              page: 1,
              pageSize: 10,
              totalPages: 1,
            }
          }

          console.log('📝 Adding optimistic transaction to existing list')
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
      }

      // Atualizar summaries otimisticamente
      queryClient.setQueryData<GetSummaryResponse>(['get-summary'], (old) => ({
        ...old,
        summary: { 
          amount: ((old?.summary?.amount ?? 0) + signedAmount) 
        },
      }))

      if (type === 'debit') {
        queryClient.setQueryData<GetDebitSummaryResponse>(['get-debit-summary'], (old) => ({
          ...old,
          debitSummary: { 
            amount: ((old?.debitSummary?.amount ?? 0) + signedAmount) 
          },
        }))
      }

      if (type === 'credit') {
        queryClient.setQueryData<GetCreditSummaryResponse>(['get-credit-summary'], (old) => ({
          ...old,
          creditSummary: { 
            amount: ((old?.creditSummary?.amount ?? 0) + signedAmount) 
          },
        }))
      }

      return { 
        newTransaction, 
        snapshots,
        currentListQueryKey
      }
    },

    onError(error, _variables, context) {
      console.error('❌ Transaction creation failed, rolling back...', error)
      
      if (!context) return
      
      // Restaurar todos os snapshots
      Object.entries(context.snapshots).forEach(([keyStr, data]) => {
        const queryKey = JSON.parse(keyStr)
        queryClient.setQueryData(queryKey, data)
      })
    },

    onSuccess() {
      console.log('✅ Transaction created successfully on server')
      
      // Estratégia mais robusta: aguardar mais tempo e invalidar de forma escalonada
      setTimeout(() => {
        console.log('🔄 Step 1: Invalidating list queries...')
        
        // Primeiro, invalida as queries de lista
        queryClient.invalidateQueries({ 
          queryKey: ['list-transactions'],
          exact: false, // Invalida todas as variações da query
        })
      }, 200)

      setTimeout(() => {
        console.log('🔄 Step 2: Invalidating summary queries...')
        
        // Depois, invalida os summaries
        queryClient.invalidateQueries({ queryKey: ['get-summary'] })
        queryClient.invalidateQueries({ queryKey: ['get-debit-summary'] })
        queryClient.invalidateQueries({ queryKey: ['get-credit-summary'] })
      }, 400)

      // Fallback: se ainda houver problemas, força um refetch completo
      setTimeout(() => {
        console.log('🔄 Step 3: Final refetch to ensure consistency...')
        
        queryClient.refetchQueries({ 
          queryKey: ['list-transactions', currentPage, currentSearchQuery],
          exact: true 
        })
      }, 600)
    },
  })
}