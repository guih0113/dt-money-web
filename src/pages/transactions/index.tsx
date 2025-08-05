import { CardsContent } from '@/components/cards-content'
import { Header } from '@/components/header'
import { TransactionsTable } from '@/components/transactionsTable'

export function Transactions() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-16 font-roboto">
      <Header />
      <div className="space-y-12 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-0">
        <CardsContent />
        <TransactionsTable />
      </div>
    </div>
  )
}
