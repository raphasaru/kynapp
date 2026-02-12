'use client';

import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatPhoneForDisplay } from '@/lib/validators/phone-number';
import { useUnlinkWhatsApp } from '@/lib/queries/whatsapp';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VerificationStatusProps {
  phoneNumber: string;
  verifiedAt: string;
}

export function VerificationStatus({ phoneNumber, verifiedAt }: VerificationStatusProps) {
  const unlinkMutation = useUnlinkWhatsApp();

  const handleUnlink = async () => {
    try {
      await unlinkMutation.mutateAsync();
    } catch (error) {
      console.error('Unlink error:', error);
    }
  };

  const formattedDate = format(new Date(verifiedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
    locale: ptBR,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>WhatsApp Vinculado</span>
        </CardTitle>
        <CardDescription>
          Você pode enviar transações por WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Número:</span>
            <span className="font-medium">{formatPhoneForDisplay(phoneNumber)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Vinculado em:</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full"
              disabled={unlinkMutation.isPending}
            >
              {unlinkMutation.isPending ? 'Desvinculando...' : 'Desvincular WhatsApp'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span>Desvincular WhatsApp?</span>
              </AlertDialogTitle>
              <AlertDialogDescription>
                Você não poderá mais enviar transações por WhatsApp até vincular novamente.
                Esta ação pode ser revertida vinculando seu número novamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnlink}>
                Desvincular
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {unlinkMutation.isError && (
          <p className="text-sm text-destructive">
            {unlinkMutation.error.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
