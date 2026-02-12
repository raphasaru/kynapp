import { Button } from '@/components/ui/button'
import { useUpgrade } from '@/lib/queries/subscriptions'
import { Loader2 } from 'lucide-react'

interface UpgradeButtonProps {
  priceId: string
  isCurrentPlan?: boolean
  disabled?: boolean
}

export function UpgradeButton({ priceId, isCurrentPlan, disabled }: UpgradeButtonProps) {
  const { mutate: upgrade, isPending } = useUpgrade()

  if (isCurrentPlan) {
    return (
      <Button className="w-full" disabled>
        Plano Atual
      </Button>
    )
  }

  return (
    <Button
      className="w-full"
      onClick={() => upgrade(priceId)}
      disabled={isPending || disabled}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecionando...
        </>
      ) : (
        'Fazer Upgrade'
      )}
    </Button>
  )
}
