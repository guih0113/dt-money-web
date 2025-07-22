import { useGetCreditSummary } from '@/http/hooks/useGetCreditSummary'
import { useGetDebitSummary } from '@/http/hooks/useGetDebitSummary'
import { useGetSummary } from '@/http/hooks/useGetSummary'
import { Card } from './card'

function formatCurrency(value: string | number | null | undefined) {
  const num = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(num)) return '0,00'
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function CardsContent() {
  const { data: SummaryData } = useGetSummary()
  const { data: DebitSummaryData } = useGetDebitSummary()
  const { data: CreditSummaryData } = useGetCreditSummary()

  return (
    <div className="mt-[-50px] h-[80px] text-white">
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:justify-center lg:overflow-x-visible 2xl:gap-20 ">
        <div className="shrink-0 snap-center">
          <Card
            title="Entradas"
            value={formatCurrency(
              CreditSummaryData?.creditSummary?.amount ?? CreditSummaryData?.creditSummary?.amount ?? 0,
            )}
          />
        </div>
        <div className="shrink-0 snap-center">
          <Card
            title="Saídas"
            value={formatCurrency(Math.abs(DebitSummaryData?.debitSummary?.amount ?? 0))}
            iconColor="red-500"
          />
        </div>
        <div className="shrink-0 snap-center">
          <Card title="Total" value={formatCurrency(SummaryData?.summary?.amount ?? 0)} bgColor="emerald-800" />
        </div>
      </div>
    </div>
  )
}
