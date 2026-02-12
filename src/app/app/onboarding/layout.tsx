import { QueryProvider } from '@/providers/query-provider'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {children}
      </div>
    </QueryProvider>
  )
}
