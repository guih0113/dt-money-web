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
			// Cancela as queries para evitar que fetches antigos sobrescrevam o update otimista
			queryClient.cancelQueries({ queryKey: ['list-transactions'] })
			queryClient.cancelQueries({ queryKey: ['get-summary'] })
			queryClient.cancelQueries({ queryKey: ['get-debit-summary'] })
			queryClient.cancelQueries({ queryKey: ['get-credit-summary'] })

			// Salva os dados anteriores para o caso de um rollback
			const currentListQueryKey = ['list-transactions', currentPage, currentSearchQuery]
			const previousList = queryClient.getQueryData<ListTransactionsResponse>(currentListQueryKey)
			const previousSummary = queryClient.getQueryData<GetSummaryResponse>(['get-summary'])
			const previousDebitSummary = queryClient.getQueryData<GetDebitSummaryResponse>(['get-debit-summary'])
			const previousCreditSummary = queryClient.getQueryData<GetCreditSummaryResponse>(['get-credit-summary'])

			const signedAmount = type === 'debit' ? Number(amount) * -1 : Number(amount)
			const newTransaction = {
				id: crypto.randomUUID(),
				title,
				description,
				amount: signedAmount,
				created_at: new Date().toISOString(),
				session_id: crypto.randomUUID(),
			}

			// Executa a atualização otimista na lista
			queryClient.setQueryData<ListTransactionsResponse>(currentListQueryKey, (old) => {
				if (!old) {
					return {
						transactions: [newTransaction],
						total: 1,
						page: currentPage,
						pageSize: 10,
						totalPages: 1,
					}
				}

				const updatedTransactions = [newTransaction, ...old.transactions].slice(0, old.pageSize)

				return {
					...old,
					transactions: updatedTransactions,
					total: (old.total ?? 0) + 1,
				}
			})
			
			// É FUNDAMENTAL retornar o objeto com os dados para o contexto.
			// O 'onError' vai usar este objeto para fazer o rollback.
			return { previousList, previousSummary, previousDebitSummary, previousCreditSummary }
		},

		onError(_error, _variables, context) {
			// Se a mutação falhar, reverte para os dados anteriores armazenados no contexto
			// A verificação 'if (context?.previousList)' só funciona se o objeto 'context' foi retornado corretamente.
			if (context?.previousList) {
				const currentListQueryKey = ['list-transactions', currentPage, currentSearchQuery]
				queryClient.setQueryData<ListTransactionsResponse>(currentListQueryKey, context.previousList)
			}
			if (context?.previousSummary) {
				queryClient.setQueryData<GetSummaryResponse>(['get-summary'], context.previousSummary)
			}
			if (context?.previousDebitSummary) {
				queryClient.setQueryData<GetDebitSummaryResponse>(['get-debit-summary'], context.previousDebitSummary)
			}
			if (context?.previousCreditSummary) {
				queryClient.setQueryData<GetCreditSummaryResponse>(['get-credit-summary'], context.previousCreditSummary)
			}
		},

		onSettled() {
			// Após a mutação (sucesso ou falha), invalida as queries de summary para garantir que os dados
			// sejam re-buscados do servidor e estejam totalmente sincronizados.
			queryClient.invalidateQueries({ queryKey: ['list-transactions'] })
			queryClient.invalidateQueries({ queryKey: ['get-summary'] })
			queryClient.invalidateQueries({ queryKey: ['get-debit-summary'] })
			queryClient.invalidateQueries({ queryKey: ['get-credit-summary'] })
		},
	})
}
