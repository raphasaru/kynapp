import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SignupForm } from '@/components/auth/signup-form'

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Preencha os dados abaixo para começar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SignupForm />
        <div className="text-center text-sm">
          <span className="text-gray-400">Já tem conta? </span>
          <Link href="/login" className="text-[#10b77f] hover:underline">
            Entre aqui
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
