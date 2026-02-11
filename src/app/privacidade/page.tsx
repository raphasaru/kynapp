import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Política de Privacidade - KYN',
  description: 'Como o KYN protege seus dados financeiros. LGPD compliant.',
}

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-6">
      <article className="prose prose-neutral max-w-3xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-sm">
        {/* Back link */}
        <div className="not-prose mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao início
            </Link>
          </Button>
        </div>

        {/* Badge */}
        <div className="not-prose mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-sm font-semibold text-primary">
            <ShieldCheck className="w-4 h-4" />
            Transparência e Segurança
          </div>
        </div>

        <h1 className="font-heading">Política de Privacidade</h1>
        <p className="lead">
          O KYN leva a privacidade dos seus dados a sério. Esta política explica como coletamos, usamos e protegemos suas informações.
        </p>

        <h2>1. Dados que coletamos</h2>

        <h3>Dados de cadastro</h3>
        <p>
          Coletamos email e nome para criar e gerenciar sua conta.
        </p>

        <h3>Dados financeiros</h3>
        <p>
          Armazenamos suas transações, contas bancárias e cartões de crédito. Todos os valores financeiros são criptografados com AES-256-GCM antes de serem salvos no banco de dados.
        </p>

        <h3>Dados de uso</h3>
        <p>
          Registramos páginas visitadas e funcionalidades utilizadas para melhorar a experiência do app.
        </p>

        <h3>Dados do WhatsApp</h3>
        <p>
          Mensagens enviadas ao bot do KYN são processadas para extrair informações de transações e em seguida descartadas. Não armazenamos o conteúdo completo das mensagens.
        </p>

        <h2>2. Como usamos seus dados</h2>

        <ul>
          <li>Fornecer o serviço de gestão financeira pessoal</li>
          <li>Processar transações enviadas via WhatsApp</li>
          <li>Gerar relatórios e gráficos personalizados</li>
          <li>Melhorar a experiência do app com base no uso</li>
        </ul>

        <p className="font-semibold text-primary">
          NÃO vendemos, compartilhamos ou monetizamos dados pessoais com terceiros.
        </p>

        <h2>3. Proteção dos dados</h2>

        <h3>Criptografia AES-256-GCM</h3>
        <p>
          Todos os valores financeiros (saldos, valores de transações, limites de cartão) são criptografados no seu navegador antes de serem enviados ao servidor. Nem os administradores do KYN conseguem ver seus dados financeiros descriptografados.
        </p>

        <h3>Row-Level Security</h3>
        <p>
          Implementamos políticas de segurança no banco de dados que garantem que você só pode acessar seus próprios dados. Cada consulta é automaticamente filtrada pelo seu ID de usuário.
        </p>

        <h3>Autenticação segura</h3>
        <p>
          Usamos autenticação moderna via Supabase, com tokens JWT e renovação automática de sessões.
        </p>

        <h2>4. Seus direitos (LGPD)</h2>

        <p>
          De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
        </p>

        <h3>Direito de acesso</h3>
        <p>
          Você pode solicitar informações sobre quais dados pessoais mantemos sobre você.
        </p>

        <h3>Direito de correção</h3>
        <p>
          Você pode atualizar dados incorretos ou desatualizados diretamente no app, na seção de configurações.
        </p>

        <h3>Direito de exclusão</h3>
        <p>
          Você pode deletar sua conta e todos os dados associados a qualquer momento. Acesse Configurações → Conta → Excluir conta.
        </p>

        <h3>Direito de portabilidade</h3>
        <p>
          Você pode exportar todos os seus dados financeiros em formato CSV ou PDF (disponível no plano Pro).
        </p>

        <h3>Direito de revogar consentimento</h3>
        <p>
          Você pode revogar o consentimento para processamento de dados excluindo sua conta.
        </p>

        <p>
          Para exercer qualquer um desses direitos, envie um email para{' '}
          <strong>contato@kynapp.com.br</strong> (placeholder).
        </p>

        <h2>5. Cookies e armazenamento local</h2>

        <h3>Cookies de sessão</h3>
        <p>
          Usamos cookies para manter você autenticado no app. Estes cookies são gerenciados pelo Supabase e são essenciais para o funcionamento do serviço.
        </p>

        <h3>localStorage</h3>
        <p>
          Armazenamos preferências do app (tema, idioma, visualizações) no navegador. Essas informações não são enviadas para o servidor.
        </p>

        <h3>Sem rastreamento de terceiros</h3>
        <p>
          Não usamos cookies de rastreamento, analytics de terceiros ou pixels de publicidade.
        </p>

        <h2>6. Retenção de dados</h2>

        <h3>Conta ativa</h3>
        <p>
          Mantemos seus dados enquanto sua conta estiver ativa.
        </p>

        <h3>Após exclusão da conta</h3>
        <p>
          Quando você exclui sua conta, todos os dados pessoais e financeiros são permanentemente removidos do banco de dados em até 30 dias.
        </p>

        <h3>Plano Free</h3>
        <p>
          O histórico de transações no plano gratuito é limitado aos últimos 3 meses. Transações mais antigas são automaticamente removidas.
        </p>

        <h2>7. Alterações nesta política</h2>

        <p>
          Podemos atualizar esta política de privacidade ocasionalmente. Caso façamos mudanças significativas, notificaremos você por email com pelo menos 15 dias de antecedência.
        </p>

        <h2>8. Contato</h2>

        <p>
          Se você tiver dúvidas sobre esta política ou sobre como tratamos seus dados, entre em contato:
        </p>
        <p>
          Email: <strong>contato@kynapp.com.br</strong> (placeholder)
        </p>

        <h2>9. Data de vigência</h2>

        <p>
          Esta política de privacidade está em vigor desde <strong>fevereiro de 2026</strong>.
        </p>

        <hr className="my-8" />

        <p className="text-sm text-muted-foreground">
          Última atualização: 11 de fevereiro de 2026
        </p>
      </article>
    </main>
  )
}
