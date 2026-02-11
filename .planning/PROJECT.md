# KYN App

## What This Is

PWA de gestão financeira pessoal para o mercado brasileiro. Usuários controlam receitas, despesas, contas bancárias, cartões de crédito, orçamentos e podem registrar transações pelo WhatsApp usando IA. Modelo freemium com plano Pro via Stripe. Next.js 15 + Supabase, tudo em pt-BR.

## Core Value

Registrar e acompanhar gastos com o mínimo de atrito — pelo app ou pelo WhatsApp em 5 segundos.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Autenticação (magic link + email/senha + recuperação)
- [ ] Onboarding simplificado (4 etapas, <2min)
- [ ] Dashboard com seletor de mês, saldo, receitas/despesas, lista de transações
- [ ] CRUD de transações (receita/despesa, planejada/completada)
- [ ] 9 categorias padrão (fixas + variáveis)
- [ ] Contas bancárias (CRUD + saldo + conta padrão)
- [ ] Cartões de crédito (CRUD + fatura calculada)
- [ ] Transações recorrentes (criação + geração mensal)
- [ ] Orçamento por categoria com barras de progresso
- [ ] Histórico com gráficos (pizza por categoria + barras evolução mensal)
- [ ] Integração WhatsApp (vinculação + registro por texto/áudio/foto via n8n)
- [ ] Assinatura Free + Pro (Stripe checkout + portal + webhooks)
- [ ] Busca de transações
- [ ] Criptografia AES-256-GCM para dados financeiros
- [ ] RLS em todas as tabelas
- [ ] Landing page com hero, features, preços, badges segurança
- [ ] PWA instalável + responsividade (mobile-first, bottom nav / sidebar desktop)
- [ ] Perfil + configurações (WhatsApp, assinatura)
- [ ] Política de privacidade (linguagem simples, LGPD)

### Out of Scope

- Investimentos — apps especializados fazem melhor, baixo uso em apps de orçamento
- Relatórios avançados — unificados no Histórico para MVP
- Categorias personalizadas — 9 padrão cobrem 90%+, adiar para v2
- Sub-itens de transação — nicho, complexidade alta sem retorno
- Visão patrimonial — sem investimentos, patrimônio = saldo das contas
- Edição em cascata de recorrentes — só "editar esta" no MVP
- Filtros avançados do dashboard (por conta/cartão, ordenação) — simplificar
- Notificações push — v2 (retenção pós-launch)
- Parcelamento de cartão — simplificado para v2
- Seleção em lote — v2
- E2EE por usuário — v4, chave compartilhada é suficiente no MVP
- Sincronização bancária (Open Finance) — v4
- Trial Pro — sem trial, paga desde o início

## Context

- **Rebuild from scratch** — sem código anterior, codebase nova
- **DB pronto** — Supabase com schema, RLS e functions já aplicados (projeto `vonfsyszaxtbxeowelqu`)
- **n8n pronto** — workflow WhatsApp já existe, só integrar app-side
- **Design system** — tokens definidos em `design-system.html` (emerald green `#10b77f`, Space Grotesk + Inter)
- **Reference files** — Stripe plans, encryption schemas, categories, shadcn config já existem em `reference/`
- **Concorrência** — Mobills, Organizze, GuiaBolso. Diferencial: WhatsApp com IA
- **Mercado** — 165M+ usuários WhatsApp no Brasil
- **Landing + App** — mesmo Next.js app (/ = landing, /dashboard etc = app)

## Constraints

- **Tech stack**: Next.js 15 App Router + Supabase + Tailwind + Shadcn/ui — já decidido
- **Idioma**: Tudo em pt-BR (UI, mensagens, landing page)
- **Mobile-first**: Bottom nav mobile, sidebar desktop, sheets para forms mobile
- **Segurança**: AES-256-GCM obrigatório para dados financeiros, RLS em tudo
- **Free tier**: 2 contas, 1 cartão, 3 meses histórico, 30 msgs WhatsApp/mês

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 15 + Supabase | Stack moderna, auth/DB/realtime integrados | — Pending |
| Criptografia no MVP | 78% abandonam após vazamento, LGPD compliance | — Pending |
| Onboarding 4 etapas | 84% churn no 1o ano, <2min para ver valor | — Pending |
| WhatsApp via n8n | Já funciona, evita microserviço custom | — Pending |
| Sem trial Pro | Paga desde o início, simplifica fluxo | — Pending |
| Landing no mesmo app | SSR/SEO nativo, sem deploy separado | — Pending |

---
*Last updated: 2026-02-11 after initialization*
