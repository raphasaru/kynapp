'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProfile, useUpdateProfile } from '@/lib/queries/profile'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Nome muito curto'),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function ProfileForm() {
  const { data: profile, isLoading: isLoadingProfile } = useProfile()
  const updateMutation = useUpdateProfile()
  const [email, setEmail] = useState<string>('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  // Fetch email from auth
  useEffect(() => {
    const getEmail = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setEmail(user?.email || '')
    }
    getEmail()
  }, [])

  // Populate form with profile data
  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
      })
    }
  }, [profile, reset])

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data)
  }

  if (isLoadingProfile) {
    return <div className="text-center py-4 text-muted-foreground">Carregando...</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nome completo</Label>
        <Input
          id="full_name"
          {...register('full_name')}
          placeholder="Seu nome"
        />
        {errors.full_name && (
          <p className="text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={email}
          disabled
          className="bg-muted text-muted-foreground cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">
          Email não pode ser alterado
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!isDirty || updateMutation.isPending}
      >
        {updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
      </Button>
    </form>
  )
}
