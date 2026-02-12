# CLAUDE.md

## Project Overview

**KYN App** - PWA de gestão financeira pessoal. Next.js 15 + Supabase. Mercado brasileiro (pt-BR).

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL + RLS)
- **Styling**: Tailwind CSS + Shadcn/ui (new-york style)
- **State**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Payments**: Stripe
- **WhatsApp**: n8n integration
- **Icons**: Lucide React
- **Fonts**: Space Grotesk (headings) + Inter (body)
- **Language**: Portuguese (pt-BR) throughout

## Key Files

- `FUNCIONALIDADES.md` — Complete functional spec, MVP analysis, architectural decisions
- `design-system.html` — Visual design system with all tokens, components, colors
- `supabase/001_schema.sql` — Full database DDL (tables, enums, constraints)
- `supabase/002_rls_policies.sql` — All RLS policies
- `supabase/003_functions_and_triggers.sql` — Functions + triggers
- `reference/stripe-plans.ts` — Stripe plan config with real price IDs
- `reference/encryption-schemas.ts` — Fields that need AES-256-GCM encryption
- `reference/categories.ts` — Category labels + icons mapping
- `reference/shadcn-config.json` — Shadcn/ui config (copy as components.json)

## Design Tokens (from design-system.html)

- Primary: `#10b77f` (emerald green)
- Primary light: `#2cedac`
- Font heading: Space Grotesk
- Font body: Inter
- Dark hero bg: `hsl(220 25% 7%)`
- Radius: `0.75rem`
- Glow effect: `0 0 40px rgba(16, 183, 127, 0.25)`

## Database

- Supabase project: `vonfsyszaxtbxeowelqu`
- All financial values stored as TEXT (encrypted with AES-256-GCM)
- All tables have RLS enabled — queries filter by `auth.uid() = user_id`
- Auth triggers auto-create profile + free subscription on signup

## Enums

```
expense_category: fixed_housing | fixed_utilities | fixed_subscriptions | fixed_personal | fixed_taxes | variable_credit | variable_food | variable_transport | variable_other
transaction_type: income | expense
transaction_status: planned | completed
payment_method: pix | cash | debit | credit | transfer | boleto
```

## Stripe

| Plan | Price | WhatsApp | Price ID |
|------|-------|----------|----------|
| Free | R$ 0 | 30/mês | — |
| Pro | R$ 19,90/mês | Ilimitado | price_1StGj0IYuOEaGzogx8HO8Hi1 |
| Pro Anual | R$ 179,90/ano | Ilimitado | price_1StGkmIYuOEaGzogcKuLfbqn |

## Free Tier Limits

- 2 bank accounts
- 1 credit card
- 3 months history
- 30 WhatsApp messages/month

## Development

```bash
npm install
npm run dev          # port 3000
npm run build
npx tsc --noEmit     # type check
```

## Conventions

- Mobile-first, bottom nav on mobile, sidebar on desktop
- Sheets for forms (not modals) on mobile
- Currency: `formatCurrency(n)` → "R$ 1.234,56"
- All dates in pt-BR format
- Transaction status: planned (expected) / completed (occurred)
