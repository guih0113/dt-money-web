import type { Transaction } from "./transaction"

export type ListTransactionsResponse = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  transactions: Transaction[]
}