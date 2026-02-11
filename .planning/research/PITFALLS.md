# Pitfalls Research

**Domain:** Personal Finance PWA (Next.js 15 + Supabase + Client-side Encryption + Stripe + WhatsApp)
**Researched:** 2026-02-11
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: RLS Disabled or Bypassed = Public Database

**What goes wrong:**
Database with disabled RLS or service_role key in client code exposes ALL user data publicly. In Jan 2026, Moltbook leaked 1.5M API keys + 35K emails due to disabled RLS. 170+ Lovable-generated apps exposed by CVE-2025-48757 (missing RLS in generated code).

**Why it happens:**
- RLS disabled by default on new Supabase tables — must manually enable + create policies
- Developers forget to enable RLS after creating tables via migrations
- Using `service_role` key bypasses RLS entirely (god mode)
- AI coding assistants generate table DDL without RLS by default

**How to avoid:**
- CI check: Assert ALL tables have `ALTER TABLE x ENABLE ROW LEVEL SECURITY`
- Never expose `service_role` key to client (check env vars, build artifacts)
- Every table needs minimum 2 policies: SELECT + INSERT/UPDATE/DELETE with `auth.uid() = user_id`
- Add `user_id` index on every table with RLS policies (prevents sequential scans)
- Use supashield CLI tool to test RLS before production

**Warning signs:**
- Tables created but no corresponding RLS policy in migrations
- Can view other users' data in Supabase table editor when logged as different user
- Queries slow despite small dataset (missing index on user_id)

**Phase to address:**
Phase 1 - Core (before any production data). RLS = foundational security, not optional.

---

### Pitfall 2: Floating Point for Currency = Rounding Errors

**What goes wrong:**
Using JavaScript `number` (float64) for currency: `0.1 + 0.2 = 0.30000000000000004`. One trading system's 0.01¢ discrepancy compounded to $50K error over millions of transactions. `1.40 * 165 = 230.99999999999997` instead of 231.

**Why it happens:**
- Financial amounts are base-10 decimal, but computers use base-2 binary floats
- "It works for small amounts" in dev, breaks at scale with accumulated rounding
- JavaScript has no native Decimal type (unlike C#/Java)

**How to avoid:**
**Store as integers (cents):** R$ 12,34 → `1234` (bigint). Modern Treasury approach.
- Database: `amount BIGINT NOT NULL` (then encrypt the bigint as text)
- Client: Display with `formatCurrency(cents / 100)` → "R$ 12,34"
- Calculations in cents, divide only for display
- Alternative: Use `decimal.js` library if must store decimals, but integers simpler

**Warning signs:**
- Transaction totals don't sum correctly (`sum !== expected`)
- Balance off by 1 cent after multiple operations
- Tests pass for `10.50` but fail for `10.33 * 3`

**Phase to address:**
Phase 1 - Core. Cannot migrate currency data type post-launch without data migration hell.

---

### Pitfall 3: Browser Encryption Key Leaks via DevTools/Logs

**What goes wrong:**
Client-side encryption with key in localStorage/sessionStorage = readable via browser DevTools. Key logged to console during dev, left in production. User inspects element → sees encryption key → decrypts all their data (or worse: all users if shared key).

**Why it happens:**
- WebCrypto key derivation from static secret hard-coded in client bundle
- `console.log(key)` during development, not removed for production
- Key stored plaintext in localStorage for "convenience"
- No key rotation strategy

**How to avoid:**
**MVP approach (shared key per environment):**
- Derive key from environment-specific secret (not in client bundle): server generates derived key per user session
- Store derived key in memory only (not localStorage)
- Clear key on page unload
- Never log raw keys (log key fingerprint instead)
- Content Security Policy to prevent XSS stealing keys

**Future (E2EE per user - Phase 4):**
- Derive key from user password with PBKDF2 (10K+ iterations)
- Store only encrypted master key server-side
- Key never leaves client, server never sees plaintext

**Warning signs:**
- Can decrypt data without authentication by opening DevTools
- Encryption key visible in Network tab or localStorage
- Same ciphertext for same plaintext across users (ECB mode or static IV)

**Phase to address:**
Phase 1 - Core for shared key security. Phase 4 for per-user E2EE. Cannot retrofit encryption model after storing sensitive data.

---

### Pitfall 4: Stripe Webhooks Processed Twice = Double Charges

**What goes wrong:**
Webhook endpoint receives `customer.subscription.created` twice due to network retry. System creates 2 subscriptions or sends 2 confirmation emails. User charged twice.

**Why it happens:**
- Stripe retries failed webhooks (timeouts, 5xx errors)
- Slow synchronous processing causes timeout → Stripe retries → duplicate
- No idempotency checks on webhook events

**How to avoid:**
- **Idempotency:** Log `event.id` in DB table before processing. Skip if already exists.
- **Async queue:** Push webhook to job queue (BullMQ, Inngest), return 200 immediately
- **Signature verification:** Verify `stripe-signature` header (prevents fake webhooks)
- **Separate URLs for test/live mode:** Different signing secrets prevent test events hitting production

**Warning signs:**
- Same `event.id` appears multiple times in logs
- User reports double charges or duplicate emails
- Webhook failures in Stripe dashboard with 500/timeout errors

**Phase to address:**
Phase 1 - Core. Cannot launch with billing without webhook idempotency.

---

### Pitfall 5: Credit Card Billing Cycle Math Wrong = Parcels in Wrong Month

**What goes wrong:**
Purchase on Jan 29, closing day 25, first parcel goes to Feb bill but calculation puts it in Jan. Months have different days (28-31) breaks fixed-day recurrence. User confused why parcel amount doesn't match expected fatura.

**Why it happens:**
- Confusing closing date vs due date (due date = closing + ~21 days)
- Not accounting for Feb (28 days), months with 31 days
- Timezone issues: purchase at 11pm PST = next day in EST
- Assuming all months have 30 days for date math

**How to avoid:**
- **Billing cycle logic:**
  - Purchase date ≤ closing date → current month fatura
  - Purchase date > closing date → next month fatura
- **Month math with date-fns:** `addMonths()` handles varying month lengths
- **Recurrence on day 31:** If month doesn't have day 31, use last day of month (`endOfMonth`)
- **Store UTC dates:** Convert to Brazil time (UTC-3) only for display
- All date calculations in UTC to avoid DST issues

**Warning signs:**
- Parcels appear in wrong month's fatura
- Recurring transactions skip February or double-fire
- Date tests pass for March (31 days) but fail for April (30 days)

**Phase to address:**
Phase 1 - Core for basic billing. Phase 2 for parcelamento (installments).

---

### Pitfall 6: Next.js 15 Server Components Call Browser APIs = Build Fails

**What goes wrong:**
Server Component uses `localStorage`, `window`, `document` → runtime error or build failure. Using `cookies()` or `headers()` outside Server Components → error. Hydration mismatch: server HTML ≠ client HTML → React warning spam + broken UI.

**Why it happens:**
- Next.js 15 defaults to Server Components (no browser access)
- Forgetting to add `"use client"` directive when component needs interactivity
- Importing client-only library (recharts, react-hook-form) in Server Component
- `getUser()` vs `getSession()` confusion (getSession doesn't revalidate token)

**How to avoid:**
- **Mark Client Components:** Add `"use client"` if component uses: useState, useEffect, browser APIs, event handlers
- **Server auth:** Use `supabase.auth.getUser()` (revalidates), NOT `getSession()` (spoofable)
- **Hydration:** Server and client must render identical HTML on first pass (no dynamic dates without suppressHydrationWarning)
- **Caching changed in Next.js 15:** GET routes + Client Router Cache now uncached by default (audit before upgrading)

**Warning signs:**
- "window is not defined" error during build/SSR
- "Hooks can only be called inside the body of a function component"
- React Hydration Error: Text content does not match server-rendered HTML
- Auth broken after middleware runs (getSession in middleware = vulnerability)

**Phase to address:**
Phase 1 - Core. Cannot build app without understanding Server vs Client Components.

---

### Pitfall 7: TanStack Query Cache Not Invalidated = Stale Data After Mutation

**What goes wrong:**
User creates transaction, sees old list. Mutation succeeds but UI shows stale cached data. Or: mutation invalidates ALL queries → refetches dashboard, transactions, budget unnecessarily → slow + expensive.

**Why it happens:**
- Forgetting `queryClient.invalidateQueries()` after mutation
- Invalidating wrong query key (typo or different structure)
- Over-invalidating (refetching unrelated queries)
- Query key doesn't include filters (same key for different months = wrong data)

**How to avoid:**
- **Query key structure:** `['transactions', { month: '2026-02', accountId: '123' }]` (include all variables)
- **Invalidate specific:** `invalidateQueries({ queryKey: ['transactions', { month }] })`
- **Optimistic updates:** Update cache immediately, rollback on error (better UX)
- **Don't refetch everything:** Only invalidate queries affected by mutation

**Warning signs:**
- Hard refresh shows new data, but UI doesn't update after mutation
- Creating transaction shows success toast but doesn't appear in list
- Memory usage grows (stale queries pile up without invalidation)

**Phase to address:**
Phase 1 - Core. Mutations without invalidation = broken user experience.

---

### Pitfall 8: PWA Service Worker Caches Stale App Forever = Users Stuck on Old Version

**What goes wrong:**
Deploy new version, users still see old version weeks later. QA team can't access new features. Cache grows 12MB → 23MB → 33MB per version without cleanup. "Just refresh" doesn't work.

**Why it happens:**
- Aggressive Service Worker caching with no invalidation strategy
- `service-worker.js` itself cached by browser (needs `cache-control: no-cache`)
- Old cached assets not cleaned up on new deploy
- No version fingerprinting in cache keys

**How to avoid:**
- **Service Worker headers:** `Cache-Control: max-age=0, no-cache` for `service-worker.js`
- **Version cache keys:** `cache-v2-assets` (increment on breaking changes)
- **Clear old caches:** In SW `activate` event, delete old cache versions
- **Skip waiting:** `self.skipWaiting()` to activate new SW immediately
- **Kill switch:** `Clear-Site-Data` header to reset everything on critical bug
- **Workbox:** Use Workbox for production-ready caching strategies

**Warning signs:**
- Users report not seeing new features after deploy
- Cache size grows indefinitely in DevTools → Application → Cache Storage
- Different users see different app versions simultaneously

**Phase to address:**
Phase 1 - Core for PWA setup. Phase 2 for robust cache invalidation strategy.

---

### Pitfall 9: Onboarding 6 Steps Before Value = 75% Abandon

**What goes wrong:**
User signs up, sees 6-step wizard (accounts, cards, budget, WhatsApp, upsell), gives up before reaching dashboard. Research: 75% abandon if they can't understand product in first week. 89% churn after bad onboarding.

**Why it happens:**
- "We need all this info to make the app useful" mindset
- Onboarding designed for completeness, not for first value
- No "skip" button or skips hidden
- Asking for credit card details before user sees any benefit

**How to avoid:**
**Onboarding redesign (from FUNCIONALIDADES.md):**
1. Welcome + segmentation (15s) — "How do you describe yourself?" (personalizes experience)
2. First win (30s) — "What was your last expense?" (creates first transaction → shows dashboard with data)
3. Basic config (30s) — Add 1 bank account + monthly income (optional, skip visible)
4. WhatsApp (30s) — Link WhatsApp (optional, "Do later" button)

**Defer to post-onboarding:**
- Credit cards → add when needed
- Budget → set after seeing transaction patterns
- Pro upsell → show after user experiences value (3-7 days)

**Benchmark:** User should see dashboard with 1 transaction in <2 minutes.

**Warning signs:**
- Analytics show <25% onboarding completion rate
- High drop-off at specific step (indicates friction)
- Support tickets: "How do I skip this?"

**Phase to address:**
Phase 1 - Core. Onboarding = activation, activation = retention. Cannot fix after launch.

---

### Pitfall 10: Free Tier Too Generous = No Upgrade Motivation

**What goes wrong:**
User stays on Free forever. Never hits limits. Pro conversion <1% (healthy freemium = 2-5%). Can't monetize enough users to sustain operations.

**Why it happens:**
- Free tier designed to "not be evil" instead of to drive conversions
- Limits too high (30 WhatsApp msgs/month likely enough for most users)
- Pro features not valuable enough (custom categories = nice-to-have)
- No graduated friction (users don't realize they're hitting limits)

**How to avoid (from FUNCIONALIDADES.md recommendations):**
- **Free limits:** 2 accounts, 1 card, 3 months history, 30 WhatsApp msgs
- **Pro triggers:** Unlimited accounts/cards, unlimited history, unlimited WhatsApp, export CSV/PDF, custom categories, savings goals
- **Upgrade prompts:** When user tries to add 3rd account → "Upgrade to Pro for unlimited accounts"
- **Value demonstration:** 14-day Pro trial AFTER user has used Free for 3-7 days (not during onboarding)

**Alternative limits to test:**
- Free: 50 transactions/month, Pro: unlimited
- Free: AI insights once/week, Pro: daily
- Free: 1 WhatsApp number, Pro: family sharing (multiple numbers)

**Warning signs:**
- <1% free-to-paid conversion after 30 days
- Users never hit limits (check analytics: % users at 2 accounts, 1 card, 3 months)
- Upgrade page has <5% click-through rate

**Phase to address:**
Phase 1 - Core for limits enforcement. Phase 3 for conversion optimization after data.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Shared encryption key (all users) | Simpler implementation, faster development | Cannot claim "zero-knowledge", weaker security, key rotation affects all users | MVP only. Phase 4 must migrate to per-user keys. |
| Storing currency as decimal string instead of int | Matches user mental model (12.34) | Rounding errors, complex currency math, harder to audit | Never. Use cents (bigint) from day 1. |
| Skipping Stripe webhook signature verification | Faster testing in dev | Production vulnerable to fake webhooks, fraudulent subscriptions | Dev/test only. Must verify in production. |
| Synchronous webhook processing | Simpler code flow | Timeouts cause duplicate events, doesn't scale | Never for production. Use async queue. |
| localStorage for sensitive data | Works offline, simple API | Readable by any script, survives XSS, no expiration | Never for keys/tokens. sessionStorage + memory only. |
| Manual query invalidation (no optimistic updates) | Less code to write | Slow UX (wait for server), perceived lag | Acceptable for MVP. Add optimistic updates in Phase 2. |
| No RLS indexes on user_id | Works with small dataset | Sequential scans at scale (50ms → timeout) | Never. Add indexes in same migration as RLS policies. |
| Single timezone (UTC everywhere) | No timezone conversion logic | Users in Brazil see wrong dates | Acceptable if all users in Brazil (UTC-3). Convert to local for display. |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **Supabase RLS** | Using `service_role` key in client code | Use `anon` key client-side. `service_role` only in server-side API routes. |
| **Supabase Auth** | Trusting `getSession()` in Server Components/Middleware | Always use `getUser()` (revalidates token). `getSession()` = spoofable cookies. |
| **Stripe Webhooks** | Processing event synchronously (causes timeout → retry → duplicate) | Push event to async queue (BullMQ), return 200 immediately. Check event.id for idempotency. |
| **Stripe Test Mode** | Same webhook URL for test + live mode | Separate URLs with different signing secrets. Prevents test events hitting production. |
| **n8n WhatsApp** | Storing WhatsApp credentials in client | Credentials in n8n workflow only. Client calls n8n webhook, never direct WhatsApp API. |
| **WebCrypto AES-GCM** | Reusing IV (nonce) with same key | Generate random 96-bit IV for every encryption. Never reuse IV. |
| **WebCrypto AES-GCM** | Not concatenating auth tag with ciphertext | `decrypt()` needs ciphertext + tag together. Concat on encrypt, split on decrypt. |
| **PWA manifest** | Missing `start_url` or wrong `scope` | `start_url: "/"`, `scope: "/"`. Test installation on iOS + Android. |
| **Service Worker** | Not versioning cache keys | Use `cache-v1-assets`, increment on breaking changes. Clean old caches in `activate`. |
| **TanStack Query** | Query key missing filter params | `['transactions', { month, accountId }]`. Different filters = different keys. |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| **RLS without user_id index** | Queries slow despite small dataset (50ms → 200ms → timeout) | `CREATE INDEX idx_transactions_user_id ON transactions(user_id);` for every table with RLS | >10K rows per table |
| **Fetching all transactions for all months** | Initial load slow, memory usage high | Fetch only current month by default. `WHERE due_date >= '2026-02-01' AND due_date < '2026-03-01'` | >1K transactions |
| **Decrypting data on server for every request** | Server CPU high, response times increase | Decrypt only what's needed. Cache decrypted data in TanStack Query (client-side). | >100 req/min |
| **TanStack Query refetching everything on focus** | Network tab floods with requests on tab switch | `refetchOnWindowFocus: false` for stable data. Keep for real-time data only. | Multiple tabs open |
| **Recharts rendering large datasets** | Chart laggy, browser freezes | Aggregate data (daily → monthly for >90 days). Virtualize if needed. | >500 data points |
| **Service Worker caching all API responses** | Stale data, large cache size | Only cache static assets. API responses should be fresh (TanStack Query handles caching). | After 10+ sessions |
| **Webhook processing all subscription events** | Server overload on high traffic | Filter events in webhook config (Stripe dashboard). Only subscribe to needed events. | >1K webhooks/day |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| **Exposing `SUPABASE_SERVICE_ROLE_KEY` in client env** | Bypasses RLS, exposes all user data | Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` in client. Service role only in API routes. |
| **Storing encryption key in localStorage** | XSS can steal key, decrypt all user data | Key in memory only (React state). Derive from session, clear on logout. |
| **Not verifying Stripe webhook signatures** | Fake webhooks can create fraudulent subscriptions | Verify `stripe-signature` header with signing secret. Reject unsigned requests. |
| **Logging decrypted financial data** | Logs leak to monitoring tools (Sentry, Datadog) | Never log raw amounts/descriptions. Log encrypted values or sanitized versions only. |
| **Client-side RBAC (checking user.role in React)** | User edits client code, bypasses checks | Enforce permissions server-side (RLS policies). Client checks = UX only. |
| **Missing CSRF protection on state-changing endpoints** | User tricked into unwanted actions | Use Supabase session cookies (SameSite=Lax). Or CSRF tokens for custom auth. |
| **No rate limiting on WhatsApp verification** | Attacker brute-forces verification codes | Rate limit by phone number (5 attempts/hour). Expire codes after 1 hour. |
| **Allowing user-controlled SQL in filters** | SQL injection via transaction search | Use parameterized queries. Never concatenate user input into SQL strings. |
| **No Content Security Policy (CSP)** | XSS can inject malicious scripts | CSP header: `script-src 'self'`, `connect-src 'self' *.supabase.co stripe.com` |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| **Forcing login before showing value** | User leaves before understanding what app does | Landing page with demo video or interactive preview. Auth after interest. |
| **6-step onboarding wizard** | 75% abandon before reaching dashboard | 2-minute onboarding: 1 transaction → see dashboard → configure later. |
| **No "skip" button in onboarding** | User feels trapped, abandons | Every step skippable. Prompt to complete later from dashboard. |
| **Confusing "planned" vs "completed" status** | User doesn't understand difference, marks everything completed | Onboarding tooltip: "Planned = you expect this. Completed = already paid." |
| **WhatsApp linking during onboarding** | Friction before user sees value | Offer WhatsApp after user creates 2-3 manual transactions (sees pain point). |
| **Pro upsell during onboarding (Step 6)** | Asking for money before demonstrating value | Show Pro upsell after 3-7 days OR when user hits limit. |
| **No feedback when hitting Free tier limits** | User confused why "Add Account" button doesn't work | Modal: "Free tier limited to 2 accounts. Upgrade to Pro for unlimited." |
| **Transaction form with 12 fields** | Cognitive overload, user gives up | Minimal MVP: amount + description. Show advanced fields on expand. |
| **No search/filter on transaction list** | Can't find specific transaction in long list | Search by description. Filter by month, status, type. Visible at top of list. |
| **Budget progress bar only shows %** | User doesn't know "67% of budget" = how many reais | Show both: "R$ 670 / R$ 1.000 (67%)" |

---

## "Looks Done But Isn't" Checklist

- [ ] **RLS Policies:** Tables exist with data, but RLS not enabled or policies missing → data leak
- [ ] **Encryption IV uniqueness:** Same IV reused → encryption broken, often missing [crypto validation test]
- [ ] **Webhook idempotency:** Webhook endpoint works, but no event.id deduplication → duplicate processing
- [ ] **Stripe signature verification:** Webhooks processed, but signatures not verified → vulnerable to fake events
- [ ] **Currency stored as float:** Works for R$ 10.00, breaks for R$ 10.33 * 3 → verify with odd decimals
- [ ] **Service Worker cache invalidation:** PWA installable, but users stuck on old version → verify `skipWaiting()` + cache versioning
- [ ] **Date math for recurring transactions:** Works for March (31 days), breaks for February → test all months
- [ ] **TanStack Query invalidation:** Mutations succeed, but UI doesn't update → verify `invalidateQueries()` called
- [ ] **Timezone handling:** Works in local dev (UTC-3), breaks for users in different states/DST → store UTC, convert for display
- [ ] **Free tier enforcement:** Limits configured in DB, but not enforced in UI → user can bypass limits
- [ ] **LGPD consent:** Privacy policy exists, but no opt-in checkbox on signup → non-compliant
- [ ] **Error boundaries:** Happy path works, but unhandled error crashes entire app → add error boundaries around routes
- [ ] **Offline mode:** PWA caches assets, but API calls fail with no feedback → show "offline" banner + queue requests
- [ ] **Mobile responsiveness:** Looks good on Chrome DevTools responsive mode, but breaks on actual iOS Safari notch → test on physical devices

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| **RLS not enabled on production tables** | HIGH | 1. Enable RLS immediately (causes downtime). 2. Create policies. 3. Notify users of breach (LGPD requires 72h). 4. Audit logs for unauthorized access. 5. Reset all sessions. |
| **Floating point used for currency** | HIGH | 1. Add new `amount_cents BIGINT` column. 2. Migrate `amount * 100` for all rows. 3. Update app to use cents. 4. Drop old column. [Requires maintenance window] |
| **Encryption key leaked** | CRITICAL | 1. Rotate key immediately. 2. Re-encrypt all data with new key (downtime). 3. Invalidate all sessions. 4. Notify ANPD + users (LGPD). 5. Audit access logs. |
| **Stripe webhooks processed without idempotency** | MEDIUM | 1. Add `stripe_events` table (event_id unique). 2. Deploy idempotency check. 3. Audit existing subscriptions for duplicates. 4. Refund duplicate charges. |
| **Service Worker caches stale app** | LOW | 1. Deploy `Clear-Site-Data` header for next version. 2. Increment cache version. 3. Notify users to hard refresh (Ctrl+Shift+R). |
| **Onboarding 6 steps causing churn** | MEDIUM | 1. A/B test shorter onboarding (2 steps). 2. Make steps skippable. 3. Measure completion rate + D1/D7 retention. |
| **Free tier too generous (low conversions)** | MEDIUM | 1. Grandfather existing users. 2. New users get stricter limits. 3. A/B test limit thresholds. 4. Measure conversion impact. |
| **TanStack Query cache stale after mutations** | LOW | 1. Add `invalidateQueries()` to all mutations. 2. Optionally add optimistic updates for instant feedback. |
| **Credit card billing cycle math wrong** | MEDIUM | 1. Fix date calculation logic. 2. Notify affected users. 3. Offer manual correction for incorrect parcels. |
| **No LGPD privacy policy** | HIGH | 1. Publish privacy policy immediately (template: LGPD compliance checklist). 2. Add consent checkbox to signup. 3. Notify ANPD of retroactive compliance. [Potential fine: up to R$ 50M or 2% revenue] |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| RLS disabled/bypassed | Phase 1 - Core | supashield CLI test before production. Manual test: login as User A, try to read User B's transactions. |
| Floating point currency | Phase 1 - Core | Test: `(1050 + 2150) === 3200` (cents). Test odd decimals: `1033 * 3 === 3099`. |
| Encryption key leaks | Phase 1 - Core | Audit: grep codebase for `console.log`, check localStorage in DevTools. CSP header blocks eval(). |
| Stripe webhook duplicates | Phase 1 - Core | Test: Send same event.id twice, verify only processed once. Check `stripe_events` table for unique constraint. |
| Credit card billing math | Phase 2 - Retention | Unit tests for all month lengths (28/29/30/31 days). Test closing day edge cases (day 31 in Feb). |
| Next.js SSR/hydration errors | Phase 1 - Core | Build passes without warnings. No hydration errors in browser console. |
| TanStack Query stale cache | Phase 1 - Core | After mutation, verify UI updates without hard refresh. Network tab shows no unnecessary refetches. |
| PWA cache invalidation | Phase 2 - Retention | Deploy new version, verify users see update within 5 minutes (not days). Cache size doesn't grow unbounded. |
| Onboarding friction (6 steps) | Phase 1 - Core | Measure: >50% onboarding completion. <2 minutes to dashboard. User sees value before friction. |
| Free tier too generous | Phase 1 - Core (limits), Phase 3 - Growth (optimization) | Measure: 2-5% free-to-paid conversion within 30 days. >30% users hit at least one limit. |
| LGPD non-compliance | Phase 1 - Core | Privacy policy published. Consent checkbox on signup. DPO appointed. Breach notification process documented. |
| WhatsApp credential exposure | Phase 1 - Core | n8n credentials not in client code. Verify: search codebase for WhatsApp API tokens. |
| Timezone/date handling | Phase 1 - Core | Test: create recurring transaction on Jan 31, verify appears on Feb 28 (not skipped). DST transition test. |
| Performance (missing indexes) | Phase 1 - Core | Query EXPLAIN shows index scan, not seq scan. <50ms query time with 10K rows. |

---

## Sources

**Next.js 15 App Router:**
- [Common mistakes with the Next.js App Router and how to fix them - Vercel](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)
- [Next.js 15 Upgrade Guide: App Router changes, caching gotchas - Prateeksha](https://prateeksha.com/blog/nextjs-15-upgrade-guide-app-router-caching-migration)
- [Next.js Hydration Errors in 2026: The Real Causes - Medium](https://medium.com/@blogs-world/next-js-hydration-errors-in-2026-the-real-causes-fixes-and-prevention-checklist-4a8304d53702)

**Supabase RLS Security:**
- [Supabase Security Flaw: 170+ Apps Exposed by Missing RLS - ByteIota](https://byteiota.com/supabase-security-flaw-170-apps-exposed-by-missing-rls/)
- [Moltbook Data Breach: Supabase RLS Security Lessons - Bastion](https://bastion.tech/blog/moltbook-security-lessons-ai-agents)
- [Supabase Row Level Security (RLS): Complete Guide 2026 - DesignRevision](https://designrevision.com/blog/supabase-row-level-security)
- [Hacking Thousands of Misconfigured Supabase Instances - DeepStrike](https://deepstrike.io/blog/hacking-thousands-of-misconfigured-supabase-instances-at-scale)

**Client-side Encryption:**
- [What's wrong with in-browser cryptography? - Tony Arcieri](https://tonyarcieri.com/whats-wrong-with-webcrypto)
- [How to secure encrypt and decrypt data within the browser with AES-GCM and PBKDF2 - Medium](https://medium.com/@thomas_40553/how-to-secure-encrypt-and-decrypt-data-within-the-browser-with-aes-gcm-and-pbkdf2-057b839c96b6)
- [SubtleCrypto AES-GCM encryption/decryption - GitHub Gist](https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a)

**Stripe Webhooks:**
- [Best practices I wish we knew when integrating Stripe webhooks - Stigg](https://www.stigg.io/blog-posts/best-practices-i-wish-we-knew-when-integrating-stripe-webhooks)
- [Troubleshooting webhook delivery issues - Stripe Support](https://support.stripe.com/questions/troubleshooting-webhook-delivery-issues)
- [Guide to Stripe Webhooks: Features and Best Practices - Hookdeck](https://hookdeck.com/webhooks/platforms/guide-to-stripe-webhooks-features-and-best-practices)

**Personal Finance App Failures:**
- [Why do Financial App Users Churn? 10 Mistakes to Avoid - Netguru](https://www.netguru.com/blog/mistakes-in-creating-finance-app)
- [8 Common Mistakes to Avoid in Financial App Onboarding - Fintel Connect](https://www.fintelconnect.com/blog/financial-app-onboarding/)
- [App Retention Benchmarks for 2026: How Your App Stacks Up - Enable3](https://enable3.io/blog/app-retention-benchmarks-2025)

**PWA Pitfalls:**
- [When 'Just Refresh' Doesn't Work: Taming PWA Cache Behavior - Infinity Interactive](https://iinteractive.com/resources/blog/taming-pwa-cache-behavior)
- [A Veteran's Guide to Squashing Pesky PWA Bugs - Medium](https://medium.com/bits-bytesprogramming/a-veterans-guide-to-squashing-pesky-pwa-bugs-7c80b237af68)
- [Stuff I wish I'd known sooner about service workers - Rich Harris GitHub](https://gist.github.com/Rich-Harris/fd6c3c73e6e707e312d7c5d7d0f3b2f9)

**Freemium SaaS Pricing:**
- [SaaS Freemium Conversion Rates: 2026 Report - First Page Sage](https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/)
- [The Three Most Common Challenges with Freemium—And How to Fix Them - a16z](https://a16z.com/how-to-optimize-your-free-tier-freemium/)
- [Freemium Model Design: Building a Free Tier That Drives Paid Conversions - Rework](https://resources.rework.com/libraries/saas-growth/freemium-model-design)

**LGPD Compliance:**
- [LGPD Compliance Checklist: The Ultimate Guide for 2026 - Captain Compliance](https://captaincompliance.com/education/lgpd-compliance-checklist/)
- [LGPD Enforcement Guide: Brazil's Data Protection Fines & Breaches - ComplianceHub](https://www.compliancehub.wiki/breaches-and-fines-under-brazils-lei-geral-de-protecao-de-dados-lgpd-2/)
- [Real-World Examples of LGPD Fines and Enforcement Actions in Brazil - Breached.company](https://breached.company/real-world-examples-of-lgpd-fines-and-enforcement-actions-in-brazil/)

**Financial Data Precision:**
- [Floats Don't Work For Storing Cents: Why Modern Treasury Uses Integers Instead](https://www.moderntreasury.com/journal/floats-dont-work-for-storing-cents)
- [Why You Should Never Use Float and Double for Monetary Calculations - DZone](https://dzone.com/articles/never-use-float-and-double-for-monetary-calculatio)
- [4 Ways Floating Point Numbers Can Ruin Your Money Math - Atomic Object](https://spin.atomicobject.com/currency-rounding-errors/)

**Supabase Auth with Next.js:**
- [Setting up Server-Side Auth for Next.js - Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Troubleshooting Next.js - Supabase Auth issues - Supabase Docs](https://supabase.com/docs/guides/troubleshooting/how-do-you-troubleshoot-nextjs---supabase-auth-issues-riMCZV)

**TanStack Query:**
- [Query Invalidation - TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)
- [Avoiding Common Mistakes with TanStack Query Part 1 - Bun Colak](https://www.buncolak.com/posts/avoiding-common-mistakes-with-tanstack-query-part-1/)
- [Managing Query Keys for Cache Invalidation in React Query - Wisp CMS](https://www.wisp.blog/blog/managing-query-keys-for-cache-invalidation-in-react-query)

**Brazil Open Finance:**
- [How Brazilian Banks Can Use Open Finance to Thrive in 2026 - Galileo](https://www.galileo-ft.com/blog/brazilian-banks-open-finance-thrive-2026/)
- [Open Banking in Brazil: Evolution, Adoption, Challenges - Noda](https://noda.live/articles/open-banking-in-brazil)
- [Success in Open Finance Requires Trust – Lessons from Brazil - CGAP](https://www.cgap.org/blog/success-in-open-finance-requires-trust-lessons-brazil)

**WhatsApp + n8n Integration:**
- [WhatsApp Business Cloud integrations - n8n](https://n8n.io/integrations/whatsapp-business-cloud/)
- [WhatsApp Business Cloud credentials - n8n Docs](https://docs.n8n.io/integrations/builtin/credentials/whatsapp/)

**Date/Timezone Handling:**
- [Common Timestamp Pitfalls and How to Avoid Them - DateTimeApp](https://www.datetimeapp.com/learn/common-timestamp-pitfalls)
- [Best practices for timestamps and time zones in databases - Tinybird](https://www.tinybird.co/blog/database-timestamps-timezones)

---

*Pitfalls research for: KYN App — Personal Finance PWA*
*Researched: 2026-02-11*
