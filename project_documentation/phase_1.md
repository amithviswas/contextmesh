# 🏗️ Phase 1 — Foundation & Authentication

**Duration:** Week 1–2  
**Goal:** Working Next.js app with Supabase auth, database schema, and basic UI shell

---

## What You'll Build

By end of Phase 1:
- ✅ Next.js 14 project fully configured
- ✅ Supabase connected (DB + Auth)
- ✅ Email signup, login, logout working
- ✅ GitHub OAuth login working
- ✅ Email verification flow working
- ✅ Password reset working
- ✅ Route protection (middleware)
- ✅ Workspace auto-created on first login
- ✅ Dashboard shell (sidebar layout, empty state)
- ✅ Brand system applied (colors, fonts, tokens)
- ✅ Responsive on mobile and desktop

---

## Step-by-Step Instructions

### Step 1.1 — Project Bootstrap

```bash
npx create-next-app@latest contextmesh \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd contextmesh

# Install core dependencies
npm install \
  @supabase/supabase-js \
  @supabase/auth-helpers-nextjs \
  framer-motion \
  zustand \
  @tanstack/react-query \
  react-hook-form \
  zod \
  @hookform/resolvers \
  lucide-react \
  clsx \
  tailwind-merge

# Dev dependencies
npm install -D \
  @types/node \
  eslint-config-prettier \
  prettier \
  husky \
  lint-staged
```

### Step 1.2 — Apply Brand System

Read `brand/guidelines.md` fully, then:

Create `styles/globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&family=Inter:wght@400;500&display=swap');

:root {
  --color-bg-primary:     #0A0A0F;
  --color-bg-secondary:   #111118;
  --color-bg-elevated:    #1A1A24;
  --color-bg-border:      #2A2A3A;
  --color-text-primary:   #F0EEE8;
  --color-text-secondary: #8A8A9A;
  --color-text-tertiary:  #4A4A5A;
  --color-accent-primary: #00D4B4;
  --color-accent-glow:    rgba(0, 212, 180, 0.15);
  --color-accent-subtle:  rgba(0, 212, 180, 0.08);
  --color-success:        #4ADE80;
  --color-warning:        #FBBF24;
  --color-error:          #F87171;
  --font-display:         'Syne', sans-serif;
  --font-body:            'Inter', sans-serif;
  --font-mono:            'DM Mono', monospace;
  --ease-out-expo:        cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast:        150ms;
  --duration-normal:      250ms;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}
```

Update `tailwind.config.ts` to extend with brand colors.

### Step 1.3 — Supabase Setup

Follow `docs/auth.md` exactly:
1. Create Supabase project
2. Run database schema SQL
3. Configure auth redirect URLs
4. Enable GitHub OAuth provider

Create `lib/supabase/client.ts` and `lib/supabase/server.ts` as defined in `docs/auth.md`.

### Step 1.4 — Route Middleware

Create `middleware.ts` in project root using code from `docs/auth.md`.

### Step 1.5 — Auth Pages

Build these pages with brand design:

**`app/(auth)/signup/page.tsx`**
- Email + password fields
- "Continue with GitHub" button
- Link to login
- "By signing up, you agree to our Terms and Privacy Policy"
- On submit: `supabase.auth.signUp()` → show "check your email" message

**`app/(auth)/login/page.tsx`**
- Email + password fields
- "Continue with GitHub" button
- "Forgot password?" link
- Link to signup
- On submit: `supabase.auth.signInWithPassword()`

**`app/(auth)/verify/page.tsx`**
- "Check your email" message
- Resend verification link button

**`app/(auth)/forgot-password/page.tsx`**
- Email field
- On submit: `supabase.auth.resetPasswordForEmail()`

**`app/(auth)/reset-password/page.tsx`**
- New password field + confirm password
- On submit: `supabase.auth.updateUser({ password })`

**`app/api/auth/callback/route.ts`**
- Handles Supabase OAuth callback
- Creates workspace on first login (use `lib/auth/onboarding.ts`)
- Redirects to `/dashboard`

### Step 1.6 — Dashboard Shell

**`app/(dashboard)/layout.tsx`**
```
Left sidebar (260px fixed):
  - ContextMesh logo (top)
  - Nav items: Dashboard, Projects, Query, Integrations, Settings
  - Workspace selector (bottom)
  - User avatar + email (bottom)

Main content area:
  - Fills remaining width
  - Scrollable
```

**`app/(dashboard)/dashboard/page.tsx`**
```
Empty state for Phase 1:
  - "Welcome to ContextMesh"
  - "Create your first project to get started"
  - [Create Project] button (disabled with "coming in Phase 2")
  - Stats row: 0 context items, 0 queries, 0 integrations
```

### Step 1.7 — Helper Utilities

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// lib/auth/onboarding.ts
// (code from docs/auth.md)
```

---

## Environment Variables for Phase 1

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Phase 1 Completion Criteria

Before moving to Phase 2, verify ALL of these work:

- [ ] `npm run dev` starts without errors
- [ ] Signup with email works → verification email received
- [ ] Email verification link works → redirected to dashboard
- [ ] Login with email works
- [ ] Login with GitHub works → redirected to dashboard
- [ ] Logged-in user visiting `/login` redirected to `/dashboard`
- [ ] Non-logged-in user visiting `/dashboard` redirected to `/login`
- [ ] Password reset email sends
- [ ] Password reset link works, can set new password
- [ ] Logout works → session cleared → redirected to `/login`
- [ ] Workspace auto-created in DB after first login
- [ ] Dashboard shell renders with sidebar
- [ ] Sidebar navigation links render (even if pages are empty)
- [ ] Brand colors applied (dark background, teal accent)
- [ ] Brand fonts loading (Syne for headings, DM Mono for code)
- [ ] Responsive on mobile (sidebar collapses)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)

---

## Git Commit

After all criteria pass:
```bash
git add .
git commit -m "feat: phase-1 complete — auth, workspace, dashboard shell"
git push origin main
```

---

## ✅ PHASE 1 COMPLETE — TRIGGER QA

**After committing, run the full Phase 1 QA protocol from `testing/QA_PROTOCOL.md` → Section: "Phase 1 QA".**

A senior human software tester must verify every item in the QA protocol for Phase 1 before Phase 2 begins. No exceptions.
