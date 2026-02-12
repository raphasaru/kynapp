/**
 * Stripe Plan Configuration Reference
 * Price IDs are from Stripe test mode
 */

export type SubscriptionPlan = 'free' | 'pro' | 'pro_annual'

export interface Plan {
  id: SubscriptionPlan
  name: string
  description: string
  price: number          // BRL
  priceYearly?: number
  interval: 'month' | 'year'
  features: string[]
  whatsappLimit: number | 'unlimited'
  stripePriceId?: string
  popular?: boolean
}

export const PLANS: Record<SubscriptionPlan, Plan> = {
  free: {
    id: 'free',
    name: 'Grátis',
    description: 'Comece a controlar suas finanças',
    price: 0,
    interval: 'month',
    features: [
      'Dashboard completo',
      'Transações ilimitadas no app',
      'Carteira (contas e cartões)',
      'Orçamentos por categoria',
      '30 mensagens WhatsApp/mês',
    ],
    whatsappLimit: 30,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Para quem quer o máximo de praticidade',
    price: 19.90,
    interval: 'month',
    features: [
      'Tudo do plano Grátis',
      'WhatsApp ilimitado',
      'Metas de economia',
      'Relatórios avançados',
      'Exportação PDF',
      'Suporte prioritário',
    ],
    whatsappLimit: 'unlimited',
    stripePriceId: 'price_1StGj0IYuOEaGzogx8HO8Hi1',  // STRIPE_PRO_MONTHLY_PRICE_ID
    popular: true,
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Pro Anual',
    description: '25% de desconto pagando anualmente',
    price: 179.90,
    priceYearly: 179.90,
    interval: 'year',
    features: [
      'Tudo do plano Pro',
      '25% de desconto',
      'Equivale a R$ 14,99/mês',
    ],
    whatsappLimit: 'unlimited',
    stripePriceId: 'price_1StGkmIYuOEaGzogcKuLfbqn',  // STRIPE_PRO_ANNUAL_PRICE_ID
  },
}

export const FREE_WHATSAPP_LIMIT = 30
