'use client'

import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters/currency'
import { cn } from '@/lib/utils'

interface ReportSummaryProps {
  totalReceived: number
  totalPaid: number
  projectedBalance: number
}

export function ReportSummary({ totalReceived, totalPaid, projectedBalance }: ReportSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Received */}
      <Card className="p-3 md:p-6">
        <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Total Recebido</p>
        <p className="text-xl md:text-3xl font-bold font-heading text-green-600">
          {formatCurrency(totalReceived)}
        </p>
      </Card>

      {/* Total Paid */}
      <Card className="p-3 md:p-6">
        <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Total Pago</p>
        <p className="text-xl md:text-3xl font-bold font-heading text-red-600">
          {formatCurrency(totalPaid)}
        </p>
      </Card>

      {/* Projected Balance */}
      <Card className="p-3 md:p-6">
        <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Saldo Projetado</p>
        <p className={cn(
          'text-xl md:text-3xl font-bold font-heading',
          projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'
        )}>
          {formatCurrency(projectedBalance)}
        </p>
      </Card>
    </div>
  )
}
