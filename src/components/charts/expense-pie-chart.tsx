'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { DecryptedTransaction } from '@/lib/queries/transactions'
import { getExpenseByCategoryData, CHART_COLORS } from '@/lib/aggregations/chart-data'
import { formatCurrency } from '@/lib/formatters/currency'
import { PrivateValue } from '@/components/ui/private-value'

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

  const maxValue = Math.max(...data.map(d => d.value))
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div aria-label="Grafico de despesas por categoria">
      {/* Pie chart — hidden on mobile */}
      <div className="hidden md:block">
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

      {/* Horizontal bars — mobile */}
      <div className="md:hidden space-y-3">
        {data.map((item, index) => {
          const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0
          const pctTotal = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0'
          return (
            <div key={item.category} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate">{item.name}</span>
                <span className="shrink-0 ml-2 text-muted-foreground">
                  <PrivateValue>{formatCurrency(item.value)}</PrivateValue>
                  <span className="ml-1 text-xs">({pctTotal}%)</span>
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
