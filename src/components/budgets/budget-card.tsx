'use client'

import { Card } from '@/components/ui/card'
import { BudgetProgress } from './budget-progress'
import { categoryLabels, categoryIcons } from '@/lib/constants/categories'
import * as Icons from 'lucide-react'

interface BudgetCardProps {
  category: string
  spent: number
  limit: number
}

export function BudgetCard({ category, spent, limit }: BudgetCardProps) {
  const label = categoryLabels[category] || category
  const iconName = categoryIcons[category] || 'MoreHorizontal'

  // Dynamically get icon component
  const IconComponent = (Icons as any)[iconName] as React.ComponentType<{ className?: string }>

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3">
        {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
        <h3 className="font-medium">{label}</h3>
      </div>
      <BudgetProgress spent={spent} limit={limit} />
    </Card>
  )
}
