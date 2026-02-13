import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { MobileHeader } from '@/components/navigation/mobile-header'
import { Sidebar } from '@/components/navigation/sidebar'
import { QueryProvider } from '@/providers/query-provider'
import { PrivacyProvider } from '@/providers/privacy-provider'
import { AppShell } from '@/components/app-shell'
import { OnboardingGate } from '@/components/onboarding/onboarding-gate'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <QueryProvider>
      <PrivacyProvider>
        <OnboardingGate>
          <div className="flex min-h-screen">
            {/* Desktop sidebar */}
            <Sidebar />

            {/* Mobile header */}
            <MobileHeader />

            {/* Main content */}
            <main className="flex-1 min-w-0 overflow-hidden pt-14 pb-16 md:pt-0 md:pb-0 md:ml-64">
              <div className="container mx-auto px-4 py-6 max-w-4xl">
                {children}
              </div>
            </main>

            {/* Mobile bottom nav */}
            <BottomNav />

            {/* FAB + transaction sheet */}
            <AppShell />
          </div>
        </OnboardingGate>
      </PrivacyProvider>
    </QueryProvider>
  )
}
