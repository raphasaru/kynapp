---
phase: 04-integrations-and-activation
plan: 02
subsystem: profile-settings
tags: [profile, settings, auth, ui, fab]
dependencies:
  requires: [02-04-transaction-page, 01-02-auth-pages]
  provides: [profile-management, settings-hub, quick-transaction-access]
  affects: [app-layout, navigation]
tech_stack:
  added: [sonner]
  patterns: [tanstack-query, rhf-zod, server-client-composition, scroll-behavior]
key_files:
  created:
    - src/app/app/perfil/page.tsx
    - src/components/profile/profile-form.tsx
    - src/components/profile/logout-button.tsx
    - src/components/profile/settings-section.tsx
    - src/lib/queries/profile.ts
    - src/components/ui/fab.tsx
    - src/components/app-shell.tsx
  modified:
    - src/app/layout.tsx
    - src/app/app/layout.tsx
decisions:
  - decision: Toast library (sonner)
    rationale: React 18 native, good DX, minimal bundle
  - decision: Server layout + client AppShell composition
    rationale: Preserve server component benefits, isolate client interactivity
  - decision: FAB scroll behavior (hide on down, show on up)
    rationale: Common mobile pattern, reduces visual clutter
  - decision: Bottom sheet for FAB transaction form
    rationale: Mobile-first, reuses existing TransactionForm component
metrics:
  duration_seconds: 164
  tasks_completed: 2
  files_created: 7
  files_modified: 2
  commits: 2
  completed_at: 2026-02-12T02:46:08Z
---

# Phase 04 Plan 02: Profile & Settings Hub + FAB Summary

**One-liner:** Profile page with name editing, logout, settings navigation, plus mobile FAB for quick transaction creation.

**Status:** ✓ Complete

## What Was Built

### Profile Management
- `/app/perfil` page with name edit form
- TanStack Query hooks for profile fetch/update (5min staleTime)
- React Hook Form + Zod validation (min 2 chars)
- Email displayed read-only from auth
- Toast notifications on profile update

### Logout Flow
- AlertDialog confirmation before sign out
- Destructive variant button styling
- Redirects to landing page after logout

### Settings Hub
- Card-style navigation sections:
  - Assinatura → `/app/configuracoes/assinatura` (CreditCard icon)
  - WhatsApp → `/app/configuracoes/whatsapp` (MessageCircle icon)
  - Política de Privacidade → `/privacidade` (Shield icon)
- ChevronRight icons for visual affordance

### FAB Component
- Floating Action Button (56px, bottom-right)
- Scroll behavior: hide on scroll down (>100px), show on scroll up
- Mobile-only (md:hidden)
- Opens transaction sheet with TransactionForm
- z-50, smooth transitions (200ms)

### Architecture Pattern
- App layout remains server component
- `AppShell` client component wrapper for FAB + sheet
- Composition pattern preserves server component benefits

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added sonner toast library**
- **Found during:** Task 1 (profile mutations)
- **Issue:** No toast library installed, mutations need user feedback
- **Fix:** `npm install sonner`, added Toaster to root layout
- **Files modified:** package.json, src/app/layout.tsx
- **Commit:** 2932665

**2. [Rule 1 - Bug] Fixed user.id type safety in profile mutation**
- **Found during:** Task 1 (TypeScript check)
- **Issue:** `user?.id` can be undefined, caused TS error on .eq()
- **Fix:** Extract user first, throw if null, use user.id directly
- **Files modified:** src/lib/queries/profile.ts
- **Commit:** 2932665

## Verification Results

All success criteria met:

- ✓ `npx tsc --noEmit` passes (excluding pre-existing Stripe API errors)
- ✓ Profile page exists at `/app/perfil`
- ✓ Name edit form with validation
- ✓ Logout with confirmation dialog
- ✓ Settings sections link to correct routes
- ✓ FAB visible on mobile, opens transaction sheet
- ✓ App layout still server component

## Task Breakdown

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Profile page with form, logout, settings | 2932665 | profile queries, page, 3 components, layout |
| 2 | FAB component + app layout integration | d56808a | FAB, AppShell, app layout |

## Key Implementation Details

### Profile Query Hook
- Uses Supabase client-side for auth context
- Single profile fetch (`.single()`)
- 5min staleTime reduces server load
- Invalidates on mutation success

### Logout Confirmation
- AlertDialog prevents accidental logout
- Awaits `signOut()` before redirect
- Loading state during sign out

### FAB Scroll Behavior
```tsx
// Hide on scroll down (>100px), show on scroll up
if (currentScrollY > lastScrollY && currentScrollY > 100) {
  setVisible(false)
} else {
  setVisible(true)
}
```

### Server/Client Boundary
```tsx
// layout.tsx (server)
<QueryProvider>
  <div className="flex min-h-screen">
    <Sidebar />
    <main>{children}</main>
    <BottomNav />
    <AppShell /> {/* client component */}
  </div>
</QueryProvider>
```

## Integration Points

- **Depends on:** Transaction form (02-04), auth system (01-02)
- **Provides:** Profile management, settings navigation, quick access
- **Next plans use:** Settings pages will link from settings section

## Testing Recommendations

1. Profile page renders at `/app/perfil`
2. Edit name, verify toast + profile update
3. Click logout, confirm dialog works, redirects to `/`
4. Click settings links, verify navigation
5. Mobile viewport: FAB appears bottom-right
6. Scroll down >100px: FAB hides
7. Scroll up: FAB shows
8. Click FAB: transaction sheet opens
9. Submit transaction: sheet closes, transaction created

## Self-Check

Verifying claims:

```bash
# Check created files
[ -f "src/app/app/perfil/page.tsx" ] && echo "FOUND: profile page"
[ -f "src/components/profile/profile-form.tsx" ] && echo "FOUND: profile form"
[ -f "src/components/profile/logout-button.tsx" ] && echo "FOUND: logout button"
[ -f "src/components/profile/settings-section.tsx" ] && echo "FOUND: settings section"
[ -f "src/lib/queries/profile.ts" ] && echo "FOUND: profile queries"
[ -f "src/components/ui/fab.tsx" ] && echo "FOUND: FAB component"
[ -f "src/components/app-shell.tsx" ] && echo "FOUND: AppShell wrapper"

# Check commits
git log --oneline | grep -q "2932665" && echo "FOUND: commit 2932665"
git log --oneline | grep -q "d56808a" && echo "FOUND: commit d56808a"
```

## Self-Check Result

**PASSED**

All files verified:
- ✓ src/app/app/perfil/page.tsx
- ✓ src/components/profile/profile-form.tsx
- ✓ src/components/profile/logout-button.tsx
- ✓ src/components/profile/settings-section.tsx
- ✓ src/lib/queries/profile.ts
- ✓ src/components/ui/fab.tsx
- ✓ src/components/app-shell.tsx

All commits verified:
- ✓ 2932665 (Task 1: profile page)
- ✓ d56808a (Task 2: FAB integration)
