'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/lib/queries/profile'
import { usePrivacy } from '@/providers/privacy-provider'

const PAGE_TITLES: Record<string, string> = {
  '/app/orcamento': 'Orçamento',
  '/app/carteira': 'Carteira',
  '/app/relatorios': 'Relatórios',
  '/app/perfil': 'Perfil',
  '/app/configuracoes': 'Configurações',
}

export function MobileHeader() {
  const pathname = usePathname()
  const { data: profile } = useProfile()
  const { valuesHidden, toggleValues } = usePrivacy()

  const firstName = profile?.full_name?.split(' ')[0] || ''
  const initial = firstName?.[0]?.toUpperCase() || 'U'

  // Home shows greeting, other pages show title
  const isHome = pathname === '/app'
  const title = isHome
    ? `Olá${firstName ? `, ${firstName}` : ''}!`
    : PAGE_TITLES[pathname] || Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1] || ''

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 md:hidden">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Avatar */}
        <Link
          href="/app/perfil"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0"
        >
          <span className="text-sm font-semibold text-primary">{initial}</span>
        </Link>

        {/* Center: Title */}
        <h1 className="text-base font-semibold font-heading truncate mx-3">
          {title}
        </h1>

        {/* Right: Eye toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={toggleValues}
        >
          {valuesHidden ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
          <span className="sr-only">
            {valuesHidden ? 'Mostrar valores' : 'Ocultar valores'}
          </span>
        </Button>
      </div>
    </header>
  )
}
