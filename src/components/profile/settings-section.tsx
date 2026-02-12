'use client'

import Link from 'next/link'
import { CreditCard, MessageCircle, Shield, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'

const settings = [
  {
    label: 'Assinatura',
    href: '/app/configuracoes/assinatura',
    icon: CreditCard,
    description: 'Gerencie seu plano',
  },
  {
    label: 'WhatsApp',
    href: '/app/configuracoes/whatsapp',
    icon: MessageCircle,
    description: 'Configure integração',
  },
  {
    label: 'Política de Privacidade',
    href: '/privacidade',
    icon: Shield,
    description: 'Leia nossa política',
  },
]

export function SettingsSection() {
  return (
    <div className="space-y-2">
      {settings.map((setting) => {
        const Icon = setting.icon
        return (
          <Link key={setting.href} href={setting.href}>
            <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
