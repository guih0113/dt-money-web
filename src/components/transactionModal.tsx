import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { CircleArrowDown, CircleArrowUp, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { useCreateTransaction } from '@/http/hooks/useCreateTransaction'

interface TransactionModalProps {
  onTransactionCreated: () => void
}

const createTransactionSchema = z.object({
  title: z.string().min(3, 'Mínimo de 3 caracteres').max(15, 'Máximo de 15 caracteres'),
  description: z.string().min(5, 'Mínimo de 5 caracteres').max(25, 'Máximo de 25 caracteres'),
  amount: z.coerce.number().min(1, 'O valor deve ser no mínimo 1'),
  type: z.enum(['credit', 'debit']),
})

type CreateTransactionInterface = z.infer<typeof createTransactionSchema>

export function TransactionModal({ onTransactionCreated }: TransactionModalProps) {
  const { mutateAsync: createTransaction } = useCreateTransaction(1)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: '',
      type: 'credit',
    },
  })

  const selectedType = watch('type')

  async function handleCreateTransaction(data: CreateTransactionInterface) {
    reset()
    onTransactionCreated()
    await createTransaction({ ...data })
  }

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fade-in-0 fixed inset-0 z-50 animate-in bg-black/70 backdrop-blur-sm duration-300" />

      <Dialog.Content className="sm:-translate-x-1/2 sm:-translate-y-1/2 fade-in-0 zoom-in-95 fixed inset-0 z-50 h-full w-full animate-in rounded-none bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-xl duration-300 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:mx-4 sm:h-auto sm:w-full sm:max-w-md sm:rounded-2xl sm:border sm:border-slate-700/50 sm:shadow-2xl">
        <div className="flex h-full flex-col p-6 sm:h-auto sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <Dialog.Title className="font-bold text-white text-xl sm:text-2xl">Nova transação</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-xl bg-slate-800/50 p-2 text-slate-400 transition-all duration-200 hover:scale-105 hover:bg-slate-700/50 hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex flex-1 flex-col justify-center sm:block">
            <form onSubmit={handleSubmit(handleCreateTransaction)} className="space-y-6 sm:space-y-4">
              <div className="space-y-1">
                <input
                  type="text"
                  {...register('title')}
                  className="h-12 w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-emerald-500/50 focus:bg-slate-800/70 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Título da transação"
                />
                {errors.title && <span className="font-medium text-red-400 text-sm">{errors.title.message}</span>}
              </div>

              <div className="space-y-1">
                <input
                  type="text"
                  {...register('amount')}
                  className="h-12 w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-emerald-500/50 focus:bg-slate-800/70 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Valor (R$)"
                />
                {errors.amount && <span className="font-medium text-red-400 text-sm">{errors.amount.message}</span>}
              </div>

              <div className="space-y-1">
                <input
                  type="text"
                  {...register('description')}
                  className="h-12 w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-emerald-500/50 focus:bg-slate-800/70 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Categoria"
                />
                {errors.description && (
                  <span className="font-medium text-red-400 text-sm">{errors.description.message}</span>
                )}
              </div>

              <RadioGroup.Root
                className="mt-6 grid grid-cols-2 gap-3"
                value={selectedType}
                onValueChange={(value) => setValue('type', value as 'credit' | 'debit')}
              >
                <RadioOption value="credit" icon={<CircleArrowUp />} color="emerald">
                  Entrada
                </RadioOption>
                <RadioOption value="debit" icon={<CircleArrowDown />} color="red">
                  Saída
                </RadioOption>
              </RadioGroup.Root>

              <button
                type="submit"
                className="mt-8 h-12 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/25 hover:shadow-lg active:scale-95"
              >
                Cadastrar transação
              </button>
            </form>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  )
}

interface RadioOptionProps {
  value: 'credit' | 'debit'
  icon: React.ReactNode
  color: 'emerald' | 'red'
  children: React.ReactNode
}

function RadioOption({ value, icon, color, children }: RadioOptionProps) {
  const styles =
    color === 'emerald'
      ? 'data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-600 data-[state=checked]:to-emerald-500 data-[state=checked]:border-emerald-500/50 data-[state=checked]:shadow-lg data-[state=checked]:shadow-emerald-500/25'
      : 'data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-600 data-[state=checked]:to-red-500 data-[state=checked]:border-red-500/50 data-[state=checked]:shadow-lg data-[state=checked]:shadow-red-500/25'

  const iconColor =
    color === 'emerald'
      ? 'text-emerald-400 group-data-[state=checked]:text-white'
      : 'text-red-400 group-data-[state=checked]:text-white'

  return (
    <RadioGroup.Item
      value={value}
      className={`group flex h-12 cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/50 text-slate-300 transition-all duration-200 hover:bg-slate-700/50 data-[state=checked]:text-white ${styles}`}
    >
      <div className={iconColor}>{icon}</div>
      <span className="font-medium">{children}</span>
    </RadioGroup.Item>
  )
}
