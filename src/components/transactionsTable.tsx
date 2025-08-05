import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useListTransactions } from '@/http/hooks/useListTransactions'
import type { Transaction } from '@/http/types/transaction'
import { PaginationButtons } from './pagination-buttons'
import { SearchForm } from './searchForm'

export function TransactionsTable() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageFromUrl = Number(searchParams.get('page')) || 1
  const queryFromUrl = searchParams.get('query') || undefined
  const [page, setPage] = useState(pageFromUrl)
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string | undefined>(queryFromUrl)

  useEffect(() => {
    setPage(pageFromUrl)
    setCurrentSearchQuery(queryFromUrl)
  }, [pageFromUrl, queryFromUrl])

  const { data, isFetching } = useListTransactions(page, currentSearchQuery)
  const transactionsToDisplay: Transaction[] | undefined = data?.transactions
  const currentPage = Number(data?.page)
  const totalPages = data?.totalPages ?? 1

  function formatCurrency(value: string | number | null | undefined) {
    const num = typeof value === 'number' ? value : Number(value)
    if (Number.isNaN(num)) return 'R$ 0,00'
    const formatted = Math.abs(num).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    return num < 0 ? `- ${formatted}` : formatted
  }

  function formatDate(isoDateString: string) {
    const date = new Date(isoDateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleSearchSubmit = (query: string | undefined) => {
    const newQuery = query === '' ? undefined : query
    setCurrentSearchQuery(newQuery)
    setPage(1)

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      if (newQuery) {
        newParams.set('query', newQuery)
      } else {
        newParams.delete('query')
      }
      newParams.set('page', '1')
      return newParams
    })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('page', String(newPage))
      if (currentSearchQuery) {
        newParams.set('query', currentSearchQuery)
      } else {
        newParams.delete('query')
      }
      return newParams
    })
  }

  const hasTransactions = transactionsToDisplay && transactionsToDisplay.length > 0

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <SearchForm onSearch={handleSearchSubmit} initialQuery={queryFromUrl} />

      <div className="space-y-4">
        {isFetching ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <span className="font-medium">Carregando transações...</span>
            </div>
          </div>
        ) : hasTransactions ? (
          <div className="space-y-3">
            {transactionsToDisplay?.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-slate-600/50 hover:bg-slate-800/60 sm:p-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-lg text-white">{item.title}</h3>
                    <p className="mt-1 truncate text-slate-400 text-sm">{item.description}</p>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
                    <div className={`font-bold text-xl ${item.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(item.amount)}
                    </div>
                    <div className="font-medium text-slate-400 text-sm">{formatDate(item.created_at)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50">
              <span className="text-2xl text-slate-500">💰</span>
            </div>
            <p className="font-medium text-lg text-slate-400">
              {currentSearchQuery
                ? `Nenhuma transação encontrada para "${currentSearchQuery}"`
                : 'Nenhuma transação cadastrada ainda'}
            </p>
            <p className="mt-2 text-slate-500 text-sm">
              {!currentSearchQuery && 'Cadastre sua primeira transação usando o botão acima'}
            </p>
          </div>
        )}
      </div>

      {!isFetching && (hasTransactions || totalPages > 1) && (
        <PaginationButtons
          page={currentPage}
          totalPages={totalPages}
          setPage={handlePageChange}
          isFetching={isFetching}
        />
      )}
    </div>
  )
}
