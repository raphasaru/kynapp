'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPhoneForAPI } from '@/lib/validators/phone-number';
import { useVerifyWhatsApp } from '@/lib/queries/whatsapp';

const phoneSchema = z.object({
  phone: z.string()
    .min(1, 'Número obrigatório')
    .regex(/^\(\d{2}\)\s?9?\d{4,5}-?\d{4}$/, 'Formato inválido'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

interface PhoneInputProps {
  onVerificationStarted: (data: { code: string; deepLink: string; expiresAt: string }) => void;
}

export function PhoneInput({ onVerificationStarted }: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const verifyMutation = useVerifyWhatsApp();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  // Mask phone input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

    // Limit to 11 digits (DDD + 9 + 8 digits)
    if (value.length > 11) value = value.slice(0, 11);

    // Apply mask: (DD) 9XXXX-XXXX or (DD) XXXX-XXXX
    let masked = '';
    if (value.length > 0) {
      masked = '(' + value.slice(0, 2);
      if (value.length > 2) {
        masked += ') ' + value.slice(2, 7);
        if (value.length > 7) {
          masked += '-' + value.slice(7, 11);
        }
      }
    }

    setDisplayValue(masked);
    setValue('phone', masked);
  };

  const onSubmit = async (data: PhoneFormData) => {
    try {
      const formatted = formatPhoneForAPI(data.phone);
      const result = await verifyMutation.mutateAsync({ phone_number: formatted });
      onVerificationStarted(result);
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Número do WhatsApp</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(11) 91234-5678"
          value={displayValue}
          onChange={handlePhoneChange}
          disabled={verifyMutation.isPending}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Formato: (11) 91234-5678
        </p>
      </div>

      <Button
        type="submit"
        disabled={verifyMutation.isPending}
        className="w-full"
      >
        {verifyMutation.isPending ? 'Gerando código...' : 'Vincular WhatsApp'}
      </Button>

      {verifyMutation.isError && (
        <p className="text-sm text-destructive">
          {verifyMutation.error.message}
        </p>
      )}
    </form>
  );
}
