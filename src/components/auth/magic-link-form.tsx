'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const magicLinkSchema = z.object({
  email: z.string().email('Email inválido'),
})

type MagicLinkFormValues = z.infer<typeof magicLinkSchema>

export function MagicLinkForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: MagicLinkFormValues) {
    setIsLoading(true)
    setSuccess(false)

    const supabase = createClient()
    const origin = window.location.origin

    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    setIsLoading(false)

    if (error) {
      form.setError('root', {
        message: error.message || 'Erro ao enviar link',
      })
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-500 text-lg font-medium">
          Link enviado!
        </div>
        <p className="text-gray-400 text-sm">
          Verifique seu e-mail
        </p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <div className="text-sm text-red-500">
            {form.formState.errors.root.message}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Enviar magic link'}
        </Button>
      </form>
    </Form>
  )
}
