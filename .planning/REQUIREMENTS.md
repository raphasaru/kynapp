# Requirements: KYN App

**Defined:** 2026-02-11
**Core Value:** Registrar e acompanhar gastos com o mínimo de atrito — pelo app ou pelo WhatsApp em 5 segundos.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User can sign in via magic link (passwordless)
- [ ] **AUTH-03**: User can reset password via email link
- [ ] **AUTH-04**: User session persists across browser refresh
- [ ] **AUTH-05**: Unauthenticated users are redirected to login page

### Onboarding

- [ ] **ONBR-01**: User sees welcome screen with app intro and segmentation question
- [ ] **ONBR-02**: User can register first transaction (amount + description) as "first win"
- [ ] **ONBR-03**: User can add primary bank account and set monthly income
- [ ] **ONBR-04**: User can link WhatsApp number with verification code
- [ ] **ONBR-05**: User can skip any onboarding step
- [ ] **ONBR-06**: Onboarding progress is saved if user exits mid-flow

### Dashboard

- [ ] **DASH-01**: User sees monthly balance (income - expenses) for selected month
- [ ] **DASH-02**: User sees total income and total expenses for selected month
- [ ] **DASH-03**: User sees planned vs completed breakdown
- [ ] **DASH-04**: User can navigate between months via month selector
- [ ] **DASH-05**: User sees list of transactions for selected month
- [ ] **DASH-06**: User can filter transactions by status (all/planned/completed)
- [ ] **DASH-07**: User can filter transactions by type (all/income/expense)
- [ ] **DASH-08**: User can access quick actions for recurring and budget

### Transactions

- [ ] **TRNS-01**: User can create a transaction with type, amount, description, category, date, status, payment method
- [ ] **TRNS-02**: User can edit an existing transaction
- [ ] **TRNS-03**: User can delete a transaction
- [ ] **TRNS-04**: User can mark a planned transaction as completed
- [ ] **TRNS-05**: User can associate transaction with a bank account
- [ ] **TRNS-06**: User can associate transaction with a credit card (when payment method is credit)
- [ ] **TRNS-07**: User can search transactions by description text

### Categories

- [ ] **CATG-01**: User can select from 9 default categories when creating a transaction
- [ ] **CATG-02**: Categories are split into fixed (housing, utilities, subscriptions, personal, taxes) and variable (credit, food, transport, other)
- [ ] **CATG-03**: Each category has a label and icon displayed consistently across app

### Bank Accounts

- [ ] **BANK-01**: User can add a bank account with name, type (checking/savings/investment), and initial balance
- [ ] **BANK-02**: User can edit a bank account
- [ ] **BANK-03**: User can delete a bank account
- [ ] **BANK-04**: User can set a default bank account
- [ ] **BANK-05**: User can select from pre-populated list of Brazilian banks
- [ ] **BANK-06**: User sees updated balance per account

### Credit Cards

- [ ] **CARD-01**: User can add a credit card with name, limit, due day, and closing day
- [ ] **CARD-02**: User can edit a credit card
- [ ] **CARD-03**: User can delete a credit card
- [ ] **CARD-04**: User sees current bill amount calculated from transactions
- [ ] **CARD-05**: User can set a color for the card

### Recurring Transactions

- [ ] **RECR-01**: User can create a recurring transaction with day of month and end date
- [ ] **RECR-02**: System auto-generates monthly transactions from recurring template
- [ ] **RECR-03**: User sees list of all active recurring groups (income and expense separately)
- [ ] **RECR-04**: User can delete all future transactions of a recurring group
- [ ] **RECR-05**: User can edit a single occurrence of a recurring transaction

### Budget

- [ ] **BUDG-01**: User can set monthly spending limit per category
- [ ] **BUDG-02**: User sees progress bar per category (green/yellow/red based on % spent)
- [ ] **BUDG-03**: User sees total budgeted, total spent, and remaining for the month
- [ ] **BUDG-04**: User can edit budget limits for all categories at once

### History & Reports

- [ ] **HIST-01**: User sees pie chart of expenses by category for selected period
- [ ] **HIST-02**: User sees bar chart of income vs expenses for last 6 months
- [ ] **HIST-03**: User sees summary: total received, total paid, projected balance

### WhatsApp Integration

- [ ] **WTSP-01**: User can enter phone number to start WhatsApp verification
- [ ] **WTSP-02**: User receives 6-character verification code (valid 1 hour)
- [ ] **WTSP-03**: User can send code via QR code, direct WhatsApp button, or copy
- [ ] **WTSP-04**: User can register transaction by sending text message to KYN bot
- [ ] **WTSP-05**: User can register transaction by sending audio message
- [ ] **WTSP-06**: User can register transaction by sending receipt photo
- [ ] **WTSP-07**: Bot creates transaction with status "planned" and sends confirmation
- [ ] **WTSP-08**: Free users are limited to 30 messages/month with counter visible
- [ ] **WTSP-09**: User can unlink WhatsApp number from settings

### Subscription & Billing

- [ ] **SUBS-01**: Free tier enforces limits (2 accounts, 1 card, 3 months history, 30 WhatsApp msgs)
- [ ] **SUBS-02**: User can upgrade to Pro via Stripe checkout
- [ ] **SUBS-03**: User can manage subscription via Stripe customer portal
- [ ] **SUBS-04**: Subscription status syncs via Stripe webhooks
- [ ] **SUBS-05**: User sees current plan and usage in settings

### Security & Privacy

- [ ] **SECU-01**: All financial values (amounts, descriptions, notes) are encrypted with AES-256-GCM before storage
- [ ] **SECU-02**: All tables have RLS enabled filtering by auth.uid() = user_id
- [ ] **SECU-03**: Privacy policy page in simple Portuguese (LGPD compliant)
- [ ] **SECU-04**: Security badges displayed on landing page and onboarding

### Landing Page

- [ ] **LAND-01**: Landing page shows hero section with value proposition
- [ ] **LAND-02**: Landing page shows features section highlighting differentials
- [ ] **LAND-03**: Landing page shows pricing table comparing Free vs Pro
- [ ] **LAND-04**: Landing page shows CTA directing to signup
- [ ] **LAND-05**: Landing page shows LGPD/security trust badges

### PWA & Layout

- [ ] **PWAX-01**: App is installable as PWA on mobile and desktop
- [ ] **PWAX-02**: Mobile layout uses bottom navigation (5 tabs: Início, Orçamento, Carteira, Relatórios, Perfil)
- [ ] **PWAX-03**: Desktop layout uses sidebar navigation
- [ ] **PWAX-04**: Forms open as bottom sheets on mobile
- [ ] **PWAX-05**: App has basic offline support (cached assets, offline fallback page)
- [ ] **PWAX-06**: FAB (floating action button) for quick transaction creation on mobile

### Profile & Settings

- [ ] **PROF-01**: User can view and edit full name
- [ ] **PROF-02**: User can view email address
- [ ] **PROF-03**: User can log out from any page
- [ ] **PROF-04**: Settings page shows subscription, WhatsApp, and profile sections

## v2 Requirements

### Retention (post-launch)

- **RETN-01**: User receives WhatsApp confirmation prompts for due transactions
- **RETN-02**: User can select multiple planned transactions and mark all as completed
- **RETN-03**: User can create installment (parcelamento) transactions on credit card
- **RETN-04**: Push notifications for bill reminders

### Growth (1-2 months)

- **GROW-01**: User can create custom categories with name, icon, color (Pro)
- **GROW-02**: User can export data as CSV/PDF (Pro)
- **GROW-03**: User sees AI-powered spending insights
- **GROW-04**: User can set savings goals with progress tracking
- **GROW-05**: User can edit recurring transaction and apply to all future occurrences

## Out of Scope

| Feature | Reason |
|---------|--------|
| Investment tracking | Only 10-15% of budgeting users need this. Specialized apps do it better |
| Open Finance bank sync | Complex integration, 30-40% re-auth rate. WhatsApp reduces friction instead |
| Transaction sub-items | <5% users itemize receipts. WhatsApp AI covers this via photo |
| Custom categories (MVP) | 9 defaults cover 90%+. Adds complexity to forms/budget/reports |
| Real-time chat/social | Privacy nightmare for finance app. LGPD risk |
| Gamification | Finance is serious. Users abandon "gamey" money apps |
| Multi-currency | Niche in Brazil. BRL only |
| E2E encryption per user | Shared key sufficient for MVP. Per-user key = Phase 4 |
| Automatic subscription detection | Requires transaction history pattern analysis. v2 |
| Collaborative budgets | Different product direction. Defer |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | — | Pending |
| AUTH-02 | — | Pending |
| AUTH-03 | — | Pending |
| AUTH-04 | — | Pending |
| AUTH-05 | — | Pending |
| ONBR-01 | — | Pending |
| ONBR-02 | — | Pending |
| ONBR-03 | — | Pending |
| ONBR-04 | — | Pending |
| ONBR-05 | — | Pending |
| ONBR-06 | — | Pending |
| DASH-01 | — | Pending |
| DASH-02 | — | Pending |
| DASH-03 | — | Pending |
| DASH-04 | — | Pending |
| DASH-05 | — | Pending |
| DASH-06 | — | Pending |
| DASH-07 | — | Pending |
| DASH-08 | — | Pending |
| TRNS-01 | — | Pending |
| TRNS-02 | — | Pending |
| TRNS-03 | — | Pending |
| TRNS-04 | — | Pending |
| TRNS-05 | — | Pending |
| TRNS-06 | — | Pending |
| TRNS-07 | — | Pending |
| CATG-01 | — | Pending |
| CATG-02 | — | Pending |
| CATG-03 | — | Pending |
| BANK-01 | — | Pending |
| BANK-02 | — | Pending |
| BANK-03 | — | Pending |
| BANK-04 | — | Pending |
| BANK-05 | — | Pending |
| BANK-06 | — | Pending |
| CARD-01 | — | Pending |
| CARD-02 | — | Pending |
| CARD-03 | — | Pending |
| CARD-04 | — | Pending |
| CARD-05 | — | Pending |
| RECR-01 | — | Pending |
| RECR-02 | — | Pending |
| RECR-03 | — | Pending |
| RECR-04 | — | Pending |
| RECR-05 | — | Pending |
| BUDG-01 | — | Pending |
| BUDG-02 | — | Pending |
| BUDG-03 | — | Pending |
| BUDG-04 | — | Pending |
| HIST-01 | — | Pending |
| HIST-02 | — | Pending |
| HIST-03 | — | Pending |
| WTSP-01 | — | Pending |
| WTSP-02 | — | Pending |
| WTSP-03 | — | Pending |
| WTSP-04 | — | Pending |
| WTSP-05 | — | Pending |
| WTSP-06 | — | Pending |
| WTSP-07 | — | Pending |
| WTSP-08 | — | Pending |
| WTSP-09 | — | Pending |
| SUBS-01 | — | Pending |
| SUBS-02 | — | Pending |
| SUBS-03 | — | Pending |
| SUBS-04 | — | Pending |
| SUBS-05 | — | Pending |
| SECU-01 | — | Pending |
| SECU-02 | — | Pending |
| SECU-03 | — | Pending |
| SECU-04 | — | Pending |
| LAND-01 | — | Pending |
| LAND-02 | — | Pending |
| LAND-03 | — | Pending |
| LAND-04 | — | Pending |
| LAND-05 | — | Pending |
| PWAX-01 | — | Pending |
| PWAX-02 | — | Pending |
| PWAX-03 | — | Pending |
| PWAX-04 | — | Pending |
| PWAX-05 | — | Pending |
| PWAX-06 | — | Pending |
| PROF-01 | — | Pending |
| PROF-02 | — | Pending |
| PROF-03 | — | Pending |
| PROF-04 | — | Pending |

**Coverage:**
- v1 requirements: 74 total
- Mapped to phases: 0
- Unmapped: 74 ⚠️

---
*Requirements defined: 2026-02-11*
*Last updated: 2026-02-11 after initial definition*
