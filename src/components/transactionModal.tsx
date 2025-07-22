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

    await createTransaction({
      ...data,
    })
  }

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 h-full w-full bg-black/75" />

      <Dialog.Content className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 min-w-lg space-y-5 rounded-md bg-zinc-800 px-12 pt-10">
        <Dialog.Title className="font-semibold text-white text-xl">Nova transação</Dialog.Title>

        <form onSubmit={handleSubmit(handleCreateTransaction)} className="flex flex-col gap-3 text-white">
          <input
            type="text"
            {...register('title')}
            className="rounded-md bg-zinc-900 px-3 py-2 outline-0 focus:outline-1 focus:outline-green-300"
            placeholder="Título"
          />
          {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
          <input
            type="text"
            {...register('amount')}
            className="rounded-md bg-zinc-900 px-3 py-2 outline-0 focus:outline-1 focus:outline-green-300"
            placeholder="Valor"
          />
          {errors.amount && <span className="text-red-500 text-sm">{errors.amount.message}</span>}
          <input
            type="text"
            {...register('description')}
            className="rounded-md bg-zinc-900 px-3 py-2 outline-0 focus:outline-1 focus:outline-green-300"
            placeholder="Categoria"
          />
          {errors.description && <span className="text-red-500 text-sm">{errors.description.message}</span>}

          <RadioGroup.Root
            className="mt-2 flex justify-between gap-2"
            value={selectedType}
            onValueChange={(value) => setValue('type', value as 'credit' | 'debit')}
          >
            <RadioOption value="credit" icon={<CircleArrowUp />} color="emerald">
              Crédito
            </RadioOption>
            <RadioOption value="debit" icon={<CircleArrowDown />} color="red">
              Débito
            </RadioOption>
          </RadioGroup.Root>

          <button
            type="submit"
            className="my-4 cursor-pointer rounded-md bg-emerald-600 px-4 py-3 text-white transition-colors hover:bg-emerald-600/90"
          >
            Cadastrar
          </button>
        </form>

        <Dialog.Close asChild>
          <button
            type="button"
            className="absolute top-4 right-4 cursor-pointer text-gray-400 transition-colors hover:text-zinc-400"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </Dialog.Close>
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
  const bgChecked = color === 'emerald' ? 'data-[state=checked]:bg-emerald-800' : 'data-[state=checked]:bg-red-600'
  const textColor =
    color === 'emerald'
      ? 'text-emerald-500 group-data-[state=checked]:text-white'
      : 'text-red-500 group-data-[state=checked]:text-white'

  return (
    <RadioGroup.Item
      value={value}
      className={`group flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-zinc-700/80 py-3 transition-colors data-[state=checked]:bg-emerald-800 data-[state=checked]:text-white data-[state=unchecked]:hover:bg-zinc-700/60 ${bgChecked} `}
    >
      <div className={textColor}>{icon}</div>
      <span className="text-sm">{children}</span>
    </RadioGroup.Item>
  )
}
