import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import { useEffect } from 'react' // <--- Importe o useEffect aqui!
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
    <form onSubmit={handleSubmit(handleSearchTransactions)} className="mb-8 flex w-3xl justify-center gap-3 md:w-full">
      <input
        type="text"
        {...register('query')}
        className="h-14 w-5xl rounded-md border-none bg-zinc-900 px-6 text-white outline-0 focus:outline-1 focus:outline-green-300"
        placeholder="Busque por transações"
      />
      <button
        type="submit"
        disabled={isFormSubmitting}
        className="flex cursor-pointer items-center justify-center gap-3 rounded-md border border-green-300 px-6 text-green-300 transition-colors hover:border-emerald-600 hover:bg-emerald-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 lg:px-8"
      >
        <Search /> <span className="hidden md:block">Buscar</span>
      </button>
    </form>
  )
}
