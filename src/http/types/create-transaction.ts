export type CreateTransactionFormData = {
  title: string
  description: string
  amount: number
  type: 'credit' | 'debit'
}
