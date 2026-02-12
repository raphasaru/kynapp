'use client'

import { Sparkles, ShieldCheck, TrendingUp } from 'lucide-react'
import Image from 'next/image'

export function WelcomeStep() {
  return (
    <div className="flex flex-col items-center text-center space-y-8">
      {/* Logo */}
      <div className="w-20 h-20 relative">
        <Image
          src="/kyn-logo.png"
          alt="KYN"
          width={80}
          height={80}
          className="object-contain"
        />
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Bem-vindo ao KYN
        </h1>
        <p className="text-lg text-muted-foreground">
          Controle suas finanças com simplicidade
        </p>
      </div>

      {/* Features */}
      <div className="grid gap-6 mt-8 w-full max-w-md">
        <div className="flex items-start gap-4 text-left">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">WhatsApp em 5 segundos</h3>
            <p className="text-sm text-muted-foreground">
              Registre gastos pelo WhatsApp sem abrir o app
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 text-left">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Segurança máxima</h3>
            <p className="text-sm text-muted-foreground">
              Dados criptografados — nem nós acessamos
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 text-left">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Orçamento inteligente</h3>
            <p className="text-sm text-muted-foreground">
              Acompanhe orçamento e evolução mensal
            </p>
          </div>
        </div>
      </div>

      {/* Security message */}
      <div className="mt-8 p-4 rounded-lg bg-muted/50 border">
        <p className="text-sm text-muted-foreground">
          <ShieldCheck className="inline w-4 h-4 mr-1 text-primary" />
          Seus dados são criptografados e só você tem acesso.
        </p>
      </div>
    </div>
  )
}
