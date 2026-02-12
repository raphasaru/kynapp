---
phase: 04-integrations-and-activation
plan: 03
subsystem: whatsapp-integration
tags: [whatsapp, verification, api, n8n-webhook, tier-enforcement]
dependency_graph:
  requires: [04-01-subscriptions]
  provides: [whatsapp-verification-flow, whatsapp-transaction-callback]
  affects: [user-onboarding, transaction-creation]
tech_stack:
  added: [react-qr-code, qrcode]
  patterns: [webhook-auth, polling, deep-linking]
key_files:
  created:
    - src/app/api/whatsapp/verify/route.ts
    - src/app/api/whatsapp/check/route.ts
    - src/app/api/whatsapp/unlink/route.ts
    - src/app/api/whatsapp/transaction/route.ts
    - src/lib/validators/phone-number.ts
    - src/lib/queries/whatsapp.ts
    - src/components/whatsapp/phone-input.tsx
    - src/components/whatsapp/verification-qr.tsx
    - src/components/whatsapp/verification-status.tsx
    - src/app/app/configuracoes/whatsapp/page.tsx
  modified:
    - package.json
    - package-lock.json
decisions:
  - decision: "Service role client for transaction callback"
    rationale: "n8n webhook has no user session, requires service role like Stripe webhook"
    alternatives: ["User-scoped client", "Separate microservice"]
  - decision: "5-second polling during verification"
    rationale: "Balance freshness with server load, stop polling once verified"
    alternatives: ["WebSockets (overkill)", "10s polling (slower UX)"]
  - decision: "QR code + deep link + copy code"
    rationale: "Multiple verification methods for different user preferences/devices"
    alternatives: ["QR only", "Deep link only"]
  - decision: "Phone mask (DD) 9XXXX-XXXX"
    rationale: "Brazilian mobile format, intuitive for local users"
    alternatives: ["International format +55 11 91234-5678"]
metrics:
  duration: 6.5
  completed_date: 2026-02-12
---

# Phase 4 Plan 3: WhatsApp Integration Summary

**One-liner:** WhatsApp verification flow with QR/deep link/copy code options + n8n transaction callback with AES-256-GCM encryption and free tier 30-message enforcement.

## What Was Built

**API Routes (4 endpoints):**
- **verify**: Generates 6-char alphanumeric code, 1-hour expiry, deep link (`wa.me/BOT_NUMBER?text=Verificação KYN: CODE`)
- **check**: Returns link status (linked/pending/not_linked), used for polling
- **unlink**: Removes WhatsApp connection
- **transaction**: n8n webhook callback with N8N_WEBHOOK_SECRET auth, encrypts amount/description, enforces 30-message free tier limit, increments counter

**Components (4 UI components):**
- **PhoneInput**: Brazilian phone mask with Zod validation, formats to API format (5511999999999)
- **VerificationQR**: QR code (react-qr-code), "Abrir WhatsApp" button, "Copiar código" button, 1-hour countdown
- **VerificationStatus**: Green checkmark linked state, phone display, verified_at timestamp, unlink AlertDialog
- **WhatsApp settings page**: State machine (not_linked → verifying → linked), usage progress bar for free tier

**Data flow:**
1. User enters phone → verify API generates code → upsert to user_whatsapp_links (verified_at=null)
2. User sends code to bot → n8n verifies code → updates verified_at
3. Client polls check API every 5s → detects verified_at set → shows linked state
4. n8n sends transaction → transaction API validates secret, finds user by phone, checks tier limit, encrypts data, inserts transaction, increments counter

## Technical Highlights

**Security:**
- N8N_WEBHOOK_SECRET header auth (same pattern as Stripe webhook)
- Service role Supabase client for transaction callback (no user session)
- Verified phone check: `verified_at IS NOT NULL` prevents unverified submissions

**Encryption:**
- Transaction amount/description encrypted with AES-256-GCM before insert
- Uses existing `encryptFields('transactions', data)` pattern from 02-04

**Tier enforcement:**
- Free tier: check `whatsapp_messages_used >= 30` → return 429 with upgrade message
- Pro/Pro Annual: unlimited (no check)
- Counter incremented per transaction, reset on successful invoice payment (webhook handler)

**UX:**
- 3 verification methods: QR scan (desktop → mobile), deep link button (mobile), copy code (any device)
- 5s polling only during pending state, stops once verified (refetchInterval conditional)
- Progress bar visual for free tier usage (green/yellow/red at 75%/90%)

## Deviations from Plan

None - plan executed exactly as written.

## Testing Checklist

- [ ] Type check passes: `npx tsc --noEmit`
- [ ] Verify route generates 6-char code with 1-hour expiry
- [ ] Check route returns linked status correctly
- [ ] Unlink route removes connection
- [ ] Transaction route enforces 30-message limit for free tier
- [ ] Transaction route encrypts amount/description
- [ ] WhatsApp page renders at `/app/configuracoes/whatsapp`
- [ ] Phone input applies Brazilian mask correctly
- [ ] QR code renders with deep link value
- [ ] Polling starts during verification, stops when linked
- [ ] Unlink dialog confirms before removing connection

## Integration Points

**Depends on:**
- 04-01: Subscription data for tier check, message counter
- 02-04: Encryption utilities (encryptFields)
- 01-02: Supabase auth patterns

**Enables:**
- n8n bot can create transactions via webhook
- Users can verify WhatsApp and see link status
- Free tier limit enforced transparently

## Self-Check

**Files verified:**
- FOUND: src/app/api/whatsapp/verify/route.ts
- FOUND: src/app/api/whatsapp/check/route.ts
- FOUND: src/app/api/whatsapp/unlink/route.ts
- FOUND: src/app/api/whatsapp/transaction/route.ts
- FOUND: src/lib/validators/phone-number.ts
- FOUND: src/lib/queries/whatsapp.ts
- FOUND: src/components/whatsapp/phone-input.tsx
- FOUND: src/components/whatsapp/verification-qr.tsx
- FOUND: src/components/whatsapp/verification-status.tsx
- FOUND: src/app/app/configuracoes/whatsapp/page.tsx

**Commits verified:**
- FOUND: 59c0c65 (Task 1: API routes)
- FOUND: e4b3831 (Task 2: UI components + page)

**Type check:** PASSED

## Self-Check: PASSED

All files created, commits exist, type check passes.
