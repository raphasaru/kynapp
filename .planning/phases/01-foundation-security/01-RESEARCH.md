# Phase 1: Foundation & Security - Research

**Researched:** 2026-02-11
**Domain:** Next.js 15 + Supabase SSR Auth + PWA + Client-side Encryption
**Confidence:** HIGH

## Summary

Phase 1 establishes secure authentication, PWA capabilities, and client-side encryption foundation. Next.js 15 with App Router offers native PWA support via manifest.ts, eliminating need for third-party packages for basic functionality. Supabase provides battle-tested SSR auth with magic links and email/password via @supabase/ssr package. AES-256-GCM encryption via Web Crypto API is native to all modern browsers. Shadcn/ui provides production-ready components with accessibility built-in.

**Critical finding:** Next.js 15.5 deprecated middleware.ts in favor of proxy.ts for auth token refresh. Web Crypto API requires keys stored in IndexedDB with extractable: false for security.

**Primary recommendation:** Use Next.js native PWA features for manifest + custom service worker (no next-pwa/Serwist), Supabase @supabase/ssr for auth, Web Crypto API for encryption, Shadcn/ui CLI for components. Proxy pattern handles auth refresh, RLS with indexed user_id columns ensures security at scale.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | Framework | App Router SSR/SSG native, proxy.ts for auth middleware, built-in PWA manifest support |
| @supabase/supabase-js | latest | Supabase client | Official client, handles auth + database |
| @supabase/ssr | latest | SSR helpers | Cookie management, token refresh, Server/Client component isolation |
| React | 19.x | UI library | Required by Next.js 15, Server Components native |
| Tailwind CSS | 3.x/4.x | Styling | Industry standard, shadcn/ui dependency |
| Shadcn/ui | latest | Component library | Copy/paste components, accessible by default, React Hook Form integration |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Hook Form | latest | Form handling | All forms - better performance than controlled components |
| Zod | latest | Schema validation | Form validation, type-safe schemas |
| @hookform/resolvers | latest | Zod + RHF integration | Connect Zod schemas to React Hook Form |
| web-push | latest | Push notifications | Server-side notification sending (VAPID) |
| Lucide React | latest | Icons | Project spec requirement, tree-shakeable |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native PWA | next-pwa / Serwist | next-pwa unmaintained, Serwist adds complexity. Native manifest.ts + custom sw.js sufficient for Phase 1 |
| @supabase/ssr | NextAuth.js | NextAuth more complex setup, Supabase auth integrated with database RLS |
| Shadcn/ui | MUI / Chakra UI | Shadcn copy/paste = no version lock-in, smaller bundle, pt-BR labels easier |
| Web Crypto API | CryptoJS / tweetnacl | Web Crypto native, async (non-blocking), hardware-accelerated, audited by W3C |

**Installation:**
```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/ssr react-hook-form zod @hookform/resolvers lucide-react

# Shadcn/ui setup (creates components.json, installs Tailwind)
npx shadcn@latest init

# Push notifications (server-side only)
npm install web-push
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group (login, signup, magic-link)
│   ├── (app)/             # Protected app routes (middleware checks)
│   ├── api/               # API routes (Stripe webhooks, etc)
│   ├── manifest.ts        # PWA manifest (native Next.js)
│   ├── proxy.ts           # Auth token refresh (replaces middleware.ts)
│   └── layout.tsx         # Root layout (metadata, fonts)
├── components/
│   ├── ui/                # Shadcn components (button, form, etc)
│   └── ...                # Custom components
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Browser client (Client Components)
│   │   ├── server.ts      # Server client (Server Components, Route Handlers)
│   │   └── proxy.ts       # Proxy client (cookie management)
│   ├── crypto/
│   │   ├── encrypt.ts     # AES-256-GCM encryption utils
│   │   └── keys.ts        # Key derivation (PBKDF2)
│   └── utils.ts           # Shadcn utilities (cn, etc)
├── hooks/                 # React hooks
└── public/
    ├── sw.js              # Service worker
    ├── icons/             # PWA icons (192x192, 512x512)
    └── ...
```

### Pattern 1: Supabase Auth with SSR
**What:** Three client types for different contexts - browser, server, proxy.
**When to use:** Every auth-related operation.
**Example:**
```typescript
// lib/supabase/client.ts (Client Components)
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

// lib/supabase/server.ts (Server Components)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// app/proxy.ts (replaces middleware.ts in Next.js 15.5+)
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session (triggers cookie update)
  await supabase.auth.getUser()

  // Redirect unauthenticated users
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                      request.nextUrl.pathname.startsWith('/signup')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/app')

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Pattern 2: AES-256-GCM Encryption with Web Crypto API
**What:** Browser-native encryption for financial data before Supabase write.
**When to use:** All fields listed in reference/encryption-schemas.ts.
**Example:**
```typescript
// lib/crypto/encrypt.ts
// Source: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt

// Derive key from shared secret (Phase 1 - shared key)
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // not extractable (security best practice)
    ['encrypt', 'decrypt']
  )
}

// Encrypt value
async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)

  // Generate random IV (12 bytes recommended for AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )

  // Combine IV + ciphertext, encode as base64
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), iv.length)

  return btoa(String.fromCharCode(...combined))
}

// Decrypt value
async function decrypt(encrypted: string, key: CryptoKey): Promise<string> {
  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))

  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )

  const decoder = new TextDecoder()
  return decoder.decode(plaintext)
}

// Usage
const sharedSecret = process.env.NEXT_PUBLIC_ENCRYPTION_KEY! // Phase 1 shared key
const salt = new Uint8Array([/* fixed salt for shared key */])
const key = await deriveKey(sharedSecret, salt)

const encrypted = await encrypt('R$ 1234.56', key)
// Store in Supabase as TEXT
await supabase.from('transactions').insert({ amount: encrypted })

// Read from Supabase
const { data } = await supabase.from('transactions').select('amount').single()
const decrypted = await decrypt(data.amount, key)
```

### Pattern 3: RLS Policies with Performance
**What:** Row-level security filtering by auth.uid() with indexes.
**When to use:** Every table with user_id column.
**Example:**
```sql
-- Source: https://supabase.com/docs/guides/database/postgres/row-level-security

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Add index FIRST (critical for performance)
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Policy with explicit null check + role specification
CREATE POLICY "Users view own transactions"
  ON transactions FOR SELECT TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    auth.uid() = user_id
  );

-- Performance optimization: wrap auth.uid() in SELECT for caching
CREATE POLICY "Users insert own transactions"
  ON transactions FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
  );

-- Always filter in query too (lets Postgres optimize better)
-- Client code:
const { data } = await supabase
  .from('transactions')
  .select()
  .eq('user_id', userId) // Duplicate of RLS but 95% faster
```

### Pattern 4: Shadcn Form with Zod Validation
**What:** Type-safe forms with schema validation.
**When to use:** All forms in the app.
**Example:**
```typescript
// Source: https://ui.shadcn.com/docs/forms/react-hook-form
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Mínimo 6 caracteres" }),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) form.setError("root", { message: error.message })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Entrar</Button>
      </form>
    </Form>
  )
}
```

### Pattern 5: PWA Manifest (Native Next.js)
**What:** manifest.ts in app directory generates manifest.json at build.
**When to use:** Every PWA.
**Example:**
```typescript
// app/manifest.ts
// Source: https://nextjs.org/docs/app/guides/progressive-web-apps
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KYN - Finanças Pessoais',
    short_name: 'KYN',
    description: 'Gestão financeira com WhatsApp e segurança LGPD',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f1117', // Dark hero bg
    theme_color: '#10b77f', // Primary green
    orientation: 'portrait',
    lang: 'pt-BR',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
```

### Anti-Patterns to Avoid
- **Anti-pattern:** Using middleware.ts in Next.js 15.5+
  - **Why bad:** Deprecated, replaced by proxy.ts
  - **Do instead:** Use proxy.ts with same logic
- **Anti-pattern:** Storing encryption keys in localStorage
  - **Why bad:** Accessible via XSS, not secure
  - **Do instead:** Use IndexedDB with extractable: false CryptoKey objects
- **Anti-pattern:** Creating RLS policies without indexes on user_id
  - **Why bad:** 100x+ slower queries on large tables
  - **Do instead:** CREATE INDEX idx_table_user_id ON table(user_id) before policies
- **Anti-pattern:** Using auth.jwt() -> 'user_metadata' in RLS
  - **Why bad:** User-modifiable, security risk
  - **Do instead:** Use auth.uid() or auth.jwt() -> 'app_metadata'
- **Anti-pattern:** Omitting TO authenticated in RLS policies
  - **Why bad:** Policy evaluated for anon users unnecessarily
  - **Do instead:** Always specify TO authenticated or TO anon

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Authentication | Custom JWT system | Supabase Auth | Magic links, email confirmation, rate limiting, session refresh, PKCE flow - all handled |
| Form validation | Manual error state | React Hook Form + Zod | Async validation, field-level errors, touched state, focus management |
| Encryption | Custom AES implementation | Web Crypto API | Hardware-accelerated, constant-time (timing attack resistant), W3C audited |
| Component library | Build from scratch | Shadcn/ui | Accessibility (ARIA), keyboard navigation, focus trapping, screen reader tested |
| PWA manifest | Static JSON file | manifest.ts in Next.js | Dynamic values, TypeScript types, build-time generation |
| Service worker caching | Custom cache strategies | Workbox patterns (if needed) | Stale-while-revalidate, cache-first, network-first battle-tested |

**Key insight:** Security, accessibility, and performance are deceptively complex. AES-GCM tag validation, PKCE flow, ARIA patterns, RLS index optimization - these have edge cases that take years to discover. Use audited, battle-tested libraries.

## Common Pitfalls

### Pitfall 1: Magic Link Email Not Arriving
**What goes wrong:** User clicks "Send magic link", never receives email.
**Why it happens:** Supabase email templates have placeholder {{ .ConfirmationURL }} that must be changed to {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email in production.
**How to avoid:** Update email templates in Supabase Dashboard > Authentication > Email Templates before testing.
**Warning signs:** Works in development, fails in production. Email arrives but link 404s.

### Pitfall 2: RLS Denies All Access After Enabling
**What goes wrong:** Enable RLS on table, all queries return empty results.
**Why it happens:** RLS enabled with no policies = implicit DENY all. Must create at least one policy.
**How to avoid:** In same transaction: ALTER TABLE ENABLE RLS; then CREATE POLICY immediately.
**Warning signs:** Queries work in SQL editor (bypasses RLS), fail from client SDK.

### Pitfall 3: Encryption Key Lost = Data Unrecoverable
**What goes wrong:** User loses access, all encrypted data becomes garbage.
**Why it happens:** Phase 1 uses shared key. If env var changes, all existing encrypted data is unreadable.
**How to avoid:**
  - Store NEXT_PUBLIC_ENCRYPTION_KEY in 1Password/Vault, not just .env
  - Document key rotation process before launch
  - Phase 4: Move to per-user keys with recovery mechanism
**Warning signs:** "Failed to decrypt" errors after deployment, data exists but unreadable.

### Pitfall 4: Service Worker Not Updating
**What goes wrong:** Deploy new version, users still see old cached version.
**Why it happens:** Browsers aggressively cache sw.js. Must set Cache-Control: no-cache.
**How to avoid:**
```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
      ],
    },
  ]
}
```
**Warning signs:** Changes deployed but users report seeing old version, hard refresh works.

### Pitfall 5: Auth Redirect Loop
**What goes wrong:** /app redirects to /login, /login redirects to /app, infinite loop.
**Why it happens:** Proxy checks session before cookies are set, or checks old cookie after logout.
**How to avoid:** In proxy.ts, call await supabase.auth.getUser() (not getSession()) to force refresh. Check user existence, not just cookie presence.
**Warning signs:** Browser tab spins forever, network tab shows repeated 307 redirects.

### Pitfall 6: Next.js 15.5+ Breaking Change
**What goes wrong:** middleware.ts stops working after Next.js 15.5 upgrade.
**Why it happens:** middleware.ts deprecated, renamed to proxy.ts.
**How to avoid:** Use proxy.ts from day 1 (forward compatible).
**Warning signs:** Deprecation warnings in build logs, auth stops working after npm update.

## Code Examples

Verified patterns from official sources:

### Magic Link Authentication
```typescript
// Source: https://supabase.com/docs/guides/auth/auth-email-passwordless
const supabase = createClient()

// Send magic link
const { error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})

// Auth callback route: app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })

    if (!error) {
      return NextResponse.redirect(new URL('/app', request.url))
    }
  }

  return NextResponse.redirect(new URL('/login?error=invalid_link', request.url))
}
```

### Password Reset Flow
```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
const supabase = createClient()

// Request password reset
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/update-password`,
})

// Update password page
const { error } = await supabase.auth.updateUser({
  password: newPassword,
})
```

### SEO Metadata (Landing Page)
```typescript
// app/layout.tsx
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KYN - Finanças Pessoais com WhatsApp',
  description: 'Gestão financeira simples, segura e com LGPD. Registre gastos pelo WhatsApp.',
  keywords: ['finanças pessoais', 'orçamento', 'controle financeiro', 'WhatsApp', 'LGPD'],
  authors: [{ name: 'KYN' }],
  openGraph: {
    title: 'KYN - Finanças Pessoais',
    description: 'Gestão financeira com WhatsApp e segurança LGPD',
    url: 'https://kynapp.com.br',
    siteName: 'KYN',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KYN App',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KYN - Finanças Pessoais',
    description: 'Gestão financeira com WhatsApp e segurança LGPD',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

### Install PWA Button (iOS Handling)
```typescript
// Source: https://nextjs.org/docs/app/guides/progressive-web-apps
"use client"

import { useState, useEffect } from 'react'

export function InstallButton() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  if (isStandalone) return null

  return (
    <div>
      <button>Instalar App</button>
      {isIOS && (
        <p className="text-sm text-muted-foreground mt-2">
          Para instalar no iOS: toque em <span className="font-semibold">⎋</span> e
          depois em <span className="font-semibold">"Adicionar à Tela de Início"</span>
        </p>
      )}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| middleware.ts | proxy.ts | Next.js 15.5 (Jan 2026) | Auth token refresh location changed, same logic |
| next-pwa package | Native manifest.ts + custom sw.js | Next.js 14 (Oct 2024) | No third-party dependency for basic PWA |
| Default shadcn style | new-york style | Q4 2024 | default deprecated, must use new-york |
| CSS utility classes | CSS variables (cssVariables: true) | Shadcn v2 | Better theming, but locked after init |
| getSession() | getUser() | Supabase Auth v2 | getSession doesn't validate JWT, getUser does |
| Anon keys | Publishable keys | Supabase 2026 rollout | New format sb_publishable_*, better security |

**Deprecated/outdated:**
- **middleware.ts**: Renamed to proxy.ts in Next.js 15.5+, still works but shows deprecation warnings
- **Shadcn "default" style**: Must use "new-york" for new projects
- **next-pwa**: Original package unmaintained, fork @ducanh2912/next-pwa active but Next.js native preferred
- **supabase.auth.getSession()**: Use getUser() for server-side checks (validates JWT expiry)

## Open Questions

1. **LGPD Privacy Policy Template**
   - What we know: Must include data types collected, processing purposes, retention periods, user rights, consent opt-in
   - What's unclear: No free pt-BR LGPD template found in research, must write custom or hire legal
   - Recommendation: Start with English GDPR template, adapt to LGPD (similar requirements), translate to simple Portuguese. Hire Brazilian privacy lawyer for review before launch (~R$ 1.500-3.000 typical cost).

2. **Encryption Key Recovery Flow**
   - What we know: Phase 1 uses shared key, lost key = data loss
   - What's unclear: User forgets password = loses key in Phase 4 per-user encryption, how to handle?
   - Recommendation: Phase 1 shared key is acceptable (documented in .env.example with CRITICAL comment). Phase 4 needs key escrow or recovery questions research.

3. **RLS Performance at Scale**
   - What we know: Indexes on user_id are critical, wrapping auth.uid() in SELECT helps
   - What's unclear: At what table size does RLS become bottleneck? 10k rows? 1M rows?
   - Recommendation: Start with indexed RLS policies. Monitor query performance in Supabase Dashboard. If >100ms avg, consider SECURITY DEFINER functions to bypass RLS on hot paths.

## Sources

### Primary (HIGH confidence)
- [Supabase Auth Server-Side Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) - SSR setup, client patterns
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) - Native manifest.ts, service worker patterns
- [Shadcn/ui Installation](https://ui.shadcn.com/docs/installation/next) - CLI setup, components.json
- [Shadcn/ui components.json](https://ui.shadcn.com/docs/components-json) - Configuration options
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) - Policy patterns, performance
- [MDN Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - AES-GCM spec
- [MDN SubtleCrypto.encrypt()](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt) - Encryption examples
- [Next.js proxy.ts (15.5)](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) - New middleware pattern

### Secondary (MEDIUM confidence)
- [LogRocket Next.js 16 PWA Guide](https://blog.logrocket.com/nextjs-16-pwa-offline-support/) - Serwist comparison
- [Supabase RLS Best Practices (MakerKit)](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices) - Performance patterns
- [LGPD Compliance Checklist (Captain Compliance)](https://captaincompliance.com/education/lgpd-compliance-checklist/) - Privacy policy requirements
- [Next.js SEO Guide 2026 (Medium)](https://medium.com/@thomasaugot/the-complete-guide-to-seo-optimization-in-next-js-15-1bdb118cffd7) - Metadata patterns

### Tertiary (LOW confidence)
- GitHub Gists for Web Crypto examples - Code samples helpful but not official
- Medium articles on React Hook Form + Zod - Patterns valid but unofficial

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official docs for all libraries, verified versions
- Architecture: HIGH - All patterns from official Supabase/Next.js docs
- Pitfalls: MEDIUM - Some from docs (magic link template, RLS), some from community (redirect loop, key loss)
- LGPD compliance: LOW - No official template found, legal review needed

**Research date:** 2026-02-11
**Valid until:** 2026-03-11 (30 days - stable stack, Next.js 15 mature)
