import { CardsContent } from '@/components/cards-content'
import { Header } from '@/components/header'
import { TransactionsTable } from '@/components/transactionsTable'

export function Transactions() {
  return (
    <div className="min-h-screen w-full bg-zinc-800 pb-10 font-roboto">
      <Header />
      <div className="space-y-20 px-8 2xl:px-0">
        <CardsContent />
        <TransactionsTable />
      </div>
    </div>
  )
}
