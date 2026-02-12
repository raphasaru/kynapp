import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FREE_WHATSAPP_LIMIT } from '@/lib/plans'
import { MessageCircle } from 'lucide-react'

interface UsageMeterProps {
  plan: string
  messagesUsed: number
  resetAt: string | null
}

export function UsageMeter({ plan, messagesUsed, resetAt }: UsageMeterProps) {
  const isPro = plan === 'pro' || plan === 'pro_annual'
  const percentage = isPro ? 0 : (messagesUsed / FREE_WHATSAPP_LIMIT) * 100

  const getProgressColor = () => {
    if (isPro) return ''
    if (percentage < 75) return ''
    if (percentage < 90) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Uso de WhatsApp
        </CardTitle>
        <CardDescription>
          Mensagens enviadas via WhatsApp no período atual
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPro ? (
          <div className="flex items-center justify-center p-6">
            <Badge variant="default" className="bg-primary text-lg px-4 py-2">
              Mensagens Ilimitadas
            </Badge>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {messagesUsed}/{FREE_WHATSAPP_LIMIT}
              </span>
              <span className="text-sm text-muted-foreground">
                {(100 - percentage).toFixed(0)}% disponível
              </span>
            </div>
            <Progress value={percentage} className={getProgressColor()} />
            {percentage >= 90 && (
              <div className="text-sm text-amber-600 dark:text-amber-400">
                Você está próximo do limite. Considere fazer upgrade para o plano Pro.
              </div>
            )}
          </>
        )}
        {resetAt && !isPro && (
          <div className="text-sm text-muted-foreground">
            Resetado em:{' '}
            <span className="font-medium text-foreground">
              {format(new Date(resetAt), "dd 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
