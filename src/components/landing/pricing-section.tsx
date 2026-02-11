import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function PricingSection() {
  const plans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      period: '/mês',
      description: 'Comece a controlar suas finanças',
      features: [
        '2 contas bancárias',
        '1 cartão de crédito',
        '3 meses de histórico',
        '30 mensagens WhatsApp/mês',
        'Dashboard e relatórios',
        'Criptografia AES-256',
      ],
      cta: 'Começar grátis',
      href: '/signup',
      featured: false,
    },
    {
      name: 'Pro',
      price: 'R$ 19,90',
      period: '/mês',
      yearlyPrice: 'ou R$ 179,90/ano',
      description: 'Máximo de praticidade',
      features: [
        'Contas e cartões ilimitados',
        'Histórico completo',
        'WhatsApp ilimitado',
        'Tudo do plano gratuito',
      ],
      cta: 'Assinar Pro',
      href: '/signup',
      featured: true,
      badge: 'Mais popular',
    },
  ]

  return (
    <section className="py-24 px-6 bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
          Planos simples, sem surpresas
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Comece grátis e faça upgrade quando quiser
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 relative ${
                plan.featured
                  ? 'border-primary shadow-[0_0_20px_rgba(16,183,127,0.2)]'
                  : 'border-border'
              }`}
            >
              {plan.featured && plan.badge && (
                <Badge
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white border-0"
                >
                  {plan.badge}
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="font-heading text-2xl font-bold mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="mb-2">
                  <span className="font-heading text-4xl font-bold">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                {plan.yearlyPrice && (
                  <p className="text-sm text-muted-foreground">
                    {plan.yearlyPrice}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                className={`w-full ${
                  plan.featured
                    ? 'bg-primary hover:bg-primary-dark text-white'
                    : 'bg-white hover:bg-neutral-100'
                }`}
                variant={plan.featured ? 'default' : 'outline'}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
