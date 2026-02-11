import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[hsl(220,25%,7%)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-[#10b77f] font-[family-name:var(--font-space-grotesk)]">
              KYN
            </h1>
          </Link>
        </div>
        {children}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-300 transition"
          >
            ← Voltar para página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}
