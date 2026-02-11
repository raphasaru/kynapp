import { Lock, ShieldCheck, FileCheck } from 'lucide-react'

export function SecurityBadges() {
  const badges = [
    {
      icon: Lock,
      text: 'Dados 100% criptografados',
    },
    {
      icon: ShieldCheck,
      text: 'Não vendemos suas informações',
    },
    {
      icon: FileCheck,
      text: 'LGPD Compliant',
    },
  ]

  return (
    <section className="py-16 px-6 bg-white border-y border-border">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-center gap-6">
          {badges.map((badge) => {
            const Icon = badge.icon
            return (
              <div
                key={badge.text}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-sm font-semibold text-primary"
              >
                <Icon className="w-4 h-4" />
                {badge.text}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
