'use client'

import { useState } from 'react'
import { PhoneInput } from '@/components/whatsapp/phone-input'
import { VerificationQR } from '@/components/whatsapp/verification-qr'
import { VerificationStatus } from '@/components/whatsapp/verification-status'
import { useProfile } from '@/lib/queries/profile'
import { CheckCircle2 } from 'lucide-react'

export function WhatsAppStep() {
  const { data: profile } = useProfile()
  const [verificationData, setVerificationData] = useState<{
    code: string
    deepLink: string
    expiresAt: string
  } | null>(null)

  const isLinked = profile?.whatsapp_verified && profile?.whatsapp_phone

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Vincule seu WhatsApp</h2>
        <p className="text-muted-foreground">
          Registre transações enviando mensagens
        </p>
      </div>

      {isLinked ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-medium">WhatsApp vinculado com sucesso!</p>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Número: {profile.whatsapp_phone}
          </p>
        </div>
      ) : verificationData ? (
        <div className="space-y-6">
          <VerificationQR
            code={verificationData.code}
            deepLink={verificationData.deepLink}
            expiresAt={verificationData.expiresAt}
          />
        </div>
      ) : (
        <>
          <PhoneInput onVerificationStarted={setVerificationData} />
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Exemplo:</strong> "gastei 50 no uber"
            </p>
          </div>
        </>
      )}

      {!isLinked && (
        <p className="text-center text-sm text-muted-foreground">
          Você pode pular esta etapa e vincular depois
        </p>
      )}
    </div>
  )
}
