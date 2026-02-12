# Roadmap: KYN App

## Overview

KYN delivers a mobile-first Brazilian finance PWA in 4 phases: foundation with auth and security, core financial data (transactions, accounts, cards, dashboard), analysis tools (budget, recurring, reports), and integrations (WhatsApp, Stripe, onboarding). Each phase delivers observable user value, building from secure foundation to complete MVP.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Security** - Auth, encryption, landing page, PWA basics *(completed 2026-02-11)*
- [x] **Phase 2: Core Financial Data** - Transactions, accounts, cards, dashboard *(completed 2026-02-11)*
- [ ] **Phase 3: Analysis & Automation** - Budget, recurring transactions, reports
- [ ] **Phase 4: Integrations & Activation** - WhatsApp, Stripe, onboarding, settings

## Phase Details

### Phase 1: Foundation & Security
**Goal**: User can access secure, installable app with landing page
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, SECU-01, SECU-02, SECU-03, SECU-04, LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, PWAX-01, PWAX-02, PWAX-03, PWAX-04, PWAX-05
**Success Criteria** (what must be TRUE):
  1. User can create account with email/password
  2. User can log in via magic link (passwordless)
  3. User can reset password via email link
  4. User sees landing page with value proposition, features, pricing, security badges
  5. App is installable as PWA on mobile and desktop
  6. All financial data is encrypted with AES-256-GCM before storage
  7. RLS enabled on all tables filtering by auth.uid()
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Project setup, Supabase clients, DB migrations, encryption lib
- [x] 01-02-PLAN.md — Auth system (signup, login, magic link, password reset, proxy.ts)
- [x] 01-03-PLAN.md — Landing page (hero, features, pricing, badges) + privacy policy
- [x] 01-04-PLAN.md — PWA config (manifest, service worker, offline) + app shell navigation

### Phase 2: Core Financial Data
**Goal**: User can register and view transactions across accounts and cards
**Depends on**: Phase 1
**Requirements**: TRNS-01, TRNS-02, TRNS-03, TRNS-04, TRNS-05, TRNS-06, TRNS-07, CATG-01, CATG-02, CATG-03, BANK-01, BANK-02, BANK-03, BANK-04, BANK-05, BANK-06, CARD-01, CARD-02, CARD-03, CARD-04, CARD-05, DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, DASH-08
**Success Criteria** (what must be TRUE):
  1. User can create transaction with all fields (type, amount, description, category, date, status, payment method)
  2. User can associate transaction with bank account or credit card
  3. User can search transactions by description
  4. User sees monthly balance (income - expenses) for selected month
  5. User can navigate between months via month selector
  6. User can add/edit/delete bank accounts with updated balance
  7. User sees credit card bill calculated from transactions
  8. User can filter transactions by status and type
**Plans**: 5 plans

Plans:
- [x] 02-01-PLAN.md — Shared utilities (deps, formatters, validators, hooks, query provider, types)
- [x] 02-02-PLAN.md — Bank accounts CRUD (queries, form, card, wallet page)
- [x] 02-03-PLAN.md — Credit cards CRUD (queries, form, display, wallet integration)
- [x] 02-04-PLAN.md — Transactions CRUD (queries, form, list item, category select, amount input)
- [x] 02-05-PLAN.md — Dashboard (month selector, balance cards, transaction list, filters, search)

### Phase 3: Analysis & Automation
**Goal**: User can set budgets, create recurring transactions, and view spending reports
**Depends on**: Phase 2
**Requirements**: BUDG-01, BUDG-02, BUDG-03, BUDG-04, RECR-01, RECR-02, RECR-03, RECR-04, RECR-05, HIST-01, HIST-02, HIST-03
**Success Criteria** (what must be TRUE):
  1. User can set monthly spending limit per category
  2. User sees progress bar per category (green/yellow/red)
  3. User sees total budgeted, spent, and remaining for month
  4. User can create recurring transaction with day of month and end date
  5. System auto-generates monthly transactions from recurring template
  6. User sees pie chart of expenses by category
  7. User sees bar chart of income vs expenses for last 6 months
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md — Budget management (types, queries, aggregation, progress bars, budget page)
- [ ] 03-02-PLAN.md — Recurring transactions (templates CRUD, grouped list, pg_cron migration)
- [ ] 03-03-PLAN.md — Reports & charts (pie chart by category, bar chart 6-month trend, summary)

### Phase 4: Integrations & Activation
**Goal**: User can register transactions via WhatsApp, upgrade to Pro, and complete onboarding
**Depends on**: Phase 3
**Requirements**: WTSP-01, WTSP-02, WTSP-03, WTSP-04, WTSP-05, WTSP-06, WTSP-07, WTSP-08, WTSP-09, SUBS-01, SUBS-02, SUBS-03, SUBS-04, SUBS-05, ONBR-01, ONBR-02, ONBR-03, ONBR-04, ONBR-05, ONBR-06, PROF-01, PROF-02, PROF-03, PROF-04, PWAX-06
**Success Criteria** (what must be TRUE):
  1. User can link WhatsApp number with verification code
  2. User can register transaction by sending text/audio/photo to KYN bot
  3. Bot creates transaction with status "planned" and sends confirmation
  4. Free users limited to 30 messages/month with counter visible
  5. User can upgrade to Pro via Stripe checkout
  6. Subscription status syncs via Stripe webhooks
  7. User sees 4-step onboarding (welcome, first transaction, basic config, WhatsApp)
  8. User can skip any onboarding step
  9. User can view profile, manage subscription, and log out from settings
**Plans**: TBD

Plans:
- [ ] 04-01: TBD during planning
- [ ] 04-02: TBD during planning
- [ ] 04-03: TBD during planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Security | 4/4 | ✓ Complete | 2026-02-11 |
| 2. Core Financial Data | 5/5 | ✓ Complete | 2026-02-11 |
| 3. Analysis & Automation | 0/3 | Not started | - |
| 4. Integrations & Activation | 0/3 | Not started | - |

---
*Roadmap created: 2026-02-11*
*Last updated: 2026-02-11 — Phase 3 planned*
