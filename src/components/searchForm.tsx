import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const searchFormSchema = z.object({
  query: z.string().optional(),
})

type SearchFormInputs = z.infer<typeof searchFormSchema>

interface SearchFormProps {
  onSearch: (query: string | undefined) => void
  initialQuery?: string
}

export function SearchForm({ onSearch, initialQuery }: SearchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting: isFormSubmitting },
    reset,
  } = useForm<SearchFormInputs>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: initialQuery || '',
    },
  })

  useEffect(() => {
    reset({ query: initialQuery || '' })
  }, [initialQuery, reset])

  async function handleSearchTransactions(data: SearchFormInputs) {
    onSearch(data.query)
  }

  return (
    <form onSubmit={handleSubmit(handleSearchTransactions)} className="mx-auto mb-8 w-full max-w-6xl">
      <div className="flex gap-3 sm:gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            {...register('query')}
            className="h-12 w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 text-white placeholder-slate-400 outline-none backdrop-blur-sm transition-all duration-200 focus:border-emerald-500/50 focus:bg-slate-800/70 focus:ring-2 focus:ring-emerald-500/20 sm:h-14 sm:px-6"
            placeholder="Busque por transações..."
          />
        </div>
        <button
          type="submit"
          disabled={isFormSubmitting}
          className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/25 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:gap-3 sm:px-6"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:block">Buscar</span>
        </button>
      </div>
    </form>
  )
}
