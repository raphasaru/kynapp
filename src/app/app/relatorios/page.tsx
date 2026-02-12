'use client'

import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { decryptFields } from '@/lib/crypto/encrypt'
import { getMonthRange } from '@/lib/aggregations/date-ranges'
import { useMonthSelector } from '@/hooks/use-month-selector'
import { MonthSelector } from '@/components/dashboard/month-selector'
import { ExpensePieChart } from '@/components/charts/expense-pie-chart'
import { IncomeExpenseBars } from '@/components/charts/income-expense-bars'
import { ReportSummary } from '@/components/charts/report-summary'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getLast6Months } from '@/lib/aggregations/date-ranges'
import { getReportSummary } from '@/lib/aggregations/chart-data'
import type { DecryptedTransaction } from '@/lib/queries/transactions'

export default function RelatoriosPage() {
  const { month, prevMonth, nextMonth, monthLabel } = useMonthSelector()

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

  // Get current month transactions
  const currentMonthQuery = monthQueries.find((_, index) => last6Months[index].month === month)
  const currentMonthTransactions = currentMonthQuery?.data || []

  // Calculate summary for current month
  const summary = useMemo(
    () => getReportSummary(currentMonthTransactions),
    [currentMonthTransactions]
  )

  // Loading state
  const isLoading = monthQueries.some(q => q.isLoading)

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-heading">Relatorios</h1>
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
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <ReportSummary
          totalReceived={summary.totalReceived}
          totalPaid={summary.totalPaid}
          projectedBalance={summary.projectedBalance}
        />
      )}

      {/* Expenses by Category */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold font-heading mb-4">Despesas por Categoria</h2>
        {isLoading ? (
          <Skeleton className="h-[300px]" />
        ) : (
          <ExpensePieChart transactions={currentMonthTransactions} />
        )}
      </Card>

      {/* Income vs Expenses */}
      <Card className="p-6">
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
