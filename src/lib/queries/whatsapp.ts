import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface WhatsAppLinkStatus {
  linked: boolean;
  phone_number?: string;
  verified_at?: string;
  pending?: boolean;
}

interface VerifyResponse {
  code: string;
  deepLink: string;
  expiresAt: string;
}

/**
 * Get WhatsApp link status
 * Polls every 5s when pending verification
 */
export function useWhatsAppLink() {
  const query = useQuery<WhatsAppLinkStatus>({
    queryKey: ['whatsapp-link'],
    queryFn: async () => {
      const res = await fetch('/api/whatsapp/check');
      if (!res.ok) throw new Error('Failed to fetch WhatsApp link status');
      return res.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: (query) => {
      // Poll every 5s when pending verification
      const data = query.state.data;
      if (data?.pending) {
        return 5000;
      }
      return false;
    },
  });

  return query;
}

/**
 * Verify WhatsApp number
 * Generates verification code and deep link
 */
export function useVerifyWhatsApp() {
  const queryClient = useQueryClient();

  return useMutation<VerifyResponse, Error, { phone_number: string }>({
    mutationFn: async ({ phone_number }) => {
      const res = await fetch('/api/whatsapp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Falha ao verificar WhatsApp');
      }

      return res.json();
    },
    onSuccess: () => {
      // Invalidate to trigger polling
      queryClient.invalidateQueries({ queryKey: ['whatsapp-link'] });
    },
  });
}

/**
 * Unlink WhatsApp number
 */
export function useUnlinkWhatsApp() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error>({
    mutationFn: async () => {
      const res = await fetch('/api/whatsapp/unlink', {
        method: 'POST',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Falha ao desvincular WhatsApp');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-link'] });
    },
  });
}
