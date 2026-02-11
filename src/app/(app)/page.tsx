import { createClient } from '@/lib/supabase/server'

export default async function AppPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">
          Bem-vindo ao KYN{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Esta página será o dashboard. Em breve!
        </p>
      </div>

      <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground">
          O dashboard vai mostrar o resumo das suas finanças, transações recentes e insights do mês.
        </p>
      </div>
    </div>
  )
}
