import { CircleArrowDown, CircleArrowUp, DollarSign } from 'lucide-react'

type IconColor = 'emerald-400' | 'red-400'
type BgColor = 'slate-800' | 'emerald-900'

interface CardProps {
  title: string
  value: number | string
  iconColor?: IconColor
  bgColor?: BgColor
}

const bgColorMap: Record<BgColor, string> = {
  'slate-800': 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70',
  'emerald-900':
    'bg-gradient-to-br from-emerald-900/80 to-emerald-800/60 border-emerald-700/50 hover:from-emerald-900/90 hover:to-emerald-800/70',
}

const iconColorMap: Record<IconColor, string> = {
  'emerald-400': 'text-emerald-400',
  'red-400': 'text-red-400',
}

export function Card({ title, value, iconColor = 'emerald-400', bgColor = 'slate-800' }: CardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${bgColorMap[bgColor]} min-w-[280px] px-6 py-8 sm:min-w-[320px]`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-300 text-sm uppercase tracking-wider">{title}</span>
          <div className="rounded-xl bg-slate-900/30 p-2">
            {bgColor === 'emerald-900' ? (
              <DollarSign className="h-5 w-5 text-emerald-300" />
            ) : iconColor === 'red-400' ? (
              <CircleArrowDown className={`${iconColorMap[iconColor]} h-5 w-5`} />
            ) : (
              <CircleArrowUp className={`${iconColorMap[iconColor]} h-5 w-5`} />
            )}
          </div>
        </div>
        <span className="block font-bold text-3xl text-white leading-tight">{value}</span>
      </div>
    </div>
  )
}
