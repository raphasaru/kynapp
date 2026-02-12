import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useManageSubscription } from '@/lib/queries/subscriptions'
import { Loader2, ExternalLink } from 'lucide-react'

interface ManageSubscriptionProps {
  currentPeriodEnd: string | null
  hasStripeCustomer: boolean
}

export function ManageSubscription({ currentPeriodEnd, hasStripeCustomer }: ManageSubscriptionProps) {
  const { mutate: openPortal, isPending } = useManageSubscription()

  if (!hasStripeCustomer) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Assinatura</CardTitle>
        <CardDescription>
          Atualize seus dados de pagamento ou cancele sua assinatura
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentPeriodEnd && (
          <div className="text-sm text-muted-foreground">
            Próxima cobrança:{' '}
            <span className="font-medium text-foreground">
              {format(new Date(currentPeriodEnd), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </span>
          </div>
        )}
        <Button
          className="w-full"
          onClick={() => openPortal()}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Abrindo portal...
            </>
          ) : (
            <>
              Gerenciar Assinatura
              <ExternalLink className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
