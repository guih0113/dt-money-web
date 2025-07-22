import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useListTransactions } from '@/http/hooks/useListTransactions'
import { PaginationButtons } from './pagination-buttons'
import { SearchForm } from './searchForm'
import type { Transaction } from '@/http/types/transaction'

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
    if (Number.isNaN(num)) return '0,00'
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
    <div className="flex flex-col items-center">
      <SearchForm onSearch={handleSearchSubmit} initialQuery={queryFromUrl} />
      <div className="flex justify-center">
        {isFetching ? (
          <p className="py-8 text-center text-gray-400">Carregando transações...</p>
        ) : hasTransactions ? (
          <table className="text-gray-300">
            <tbody className="grid grid-cols-2 gap-2 md:grid-cols-1">
              {transactionsToDisplay?.map((item) => (
                <tr className="rounded-md bg-zinc-700/80 px-1 py-1" key={item.id}>
                  <td className="w-full px-6 py-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <span className="w-[200px] md:w-3xs xl:w-md">{item.title}</span>
                      <span className={`w-fit md:w-[175px] ${item.amount > 0 ? 'text-green-300' : 'text-red-500'}`}>
                        {formatCurrency(item.amount)}
                      </span>
                      <div className="flex justify-between lg:w-auto lg:gap-4">
                        <span className="w-fit md:w-[200px] xl:w-sm">{item.description}</span>
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="py-8 text-center text-gray-400">
            {currentSearchQuery
              ? `Nenhuma transação encontrada para "${currentSearchQuery}".`
              : 'Nenhuma transação cadastrada ainda.'}
          </p>
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
