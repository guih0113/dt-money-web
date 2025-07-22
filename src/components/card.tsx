import { CircleArrowDown, CircleArrowUp, DollarSign } from 'lucide-react'

type IconColor = 'emerald-600' | 'red-500'
type BgColor = 'zinc-700' | 'emerald-800'

interface CardProps {
  title: string
  value: number | string
  iconColor?: IconColor
  bgColor?: BgColor
}

const bgColorMap: Record<BgColor, string> = {
  'zinc-700': 'bg-zinc-700',
  'emerald-800': 'bg-emerald-800',
}

const iconColorMap: Record<IconColor, string> = {
  'emerald-600': 'text-emerald-600',
  'red-500': 'text-red-500',
}

export function Card({ title, value, iconColor = 'emerald-600', bgColor = 'zinc-700' }: CardProps) {
  return (
    <div className={`w-xs space-y-4 rounded-sm xl:w-sm ${bgColorMap[bgColor]} px-8 py-6`}>
      <div className="flex justify-between">
        <span className="text-sm text-zinc-200">{title}</span>
        {bgColor === 'emerald-800' ? (
          <DollarSign className="text-zinc-200" />
        ) : iconColor === 'red-500' ? (
          <CircleArrowDown className={iconColorMap[iconColor]} />
        ) : (
          <CircleArrowUp className={iconColorMap[iconColor]} />
        )}
      </div>
      <span className="font-semibold text-2xl text-zinc-100">{value}</span>
    </div>
  )
}
