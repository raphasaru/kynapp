import { MessageCircle, Shield, Smartphone, BarChart3 } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function FeaturesSection() {
  const features = [
    {
      icon: MessageCircle,
      title: 'Registre pelo WhatsApp',
      description: 'Envie um texto, áudio ou foto e pronto. A IA do KYN registra tudo automaticamente.',
    },
    {
      icon: Shield,
      title: 'Segurança de verdade',
      description: 'Seus dados financeiros são criptografados com AES-256. Nem nós conseguimos ver.',
    },
    {
      icon: Smartphone,
      title: 'Simples e rápido',
      description: 'Dashboard intuitivo, categorias automáticas, orçamento visual. Sem complicação.',
    },
    {
      icon: BarChart3,
      title: 'Controle total',
      description: 'Veja para onde vai seu dinheiro com gráficos e relatórios claros.',
    },
  ]

  return (
    <section id="features" className="py-24 px-6 bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
          Por que escolher o KYN?
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Gestão financeira descomplicada, com a segurança que você precisa
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="p-6 hover:shadow-md transition-shadow border-border"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
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
