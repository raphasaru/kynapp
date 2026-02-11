import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoginForm } from '@/components/auth/login-form'
import { MagicLinkForm } from '@/components/auth/magic-link-form'

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Acesse sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">Email e Senha</TabsTrigger>
            <TabsTrigger value="magic">Magic Link</TabsTrigger>
          </TabsList>
          <TabsContent value="password" className="mt-4">
            <LoginForm />
          </TabsContent>
          <TabsContent value="magic" className="mt-4">
            <MagicLinkForm />
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm">
          <span className="text-gray-400">Não tem conta? </span>
          <Link href="/signup" className="text-[#10b77f] hover:underline">
            Crie aqui
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
