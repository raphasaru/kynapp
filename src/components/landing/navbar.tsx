'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navLinks = [
  { label: 'Funcionalidades', href: '#features' },
  { label: 'Como funciona', href: '#how-it-works' },
  { label: 'Preços', href: '#pricing' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const targetId = href.replace('#', '')
    const targetElement = document.getElementById(targetId)
    
    if (targetElement) {
      const navHeight = 64 // altura do navbar fixo
      const targetPosition = targetElement.offsetTop - navHeight
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
      
      setMobileOpen(false)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(220,25%,7%)]/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-heading text-2xl font-bold text-white tracking-tight"
        >
          KYN
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="text-sm text-[hsl(220,15%,65%)] hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-white/10 text-white bg-transparent hover:bg-white/5"
          >
            <Link href="/login">Entrar</Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="shadow-[0_0_16px_rgba(16,183,127,0.25)]"
          >
            <Link href="/signup">Criar conta grátis</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[hsl(220,25%,7%)]/95 backdrop-blur-xl px-4 pb-6 pt-4 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="block text-sm text-[hsl(220,15%,65%)] hover:text-white transition-colors py-2"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              asChild
              variant="outline"
              className="border-white/10 text-white bg-transparent hover:bg-white/5 w-full"
            >
              <Link href="/login">Entrar</Link>
            </Button>
            <Button
              asChild
              className="shadow-[0_0_16px_rgba(16,183,127,0.25)] w-full"
            >
              <Link href="/signup">Criar conta grátis</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
