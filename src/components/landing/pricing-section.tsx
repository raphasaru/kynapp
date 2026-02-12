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
    <section className="py-24 px-6 bg-neutral-50 text-neutral-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4 text-neutral-900 animate-slide-up">
          Planos simples, sem surpresas
        </h2>
        <p className="text-center text-neutral-600 mb-16 animate-slide-up delay-100">
          Comece grátis e faça upgrade quando quiser
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`p-8 relative transition-all duration-300 hover:-translate-y-1 animate-slide-up delay-${(index + 2) * 100} ${
                plan.featured
                  ? 'border-primary shadow-[0_0_30px_rgba(16,183,127,0.15)] hover:shadow-glow bg-white'
                  : 'border-neutral-200 bg-white hover:shadow-lg'
              }`}
            >
              {plan.featured && plan.badge && (
                <Badge
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white border-0 px-4 py-1 shadow-[0_0_12px_rgba(16,183,127,0.3)]"
                >
                  {plan.badge}
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="font-heading text-2xl font-bold mb-2 text-neutral-900">
                  {plan.name}
                </h3>
                <p className="text-sm text-neutral-600 mb-4">
                  {plan.description}
                </p>
                <div className="mb-2">
                  <span className="font-heading text-4xl font-bold text-neutral-900">
                    {plan.price}
                  </span>
                  <span className="text-neutral-600">
                    {plan.period}
                  </span>
                </div>
                {plan.yearlyPrice && (
                  <p className="text-sm text-neutral-600">
                    {plan.yearlyPrice}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-neutral-700">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                className={`w-full h-12 font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                  plan.featured
                    ? 'bg-primary hover:bg-primary-dark text-white shadow-[0_0_15px_rgba(16,183,127,0.2)] hover:shadow-[0_0_25px_rgba(16,183,127,0.3)]'
                    : '!bg-transparent !border-[1.5px] !border-primary-300 text-primary hover:!bg-primary-50 hover:!border-primary shadow-none'
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
