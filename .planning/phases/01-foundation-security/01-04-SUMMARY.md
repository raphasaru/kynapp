---
phase: 01-foundation-security
plan: 04
subsystem: PWA & App Shell
tags: [pwa, manifest, service-worker, navigation, responsive, offline]
dependency_graph:
  requires: ["01-02"]
  provides: ["pwa-manifest", "service-worker", "app-navigation", "responsive-layout"]
  affects: ["all-authenticated-pages"]
tech_stack:
  added: ["Next.js manifest.ts", "Service Worker API", "PWA"]
  patterns: ["Route Groups", "Client Components", "Responsive Navigation"]
key_files:
  created:
    - src/app/manifest.ts
    - public/sw.js
    - public/offline.html
    - src/components/sw-register.tsx
    - src/app/(app)/layout.tsx
    - src/app/(app)/page.tsx
    - src/components/navigation/bottom-nav.tsx
    - src/components/navigation/sidebar.tsx
    - src/components/navigation/nav-items.ts
  modified:
    - src/app/layout.tsx
  deleted:
    - public/manifest.json
decisions:
  - Client component for SW registration (useEffect pattern)
  - Route group (app) for authenticated pages
  - Mobile-first with conditional rendering (md:hidden / hidden md:flex)
  - Shared nav-items.ts config for both nav components
  - User greeting from Supabase auth in dashboard
metrics:
  duration: 2.6 minutes
  tasks_completed: 2
  files_created: 9
  commits: 2
  completed_at: 2026-02-11T23:10:40Z
---

# Phase 01 Plan 04: PWA Configuration & App Shell Summary

**One-liner:** PWA manifest with Next.js manifest.ts, service worker with offline fallback, authenticated app shell with bottom nav (mobile) and sidebar (desktop).

## Overview

Configured KYN as installable PWA with offline support. Created authenticated app layout with responsive navigation structure that adapts to viewport: bottom navigation with 5 tabs on mobile, sidebar on desktop. All future authenticated pages will inherit this shell.

## What Was Built

### PWA Infrastructure (Task 1)

**manifest.ts** — Next.js native PWA manifest generator:
- Generates `/manifest.webmanifest` automatically
- start_url: `/app` (authenticated entry point)
- theme_color: `#10b77f` (primary green)
- background_color: `#070b14` (dark hero)
- Icons: 192x192 (maskable) and 512x512 (any)
- Categories: finance, productivity
- Replaces static public/manifest.json

**Service Worker (public/sw.js)** — Cache strategy:
- Install: Precache offline.html + icons
- Activate: Clean old caches
- Fetch: Network-first for navigation (fallback to offline.html), cache-first for images/styles/scripts, network-first for API calls
- Cache name: `kyn-v1`

**Offline Fallback (public/offline.html)** — Standalone offline page:
- Dark background (hsl(220, 25%, 7%))
- Primary green accent (#10b77f)
- WiFi-off icon
- "Sem Conexão" heading
- "Tentar Novamente" button (window.location.reload)
- Inline styles (no external dependencies)

**Service Worker Registration** — Client component pattern:
- `src/components/sw-register.tsx` uses useEffect
- Registers `/sw.js` on mount
- Included in root layout.tsx

### Authenticated App Shell (Task 2)

**Route Group (app)** — Authenticated pages:
- Server component layout with auth check
- Redirects to `/login` if no user
- Wraps all authenticated pages

**Shared Navigation Config** — `nav-items.ts`:
```typescript
[
  { label: 'Início', href: '/app', icon: Home },
  { label: 'Orçamento', href: '/app/orcamento', icon: PiggyBank },
  { label: 'Carteira', href: '/app/carteira', icon: Wallet },
  { label: 'Relatórios', href: '/app/relatorios', icon: BarChart3 },
  { label: 'Perfil', href: '/app/perfil', icon: User },
]
```

**Bottom Navigation (Mobile)** — `bottom-nav.tsx`:
- Fixed bottom, h-16, only visible on mobile (md:hidden)
- 5 tabs from nav-items, evenly spaced
- Icon (24px) + label (text-xs) stacked vertically
- Active state: text-primary (#10b77f)
- Inactive: text-muted-foreground with hover effect
- Uses usePathname() for active detection
- Safe area padding (pb-safe)

**Sidebar (Desktop)** — `sidebar.tsx`:
- Fixed left, w-64, h-screen, only visible on desktop (hidden md:flex)
- KYN logo at top (next/image)
- Vertical nav items with icon + label
- Active state: bg-primary/10, text-primary, left border accent
- Inactive: text-muted-foreground with hover:bg-muted
- User placeholder at bottom (will be populated in Phase 4)

**App Layout** — `src/app/(app)/layout.tsx`:
- Server component with auth check
- Flex container with sidebar + main + bottom nav
- Main content: flex-1, pb-16 (mobile space for nav), md:ml-64 (desktop space for sidebar)
- Container: max-w-4xl, responsive padding

**Dashboard Page** — `src/app/(app)/page.tsx`:
- Welcome message with user greeting from Supabase auth
- Placeholder content ("Em breve!")
- Will be replaced with real dashboard in Phase 2

## Deviations from Plan

None - plan executed exactly as written.

## Technical Decisions

1. **Client component for SW registration**: Cleaner than inline script, proper React pattern with useEffect
2. **Route group (app)**: Next.js pattern for layout without URL segment
3. **Conditional rendering over display:none**: Avoids rendering unused nav components
4. **Shared nav config**: Single source of truth, easier to maintain
5. **Server component layout**: Auth check happens server-side for security

## Files Modified

**Created (9):**
- src/app/manifest.ts — PWA manifest generator
- public/sw.js — Service worker with cache strategy
- public/offline.html — Offline fallback page
- src/components/sw-register.tsx — Client SW registration
- src/app/(app)/layout.tsx — Authenticated app layout
- src/app/(app)/page.tsx — Dashboard placeholder
- src/components/navigation/bottom-nav.tsx — Mobile bottom nav
- src/components/navigation/sidebar.tsx — Desktop sidebar
- src/components/navigation/nav-items.ts — Shared nav config

**Modified (1):**
- src/app/layout.tsx — Added ServiceWorkerRegister component

**Deleted (1):**
- public/manifest.json — Superseded by manifest.ts

## Verification Results

**Type Check:** ✓ `npx tsc --noEmit` passed
**Installability:** Manifest accessible at /manifest.webmanifest
**Service Worker:** Registered via client component
**Responsive Navigation:** Bottom nav (mobile), sidebar (desktop)
**Auth Protection:** Layout redirects to /login if unauthenticated

## Success Criteria Met

- [x] PWAX-01: App installable as PWA (manifest.ts + sw.js + icons)
- [x] PWAX-02: Mobile bottom nav with 5 tabs (Início, Orçamento, Carteira, Relatórios, Perfil)
- [x] PWAX-03: Desktop sidebar navigation
- [x] PWAX-04: Sheet component available for forms (confirmed installed from Plan 01)
- [x] PWAX-05: Offline fallback page with "Sem conexão" message

## Commits

1. **3190a52** — feat(01-foundation-security-04): configure PWA manifest, service worker, offline support
   - manifest.ts, sw.js, offline.html, sw-register.tsx
   - Service worker registration in root layout
   - Removed old manifest.json

2. **7c2c39f** — feat(01-foundation-security-04): create authenticated app shell with responsive navigation
   - (app) route group with auth layout
   - bottom-nav.tsx (mobile), sidebar.tsx (desktop)
   - nav-items.ts shared config
   - Dashboard placeholder with user greeting

## Next Steps

Phase 2 will populate the app shell with:
- Real dashboard (budget summary, recent transactions)
- Budget page (/app/orcamento)
- Wallet page (/app/carteira) with accounts/cards
- Reports page (/app/relatorios) with charts
- Profile page (/app/perfil) with settings

The navigation structure is ready. All pages will inherit the responsive navigation automatically through the (app) layout.

## Self-Check: PASSED

**Files exist:**
✓ src/app/manifest.ts
✓ public/sw.js
✓ public/offline.html
✓ src/components/sw-register.tsx
✓ src/app/(app)/layout.tsx
✓ src/app/(app)/page.tsx
✓ src/components/navigation/bottom-nav.tsx
✓ src/components/navigation/sidebar.tsx
✓ src/components/navigation/nav-items.ts

**Commits exist:**
✓ 3190a52
✓ 7c2c39f
