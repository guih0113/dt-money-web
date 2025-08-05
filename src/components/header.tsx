import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { TransactionModal } from './transactionModal'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="relative z-30 mb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />

      <div className="relative z-10 flex h-48 items-center justify-around px-4 text-white sm:h-52 sm:px-6 lg:px-8 xl:gap-68 xl:px-12">
        <div className="flex items-center gap-4">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/20 p-2 backdrop-blur-sm">
            <img src="/ignite-simbol.svg" alt="Symbol" className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <h1 className="bg-gradient-to-r from-white to-slate-300 bg-clip-text font-bold text-transparent text-xl sm:text-2xl lg:text-3xl">
            DT Money
          </h1>
        </div>

        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
          <Dialog.Trigger asChild>
            <button
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/25 hover:shadow-lg active:scale-95 sm:px-6 sm:py-4"
              type="button"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative z-10 text-sm sm:text-base">Nova Transação</span>
            </button>
          </Dialog.Trigger>
          <TransactionModal onTransactionCreated={() => setIsOpen(false)} />
        </Dialog.Root>
      </div>
    </header>
  )
}
