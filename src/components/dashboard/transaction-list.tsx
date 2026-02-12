'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TransactionItem } from '@/components/transactions/transaction-item'
import { filterTransactionsBySearch } from '@/lib/queries/transactions'
import type { DecryptedTransaction } from '@/lib/queries/transactions'

interface TransactionListProps {
  transactions: DecryptedTransaction[]
  isLoading?: boolean
  onEdit: (transaction: DecryptedTransaction) => void
}

export function TransactionList({ transactions, isLoading, onEdit }: TransactionListProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'planned' | 'completed'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Apply filters
  let filtered = transactions
  if (statusFilter !== 'all') {
    filtered = filtered.filter(t => t.status === statusFilter)
  }
  if (typeFilter !== 'all') {
    filtered = filtered.filter(t => t.type === typeFilter)
  }
  if (searchQuery) {
    filtered = filterTransactionsBySearch(filtered, searchQuery)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar transações..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status filter */}
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="planned">Planejadas</TabsTrigger>
            <TabsTrigger value="completed">Realizadas</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Type filter */}
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="income">Receitas</TabsTrigger>
            <TabsTrigger value="expense">Despesas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Transaction list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">Nenhuma transação encontrada</p>
            <p className="text-sm">Tente ajustar os filtros ou criar uma nova transação</p>
          </div>
        ) : (
          filtered.map(transaction => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onEdit={() => onEdit(transaction)}
            />
          ))
        )}
      </div>
    </div>
  )
}
