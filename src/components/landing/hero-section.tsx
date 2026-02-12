'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Shield, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const targetElement = document.getElementById('features')
    
    if (targetElement) {
      const navHeight = 64
      const targetPosition = targetElement.offsetTop - navHeight
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="relative overflow-hidden bg-[hsl(220,25%,7%)] text-white min-h-screen flex items-center px-6 pt-16">
      {/* Glow effect */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none animate-glow-pulse"
        style={{
          background: 'radial-gradient(ellipse, rgba(16, 183, 127, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center w-full py-24">
        {/* Logo */}
        <div className="mb-10 flex justify-center animate-fade-in [&_img]:bg-transparent">
          <Image
            src="/kyn-logo.png"
            alt="KYN"
            width={140}
            height={140}
            className="w-[120px] h-auto md:w-[140px] drop-shadow-[0_0_24px_rgba(16,183,127,0.15)]"
            priority
          />
        </div>

        {/* Headline */}
        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight animate-slide-up delay-100">
          Controle suas finanças{' '}
          <span className="text-gradient-primary">com simplicidade</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-[hsl(220,15%,65%)] mb-10 max-w-2xl mx-auto animate-slide-up delay-200">
          Registre gastos pelo WhatsApp em 5 segundos. Criptografia de ponta a ponta. LGPD compliant.
        </p>

        {/* Security badges inline */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 animate-slide-up delay-300">
          <div className="inline-flex items-center gap-2 bg-white/6 border border-white/8 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-[hsl(220,15%,65%)] transition-colors duration-300 hover:text-white hover:border-white/20">
            <Lock className="w-4 h-4" />
            Dados criptografados
          </div>
          <div className="inline-flex items-center gap-2 bg-white/6 border border-white/8 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-[hsl(220,15%,65%)] transition-colors duration-300 hover:text-white hover:border-white/20">
            <Shield className="w-4 h-4" />
            LGPD
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up delay-400">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 h-12 text-base shadow-[0_0_20px_rgba(16,183,127,0.3)] hover:shadow-[0_0_40px_rgba(16,183,127,0.4)] transition-all duration-300 hover:-translate-y-0.5"
          >
            <Link href="/signup">Criar conta grátis</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/30 h-12 px-8 text-base transition-all duration-300 hover:-translate-y-0.5"
          >
            <a href="#features" onClick={handleSmoothScroll}>Saiba mais</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
