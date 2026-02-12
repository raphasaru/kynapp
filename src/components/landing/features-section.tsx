import { MessageCircle, Shield, Smartphone, BarChart3 } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function FeaturesSection() {
  const features = [
    {
      icon: MessageCircle,
      title: 'Registre pelo WhatsApp',
      description: 'Envie um texto, áudio ou foto e pronto. A IA do KYN registra tudo automaticamente.',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Shield,
      title: 'Segurança de verdade',
      description: 'Seus dados financeiros são criptografados com AES-256. Nem nós conseguimos ver.',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Smartphone,
      title: 'Simples e rápido',
      description: 'Dashboard intuitivo, categorias automáticas, orçamento visual. Sem complicação.',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: BarChart3,
      title: 'Controle total',
      description: 'Veja para onde vai seu dinheiro com gráficos e relatórios claros.',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ]

  return (
    <section id="features" className="py-24 px-6 bg-white text-neutral-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4 text-neutral-900 animate-slide-up">
          Por que escolher o KYN?
        </h2>
        <p className="text-center text-neutral-600 mb-16 max-w-2xl mx-auto animate-slide-up delay-100">
          Gestão financeira descomplicada, com a segurança que você precisa
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className={`p-6 border-neutral-200 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up-sm delay-${(index + 2) * 100}`}
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2 text-neutral-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
