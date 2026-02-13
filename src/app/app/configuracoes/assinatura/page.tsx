'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlanCard } from '@/components/subscriptions/plan-card'
import { UpgradeButton } from '@/components/subscriptions/upgrade-button'
import { ManageSubscription } from '@/components/subscriptions/manage-subscription'
import { UsageMeter } from '@/components/subscriptions/usage-meter'
import { useSubscription } from '@/lib/queries/subscriptions'
import { PLANS } from '@/lib/plans'

export default function AssinaturaPage() {
  const { data: subscription, isLoading } = useSubscription()

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/app/perfil">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Assinatura</h1>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          Carregando...
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="container max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/app/perfil">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Assinatura</h1>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          Erro ao carregar informações da assinatura.
        </div>
      </div>
    )
  }

  const currentPlan = subscription.plan as 'free' | 'pro' | 'pro_annual'
  const isFree = currentPlan === 'free'
  const isPro = currentPlan === 'pro' || currentPlan === 'pro_annual'

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/app/perfil">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Assinatura</h1>
          <p className="text-muted-foreground">Gerencie seu plano e uso</p>
        </div>
      </div>

      {/* Current Plan */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Plano Atual</h2>
        <PlanCard plan={PLANS[currentPlan]} isCurrent />
      </section>

      {/* Usage Meter */}
      <UsageMeter
        plan={currentPlan}
        messagesUsed={subscription.whatsapp_messages_used}
        resetAt={subscription.whatsapp_messages_reset_at}
      />

      {/* Upgrade Options (Free users) */}
      {isFree && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Fazer Upgrade</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <PlanCard plan={PLANS.pro}>
              <UpgradeButton priceId={PLANS.pro.stripePriceId!} />
            </PlanCard>
            <PlanCard plan={PLANS.pro_annual}>
              <UpgradeButton priceId={PLANS.pro_annual.stripePriceId!} />
            </PlanCard>
          </div>
        </section>
      )}

      {/* Manage Subscription (Pro users) */}
      {isPro && (
        <ManageSubscription
          currentPeriodEnd={subscription.current_period_end}
          hasStripeCustomer={!!subscription.stripe_customer_id}
        />
      )}
    </div>
  )
}
