'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface Profile {
  id: string
  user_id: string
  full_name: string | null
  avatar_url: string | null
  onboarding_completed: boolean
  onboarding_step: number
  whatsapp_phone: string | null
  whatsapp_verified: boolean
  whatsapp_verification_code: string | null
  whatsapp_verification_expires_at: string | null
  created_at: string
  updated_at: string
}

export function useProfile() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single()

      if (error) throw error
      return data as Profile
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateProfile() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { full_name: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile, error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return profile
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Perfil atualizado')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar perfil')
    },
  })
}
