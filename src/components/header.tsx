import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { TransactionModal } from './transactionModal'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="flex h-40 justify-between bg-zinc-950 px-6 py-7 text-white md:px-15 lg:px-30">
      <div className="flex h-fit w-full justify-between">
        <div className="flex cursor-pointer items-center gap-3 font-bold text-lg">
          <img src="/ignite-simbol.svg" alt="Symbol " />
          DT Money
        </div>
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
          <Dialog.Trigger asChild>
            <button
              className="cursor-pointer rounded-md bg-emerald-600 px-4 py-3 text-white transition-colors hover:bg-emerald-600/90"
              type="button"
            >
              Nova Transação
            </button>
          </Dialog.Trigger>

          <TransactionModal onTransactionCreated={() => setIsOpen(false)} />
        </Dialog.Root>
      </div>
    </header>
  )
}
