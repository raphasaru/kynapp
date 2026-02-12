'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { DecryptedTransaction } from '@/lib/queries/transactions'
import { getIncomeExpenseByMonth, CHART_COLORS } from '@/lib/aggregations/chart-data'
import { getLast6Months } from '@/lib/aggregations/date-ranges'
import { formatCurrency } from '@/lib/formatters/currency'

interface IncomeExpenseBarsProps {
  transactionsByMonth: Map<string, DecryptedTransaction[]>
}

export function IncomeExpenseBars({ transactionsByMonth }: IncomeExpenseBarsProps) {
  const data = useMemo(() => {
    const months = getLast6Months()
    return getIncomeExpenseByMonth(transactionsByMonth, months)
  }, [transactionsByMonth])

  return (
    <div aria-label="Grafico de receitas vs despesas">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis className="hidden md:block" />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend />
          <Bar dataKey="income" fill="#10b77f" name="Receitas" />
          <Bar dataKey="expense" fill="#ef4444" name="Despesas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
