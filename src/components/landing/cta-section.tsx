import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTASection() {
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

      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
          Pronto para organizar suas finanças?
        </h2>
        <p className="text-lg md:text-xl text-[hsl(220,15%,55%)] mb-8">
          Comece grátis e descubra como é fácil.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-primary hover:bg-primary-dark text-white font-medium shadow-[0_0_20px_rgba(16,183,127,0.2)] hover:shadow-[0_0_40px_rgba(16,183,127,0.25)]"
        >
          <Link href="/signup">Criar conta grátis</Link>
        </Button>
      </div>
    </section>
  )
}
