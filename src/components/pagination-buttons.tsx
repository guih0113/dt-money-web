import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationButtonsProps = {
  page: number
  totalPages: number
  setPage: (page: number) => void
  isFetching?: boolean
}

export function PaginationButtons({ page, totalPages, setPage, isFetching }: PaginationButtonsProps) {
  const getPagesToShow = () => {
    const visiblePages = 3
    const pages = []

    if (totalPages <= visiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      let startPage = Math.max(1, page - Math.floor(visiblePages / 2))
      const endPage = Math.min(totalPages, startPage + visiblePages - 1)

      if (endPage - startPage + 1 < visiblePages) {
        startPage = Math.max(1, endPage - visiblePages + 1)
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }
    return pages
  }

  const pagesToShow = getPagesToShow()

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-slate-700/50 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1 || isFetching}
        aria-label="Página anterior"
        type="button"
      >
        <ChevronLeft className={`h-4 w-4 ${page === 1 ? 'text-slate-600' : 'text-emerald-400'}`} />
      </button>

      {pagesToShow.map((value) => (
        <Button
          key={value}
          value={value}
          isActive={value === page}
          onClick={() => setPage(value)}
          disabled={isFetching}
        />
      ))}

      <button
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-slate-700/50 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages || isFetching}
        aria-label="Próxima página"
        type="button"
      >
        <ChevronRight className={`h-4 w-4 ${page === totalPages ? 'text-slate-600' : 'text-emerald-400'}`} />
      </button>
    </div>
  )
}

type ButtonProps = {
  value: number
  isActive?: boolean
  onClick?: () => void
  disabled?: boolean
}

function Button({ value, isActive, onClick, disabled }: ButtonProps) {
  return (
    <button
      className={`h-10 w-10 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${
        isActive
          ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-500/25 shadow-lg'
          : 'border border-slate-700/50 bg-slate-800/50 text-slate-300 backdrop-blur-sm hover:bg-slate-700/50'
      }`}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {value}
    </button>
  )
}
