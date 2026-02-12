import { Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Plan } from '@/lib/plans'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

interface PlanCardProps {
  plan: Plan
  isCurrent?: boolean
  children?: React.ReactNode
}

export function PlanCard({ plan, isCurrent, children }: PlanCardProps) {
  return (
    <Card className={isCurrent ? 'border-primary shadow-lg' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {plan.name}
              {plan.popular && (
                <Badge variant="default" className="bg-primary">
                  Popular
                </Badge>
              )}
              {isCurrent && (
                <Badge variant="outline" className="border-primary text-primary">
                  Plano Atual
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-4xl font-bold">
            {formatCurrency(plan.price)}
          </span>
          <span className="text-muted-foreground">
            {plan.interval === 'month' ? '/mês' : '/ano'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        {children}
      </CardContent>
    </Card>
  )
}
