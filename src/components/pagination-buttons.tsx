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

      // Se a faixa calculada (startPage a endPage) não preencher o número total de botões visíveis (ex: estamos nas últimas 2 páginas)
      if (endPage - startPage + 1 < visiblePages) {
        // Recalcula startPage para "empurrar" os botões para a esquerda e preencher os 5 espaços
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
    <div className="mt-6 flex items-center justify-center gap-1.5">
      <button
        className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-700/80 text-zinc-300"
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1 || isFetching}
        aria-label="Página anterior"
        type="button"
      >
        <ChevronLeft className={page === 1 ? 'text-zinc-700' : 'text-emerald-700'} />
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
        className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-700/80 text-zinc-300"
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages || isFetching}
        aria-label="Próxima página"
        type="button"
      >
        <ChevronRight className={page === totalPages ? 'text-zinc-700' : 'text-emerald-700'} />
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
      className={`h-8 w-8 rounded-md ${isActive ? 'bg-emerald-700 ' : 'bg-zinc-700/80 text-zinc-300'} text-zinc-300 transition-colors duration-150 ${disabled ? 'cursor-not-allowed opacity-50' : ''} `}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {value}
    </button>
  )
}
