import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Transactions } from './pages/transactions'

const queryClient = new QueryClient()

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
