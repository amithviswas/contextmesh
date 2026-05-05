# 🚀 ContextMesh — Deployment Guide

---

## Infrastructure (All Free)

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Vercel** | Next.js hosting + serverless functions | Hobby plan (free) |
| **Supabase** | Database + Auth + Storage | Free (500MB, 2 projects) |
| **GitHub** | Source control + CI/CD | Free |

---

## Step 1: Supabase Setup

### Create Project
1. Go to https://supabase.com → New Project
2. Name: `contextmesh-prod`
3. Set a strong database password (save it — you'll need it)
4. Region: Choose closest to your users (ap-south-1 for India)
5. Wait ~2 minutes for project to be ready

### Run Migrations
1. Go to Supabase Dashboard → SQL Editor
2. Run the full schema from `docs/tech_stack.md` (Database Schema section)
3. Verify tables created: `workspaces`, `memberships`, `projects`, `context_items`, `integrations`, `queries`

### Configure Auth
1. Supabase Dashboard → Authentication → URL Configuration
2. Set:
   ```
   Site URL: https://contextmesh.vercel.app
   Redirect URLs:
     https://contextmesh.vercel.app/api/auth/callback
     http://localhost:3000/api/auth/callback  ← for local dev
   ```
3. Enable GitHub Provider:
   - Go to Auth → Providers → GitHub
   - Add Client ID and Secret from your GitHub OAuth app
   - Enable

### Get Your Keys
From Supabase Dashboard → Settings → API:
```
Project URL          → NEXT_PUBLIC_SUPABASE_URL
anon/public key      → NEXT_PUBLIC_SUPABASE_ANON_KEY
service_role key     → SUPABASE_SERVICE_ROLE_KEY  ← NEVER expose to client
```

---

## Step 2: GitHub Repository

```bash
# Initialize local project
npx create-next-app@latest contextmesh --typescript --tailwind --app --src-dir=false
cd contextmesh

# Initialize git
git init
git add .
git commit -m "feat: initial setup"

# Create GitHub repo (via GitHub CLI or manually)
gh repo create contextmesh --private
git remote add origin https://github.com/yourusername/contextmesh.git
git push -u origin main
```

### .gitignore (make sure these are ignored)
```
.env
.env.local
.env.production
node_modules/
.next/
```

### .env.local (local development)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=

# Anthropic
ANTHROPIC_API_KEY=

# Resend
RESEND_API_KEY=
EMAIL_FROM=noreply@contextmesh.com

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe (Phase 6 only)
# STRIPE_SECRET_KEY=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
# STRIPE_WEBHOOK_SECRET=
# STRIPE_PRO_PRICE_ID=
# STRIPE_TEAM_PRICE_ID=
```

---

## Step 3: Vercel Deployment

### Connect to Vercel
1. Go to https://vercel.com → New Project
2. Import from GitHub → select `contextmesh` repo
3. Framework: Next.js (auto-detected)
4. Root directory: `./` (default)

### Add Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables, add ALL variables from `.env.local` (except change `NEXT_PUBLIC_APP_URL` to your actual Vercel URL).

### Deploy
```bash
# Vercel auto-deploys on every push to main
# Preview deployments on every PR

# Manual deploy via CLI
npx vercel --prod
```

### Custom Domain (Optional, Later)
1. Buy domain (Namecheap, Google Domains — ~$10/year)
2. Vercel → Project → Settings → Domains → Add domain
3. Follow DNS instructions from Vercel
4. Update `NEXT_PUBLIC_APP_URL` and Supabase redirect URLs

---

## Step 4: Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# → Opens http://localhost:3000

# Run type check
npm run type-check

# Run linter
npm run lint

# Run tests
npm run test

# Run E2E tests
npm run test:e2e
```

---

## CI/CD Pipeline

Vercel handles this automatically:

```
Push to feature/* branch
  → Vercel creates preview deployment
  → URL: https://contextmesh-git-feature-name.vercel.app
  → Share preview URL for review

Merge to main
  → Vercel auto-deploys to production
  → Takes ~60 seconds
  → Zero-downtime deployment
```

### GitHub Actions (Optional — for tests before deploy)
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
```

---

## Monitoring

### Check App Health
```
GET https://contextmesh.vercel.app/api/health
Expected: { "status": "ok", "timestamp": "..." }
```

### Vercel Dashboard
- Function logs: Vercel → Project → Functions tab
- Deployment logs: Vercel → Project → Deployments
- Analytics: Vercel → Project → Analytics

### Supabase Dashboard
- Database health: Supabase → Project → Database
- Auth stats: Supabase → Project → Authentication
- API stats: Supabase → Project → API

---

## Deployment Checklist (Pre-Launch)

- [ ] All env vars set in Vercel (not just local)
- [ ] Supabase schema fully migrated
- [ ] Auth callback URLs updated to production URL
- [ ] GitHub OAuth app URLs updated to production URL
- [ ] Health endpoint responding
- [ ] Signup flow works end-to-end on production
- [ ] GitHub webhook URL updated to production
- [ ] Slack webhook URL updated to production
- [ ] Sentry receiving errors from production
- [ ] PostHog receiving events from production
- [ ] `robots.txt` accessible
- [ ] Sitemap accessible and submitted to Google
- [ ] SSL certificate active (automatic with Vercel)
- [ ] All legal pages live
