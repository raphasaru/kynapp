'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { DecryptedTransaction } from '@/lib/queries/transactions'
import { getExpenseByCategoryData, CHART_COLORS } from '@/lib/aggregations/chart-data'
import { formatCurrency } from '@/lib/formatters/currency'

interface ExpensePieChartProps {
  transactions: DecryptedTransaction[]
}

export function ExpensePieChart({ transactions }: ExpensePieChartProps) {
  const data = useMemo(
    () => getExpenseByCategoryData(transactions),
    [transactions]
  )

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        Nenhuma despesa registrada neste periodo
      </div>
    )
  }

  return (
    <div aria-label="Grafico de despesas por categoria">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name }) => name}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
