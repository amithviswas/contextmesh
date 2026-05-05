# 🔐 ContextMesh — Authentication & Security

---

## Auth Stack: Supabase Auth

**Why Supabase Auth:**
- Free up to 50,000 MAU
- Built-in email verification, password reset, OAuth
- JWT tokens + Row Level Security = no custom auth middleware needed
- Works natively with Next.js App Router

---

## Auth Flows

### 1. Email/Password Signup
```
User fills signup form
  → Client calls supabase.auth.signUp({ email, password })
  → Supabase sends verification email (via its own SMTP or Resend)
  → User clicks link → redirected to /verify?token=...
  → Supabase verifies token → session created
  → Middleware detects session → redirects to /dashboard
  → On first login: create workspace + membership in DB
```

### 2. GitHub OAuth (Recommended)
```
User clicks "Continue with GitHub"
  → Client calls supabase.auth.signInWithOAuth({ provider: 'github' })
  → Redirected to GitHub → user authorizes
  → GitHub redirects to /api/auth/callback
  → Supabase exchanges code for session
  → Session stored in httpOnly cookie
  → Redirect to /dashboard
```

### 3. Password Reset
```
User clicks "Forgot password"
  → Enter email → calls supabase.auth.resetPasswordForEmail(email)
  → Supabase sends reset email
  → User clicks link → /reset-password?token=...
  → User enters new password → calls supabase.auth.updateUser({ password })
  → Session refreshed → redirect to /dashboard
```

---

## Next.js Middleware (Route Protection)

```typescript
// middleware.ts (root of project)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  const isAuthRoute = req.nextUrl.pathname.startsWith('/login') ||
                      req.nextUrl.pathname.startsWith('/signup');
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard') ||
                           req.nextUrl.pathname.startsWith('/projects') ||
                           req.nextUrl.pathname.startsWith('/query') ||
                           req.nextUrl.pathname.startsWith('/settings') ||
                           req.nextUrl.pathname.startsWith('/integrations');

  // Not logged in → redirect to login
  if (isDashboardRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Already logged in → redirect away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/projects/:path*', '/query/:path*',
            '/settings/:path*', '/integrations/:path*', '/login', '/signup'],
};
```

---

## Supabase Client Setup

```typescript
// lib/supabase/client.ts (browser client)
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export const createClient = () => createClientComponentClient<Database>();
```

```typescript
// lib/supabase/server.ts (server component client)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies });
```

---

## Workspace Creation on First Login

```typescript
// lib/auth/onboarding.ts
export async function ensureWorkspace(userId: string, email: string) {
  const supabase = createServerClient();

  // Check if user already has a workspace
  const { data: existing } = await supabase
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', userId)
    .single();

  if (existing) return existing.workspace_id;

  // Create new workspace
  const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');

  const { data: workspace } = await supabase
    .from('workspaces')
    .insert({ name: `${slug}'s workspace`, slug: `${slug}-${Date.now()}` })
    .select()
    .single();

  // Add user as owner
  await supabase.from('memberships').insert({
    user_id: userId,
    workspace_id: workspace!.id,
    role: 'owner',
  });

  return workspace!.id;
}
```

---

## Row Level Security Policies

```sql
-- Users can only see their own workspaces
CREATE POLICY "users_see_own_workspaces"
  ON workspaces FOR SELECT
  USING (id IN (
    SELECT workspace_id FROM memberships WHERE user_id = auth.uid()
  ));

-- Only workspace members can see projects
CREATE POLICY "members_see_workspace_projects"
  ON projects FOR ALL
  USING (workspace_id IN (
    SELECT workspace_id FROM memberships WHERE user_id = auth.uid()
  ));

-- Only workspace members can see context items
CREATE POLICY "members_see_context_items"
  ON context_items FOR ALL
  USING (project_id IN (
    SELECT id FROM projects WHERE workspace_id IN (
      SELECT workspace_id FROM memberships WHERE user_id = auth.uid()
    )
  ));
```

---

## Security Checklist

- [ ] Email verification required before dashboard access
- [ ] Password minimum 8 characters (enforced by Supabase)
- [ ] OAuth tokens stored encrypted in Supabase Vault
- [ ] RLS enabled on all tables
- [ ] API routes verify session before any DB operation
- [ ] Webhook endpoints verify signatures
- [ ] Rate limiting on auth endpoints (Supabase handles this)
- [ ] CORS properly configured in Next.js
- [ ] `.env` never committed to Git (add to `.gitignore`)
- [ ] `NEXTAUTH_SECRET` or equivalent generated with `openssl rand -base64 32`

---

## Environment Variables (Auth)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # Never expose to client

# OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Set in Supabase Dashboard → Authentication → URL Configuration
# Site URL: https://contextmesh.vercel.app
# Redirect URLs: https://contextmesh.vercel.app/api/auth/callback
```
