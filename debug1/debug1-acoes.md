# Debug Session 1 — Ações Identificadas

> Reunião: 12/02/2026 | Participantes: Rafael Araujo, Raphael Saru
> Fonte: `transc-reuniao-debug1.txt`

---

## BUGS (Correções Urgentes)

### ~~B01 — Edição de transação não salva~~ RESOLVIDO
~~Ao editar transação (nome, valor, conta bancária), as alterações não persistem.~~
**Fix:** `installment_count` do Zod schema era incluído no payload de update mas não existe na tabela. Removido do payload. Também adicionado fallback p/ buscar transação no DB quando cache miss (antes skippava reversal de saldo).
**Arquivos:** `src/lib/queries/transactions.ts`

### ~~B02 — Data com fuso horário errado~~ RESOLVIDO
~~Usuário coloca dia 10, sistema salva como dia 9.~~
**Fix:** `new Date("2025-02-10")` parseava como UTC midnight → com UTC-3 virava dia 9. Removido `new Date()` desnecessário, a string `yyyy-MM-dd` do form agora é passada diretamente sem re-parsing.
**Arquivos:** `src/lib/queries/transactions.ts`, `src/components/transactions/transaction-form.tsx`

### ~~B03 — Limite do cartão de crédito não é consumido~~ RESOLVIDO
~~Compras no cartão não abatiam do limite disponível.~~
**Fix:** "Disponível" só considerava fatura do próximo mês. Criado `useCardBillSummary` que calcula `totalOutstanding` (TODAS parcelas planned de todos os meses). Disponível = limite - totalOutstanding.
**Arquivos:** `src/lib/queries/bills.ts`, `src/components/cards/card-display.tsx`, `src/app/app/carteira/page.tsx`, `src/app/app/carteira/[cardId]/page.tsx`

### ~~B04 — Loop infinito ao navegar para início~~ RESOLVIDO
~~Ao sair do menu hambúrguer para tela de início, entra em loop infinito.~~
**Fix:** `OnboardingGate` usava `router.push` (empilhava histórico) sem guard contra redirect repetido. Trocado p/ `router.replace` + `useRef` guard. Removido `isFetching` das deps (causava re-triggers).
**Arquivos:** `src/components/onboarding/onboarding-gate.tsx`

### ~~B05 — Botão voltar da página WhatsApp vai para rota inexistente~~ RESOLVIDO
~~Navega para `/configuracoes` que não existe.~~
**Fix:** Back button agora aponta p/ `/app/perfil`.
**Arquivos:** `src/app/app/configuracoes/whatsapp/page.tsx`

### ~~B06 — Todos os links do menu perfil/configurações com navegação quebrada~~ RESOLVIDO
~~Ao apertar voltar, deve retornar para a página de perfil.~~
**Fix:** Assinatura apontava p/ `/app`, agora aponta p/ `/app/perfil`.
**Arquivos:** `src/app/app/configuracoes/assinatura/page.tsx`

### ~~B07 — Conta bancária não vem pré-selecionada no formulário de transação~~ RESOLVIDO
~~Campo de conta bancária vem vazio.~~
**Fix:** Nova prop `defaultAccountId` no `TransactionForm`, passada via `profile.default_bank_account_id` do dashboard, AppShell (FAB) e carteira. Carteira agora usa `useProfile()` em vez de `accounts[0]`.
**Arquivos:** `src/components/transactions/transaction-form.tsx`, `src/app/app/page.tsx`, `src/components/app-shell.tsx`, `src/app/app/carteira/page.tsx`

### ~~B08 — Receita recorrente não funciona~~ RESOLVIDO
~~Ao criar receita recorrente, o sistema não lança. Aparece erro ou simplesmente não salva.~~
**Fix:** INSERT da primeira transação não tinha error handling (falha silenciosa) + campos `undefined` (category, payment_method, bank_account_id, credit_card_id) causavam problemas. Limpeza `undefined` → `null` em template e transações + error handling no INSERT.
**Arquivos:** `src/lib/queries/recurring.ts`

### ~~B09 — Recorrentes não lançam para todos os meses~~ RESOLVIDO
~~Transações recorrentes precisam ser lançadas para todos os meses até a data final. Atualmente não gera as ocorrências futuras.~~
**Fix:** `useCreateRecurring` agora gera transações para TODOS os meses de hoje até `end_date` (loop mensal com encrypt+insert). pg_cron continua como safety net (idempotente).
**Arquivos:** `src/lib/queries/recurring.ts`

### ~~B10 — E-mails (magic link, redefinição de senha, boas-vindas) com domínio errado~~ RESOLVIDO
~~Domínio do Resend não estava configurado. E-mails de autenticação apontavam para domínio antigo.~~
**Fix:** Configuração no dashboard Resend + Supabase Auth settings (não é código).

### ~~B11 — Lançamento via WhatsApp não usa conta padrão~~ RESOLVIDO
~~Transações vindas do WhatsApp caem na primeira conta criada em vez da conta marcada como padrão.~~
**Fix:** SQL migration atualizou `create_whatsapp_transaction()` para buscar `default_bank_account_id` do `profiles`, fallback para primeira conta do usuário.
**Arquivos:** Migration Supabase `whatsapp_default_account`

---

## MELHORIAS DE UX/UI

### ~~M01 — Onboarding: perguntar conta padrão~~ RESOLVIDO
~~No onboarding, após cadastrar contas bancárias, perguntar ao usuário qual será a conta padrão. Lançamentos via WhatsApp usam essa conta.~~
**Fix:** Novo `DefaultAccountStep` inserido entre Contas e Cartões (index 2). Se 1 conta → auto-seleciona. Se 0 → mostra aviso. Radio select com visual de card. Onboarding agora tem 7 steps.
**Arquivos:** `src/components/onboarding/default-account-step.tsx` (novo), `src/app/app/onboarding/page.tsx`, `src/components/onboarding/onboarding-wizard.tsx`, `src/lib/queries/onboarding.ts`

### ~~M02 — Onboarding: salvar estado ao avançar~~ RESOLVIDO
~~Quando usuário clica "Próximo" no onboarding, já salvar o estado da fase atual. Se sair e voltar, retoma de onde parou.~~
**Fix:** `useEffect` no wizard salva `currentStep` no DB quando monta/muda step (com `useRef` guard p/ evitar saves duplicados). Antes só salvava ao clicar "Próximo" (salvava nextStep, não currentStep).
**Arquivos:** `src/components/onboarding/onboarding-wizard.tsx`

### ~~M03 — Onboarding: botão "criar conta" vs "próximo" confuso~~ RESOLVIDO
~~Usuário confundiu botão "Próximo" (avançar etapa) com "Criar conta bancária". Os botões estão visualmente similares.~~
**Fix:** Botão "Próximo" trocado por "Avançar para: {próxima etapa}" com `variant="outline"`. Só o último step ("Começar a usar") mantém variant default/primary. Diferencia claramente navegação de ação.
**Arquivos:** `src/components/onboarding/onboarding-wizard.tsx`

### ~~M04 — Onboarding: auto-refresh ao vincular WhatsApp~~ RESOLVIDO
~~Após vincular WhatsApp com sucesso durante onboarding, a página deve atualizar automaticamente para mostrar status vinculado.~~
**Fix:** Polling a cada 3s no profile query enquanto `verificationData` existe e `isLinked` é false. Para automaticamente quando vinculado.
**Arquivos:** `src/components/onboarding/whatsapp-step.tsx`

### ~~M05 — Centralizar logo no menu lateral (sidebar)~~ RESOLVIDO
~~Logo no menu lateral (desktop) não está centralizada.~~
**Fix:** Adicionado `justify-center` ao container do logo.
**Arquivos:** `src/components/navigation/sidebar.tsx`

### ~~M06 — Perfil: mostrar inicial do nome em vez de nome completo~~ RESOLVIDO
~~No menu/sidebar, exibir apenas a inicial do usuário. Remover texto placeholder.~~
**Fix:** Sidebar agora usa `useProfile()` para mostrar inicial real do usuário no avatar e primeiro nome em vez de "Usuário".
**Arquivos:** `src/components/navigation/sidebar.tsx`

### ~~M07 — Permitir exclusão de transações~~ RESOLVIDO
~~Adicionar botão/opção de deletar transações lançadas.~~
**Fix:** Botão Trash2 adicionado ao `TransactionItem`, visível no hover (desktop) e sempre acessível. Usa `useDeleteTransaction` com confirm nativo. Reverte saldo automaticamente.
**Arquivos:** `src/components/transactions/transaction-item.tsx`

### ~~M08 — Ordem das parcelas no cartão: crescente por data~~ RESOLVIDO
~~No detalhe de compras parceladas do cartão, exibir da primeira parcela à última (ordem crescente de data).~~
**Fix:** Removido `.reverse()` na ordenação dos grupos de mês em CardTransactions. Agora exibe do mês mais antigo ao mais recente.
**Arquivos:** `src/components/cards/card-transactions.tsx`

### M09 — Recorrentes: data final padrão = final do ano
Ao criar despesa/receita recorrente, a data final padrão é 31/12 do ano corrente. Na virada do ano, perguntar ao usuário quais recorrentes deseja renovar.

### M10 — Permitir edição de recorrentes
Na página de recorrentes, permitir editar (não só excluir).

---

## RELATÓRIOS

### ~~R01 — Relatório mais detalhado com filtros de período~~ RESOLVIDO
~~Adicionar visualização de transações por período: Hoje, Ontem, 3/7/14/30 dias.~~
**Fix:** Nova seção "Transações por Período" com botões de filtro (Hoje, Ontem, 3/7/14/30 dias). Mostra lista de transações filtradas + resumo (receitas/despesas) do período. Usa dados já carregados (6 meses) com filtro client-side.
**Arquivos:** `src/app/app/relatorios/page.tsx`

### ~~R02 — Gráfico receita vs despesa: adicionar barra de saldo~~ RESOLVIDO
~~No gráfico de barras receita vs despesa, adicionar terceira barra representando o saldo (receita - despesa).~~
**Fix:** Campo `balance` adicionado a `getIncomeExpenseByMonth()`. Terceira barra "Saldo" (cor indigo #6366f1) no gráfico.
**Arquivos:** `src/lib/aggregations/chart-data.ts`, `src/components/charts/income-expense-bars.tsx`

### ~~R03 — Despesa por categoria: barras horizontais + valores~~ RESOLVIDO
~~No mobile, substituir gráfico de pizza por barras horizontais mostrando valor gasto por categoria. Exibir valores no mobile.~~
**Fix:** Pie chart agora `hidden md:block`. Mobile mostra barras horizontais coloridas com nome da categoria, valor formatado e percentual. Usa `PrivateValue` para respeitar olhinho.
**Arquivos:** `src/components/charts/expense-pie-chart.tsx`

---

## MOBILE

### ~~MOB01 — Botões de filtro (Nova Transação, Orçamento, Recorrentes) devem ser horizontais~~ RESOLVIDO
~~No celular, botões ficam quebrados. Devem rolar horizontalmente (scroll horizontal).~~
**Fix:** Adicionado `shrink-0` a cada botão + `scrollbar-none` no container. Garante scroll horizontal sem quebra de linha.
**Arquivos:** `src/components/dashboard/quick-actions.tsx`

### ~~MOB02 — Cards de resumo menores no mobile~~ RESOLVIDO
~~Cards de saldo, receita, despesa e orçamento (home, orçamento, relatórios) estão muito altos.~~
**Fix:** Cards com padding responsivo `p-3 md:p-6`, font `text-xl md:text-3xl`, label `text-xs md:text-sm`. Aplicado em BalanceCards, ReportSummary e BudgetSummary.
**Arquivos:** `src/components/dashboard/balance-cards.tsx`, `src/components/charts/report-summary.tsx`, `src/components/budgets/budget-summary.tsx`

### ~~MOB03 — Header fixo no mobile~~ RESOLVIDO
~~Adicionar barra fixa no topo com ícone de perfil, botão olhinho, boas-vindas na home.~~
**Fix:** Novo `MobileHeader` (h-14 fixed top) com avatar/inicial → link perfil, título da página (ou "Olá, Nome!" na home), eye toggle. Bottom nav agora 4 itens (Início, Orçamento, Carteira, Relatórios). Dashboard "Olá" header hidden on mobile (evita duplicata). Layout com `pt-14` no mobile.
**Arquivos:** `src/components/navigation/mobile-header.tsx` (novo), `src/components/navigation/nav-items.ts`, `src/components/navigation/bottom-nav.tsx`, `src/app/app/layout.tsx`, `src/app/app/page.tsx`

### ~~MOB04 — Botão ocultar valores (olhinho)~~ RESOLVIDO
~~Adicionar botão de olho no header fixo do mobile. Ao clicar, substitui todos os valores financeiros por "•••••". Funciona em todas as telas (igual Nubank).~~
**Fix:** `PrivacyProvider` (context + localStorage) + `PrivateValue` wrapper. Integrado em: BalanceCards, TransactionItem, CardDisplay, AccountCard, RecurringItem.
**Arquivos:** `src/providers/privacy-provider.tsx` (novo), `src/components/ui/private-value.tsx` (novo), `src/components/dashboard/balance-cards.tsx`, `src/components/transactions/transaction-item.tsx`, `src/components/cards/card-display.tsx`, `src/components/accounts/account-card.tsx`, `src/components/recurrents/recurring-item.tsx`

### MOB05 — Bloquear rotação para landscape
No celular, não permitir rotação para modo horizontal (landscape).

### MOB06 — Card resumo do cartão de crédito quebrado no mobile
Ao abrir detalhes de um cartão de crédito no mobile, o card de resumo fica com layout quebrado.

---

## WHATSAPP / IA

### W01 — Prompt do Gemini: identificar quantidades em imagens de nota fiscal
Quando usuário envia foto de cupom/nota fiscal, o Gemini deve identificar quando há mais de 1 unidade do mesmo item. Incluir quantidade na descrição do lançamento (ex: "Leite (3x)" em vez de só "Leite").

---

## RESUMO DE PRIORIDADES

| Prioridade | IDs | Status |
|---|---|---|
| **Crítico** | ~~B01, B02, B03, B04, B05, B06, B07~~ | **7/7 RESOLVIDOS** |
| **Alto** | ~~B08, B09, B10, B11, M01, M02, MOB03, MOB04~~ | **8/8 RESOLVIDOS** |
| **Médio** | ~~M03, M04, M05, M06, M07, M08, R01, R02, R03, MOB01, MOB02~~ | **11/11 RESOLVIDOS** |
| **Baixo** | M09, M10, MOB05, MOB06, W01 | 0/5 pendente |

**Progresso geral: 26/31 resolvidos — próximo: prioridade Baixa**
