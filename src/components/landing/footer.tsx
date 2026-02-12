import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-12 px-6 text-neutral-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo/Brand */}
          <div className="font-heading text-2xl font-bold text-gradient-primary">
            KYN
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              href="/privacidade"
              className="text-neutral-600 hover:text-primary transition-colors duration-200"
            >
              Política de Privacidade
            </Link>
            <Link
              href="#"
              className="text-neutral-600 hover:text-primary transition-colors duration-200"
            >
              Termos de Uso
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-neutral-500">
            © 2026 KYN. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
