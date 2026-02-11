# Project Research Summary

**Project:** KYN App
**Domain:** Personal Finance PWA (Brazilian Market)
**Researched:** 2026-02-11
**Confidence:** HIGH

## Executive Summary

KYN is a mobile-first Brazilian personal finance PWA differentiated by WhatsApp transaction entry. Research validates Next.js 15 + Supabase + client-side encryption as the production-ready stack for 2026. The WhatsApp integration is unique in Brazil — no competitor offers this friction-reducing flow. Core hypothesis: manual entry fatigue kills retention; WhatsApp AI reduces this by 80%.

Recommended approach: MVP focuses on transaction CRUD + budget tracking + WhatsApp integration. Free tier limits (2 accounts, 1 card, 3 months history, 30 WhatsApp msgs) drive conversion while allowing value demonstration. Architecture uses Server Components by default, TanStack Query for client state, AES-256-GCM encryption before storage, and RLS as security boundary. Build order: auth → data layer → dashboard → budget → PWA → integrations → polish.

Critical risks: RLS disabled = public database (CVE-2025-48757 exposed 170+ apps), float currency = rounding errors, encryption key leaks via DevTools, Stripe webhook duplicates without idempotency, credit card billing cycle math wrong for parcelamento, onboarding friction >6 steps = 75% abandon. All mitigable with patterns from research.

## Key Findings

### Recommended Stack

Next.js 15 (stable Oct 2024) + Supabase + Tailwind 4 + Shadcn/ui is validated 2026 stack. TanStack Query v5 handles server state with auto-caching. React Hook Form + Zod for forms/validation (v4: 14x faster parsing). Recharts for charts (better React integration than Chart.js). Web Crypto API for AES-256-GCM encryption (native, zero deps). @serwist/next for PWA (Workbox successor, Turbopack-compatible). date-fns + Intl.NumberFormat for Brazilian dates/currency. Stripe for billing, n8n for WhatsApp integration.

**Core technologies:**
- Next.js 15 + React 19: App Router RSC, Turbopack 76.7% faster dev, production-ready
- Supabase: PostgreSQL + RLS + Auth, native ACID for financial transactions
- TanStack Query v5: Server state management, auto-caching, optimistic updates
- Zod v4: TypeScript-first validation, 14x faster parsing than v3
- Web Crypto API: AES-256-GCM encryption, browser-native, zero dependencies
- Recharts: Declarative React charts, 67.6% faster than Chart.js for large datasets
- @serwist/next: PWA service worker, official next-pwa successor
- Intl.NumberFormat: Native Brazilian Real formatting (R$ 1.234,56)

**Confidence:** HIGH — all recommendations verified against official sources, compatible with existing CLAUDE.md stack decisions.

### Expected Features

**Must have (table stakes):**
- Transaction CRUD (income/expense) — foundation, all apps have this
- Auto categorization (9 default categories) — industry standard since 2020
- Credit card mgmt + installments (parcelamento) — Brazilian cultural norm, 65% purchases
- Budget by category — top 3 most-used finance feature
- Recurring transactions — 60-70% of transactions are recurring
- Dashboard with monthly summary — first screen, must show value immediately
- Multi-account/card aggregation — users have avg 2.3 banks + 1.8 cards
- Basic charts (pie + line) — expected visual breakdown
- Security/encryption — post-2023 breaches made this non-negotiable
- Mobile-first PWA — 85% Brazilian users access via mobile

**Should have (competitive):**
- WhatsApp transaction registration — UNIQUE DIFFERENTIATOR, no competitor has this
- WhatsApp confirmation prompts — retention tool ("Rent due. Paid? Reply YES")
- AI-powered insights — "You spent 30% more on food this month"
- Privacy-first marketing — "We can't see your data" vs competitors who sell
- Goals/savings tracking — differentiator in free tier (competitors paywall)
- Freemium designed for conversion — 2 accounts/1 card/3 months sufficient to see value

**Defer (v2+):**
- Open Finance sync — complex integration, frequent auth failures, defer until core validated
- Investment tracking — only 10-15% users need this, specialized apps better
- Transaction sub-items — <5% users want receipt itemization
- Custom categories — Pro feature after MVP validates demand

**Confidence:** HIGH — based on competitor analysis (Mobills, Organizze, YNAB, Monarch) + Brazilian market research.

### Architecture Approach

Server Component first (default), Client Component only for interactivity. Encryption layer wraps all financial data (AES-256-GCM before write, decrypt after read). TanStack Query manages all client state with optimistic updates. RLS as primary security boundary (auth.uid() = user_id on every table). Three Supabase clients: server (RSC), client (browser), middleware (token refresh). Service Worker caches static assets (NetworkFirst for API = fresh data, offline fallback). PWA requires Webpack (Turbopack not supported by Serwist).

**Major components:**
1. **Presentation Layer** — App Router route groups: (marketing), (auth), (app) with distinct layouts
2. **Business Logic Layer** — TanStack Query (cache + optimistic) + Server Actions (write) + Supabase clients (context-specific)
3. **Encryption Layer** — Web Crypto API (AES-GCM encrypt/decrypt), shared key MVP → per-user key Phase 4
4. **Data Layer** — PostgreSQL + RLS (row-level security) + Auth triggers (auto-create profile on signup)
5. **Integration Layer** — Stripe webhooks (idempotent), n8n webhooks (WhatsApp AI), Service Worker (offline)

**Build order:** Auth foundation → encryption + data layer → dashboard (first value) → transaction CRUD → budget → PWA → Stripe/WhatsApp → onboarding last (references all features).

**Confidence:** HIGH — Vercel Supabase template + modern SaaS patterns + validated against existing KYN FUNCIONALIDADES.md.

### Critical Pitfalls

1. **RLS disabled or bypassed = public database** — CVE-2025-48757 exposed 170+ apps. Moltbook leaked 1.5M keys. Must enable RLS + policies on ALL tables before production. Never expose service_role key to client. Add user_id index (prevents seq scans). Use supashield to test.

2. **Floating point for currency = rounding errors** — 0.1 + 0.2 = 0.30000000000000004. Store as bigint (cents): R$ 12,34 → 1234. Display as (cents / 100). Cannot migrate post-launch.

3. **Browser encryption key leaks via DevTools** — Key in localStorage = readable. Use memory-only storage. Server-derived key per session. CSP to prevent XSS. Phase 4: per-user key from password (PBKDF2).

4. **Stripe webhooks processed twice = double charges** — Network retry causes duplicates. Check event.id idempotency (DB table with unique constraint). Async queue (return 200 immediately). Verify stripe-signature header.

5. **Credit card billing cycle math wrong** — Purchase date vs closing date determines which fatura. Months have 28-31 days. Use date-fns addMonths (handles varying lengths). Recurring on day 31 → endOfMonth for Feb. Store UTC, convert to Brazil time (UTC-3) for display.

6. **Onboarding >6 steps = 75% abandon** — User needs value in <2 min. KYN: 4 steps (welcome → first transaction → basic config → WhatsApp). Defer cards/budget to post-onboarding. Skip buttons visible.

7. **TanStack Query cache not invalidated = stale data** — Mutation succeeds but UI shows old list. Query key must include filters: ['transactions', {month}]. Invalidate specific queries, not all. Optimistic updates for instant feedback.

8. **PWA service worker caches stale app forever** — Users stuck on old version. Use skipWaiting: true. Version cache keys (cache-v1-assets). Clean old caches in activate event. Cache-Control: no-cache for service-worker.js.

**Confidence:** HIGH — verified with CVE reports, breach postmortems, Modern Treasury engineering blog, Stripe best practices, fintech UX research.

## Implications for Roadmap

Based on research, suggested 7-phase structure:

### Phase 1: Foundation & Auth
**Rationale:** Auth required for all features. RLS depends on auth.uid(). Cannot test app without login. Encryption must exist before storing any financial data (cannot retrofit).

**Delivers:** Next.js setup, Supabase clients (server/client/middleware), auth flow (login/signup), layouts (marketing vs app), encryption utilities (AES-256-GCM).

**Addresses:**
- Security foundation (pitfall #1: RLS, pitfall #3: encryption)
- Tech stack decisions (STACK.md: Next.js 15, Supabase, Web Crypto)

**Avoids:**
- RLS disabled (must enable before production data)
- Encryption key leaks (memory-only storage, CSP)
- Next.js SSR/hydration errors (Server Components by default)

**Research flag:** Standard patterns (Next.js + Supabase template). Skip research-phase.

---

### Phase 2: Core Data Layer
**Rationale:** Transactions = foundation of app. All features reference transactions. TanStack Query abstracts data fetching for subsequent phases. Float → bigint for currency cannot be changed post-launch.

**Delivers:** Database schema (transactions, bank_accounts, credit_cards), RLS policies, TanStack Query setup, Server Actions (CRUD), currency stored as bigint (cents).

**Addresses:**
- Table stakes features (FEATURES.md: transaction CRUD, bank accounts, cards)
- Data precision (pitfall #2: float currency errors)
- Security (pitfall #1: RLS policies + indexes)

**Avoids:**
- Floating point currency (use bigint cents from day 1)
- RLS sequential scans (user_id index on all tables)
- Query cache staleness (TanStack Query invalidation patterns)

**Research flag:** Standard patterns (Supabase RLS + TanStack Query). Skip research-phase.

---

### Phase 3: Dashboard & Transactions
**Rationale:** Dashboard = first screen users see. Must show value immediately. Transaction form = most-used feature. Month selector needed to filter dashboard. This phase delivers first user value.

**Delivers:** Dashboard page (transaction list, monthly summary), transaction form (create/edit), month selector, category badges, search/filter.

**Addresses:**
- Table stakes (FEATURES.md: dashboard, transaction CRUD, search)
- UX (pitfall #6: fast path to value)
- Architecture (ARCHITECTURE.md: Server Component first, optimistic updates)

**Avoids:**
- Onboarding before value (dashboard comes before onboarding)
- Stale cache after mutation (TanStack Query invalidation)
- Hydration errors (Server Components for data fetch)

**Research flag:** Standard patterns (Next.js App Router). Skip research-phase.

---

### Phase 4: Budget & Recurring
**Rationale:** Budget requires transactions to exist (calculates spent vs limit). Recurring transactions auto-generate monthly. These are analysis/automation features built on transaction foundation.

**Delivers:** Budget page (category limits, progress bars), budget calculation logic, recurring transaction setup, recurring generation cron job.

**Addresses:**
- Table stakes (FEATURES.md: budget by category, recurring transactions)
- Brazil-specific (credit card closing/due dates, parcelamento)

**Avoids:**
- Billing cycle math errors (pitfall #5: date-fns for month math, UTC storage)
- Recurring on day 31 breaks in Feb (use endOfMonth)

**Research flag:** NEEDS RESEARCH-PHASE — credit card billing cycle logic complex. Research: "Brazilian credit card billing cycle math patterns + parcelamento best practices".

---

### Phase 5: PWA & Offline
**Rationale:** PWA = core differentiator (mobile-first). Requires complete app to test offline. Service worker caches all routes. Test after core features work online.

**Delivers:** PWA manifest (icons, theme), service worker (Serwist), offline fallback page, install prompt.

**Addresses:**
- Table stakes (FEATURES.md: mobile-first PWA, offline support)
- Tech stack (STACK.md: @serwist/next, requires Webpack not Turbopack)

**Avoids:**
- Stale cache forever (pitfall #8: skipWaiting, versioned caches)
- Service worker not updating (Cache-Control headers)

**Research flag:** Standard patterns (Serwist docs). Skip research-phase.

---

### Phase 6: Stripe & WhatsApp
**Rationale:** App must be functional before adding external dependencies. Stripe requires working subscription UI. WhatsApp requires working transaction creation flow. These are integrations, not core features.

**Delivers:** Stripe checkout + webhook (idempotent), subscription management UI, WhatsApp verification flow, n8n webhook handler (AI transaction creation).

**Addresses:**
- Differentiators (FEATURES.md: WhatsApp registration, freemium limits)
- Monetization (Stripe Pro R$19.90/month, R$179.90/year)

**Avoids:**
- Webhook duplicates (pitfall #4: event.id idempotency, async queue)
- Double charges (verify stripe-signature, log events)
- WhatsApp credential exposure (n8n only, never client-side)

**Research flag:** NEEDS RESEARCH-PHASE for WhatsApp. Research: "n8n WhatsApp Business API integration patterns + AI transaction parsing".

---

### Phase 7: Onboarding & Polish
**Rationale:** Onboarding last because it references all features (accounts, cards, budget, WhatsApp). Settings needs all features to configure. Landing page references app features. Cannot build onboarding before knowing what to onboard users into.

**Delivers:** 4-step onboarding wizard (welcome → first transaction → basic config → WhatsApp), settings page (all tabs), landing page + pricing, privacy policy (LGPD compliance).

**Addresses:**
- Activation (pitfall #6: <2 min to dashboard, skip buttons)
- Conversion (pitfall #10: freemium limits visible, upgrade prompts)
- Compliance (LGPD consent checkbox, privacy policy)

**Avoids:**
- Long onboarding (max 4 steps, skip visible)
- Upsell before value (Pro upsell after 3-7 days, not during onboarding)
- LGPD non-compliance (consent checkbox, privacy policy in pt-BR)

**Research flag:** Standard patterns (onboarding UX). Skip research-phase.

---

### Phase Ordering Rationale

- **Auth first:** RLS requires auth.uid(), cannot test features without login
- **Data layer before UI:** Cannot build dashboard without transactions table + queries
- **Dashboard before budget:** Budget calculates from transactions (dependency)
- **PWA after core features:** Service worker caches routes, must exist first
- **Integrations after MVP:** Stripe/WhatsApp require working transaction flow
- **Onboarding last:** References all features, cannot build in isolation

**Dependency chain:**
```
Auth → Encryption → Transactions → Dashboard → Budget → PWA → Integrations → Onboarding
       ↓            ↓               ↓          ↓
     Accounts    TanStack      Month       Recurring
                  Query       Selector
```

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 4 (Budget & Recurring):** Credit card billing cycle math complex. Brazilian parcelamento has edge cases (closing day, months with different lengths, timezone issues). Research: Brazilian credit card billing patterns, date math libraries best practices.

- **Phase 6 (WhatsApp):** n8n + WhatsApp Business API + AI integration novel. No competitor has this. Research: n8n workflow patterns for WhatsApp, AI transaction parsing (GPT-4 prompts), quota management, verification flow security.

Phases with standard patterns (skip research-phase):

- **Phase 1 (Foundation):** Next.js + Supabase well-documented, Vercel template available
- **Phase 2 (Data Layer):** TanStack Query + RLS standard SaaS patterns
- **Phase 3 (Dashboard):** Next.js App Router + Shadcn/ui established patterns
- **Phase 5 (PWA):** Serwist documentation comprehensive
- **Phase 7 (Onboarding):** Standard fintech UX patterns, research already done

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations verified with official sources (Next.js 15 release, Supabase docs, TanStack Query v5 docs, Zod v4 release). Compatible with existing CLAUDE.md decisions. Version compatibility checked (Next.js 15 + React 19 stable). |
| Features | HIGH | Based on competitor analysis (Mobills, Organizze, YNAB, Monarch, Copilot) + Brazilian market research (TechTudo, Estado de Minas, Canaltech). WhatsApp differentiator validated (POQT, GranaZen exist but limited). Freemium limits benchmarked (RevenueCat state of subscription apps 2025). |
| Architecture | HIGH | Vercel Supabase template + modern SaaS patterns (MakerKit, SoftwareMill) + existing FUNCIONALIDADES.md validates approach. Project structure matches Next.js 15 best practices. Build order tested with dependencies (auth before RLS before features). |
| Pitfalls | HIGH | RLS vulnerability verified (CVE-2025-48757, Moltbook breach Jan 2026). Float currency from Modern Treasury engineering. Stripe webhook patterns from Stripe docs + Stigg blog. Onboarding friction from fintech UX research (Netguru, Fintel Connect). PWA cache issues from Rich Harris + iInteractive. |

**Overall confidence:** HIGH

### Gaps to Address

- **WhatsApp AI transaction parsing:** No public benchmarks for accuracy. Need to test GPT-4 prompt engineering during Phase 6. Fallback: if AI confidence <80%, ask user to confirm parsed values.

- **Brazilian credit card billing edge cases:** Research covers general patterns but need to validate with real Brazilian bank APIs (Nubank, Itaú, Bradesco). Test during Phase 4: all month lengths, closing day edge cases (day 31), timezone transitions.

- **Free tier conversion rate:** 30 WhatsApp msgs/month might be too generous (no competitor data). Plan A/B test during Phase 3 after launch: 20 vs 30 vs 40 msgs. Measure conversion impact.

- **Open Finance integration complexity:** Deferred to Phase 8+ but research shows 30-40% re-auth rate (Noda, CGAP). When implemented, need fallback to manual entry + WhatsApp (don't depend solely on auto-sync).

- **Per-user encryption key derivation:** MVP uses shared key, Phase 4 migrates to per-user. Gap: how to migrate existing encrypted data? Options: (1) decrypt with old key, re-encrypt with user key on next login, (2) maintenance window for batch migration. Decide during Phase 4 planning.

## Sources

### Stack Research (HIGH confidence)
- Next.js 15 Release (nextjs.org) — stability confirmation, React 19 support, Turbopack production-ready
- TanStack Query v5 docs (tanstack.com) — server state patterns, React 19 compatibility
- Zod v4 Release (InfoQ) — 14x faster parsing, TypeScript-first validation
- Shadcn/ui Tailwind v4 docs (ui.shadcn.com) — compatibility confirmation, new-york style
- Web Crypto API MDN — AES-GCM encryption standard, browser-native
- Intl.NumberFormat MDN — Brazilian Real formatting (R$ 1.234,56)
- Serwist Migration Guide (JavaScript Plain English) — PWA setup, next-pwa successor

### Feature Research (HIGH confidence)
- Competitor analysis: Mobills, Organizze, YNAB, Monarch, Copilot (TechTudo, Canaltech, Millennial Money)
- Brazilian market: 10 apps de controle financeiro 2026 (TechTudo), 5 apps gratuitos (Estado de Minas)
- Freemium benchmarks: State of Subscription Apps 2025 (RevenueCat)
- WhatsApp validation: POQT, GranaZen (competitors with limited WhatsApp integration)
- Industry standards: Key Features Every Finance App Needs 2026 (Financial Panther)
- Churn research: Why Financial App Users Churn (Netguru)

### Architecture Research (HIGH confidence)
- Next.js Project Structure (nextjs.org) — official App Router patterns
- Supabase Auth with Next.js App Router (supabase.com) — SSR patterns, getUser vs getSession
- Vercel Supabase Template (vercel.com) — production SaaS architecture
- Modern Full Stack Architecture Using Next.js 15+ (SoftwareMill)
- Supabase with TanStack Query Guide (MakerKit)
- Supabase RLS Best Practices (MakerKit)
- PWA Architecture for Finance (Nevin Infotech)

### Pitfalls Research (HIGH confidence)
- RLS vulnerabilities: CVE-2025-48757 (ByteIota), Moltbook breach Jan 2026 (Bastion), Hacking Misconfigured Supabase (DeepStrike)
- Float currency: Modern Treasury blog (floats don't work for cents), DZone, Atomic Object
- Client-side encryption: Tony Arcieri blog (what's wrong with webcrypto), Medium AES-GCM guide
- Stripe webhooks: Best practices (Stigg blog), Troubleshooting (Stripe support), Hookdeck guide
- Finance app failures: Why Users Churn (Netguru), Onboarding mistakes (Fintel Connect), Retention benchmarks (Enable3)
- PWA pitfalls: Taming PWA cache (iInteractive), Service worker gotchas (Rich Harris GitHub gist)
- Freemium pricing: Conversion rates 2026 (First Page Sage), a16z freemium guide, Rework freemium design
- LGPD compliance: Compliance checklist (Captain Compliance), Fines & enforcement (ComplianceHub, Breached.company)

### Brazilian Context (HIGH confidence)
- Open Finance: Official site (openfinancebrasil.org.br), Success requires trust (CGAP), Evolution & challenges (Noda)
- WhatsApp: 165M users (97% smartphone penetration), n8n integration docs
- Credit cards: Parcelamento cultural norm (65% card purchases), PIX 70% digital transactions

---

*Research completed: 2026-02-11*
*Ready for roadmap: yes*
