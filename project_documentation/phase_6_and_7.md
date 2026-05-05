# 💳 Phase 6 — Payments & Plan Enforcement

**Duration:** Week 11–12  
**Goal:** Stripe subscriptions, upgrade/downgrade/cancel, billing page, plan gates enforced

---

## What You'll Build

- ✅ Stripe Checkout for Pro and Team plans
- ✅ Stripe Customer Portal (self-serve billing)
- ✅ Subscription lifecycle: upgrade, downgrade, cancel, renew
- ✅ Failed payment handling + email warning
- ✅ All plan limits hard-enforced (projects, queries, integrations, team size)
- ✅ Billing page in settings
- ✅ Upgrade prompts throughout app (contextual, not annoying)

---

## Step-by-Step Instructions

### Step 6.1 — Stripe Setup

Follow `docs/payments.md` completely:
1. Create Stripe account
2. Create Pro and Team products + prices
3. Add all env vars
4. Install Stripe: `npm install stripe @stripe/stripe-js`

### Step 6.2 — Implement All Payment Routes

Follow the code in `docs/payments.md` exactly:
- `app/api/stripe/checkout/route.ts`
- `app/api/stripe/webhook/route.ts`
- `app/api/stripe/portal/route.ts`
- `app/api/stripe/subscription/route.ts`

### Step 6.3 — Update Plan Limits Enforcement

Plan gates must be hard-enforced server-side (never trust client):

```typescript
// Every API route that creates a resource must check limits
// lib/plans.ts — already from Phase 2, now enforced for real:

// Projects: free=1, pro=5, team=unlimited
// Before creating project:
const projectCount = await getProjectCount(workspace_id);
if (!canAddProject(workspace, projectCount)) {
  return Response.json({
    error: 'PROJECT_LIMIT_REACHED',
    upgrade_url: '/pricing'
  }, { status: 403 });
}

// Queries: free=100/mo, pro=2000/mo, team=unlimited
// (already in Phase 4, now it's live with real Stripe data)

// Integrations: free=github only, pro=github+slack+jira
// Before connecting integration:
if (!canConnectIntegration(workspace, provider)) {
  return Response.json({
    error: 'INTEGRATION_NOT_AVAILABLE',
    upgrade_url: '/pricing'
  }, { status: 403 });
}

// Team members: free=1, pro=5, team=unlimited
// Before sending invite:
const memberCount = await getMemberCount(workspace_id);
if (!canAddMember(workspace, memberCount)) {
  return Response.json({
    error: 'MEMBER_LIMIT_REACHED',
    upgrade_url: '/pricing'
  }, { status: 403 });
}
```

### Step 6.4 — Billing Settings Page

`app/(dashboard)/settings/billing/page.tsx`:
```
CURRENT PLAN:
  Plan name (Free / Pro / Team)
  Status (Active / Past Due / Canceled)
  Next billing date (if paid plan)
  Amount

FREE PLAN:
  Usage summary:
    - X/1 projects used
    - X/100 queries used this month
    - X/1 integrations used
  
  [Upgrade to Pro — $19/month] (primary CTA)
  [See all features →] links to pricing

PRO/TEAM PLAN:
  [Manage Billing] → opens Stripe Customer Portal
  (Portal handles upgrade, downgrade, cancel, payment method)

BILLING HISTORY:
  List of past invoices (from Stripe API)
  Each: date | amount | status | [Download PDF]
```

### Step 6.5 — Upgrade Prompts (Throughout App)

Add contextual upgrade prompts at the right moments:

```typescript
// components/ui/UpgradePrompt.tsx
// A reusable banner/modal shown when hitting plan limits

// Usage:
// When project limit hit:
<UpgradePrompt
  reason="You've reached the 1-project limit on Free plan"
  feature="projects"
  cta="Upgrade to Pro for 5 projects"
/>

// When query limit hit:
<UpgradePrompt
  reason="You've used all 100 queries this month"
  feature="queries"
  cta="Upgrade to Pro for 2,000 queries"
/>
```

Place upgrade prompts:
- Usage meter in query page (when > 80% used)
- Project creation blocked state
- Integrations page (locked integrations)
- Team settings (when member limit hit)

---

## Phase 6 Completion Criteria

- [ ] Stripe Checkout opens correctly from Upgrade button
- [ ] Test card (4242...) completes purchase successfully
- [ ] Workspace plan updates to 'pro' in DB after successful payment
- [ ] Dashboard plan badge updates immediately after upgrade
- [ ] Customer portal opens from [Manage Billing]
- [ ] Can change payment method in portal
- [ ] Can cancel subscription in portal
- [ ] After cancel: plan remains active until period end
- [ ] After period end: plan reverts to 'free'
- [ ] Failed payment email sends
- [ ] Failed payment banner shows in dashboard
- [ ] Decline card (4000...0002) shows error message
- [ ] All plan limits enforced server-side (test each one)
- [ ] Upgrade prompts appear at right moments
- [ ] Upgrade prompt CTAs link to checkout
- [ ] Billing page shows correct plan info
- [ ] Invoice list populates (if paid)
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## Git Commit

```bash
git add .
git commit -m "feat: phase-6 complete — stripe payments and plan enforcement"
git push origin main
```

---

## ✅ PHASE 6 COMPLETE — TRIGGER QA

**Run Phase 6 QA from `testing/QA_PROTOCOL.md` → Section: "Phase 6 QA".**

---
---

# 🚀 Phase 7 — Pre-Launch & Launch

**Duration:** Week 13–14  
**Goal:** All legal pages live, analytics wired, SEO complete, production deploy, public launch

---

## What You'll Build

- ✅ All legal pages (Privacy, Terms, Cookies)
- ✅ Cookie consent banner
- ✅ PostHog + Sentry fully wired
- ✅ SEO meta tags, sitemap, robots.txt
- ✅ Google Search Console submitted
- ✅ Switched to Stripe Live Mode
- ✅ All env vars set in Vercel production
- ✅ Full end-to-end production test
- ✅ Product Hunt launch prepared
- ✅ Public launch

---

## Step-by-Step Instructions

### Step 7.1 — Legal Pages

Follow `docs/legal.md` completely:
- Create `/privacy`, `/terms`, `/cookies` pages
- Use brand-consistent styling (dark theme, same fonts)
- Add cookie consent banner (`components/ui/CookieBanner.tsx`)
- Link all legal pages in footer

### Step 7.2 — Analytics Wiring

Follow `docs/analytics.md` completely:
1. PostHog: init with cookie consent gate, track all events listed
2. Sentry: init on client and server, verify errors appear in dashboard
3. Vercel Analytics: add `<Analytics />` component

Test by signing up a new account and checking PostHog → Live Events stream.

### Step 7.3 — SEO

Follow `docs/analytics.md` → SEO Setup:
1. Add metadata export to `app/layout.tsx`
2. Create `app/sitemap.ts`
3. Create `public/robots.txt`
4. Create OG image (1200x630, brand-consistent)
5. Add favicon (16x16, 32x32, SVG)
6. Submit sitemap to Google Search Console
7. Submit sitemap to Bing Webmaster Tools

Check with: https://pagespeed.web.dev — aim for 90+ scores.

### Step 7.4 — Production Checks

```bash
# Run full production build locally
npm run build
npm run start

# Check for build errors, warnings
# Test auth, query, payment flows on production build
```

In Vercel:
- All env vars present (no NEXT_PUBLIC_ vars missing)
- Check Function logs for any errors
- Check health endpoint: GET /api/health

Switch Stripe to Live Mode:
1. Replace test keys with live keys in Vercel env vars
2. Re-run webhook setup with live webhook endpoint
3. Test with a real card (then refund)

### Step 7.5 — Pre-Launch Checklist

Run the full checklist from the SaaS Pre-Launch Checklist (provided in project brief):

**Legal & Compliance:**
- [ ] Privacy Policy live at /privacy
- [ ] Terms of Service live at /terms
- [ ] Cookie consent banner working
- [ ] GDPR-compliant (if targeting EU)

**Auth & Security:**
- [ ] Signup/login tested in production
- [ ] Email verification working in production
- [ ] Password reset working in production
- [ ] GitHub OAuth working in production
- [ ] Rate limiting active

**Payments:**
- [ ] Live Stripe keys in production
- [ ] Checkout flow tested with real card
- [ ] Subscription lifecycle tested:
  - [ ] Upgrade works
  - [ ] Downgrade works
  - [ ] Cancel works

**Analytics:**
- [ ] PostHog receiving events
- [ ] Sentry receiving errors (test by triggering one)
- [ ] Vercel Analytics active

**Marketing:**
- [ ] Google Search Console verified and sitemap submitted
- [ ] Bing Webmaster Tools set up
- [ ] OG image renders correctly (test on https://www.opengraph.xyz)
- [ ] Meta description under 160 chars
- [ ] Page title under 60 chars

**Feedback Loop:**
- [ ] Contact email hello@contextmesh.com set up and monitored
- [ ] Bug report link in app (footer or settings)
- [ ] In-app feedback button (bottom-right)

### Step 7.6 — Launch

**Product Hunt:**
1. Create maker account at producthunt.com
2. Schedule launch for Tuesday–Thursday (best days)
3. Prepare: tagline, description, 3 screenshots, demo GIF/video
4. Launch at midnight PST
5. Engage with every comment on launch day

**Launch Posts:**
```
Hacker News: "Show HN: ContextMesh – shared memory layer for AI-powered dev teams"
Reddit: r/SideProject, r/webdev, r/artificial, r/MachineLearning
IndieHackers: post in "What are you building?" thread
Twitter/X: thread with screenshots + demo video
LinkedIn: article about the problem you solved
```

**Discord/Slack Communities:**
- Developer Discord servers
- IndieHackers Slack
- AI builders communities

---

## Phase 7 Completion Criteria

- [ ] All legal pages live in production
- [ ] Cookie consent banner works
- [ ] PostHog events visible in dashboard (not localhost data)
- [ ] Sentry errors visible in dashboard
- [ ] Sitemap accessible at /sitemap.xml
- [ ] robots.txt accessible at /robots.txt
- [ ] Google Search Console verified
- [ ] OG image renders correctly on social previews
- [ ] PageSpeed score 85+ (mobile and desktop)
- [ ] All auth flows work in production
- [ ] All payment flows work with live Stripe keys
- [ ] Contact email receives messages
- [ ] No console errors on any page
- [ ] No broken links
- [ ] Product Hunt listing ready
- [ ] **LAUNCHED** 🚀

---

## Git Commit

```bash
git add .
git commit -m "feat: phase-7 complete — production ready, launched"
git push origin main
```

---

## ✅ PHASE 7 COMPLETE — TRIGGER FINAL QA

**Run Phase 7 QA from `testing/QA_PROTOCOL.md` → Section: "Phase 7 QA — Full Production Test".**

This is the final pre-launch test. A senior human software tester must pass every single check before the product goes public. No shortcuts.
