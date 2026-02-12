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
    <section className="py-16 px-6 bg-[hsl(220,25%,7%)] text-white border-y border-white/10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-center gap-4">
          {badges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <div
                key={badge.text}
                className={`inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/15 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:bg-white/15 hover:-translate-y-0.5 animate-slide-up-sm delay-${(index + 1) * 100}`}
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
