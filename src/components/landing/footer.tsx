import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo/Brand */}
          <div className="font-heading text-2xl font-bold bg-gradient-to-r from-primary to-[#2cedac] bg-clip-text text-transparent">
            KYN
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              href="/privacidade"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Política de Privacidade
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Termos de Uso
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2026 KYN. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
