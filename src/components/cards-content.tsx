import { useGetCreditSummary } from '@/http/hooks/useGetCreditSummary'
import { useGetDebitSummary } from '@/http/hooks/useGetDebitSummary'
import { useGetSummary } from '@/http/hooks/useGetSummary'
import { Card } from './card'

function formatCurrency(value: string | number | null | undefined) {
  const num = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(num)) return 'R$ 0,00'
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function CardsContent() {
  const { data: SummaryData } = useGetSummary()
  const { data: DebitSummaryData } = useGetDebitSummary()
  const { data: CreditSummaryData } = useGetCreditSummary()

  return (
    <div className="relative z-40 mt-[-60px]">
      <div className="flex flex-col gap-6 px-4 lg:flex-row lg:items-center lg:justify-center">
        <div className="scrollbar-hide flex snap-x snap-mandatory gap-20 overflow-x-auto lg:flex-wrap lg:justify-center lg:overflow-visible">
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
              iconColor="red-400"
            />
          </div>
          <div className="shrink-0 snap-center">
            <Card title="Total" value={formatCurrency(SummaryData?.summary?.amount ?? 0)} bgColor="emerald-900" />
          </div>
        </div>
      </div>
    </div>
  )
}
