import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrCreateSessionId } from '@/utils/sessionId' // ajuste o path conforme sua estrutura
import type { CreateTransactionFormData } from '../types/create-transaction'
import type { GetCreditSummaryResponse } from '../types/get-credit-summary'
import type { GetDebitSummaryResponse } from '../types/get-debit-summary'
import type { GetSummaryResponse } from '../types/get-summary'
import type { ListTransactionsResponse } from '../types/list-transactions'

export function useCreateTransaction(currentPage: number, currentSearchQuery?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTransactionFormData) => {
      const sessionId = getOrCreateSessionId()

      console.log('🍪 Using sessionId:', sessionId)
      console.log('🍪 Document cookies:', document.cookie)

      // IMPORTANTE: Forçar o sessionId via cookie manual
      // Definir o cookie manualmente antes da requisição
      document.cookie = `sessionId=${sessionId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=None; Secure`

      console.log('🍪 Set manual cookie, new document.cookie:', document.cookie)

      const response = await fetch('https://ignite-nodejs-02-api-rest-m3es.onrender.com/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Enviar sessionId via header E cookie
          'X-Session-ID': sessionId,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      console.log('📡 POST response status:', response.status)
      console.log('📡 POST response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Server error:', errorText)
        throw new Error(`Failed to create transaction: ${response.status} ${errorText}`)
      }

      console.log('✅ Transaction POST completed successfully')
      return { success: true, sessionId }
    },

    onMutate({ title, description, amount, type }) {
      console.log('🚀 Starting optimistic update...')

      // Cancelar queries para evitar race conditions
      queryClient.cancelQueries({ queryKey: ['list-transactions'] })
      queryClient.cancelQueries({ queryKey: ['get-summary'] })
      queryClient.cancelQueries({ queryKey: ['get-debit-summary'] })
      queryClient.cancelQueries({ queryKey: ['get-credit-summary'] })

      const signedAmount = type === 'debit' ? Number(amount) * -1 : Number(amount)
      const sessionId = getOrCreateSessionId()

      // Criar a transação otimista
      const newTransaction = {
        id: `temp-${Date.now()}-${Math.random()}`,
        title,
        description,
        amount: signedAmount,
        created_at: new Date().toISOString(),
        session_id: sessionId, // Usar o sessionId do frontend
      }

      // Armazenar snapshots para rollback
      const snapshots: Record<string, any> = {}

      const takeSnapshot = (queryKey: any[]) => {
        const key = JSON.stringify(queryKey)
        const data = queryClient.getQueryData(queryKey)
        snapshots[key] = data
        return data
      }

      // Snapshots das queries que vamos modificar
      const currentListQueryKey = ['list-transactions', currentPage, currentSearchQuery]
      takeSnapshot(currentListQueryKey)
      takeSnapshot(['get-summary'])
      takeSnapshot(['get-debit-summary'])
      takeSnapshot(['get-credit-summary'])

      // Atualizar a lista apenas se estivermos na primeira página
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
          amount: (old?.summary?.amount ?? 0) + signedAmount,
        },
      }))

      if (type === 'debit') {
        queryClient.setQueryData<GetDebitSummaryResponse>(['get-debit-summary'], (old) => ({
          ...old,
          debitSummary: {
            amount: (old?.debitSummary?.amount ?? 0) + signedAmount,
          },
        }))
      }

      if (type === 'credit') {
        queryClient.setQueryData<GetCreditSummaryResponse>(['get-credit-summary'], (old) => ({
          ...old,
          creditSummary: {
            amount: (old?.creditSummary?.amount ?? 0) + signedAmount,
          },
        }))
      }

      return {
        newTransaction,
        snapshots,
        sessionId,
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

    onSuccess(_data, _variables, context) {
      console.log('✅ Transaction created successfully on server')
      console.log('🆔 SessionId used in creation:', context?.sessionId)

      // MANTER APENAS O OPTIMISTIC UPDATE - remover refetch que causa problemas
      console.log('🎯 Keeping optimistic update as source of truth - no refetch needed')

      const currentListQueryKey = ['list-transactions', currentPage, currentSearchQuery]

      queryClient.setQueryData(currentListQueryKey, (current) => {
        console.log('📊 Current data after success:', current)
        return current // Manter os dados como estão
      })
    },
  })
}
