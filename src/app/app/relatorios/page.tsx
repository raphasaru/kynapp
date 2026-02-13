'use client'

import { useMemo, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { decryptFields } from '@/lib/crypto/encrypt'
import { getMonthRange } from '@/lib/aggregations/date-ranges'
import { useMonthSelector } from '@/hooks/use-month-selector'
import { MonthSelector } from '@/components/dashboard/month-selector'
import { ExpensePieChart } from '@/components/charts/expense-pie-chart'
import { IncomeExpenseBars } from '@/components/charts/income-expense-bars'
import { ReportSummary } from '@/components/charts/report-summary'
import { TransactionItem } from '@/components/transactions/transaction-item'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getLast6Months } from '@/lib/aggregations/date-ranges'
import { getReportSummary } from '@/lib/aggregations/chart-data'
import { formatCurrency } from '@/lib/formatters/currency'
import { PrivateValue } from '@/components/ui/private-value'
import { format, subDays } from 'date-fns'
import type { DecryptedTransaction } from '@/lib/queries/transactions'

const PERIOD_FILTERS = [
  { label: 'Hoje', days: 0 },
  { label: 'Ontem', days: 1 },
  { label: '3 dias', days: 3 },
  { label: '7 dias', days: 7 },
  { label: '14 dias', days: 14 },
  { label: '30 dias', days: 30 },
] as const

export default function RelatoriosPage() {
  const { month, prevMonth, nextMonth, monthLabel } = useMonthSelector()
  const [periodDays, setPeriodDays] = useState<number>(7)

  // Get last 6 months for bar chart
  const last6Months = useMemo(() => getLast6Months(), [])

  // Fetch transactions for all 6 months using useQueries
  const monthQueries = useQueries({
    queries: last6Months.map(({ month: monthKey }) => ({
      queryKey: ['transactions', monthKey],
      queryFn: async () => {
        const supabase = createClient()
        const { start, end } = getMonthRange(monthKey)

        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .gte('due_date', start)
          .lt('due_date', end)
          .order('due_date', { ascending: false })

        if (error) throw error

        // Decrypt all transactions
        const decrypted = await Promise.all(
          (data || []).map(row => decryptFields('transactions', row))
        )

        return decrypted as DecryptedTransaction[]
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  })

  // Build map of month -> transactions for bar chart
  const transactionsByMonth = useMemo(() => {
    const map = new Map<string, DecryptedTransaction[]>()
    last6Months.forEach(({ month: monthKey }, index) => {
      const queryResult = monthQueries[index]
      if (queryResult.data) {
        map.set(monthKey, queryResult.data)
      }
    })
    return map
  }, [monthQueries, last6Months])

  // All transactions (flattened from all months)
  const allTransactions = useMemo(() => {
    const all: DecryptedTransaction[] = []
    for (const [, txs] of transactionsByMonth) {
      all.push(...txs)
    }
    return all
  }, [transactionsByMonth])

  // Get current month transactions
  const currentMonthQuery = monthQueries.find((_, index) => last6Months[index].month === month)
  const currentMonthTransactions = currentMonthQuery?.data || []

  // Calculate summary for current month
  const summary = useMemo(
    () => getReportSummary(currentMonthTransactions),
    [currentMonthTransactions]
  )

  // Period-filtered transactions
  const periodTransactions = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    let startDate: string

    if (periodDays === 0) {
      startDate = today
    } else if (periodDays === 1) {
      // "Ontem" = only yesterday
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
      return allTransactions
        .filter(t => t.due_date === yesterday)
        .sort((a, b) => b.due_date.localeCompare(a.due_date))
    } else {
      startDate = format(subDays(new Date(), periodDays), 'yyyy-MM-dd')
    }

    return allTransactions
      .filter(t => t.due_date >= startDate && t.due_date <= today)
      .sort((a, b) => b.due_date.localeCompare(a.due_date))
  }, [allTransactions, periodDays])

  // Period summary
  const periodSummary = useMemo(() => {
    const income = periodTransactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = periodTransactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
    return { income, expense, count: periodTransactions.length }
  }, [periodTransactions])

  // Loading state
  const isLoading = monthQueries.some(q => q.isLoading)

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-heading">Relatórios</h1>
      </div>

      {/* Month selector */}
      <MonthSelector
        monthLabel={monthLabel}
        onPrev={prevMonth}
        onNext={nextMonth}
      />

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-20 md:h-32" />
          <Skeleton className="h-20 md:h-32" />
          <Skeleton className="h-20 md:h-32" />
        </div>
      ) : (
        <ReportSummary
          totalReceived={summary.totalReceived}
          totalPaid={summary.totalPaid}
          projectedBalance={summary.projectedBalance}
        />
      )}

      {/* Period filter section */}
      <Card className="p-4 md:p-6">
        <h2 className="text-xl font-semibold font-heading mb-4">Transações por Período</h2>

        {/* Period buttons */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
          {PERIOD_FILTERS.map(({ label, days }) => (
            <Button
              key={days}
              variant={periodDays === days ? 'default' : 'outline'}
              size="sm"
              className="shrink-0"
              onClick={() => setPeriodDays(days)}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Period summary */}
        {!isLoading && (
          <div className="flex items-center gap-4 text-sm py-3 border-b mb-3">
            <span className="text-muted-foreground">{periodSummary.count} transações</span>
            <span className="text-green-600 font-medium">
              + <PrivateValue>{formatCurrency(periodSummary.income)}</PrivateValue>
            </span>
            <span className="text-red-600 font-medium">
              - <PrivateValue>{formatCurrency(periodSummary.expense)}</PrivateValue>
            </span>
          </div>
        )}

        {/* Transaction list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : periodTransactions.length === 0 ? (
          <p className="text-center py-8 text-sm text-muted-foreground">
            Nenhuma transação neste período
          </p>
        ) : (
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {periodTransactions.map(tx => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))}
          </div>
        )}
      </Card>

      {/* Expenses by Category */}
      <Card className="p-4 md:p-6">
        <h2 className="text-xl font-semibold font-heading mb-4">Despesas por Categoria</h2>
        {isLoading ? (
          <Skeleton className="h-[300px]" />
        ) : (
          <ExpensePieChart transactions={currentMonthTransactions} />
        )}
      </Card>

      {/* Income vs Expenses */}
      <Card className="p-4 md:p-6">
        <h2 className="text-xl font-semibold font-heading mb-4">Receitas vs Despesas</h2>
        {isLoading ? (
          <Skeleton className="h-[300px]" />
        ) : (
          <IncomeExpenseBars transactionsByMonth={transactionsByMonth} />
        )}
      </Card>
    </div>
  )
}
