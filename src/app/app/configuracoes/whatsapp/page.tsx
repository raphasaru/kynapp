'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneInput } from '@/components/whatsapp/phone-input';
import { VerificationQR } from '@/components/whatsapp/verification-qr';
import { VerificationStatus } from '@/components/whatsapp/verification-status';
import { useWhatsAppLink } from '@/lib/queries/whatsapp';
import { useSubscription } from '@/lib/queries/subscriptions';

type VerificationData = {
  code: string;
  deepLink: string;
  expiresAt: string;
} | null;

export default function WhatsAppSettingsPage() {
  const [verificationData, setVerificationData] = useState<VerificationData>(null);
  const { data: linkStatus, isLoading: linkLoading } = useWhatsAppLink();
  const { data: subscription } = useSubscription();

  // Determine current state
  const getState = () => {
    if (linkStatus?.linked) return 'linked';
    if (verificationData || linkStatus?.pending) return 'verifying';
    return 'not_linked';
  };

  const state = getState();

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/configuracoes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">WhatsApp</h1>
          <p className="text-muted-foreground">
            Vincule seu WhatsApp para registrar transações por mensagem
          </p>
        </div>
      </div>

      {/* Loading state */}
      {linkLoading && (
        <Card>
          <CardContent className="py-8 flex justify-center">
            <p className="text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      )}

      {/* Not linked state */}
      {!linkLoading && state === 'not_linked' && (
        <Card>
          <CardHeader>
            <CardTitle>Vincular WhatsApp</CardTitle>
            <CardDescription>
              Informe seu número de WhatsApp para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhoneInput onVerificationStarted={setVerificationData} />
          </CardContent>
        </Card>
      )}

      {/* Verifying state */}
      {!linkLoading && state === 'verifying' && verificationData && (
        <VerificationQR
          code={verificationData.code}
          deepLink={verificationData.deepLink}
          expiresAt={verificationData.expiresAt}
        />
      )}

      {/* Linked state */}
      {!linkLoading && state === 'linked' && linkStatus?.phone_number && linkStatus?.verified_at && (
        <VerificationStatus
          phoneNumber={linkStatus.phone_number}
          verifiedAt={linkStatus.verified_at}
        />
      )}

      {/* Usage info */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Uso do WhatsApp</CardTitle>
            <CardDescription>
              Mensagens utilizadas neste mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plano:</span>
                <span className="font-medium capitalize">{subscription.plan}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mensagens usadas:</span>
                <span className="font-medium">
                  {subscription.plan === 'free'
                    ? `${subscription.whatsapp_messages_used} / 30`
                    : `${subscription.whatsapp_messages_used} / Ilimitado`
                  }
                </span>
              </div>
              {subscription.plan === 'free' && (
                <div className="pt-2">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${Math.min(100, (subscription.whatsapp_messages_used / 30) * 100)}%`,
                      }}
                    />
                  </div>
                  {subscription.whatsapp_messages_used >= 30 && (
                    <p className="text-sm text-destructive mt-2">
                      Você atingiu o limite do plano gratuito. Faça upgrade para Pro.
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
