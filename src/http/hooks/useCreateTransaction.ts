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

			// Adicionando um tratamento mais seguro para respostas sem corpo
			const contentType = response.headers.get('content-type');
			if (contentType && contentType.includes('application/json')) {
				const result = await response.json();
				return result;
			}
			
			// Se a resposta não tiver corpo JSON, apenas retorna o sucesso da requisição.
			// Isso evita o erro 'Unexpected end of JSON input'.
			return null;
		},

		onMutate({ title, description, amount, type }) {
			// Cancelar queries para evitar que fetches antigos sobrescrevam o update otimista
			queryClient.cancelQueries({ queryKey: ['list-transactions'] })
			queryClient.cancelQueries({ queryKey: ['get-summary'] })
			queryClient.cancelQueries({ queryKey: ['get-debit-summary'] })
			queryClient.cancelQueries({ queryKey: ['get-credit-summary'] })

			const currentListQueryKey = ['list-transactions', currentPage, currentSearchQuery]
			const previousList = queryClient.getQueryData<ListTransactionsResponse>(currentListQueryKey)

			const signedAmount = type === 'debit' ? Number(amount) * -1 : Number(amount)
			const newTransaction = {
				id: crypto.randomUUID(),
				title,
				description,
				amount: signedAmount,
				created_at: new Date().toISOString(),
				session_id: crypto.randomUUID(),
			}

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

			const updateSummaryCache = <T extends GetSummaryResponse | GetDebitSummaryResponse | GetCreditSummaryResponse>(
				queryKey: string[],
				currentAmountKey: keyof T,
				prevData: T | undefined,
				change: number,
			) => {

				const prevAmount = (prevData?.[currentAmountKey] as { amount: number } | undefined)?.amount ?? 0
				const currentAmount = prevAmount + change

				queryClient.setQueryData<T>(queryKey, {
					[currentAmountKey]: { amount: currentAmount },
				} as T)
			}

			const previousSummary = queryClient.getQueryData<GetSummaryResponse>(['get-summary'])
			updateSummaryCache(['get-summary'], 'summary', previousSummary, signedAmount)

			const previousDebitSummary = queryClient.getQueryData<GetDebitSummaryResponse>(['get-debit-summary'])
			if (type === 'debit') {
				updateSummaryCache(['get-debit-summary'], 'debitSummary', previousDebitSummary, signedAmount)
			}

			const previousCreditSummary = queryClient.getQueryData<GetCreditSummaryResponse>(['get-credit-summary'])
			if (type === 'credit') {
				updateSummaryCache(['get-credit-summary'], 'creditSummary', previousCreditSummary, signedAmount)
			}

			return { newTransaction, previousList, previousSummary, previousDebitSummary, previousCreditSummary }
		},

		onError(_error, _variables, context) {
			// Se a mutação falhar, reverte para os dados anteriores armazenados no contexto
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
			// Após a mutação (sucesso ou falha), invalida as queries para garantir que a lista e os summaries
			// sejam re-buscados do servidor e estejam totalmente sincronizados.
			queryClient.invalidateQueries({ queryKey: ['list-transactions'] })
			queryClient.invalidateQueries({ queryKey: ['get-summary'] })
			queryClient.invalidateQueries({ queryKey: ['get-debit-summary'] })
			queryClient.invalidateQueries({ queryKey: ['get-credit-summary'] })
		},
	})
}
