'use client';

import { useState, useEffect } from 'react';
import QRCodeSVG from 'react-qr-code';
import { MessageCircle, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface VerificationQRProps {
  code: string;
  deepLink: string;
  expiresAt: string;
}

export function VerificationQR({ code, deepLink, expiresAt }: VerificationQRProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    // Calculate time left
    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = Math.max(0, expiry - now);
      setTimeLeft(Math.floor(diff / 1000)); // seconds
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(deepLink, '_blank');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificação WhatsApp</CardTitle>
        <CardDescription>
          Envie o código abaixo para o número do KYN no WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Verification code display */}
        <div className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">Código de verificação:</p>
          <code className="text-2xl font-mono font-bold tracking-wider">
            {code}
          </code>
          {timeLeft !== null && (
            <p className="text-sm text-muted-foreground">
              Válido por {formatTime(timeLeft)}
            </p>
          )}
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              value={deepLink}
              size={200}
              level="M"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleOpenWhatsApp}
            variant="default"
            className="w-full"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Abrir WhatsApp
          </Button>

          <Button
            onClick={handleCopyCode}
            variant="outline"
            className="w-full"
          >
            {copied ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copiar código
              </>
            )}
          </Button>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Aguardando verificação...</span>
        </div>
      </CardContent>
    </Card>
  );
}
