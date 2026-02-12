# KYN App - Especificação Funcional

App de gestão financeira pessoal. O usuário controla receitas, despesas, contas bancárias, cartões, orçamentos e pode registrar transações pelo WhatsApp usando IA. Modelo freemium com plano Pro.

---

## 1. Landing Page

Página pública de apresentação do app. Contém:

- **Hero** com proposta de valor principal
- **Seção de funcionalidades** destacando os diferenciais
- **Como funciona** em passos simples
- **Tabela de preços** comparando Free vs Pro
- **CTA final** direcionando para cadastro
- **Footer** com links para termos e política de privacidade

---

## 2. Autenticação

### Cadastro e Login

Três métodos de acesso:

1. **Magic Link** - usuário informa e-mail e recebe link de acesso (sem senha)
2. **Email + Senha** - cadastro tradicional com senha
3. **Recuperação de senha** - envia email para redefinir

### Redirecionamento

- Se onboarding completo → vai para Dashboard
- Se onboarding pendente → vai para Onboarding

---

## 3. Onboarding

Wizard de 6 etapas para configurar o app na primeira vez. O usuário pode pular a qualquer momento.

### Etapa 1 - Boas-vindas
Apresentação das funcionalidades principais do KYN: controle financeiro, integração WhatsApp, segurança dos dados.

### Etapa 2 - Contas Bancárias
Adicionar contas (corrente, poupança, investimento) com saldo inicial. Lista de bancos brasileiros pré-definida + opção "Outro". A primeira conta adicionada vira a conta padrão.

### Etapa 3 - Cartões de Crédito
Adicionar cartões com: nome, limite, dia do vencimento e dia do fechamento da fatura.

### Etapa 4 - Orçamento
Definir limites mensais de gasto por categoria. As 9 categorias padrão já vêm listadas para o usuário preencher.

### Etapa 5 - WhatsApp
Vincular número de WhatsApp para registrar transações por mensagem. Processo de verificação com código.

### Etapa 6 - Oferta Pro
Apresentação do plano Pro com seus benefícios e opção de upgrade.

**Progresso salvo:** se o usuário sair no meio, volta de onde parou.

---

## 4. Dashboard

Tela principal do app após login. Mostra a visão geral financeira do mês selecionado.

### O que mostra

- **Saldo total** do mês (receitas - despesas)
- **Total de receitas** e **total de despesas** do mês
- **Valores realizados** (completados) vs **valores planejados** (previstos)
- **Lista de transações** do mês

### Seletor de Mês

Navegação entre meses para ver dados históricos ou futuros.

### Ações Rápidas

Botões de acesso direto para Recorrentes e Orçamento.

### Filtros da Lista

- Por status: todas, pendentes, completadas
- Por tipo: todas, receitas, despesas
- Por conta bancária específica
- Por cartão de crédito específico
- Ordenação: por data, descrição ou valor (crescente/decrescente)

### Seleção em Lote

Selecionar múltiplas transações pendentes e marcar todas como completadas de uma vez.

---

## 5. Transações

O coração do app. Toda movimentação financeira é uma transação.

### Criar/Editar Transação

Campos disponíveis:

- **Tipo**: receita ou despesa
- **Valor**: campo monetário (R$)
- **Descrição**: texto livre
- **Categoria**: uma das 9 categorias padrão ou categoria personalizada (Pro)
- **Data**: quando aconteceu ou vai acontecer
- **Status**: planejada (prevista) ou completada (realizada)
- **Método de pagamento**: dinheiro, débito, crédito, PIX ou transferência
- **Conta bancária**: qual conta associar
- **Cartão de crédito**: se pago no crédito, qual cartão

### Sub-itens

Uma transação pode ter itens detalhados. Ex: nota fiscal do supermercado com cada produto listado separadamente, mas o total como uma transação só.

### Parcelamento (Cartão de Crédito)

- Definir número de parcelas (até 48x)
- O sistema calcula automaticamente em quais faturas cada parcela vai cair, baseado na data da compra e no dia de fechamento do cartão
- Gera N transações, uma por parcela, com numeração (1/12, 2/12...)

### Transação Recorrente

- Ativar toggle "Recorrente" ao criar
- Definir dia do mês para repetição
- Definir data de término (mês/ano)
- O sistema gera automaticamente a transação todo mês até a data final
- Se o dia não existe no mês (ex: dia 31 em fevereiro), usa o último dia do mês

### Edição de Recorrentes

Ao editar uma transação recorrente, duas opções:

1. **Apenas esta** - altera só a transação selecionada
2. **Esta e futuras** - altera a selecionada e todas as próximas

### Status: Planejada vs Completada

- **Planejada**: transação futura ou prevista. Entra no cálculo de projeção.
- **Completada**: transação realizada. Tem data de conclusão. Entra no cálculo do saldo real.

Isso permite ao usuário planejar o mês (lançar todas as contas previstas) e ir confirmando conforme paga.

---

## 6. Categorias

### Categorias Padrão (todos os usuários)

Divididas em fixas e variáveis:

**Fixas:**
- Moradia fixa (aluguel, condomínio)
- Contas fixas (água, luz, internet)
- Assinaturas (streaming, apps)
- Pessoal fixo (plano de saúde, academia)
- Impostos

**Variáveis:**
- Cartão de crédito
- Alimentação
- Transporte
- Outros variáveis

### Categorias Personalizadas (Pro)

Usuários Pro podem criar categorias ilimitadas com:
- Nome personalizado
- Cor
- Ícone
- Tipo (fixa ou variável)

Categorias personalizadas aparecem em todos os lugares: formulário de transação, orçamento, relatórios.

---

## 7. Carteira

Gestão de contas bancárias e cartões de crédito.

### Contas Bancárias

- Adicionar/editar/remover contas
- Tipos: corrente, poupança, investimento
- Saldo atualizado
- Conta padrão (usada como default ao criar transações)
- Lista de bancos brasileiros pré-definida

### Cartões de Crédito

- Adicionar/editar/remover cartões
- Campos: nome, limite, dia do vencimento, dia do fechamento
- Valor atual da fatura (calculado pelas transações)
- Cor do cartão

### Visão Patrimonial

Resumo mostrando:
- Total em contas bancárias
- Total em investimentos
- Patrimônio líquido total

---

## 8. Orçamento

Controle de gastos mensais por categoria.

### Como funciona

1. Usuário define um valor máximo de gasto mensal para cada categoria
2. Conforme transações são registradas, o sistema calcula quanto já foi gasto em cada categoria
3. Barra de progresso visual: verde (dentro do orçamento), amarelo (próximo do limite), vermelho (estourou)

### Visão Geral

- Total orçado no mês
- Total já gasto
- Quanto ainda pode gastar

### Edição

Formulário para definir/alterar o valor de cada categoria de uma vez.

---

## 9. Recorrentes

Tela dedicada para gerenciar todas as transações recorrentes ativas.

### O que mostra

- Lista de todos os grupos recorrentes (receitas e despesas separadas)
- Para cada um: descrição, valor, dia de repetição, data final, quantas parcelas futuras restam

### Ações

- Excluir todas as transações futuras de um grupo recorrente
- Navegar para editar a transação original

### Por que existe

Permite visualizar todos os compromissos financeiros fixos de uma vez (salário, aluguel, streaming, etc.) sem precisar procurar nas transações.

---

## 10. Relatórios

Análises visuais dos dados financeiros.

### Filtros Disponíveis

- **Período**: mês atual, mês passado, ano atual, período personalizado
- **Conta bancária**: filtrar por uma conta específica
- **Cartão de crédito**: filtrar por um cartão específico

### Gráficos e Dados

1. **Pizza de despesas por categoria** - quanto % cada categoria representa do total de gastos
2. **Barras de evolução mensal** - receitas, despesas e saldo dos últimos 6 meses
3. **Breakdown por categoria** - orçamento vs realizado para cada categoria

---

## 11. Histórico

Visão histórica simplificada com gráficos.

- **Gráfico de barras**: receitas vs despesas dos últimos 6 meses
- **Gráfico de pizza**: despesas do mês atual por categoria
- **Resumo**: total recebido, total pago, saldo projetado

---

## 12. Investimentos

Tela para acompanhar investimentos (ações, fundos, crypto). Funcionalidade planejada com tabela no banco de dados mas sem implementação completa na interface.

---

## 13. Integração WhatsApp

Permite registrar transações enviando mensagens pelo WhatsApp para um número do KYN.

### Vinculação do Número

1. Usuário vai em Configurações > WhatsApp
2. Digita o número de celular (formato brasileiro com DDD)
3. App gera código de verificação de 6 caracteres (válido por 1 hora)
4. 3 formas de enviar o código:
   - **QR Code** - escanear para abrir WhatsApp com mensagem pronta
   - **Botão direto** - abre WhatsApp com código preenchido
   - **Copiar código** - copiar e enviar manualmente
5. Bot do WhatsApp valida o código e vincula o número

### Como Usar

Depois de vinculado, o usuário pode enviar:

- **Texto**: "gastei 50 no uber" ou "recebi 3000 de salário"
- **Áudio**: mensagem de voz descrevendo a transação
- **Imagem**: foto de recibo ou nota fiscal

A IA interpreta a mensagem e cria automaticamente uma transação com status "planejada" no app. O bot envia confirmação de volta.

### Limites de Uso

- **Plano Free**: 30 mensagens por mês (reseta no dia 1)
- **Plano Pro**: ilimitado
- Quando atinge o limite, recebe mensagem sugerindo upgrade

### Serviço Separado

O WhatsApp roda como um microserviço independente que se conecta ao app principal. Usa IA para interpretar as mensagens e extrair dados da transação (valor, categoria, descrição).

---

## 14. Assinatura e Preços

### Plano Free (R$ 0)

- Dashboard completo
- Transações ilimitadas pelo app
- Carteira (contas e cartões)
- Orçamento com categorias padrão
- Relatórios básicos
- WhatsApp: 30 mensagens/mês

### Plano Pro Mensal (R$ 19,90/mês)

Tudo do Free mais:
- WhatsApp ilimitado
- Categorias personalizadas ilimitadas
- Metas de economia
- Relatórios avançados
- Exportação PDF
- Suporte prioritário

### Plano Pro Anual (R$ 179,90/ano)

Mesmo que o Pro Mensal com 25% de desconto (equivale a R$ 14,99/mês).

### Garantia

7 dias de reembolso.

### Gestão da Assinatura

- Upgrade pelo app (abre checkout do Stripe)
- Gerenciar assinatura via portal do Stripe (alterar plano, cancelar, atualizar pagamento)
- Status da assinatura atualizado automaticamente via webhooks

---

## 15. Configurações

### Assinatura
Visualizar plano atual, fazer upgrade, acessar portal de pagamentos.

### WhatsApp
Vincular/desvincular número, ver status da conexão, ver uso de mensagens.

### Categorias (Pro)
Criar, editar e excluir categorias personalizadas.

---

## 16. Perfil

Informações do usuário:
- Nome completo
- Email
- Opção de logout

---

## 17. PWA (Progressive Web App)

O app funciona como aplicativo instalável no celular e desktop:

- **Instalável** no iOS, Android e Desktop direto do navegador
- **Funciona offline** (cache de dados)
- **Aparência nativa** - abre em tela cheia sem barra do navegador
- **Orientação retrato**
- **Idioma**: Português (pt-BR)

---

## 18. Responsividade

### Mobile (celular)

- Navegação por barra inferior com 5 abas: Início, Orçamento, Carteira, Relatórios, Perfil
- Formulários abrem como sheet (desliza de baixo para cima)
- Cards compactos
- Botão flutuante para adicionar transação rápida
- Adaptação para celulares com notch

### Desktop

- Navegação por sidebar lateral fixa
- Formulários abrem como modal centralizado
- Layout em múltiplas colunas
- Filtros mais visíveis

---

## 19. Segurança e Privacidade

### Proteção Técnica (MVP)

- **Criptografia AES-GCM** - Dados sensíveis (valores, descrições) criptografados
- **RLS (Row Level Security)** - Cada usuário acessa apenas seus próprios dados
- **HTTPS/SSL** - Toda comunicação é criptografada
- **Autenticação obrigatória** - Todas as telas protegidas por login

### Conformidade LGPD

- **Consentimento opt-in** - Usuário autoriza explicitamente o uso de dados
- **Política de privacidade clara** - Linguagem simples em português (não juridiquês)
- **Direitos do usuário** - Acesso, correção e exclusão de dados em até 15 dias
- **Notificação de incidentes** - Comunicação em até 72h caso ocorra vazamento
- **Não vendemos dados** - Promessa explícita de não compartilhar/vender informações

### Comunicação ao Usuário

**Landing page:**
- Badge: "🔒 Dados 100% seguros"
- Badge: "✓ Não vendemos suas informações"
- Badge: "✓ Em conformidade com LGPD"

**Onboarding (Etapa 1 - Boas-vindas):**
"Seus dados são criptografados e só você tem acesso. Nem nós conseguimos ver suas informações financeiras."

**Elementos visuais:**
- Badge LGPD compliance no footer
- Ícone de cadeado SSL/Seguro
- Link "Como protegemos seus dados" nas configurações

### Fase 2 - Privacidade como Marketing

**Diferencial competitivo:**
- Criar página dedicada "Segurança e Privacidade"
- Explicar E2EE em linguagem simples com diagramas
- Comparar (sem nomear): "A maioria dos apps pode ver seus dados. Nós não."
- Promover: "O único app brasileiro com criptografia de ponta a ponta"

**Estatísticas para comunicar:**
- 78% dos usuários abandonam apps financeiros após vazamento de dados
- Apps gratuitos vendem até 25 categorias de dados pessoais
- KYN: zero dados vendidos, zero acesso aos seus valores

### Fase 4 - E2EE Completo por Usuário

**Implementação avançada:**
- Chave única por usuário (derivada da senha ou gerada no cadastro)
- Zero-knowledge architecture - servidor nunca vê dados descriptografados
- Backup/recuperação de chave (crítico para não perder dados)
- Auditoria de segurança externa (certificação independente)

**Marketing:**
- "Privacidade ao nível de bancos suíços"
- "Seus dados são seus. Literalmente."
- Certificações de segurança em destaque

### Por que Privacidade é Essencial

**Dados da pesquisa:**
- 78% abandonam app financeiro após vazamento (mesmo sem dados vazados)
- Setor financeiro tem maior churn pós-vazamento de todas as indústrias
- Reconstruir confiança leva anos
- Em apps financeiros, usuários fazem escolhas racionais sobre privacidade (não é paradoxo)
- ANPD intensificando fiscalizações em fintechs em 2025-2026

**Conclusão:** Segurança não pode ser "Fase 2". Precisa estar no centro do MVP desde o dia 1.

---

## 20. Fluxo Principal do Usuário

1. **Cadastro** → Magic Link ou Email/Senha
2. **Onboarding** → Configura contas, cartões, orçamento, WhatsApp
3. **Uso diário** → Registra transações (pelo app ou WhatsApp)
4. **Planejamento** → Lança transações previstas, define recorrentes
5. **Acompanhamento** → Dashboard mostra saldo, filtros ajudam a encontrar transações
6. **Confirmação** → Marca transações planejadas como completadas
7. **Análise** → Relatórios e histórico mostram para onde o dinheiro está indo
8. **Ajuste** → Orçamento ajuda a controlar gastos por categoria
9. **Evolução** → Histórico mensal mostra progresso ao longo do tempo

---
---

# Análise de MVP - O que Manter, Cortar e Adicionar

Análise baseada em pesquisa de mercado (Mobills, Organizze, GuiaBolso, YNAB, Monarch Money, Copilot) e boas práticas de SaaS financeiro.

---

## Diferencial Competitivo

**O WhatsApp é o maior diferencial do KYN.** Nenhum concorrente brasileiro oferece registro de transações via WhatsApp com IA. Com 165M+ de usuários de WhatsApp no Brasil, isso resolve o principal problema de apps financeiros: a fadiga de lançamento manual.

Posicionamento: "O único app de finanças que registra seus gastos pelo WhatsApp."

**Não competir** com GuiaBolso/Organizze em sincronização bancária automática. **Ganhar** na simplicidade do registro via WhatsApp.

---

## O que MANTER (Core do MVP)

Essas funcionalidades são essenciais e validadas pelo mercado:

| # | Funcionalidade | Por que é core |
|---|---------------|----------------|
| 2 | Autenticação | Sem isso não existe app |
| 3 | Onboarding | Crítico para retenção (ver melhorias abaixo) |
| 4 | Dashboard | Tela principal, primeiro contato diário |
| 5 | Transações | Coração do app |
| 6 | Categorias padrão | Organização básica dos gastos |
| 7 | Carteira | Gestão de contas e cartões é esperada |
| 8 | Orçamento | Top 3 feature mais usada em apps financeiros |
| 9 | Recorrentes | Resolve compromissos fixos (aluguel, salário) |
| 13 | WhatsApp | **Diferencial competitivo principal** |
| 14 | Assinatura | Monetização |

---

## O que CORTAR ou ADIAR para v2

### CORTAR do MVP

**Investimentos (seção 12)** - Só 10-15% dos usuários de app de orçamento acompanham investimentos. Apps especializados (Kinvo, Real Valor) fazem isso melhor. Cortar completamente do MVP.

**Relatórios avançados (seção 10)** - Redundante com o Histórico (seção 11). Ter duas telas de gráficos confunde. Unificar tudo na tela de Histórico com os melhores elementos de cada:
- Pizza de despesas por categoria
- Barras de evolução mensal (últimos 6 meses)
- Resumo: recebido, pago, saldo

**Categorias personalizadas (seção 6 - parte Pro)** - As 9 categorias padrão cobrem 90%+ dos casos. Criar/gerenciar categorias adiciona complexidade no formulário, orçamento e relatórios. Adiar para v2.

**Sub-itens de transação (seção 5)** - Itemizar nota fiscal é nicho. A maioria dos usuários quer lançar "Supermercado - R$ 350" e seguir com a vida. Adiciona complexidade no banco e na UI sem retorno proporcional. Adiar para v2.

**Visão Patrimonial da Carteira (seção 7)** - Sem investimentos no MVP, patrimônio líquido = saldo das contas. Não precisa de seção especial.

~~**Criptografia client-side (seção 19)** - ATUALIZADO: Manter criptografia no MVP. É diferencial competitivo e essencial para LGPD. Pesquisa mostra que 78% abandonam app após vazamento e privacidade é fator de decisão racional em apps financeiros. Simplificar mantendo chave compartilhada (fase 4 = chave por usuário).~~

### SIMPLIFICAR no MVP

**Parcelamento (seção 5)** - Manter mas simplificar. Não precisa calcular automaticamente qual fatura cada parcela cai. Gerar as N parcelas com datas mensais consecutivas é suficiente pro MVP.

**Edição em cascata de recorrentes** - Manter só "editar esta" no MVP. "Esta e futuras" é complexo de implementar corretamente. Adiar cascata para v2.

**Filtros do Dashboard (seção 4)** - Manter filtro por status e tipo. Cortar filtro por conta/cartão específico e ordenação customizada do MVP. Adiciona complexidade de UI sem resolver o caso de uso principal.

---

## O que ADICIONAR

### Essencial para o MVP

**Notificações push** - Lembrete de contas a vencer (transações planejadas próximas da data). Principal motivo de retenção em apps financeiros. Sem isso, o usuário esquece de abrir o app.

**Busca de transações** - Campo de busca por texto na lista de transações. Feature básica que todo concorrente tem.

**Confirmação rápida de transação via WhatsApp** - Quando uma transação planejada vence, enviar mensagem pelo WhatsApp: "Seu aluguel de R$ 1.500 vence hoje. Já pagou? Responda SIM para confirmar." Transforma o WhatsApp de canal de entrada em canal de engajamento.

### Importante para v2 (pós-lançamento)

**Exportação de dados (CSV)** - Feature Pro. Usuários querem poder tirar seus dados do app.

**Metas de economia** - "Quero guardar R$ 500/mês" com acompanhamento. Feature Pro.

**Detecção de assinaturas** - Identificar gastos recorrentes automaticamente (Netflix, Spotify, etc.) baseado no histórico.

**Insights com IA** - "Você gastou 30% mais com alimentação esse mês" ou "Se manter esse ritmo, vai estourar o orçamento de transporte." Diferencial forte com baixo custo (já tem IA no WhatsApp).

---

## Melhorias no Onboarding

84% dos usuários de apps fintech abandonam no primeiro ano. O onboarding é o momento mais crítico. A versão atual tem 6 etapas com muitos formulários antes do usuário ver valor.

### Onboarding Recomendado (4 etapas, <2 minutos)

**Etapa 1 - Boas-vindas + Segmentação (15s)**
Apresentação rápida + pergunta: "Como você se descreve?"
- Assalariado
- Freelancer/Autônomo
- Estudante
- Empreendedor

Isso personaliza a experiência (ex: freelancer vê categorias de recebimento de clientes).

**Etapa 2 - Primeira vitória (30s)**
"Qual foi seu último gasto?" - formulário mínimo: valor + descrição.
O usuário precisa ver algo no dashboard ANTES de preencher formulários longos. Criar a primeira transação gera senso de progresso.

**Etapa 3 - Configuração básica (30s)**
Adicionar conta bancária principal + definir renda mensal.
Só o essencial, tudo opcional, botão "Pular" visível.

**Etapa 4 - WhatsApp (30s)**
Vincular WhatsApp. Mensagem: "Registre gastos em 5 segundos, direto pelo WhatsApp."
Botão "Fazer depois" visível.

**CORTAR do onboarding:**
- Etapa de cartões de crédito → mover para Carteira (configura quando precisar)
- Etapa de orçamento → mover para Orçamento (configura depois de ter dados)
- Etapa de oferta Pro → mover para depois do usuário experimentar o app por alguns dias

**Princípio:** o usuário deve ver o Dashboard com pelo menos 1 transação em menos de 2 minutos.

---

## Melhorias na Monetização

### Problema atual

O plano Free é generoso demais. O usuário tem acesso a praticamente tudo. A única limitação real é 30 msgs/mês no WhatsApp, o que não motiva upgrade se o usuário usa mais o app manual.

### Limites recomendados para o Free

| Feature | Free | Pro |
|---------|------|-----|
| Transações manuais | Ilimitadas | Ilimitadas |
| WhatsApp | 30 msgs/mês | Ilimitado |
| Contas bancárias | 2 | Ilimitadas |
| Cartões de crédito | 1 | Ilimitados |
| Histórico visível | 3 meses | Ilimitado |
| Recorrentes | 5 templates | Ilimitados |
| Exportação | Nenhuma | CSV/PDF |
| Categorias | 9 padrão | + personalizadas |
| Orçamento | Todas | Todas |

Isso dá motivação real para upgrade sem castrar a experiência free. O usuário descobre o valor, atinge um limite natural, e faz upgrade convencido.

---

## Priorização de Funcionalidades para Rebuild

### Fase 1 - Core (lançar com isso)
1. Autenticação (magic link + senha)
2. Onboarding simplificado (4 etapas com mensagem de segurança)
3. Dashboard + seletor de mês
4. Transações (CRUD + status planejada/completada)
5. Categorias padrão (9 fixas)
6. Contas bancárias (CRUD + saldo)
7. Cartões de crédito (CRUD + fatura)
8. Recorrentes (criação e geração mensal)
9. Orçamento por categoria
10. Histórico (gráficos unificados)
11. WhatsApp (vinculação + registro por texto/áudio/foto)
12. Assinatura (Free + Pro via Stripe)
13. Busca de transações
14. **Segurança: Criptografia AES-GCM + RLS + badges LGPD**
15. **Política de Privacidade (linguagem simples)**
16. PWA + responsividade
17. Landing page (com badges de segurança)

### Fase 2 - Retenção (1-2 semanas pós-launch)
1. Notificações push (lembrete de contas)
2. Confirmação de transação via WhatsApp
3. Seleção em lote no dashboard
4. Parcelamento de cartão
5. Trial Pro de 14 dias
6. **Página dedicada "Como protegemos seus dados"**
7. **Marketing de privacidade** (E2EE como diferencial)

### Fase 3 - Crescimento (1-2 meses pós-launch)
1. Categorias personalizadas (Pro)
2. Exportação CSV/PDF (Pro)
3. Insights com IA
4. Metas de economia
5. Relatórios avançados com filtros
6. Edição em cascata de recorrentes
7. Sub-itens de transação

### Fase 4 - Expansão (3+ meses)
1. E2EE completo por usuário (chave única, zero-knowledge)
2. Investimentos
3. Detecção de assinaturas
4. Sincronização bancária (Open Finance)

---

## Decisões Arquiteturais

- ✅ **WhatsApp**: Usar n8n para integração (substituir microserviço atual)
- ✅ **Stripe**: Manter mesmos price IDs e produtos
- ✅ **Banco**: Começar zerado (não migrar dados existentes)
- ✅ **Free tier**: Limites OK (2 contas, 1 cartão, 3 meses histórico)
- ✅ **Trial Pro**: Sem trial (usuário paga desde o início para Pro)
- ✅ **Notificações push**: Web Push API nativa do navegador
