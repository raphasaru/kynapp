'use client'

import { PLANS } from '../../../reference/stripe-plans'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useUpgrade } from '@/lib/queries/subscriptions'
import { formatCurrency } from '@/lib/formatters/currency'

export function ProStep() {
  const createCheckout = useUpgrade()

  const handleUpgrade = async (priceId: string) => {
    try {
      await createCheckout.mutateAsync(priceId)
    } catch (error) {
      console.error('Failed to create checkout:', error)
    }
  }

  const freePlan = PLANS.free
  const proPlan = PLANS.pro
  const proAnnualPlan = PLANS.pro_annual

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Desbloqueie o KYN Pro</h2>
        <p className="text-muted-foreground">
          Aproveite WhatsApp ilimitado e recursos avançados
        </p>
      </div>

      {/* Plan comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Free plan */}
        <div className="border rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold">{freePlan.name}</h3>
            <p className="text-3xl font-bold mt-2">
              {formatCurrency(freePlan.price)}
            </p>
            <p className="text-sm text-muted-foreground">
              {freePlan.whatsappLimit} mensagens WhatsApp/mês
            </p>
          </div>
          <ul className="space-y-2">
            {freePlan.features.map((feature: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pro plan */}
        <div className="border-2 border-primary rounded-lg p-6 space-y-4 relative">
          <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
            POPULAR
          </div>
          <div>
            <h3 className="text-xl font-bold">{proPlan.name}</h3>
            <p className="text-3xl font-bold mt-2">
              {formatCurrency(proPlan.price)}
              <span className="text-base font-normal text-muted-foreground">/mês</span>
            </p>
            <p className="text-sm text-primary font-medium">
              WhatsApp ilimitado
            </p>
          </div>
          <ul className="space-y-2">
            {proPlan.features.map((feature: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            onClick={() => handleUpgrade(proPlan.stripePriceId!)}
            disabled={createCheckout.isPending}
            className="w-full"
          >
            {createCheckout.isPending ? 'Processando...' : 'Assinar Pro Mensal'}
          </Button>
        </div>
      </div>

      {/* Annual offer */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">{proAnnualPlan.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(proAnnualPlan.price)}/ano — economize 25%
            </p>
          </div>
          <Button
            onClick={() => handleUpgrade(proAnnualPlan.stripePriceId!)}
            disabled={createCheckout.isPending}
            variant="outline"
          >
            Assinar Anual
          </Button>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Você pode começar grátis e fazer upgrade depois
      </p>
    </div>
  )
}
