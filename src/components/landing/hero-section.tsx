import Link from 'next/link'
import Image from 'next/image'
import { Shield, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[hsl(220,25%,7%)] text-white py-24 px-6">
      {/* Glow effect */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(16, 183, 127, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/kyn-logo.png"
            alt="KYN"
            width={80}
            height={80}
            className="rounded-2xl"
            priority
          />
        </div>

        {/* Headline */}
        <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          Controle suas finanças com simplicidade
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-[hsl(220,15%,55%)] mb-8 max-w-2xl mx-auto">
          Registre gastos pelo WhatsApp em 5 segundos. Criptografia de ponta a ponta. LGPD compliant.
        </p>

        {/* Security badges inline */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-[hsl(220,15%,55%)]">
            <Lock className="w-4 h-4" />
            Dados criptografados
          </div>
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-[hsl(220,15%,55%)]">
            <Shield className="w-4 h-4" />
            LGPD
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary-dark text-white font-medium shadow-[0_0_20px_rgba(16,183,127,0.2)] hover:shadow-[0_0_40px_rgba(16,183,127,0.25)]"
          >
            <Link href="/signup">Criar conta grátis</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <a href="#features">Saiba mais</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
