# 👥 Phase 5 — Dashboard, Multi-User & Settings

**Duration:** Week 9–10  
**Goal:** Polished dashboard, team invites, workspace settings, full onboarding flow

---

## What You'll Build

By end of Phase 5:
- ✅ Polished dashboard with real metrics and charts
- ✅ Team invite system (invite by email)
- ✅ Workspace member management (view, remove members)
- ✅ Role system (owner, admin, member)
- ✅ User settings (name, avatar, email notifications)
- ✅ Workspace settings (name, plan display)
- ✅ Onboarding flow for new users (guided first steps)
- ✅ In-app notifications
- ✅ Landing page (public marketing page)
- ✅ Pricing page

---

## Step-by-Step Instructions

### Step 5.1 — Polished Dashboard

`app/(dashboard)/dashboard/page.tsx` — full rebuild:

```
TOP STATS ROW (4 cards):
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │ Context Items│ │ AI Queries   │ │ Integrations │ │ Team Members │
  │     247      │ │   67 / 100   │ │      2       │ │      3       │
  │  +12 today   │ │  this month  │ │   connected  │ │              │
  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

MIDDLE ROW (two columns):
  LEFT: Context Activity (last 14 days)
    → Simple bar chart using a lightweight chart lib or pure CSS bars
    → X axis: dates, Y axis: items added per day
    → Color by source (GitHub teal, Slack yellow, Manual blue)
  
  RIGHT: Top Sources
    → Horizontal bar chart
    → GitHub: 180 items (73%)
    → Slack: 47 items (19%)
    → Manual: 20 items (8%)

BOTTOM ROW: Recent Activity Feed
  Full-width timeline of recent context additions + queries
  Each item:
    Left: source icon in colored circle
    Middle: action description + project name
    Right: relative timestamp
  
  Show 20 items, [Load more] button
```

### Step 5.2 — Team Invites

**DB addition:**
```sql
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Invite API:**
`app/api/team/invite/route.ts`:
```typescript
// POST { email, role }
// 1. Check user is owner or admin
// 2. Check plan limits (free: 1 member, pro: 5, team: unlimited)
// 3. Create invite record
// 4. Send invite email via Resend:
//    Subject: "You've been invited to [Workspace] on ContextMesh"
//    Body: Link to /invite/[token]
// 5. Return invite record
```

`app/invite/[token]/page.tsx`:
```typescript
// Public page (no auth required)
// 1. Look up invite by token
// 2. If expired: show "This invite has expired"
// 3. If user not logged in: show signup/login form
// 4. If logged in: show "Join [Workspace]" button
// 5. On accept: add to memberships, mark invite accepted, redirect to dashboard
```

### Step 5.3 — Team Settings Page

`app/(dashboard)/settings/team/page.tsx`:
```
MEMBERS TABLE:
  Columns: Avatar | Name/Email | Role | Joined | Actions
  
  Each row:
    Owner badge (cannot be removed)
    Role selector (admin can change roles)
    [Remove] button (owner/admin only, not self)

INVITE SECTION:
  Email input + Role selector + [Send Invite] button
  
  Pending invites list:
    Email | Role | Expires | [Revoke]

PLAN LIMIT NOTICE (Free plan):
  "Free plan allows 1 member. Upgrade to Pro for 5 members."
```

### Step 5.4 — User & Workspace Settings

`app/(dashboard)/settings/page.tsx` — tabs:

**Profile tab:**
- Display name input
- Email (readonly, from Supabase)
- Avatar upload (Supabase Storage)
- [Save Changes] button

**Workspace tab (owner/admin only):**
- Workspace name input
- Workspace slug (readonly)
- Current plan + [Manage Billing] button (placeholder for Phase 6)
- [Save Changes] button

**Notifications tab:**
- Toggle: "Email when new team member joins"
- Toggle: "Email when integration disconnects"
- Toggle: "Email when query limit is 80% used"
- [Save Preferences] button

**Danger Zone tab (owner only):**
- [Delete Workspace] button (red, requires typing workspace name to confirm)
- Deletes all data (RLS cascade handles DB cleanup)

### Step 5.5 — Onboarding Flow

For new users (first login), show a guided checklist:

`components/onboarding/OnboardingChecklist.tsx`:
```
Shown on dashboard until all steps complete:

✅ Create account          [Done]
□  Create first project    [Create Project →]
□  Add context             [Add Context →]
□  Connect GitHub          [Connect →]
□  Make first AI query     [Try Query →]

Progress: 1/5 steps complete
[Dismiss] (only after 3+ steps done)
```

Track completion in Supabase:
```sql
ALTER TABLE memberships ADD COLUMN onboarding_completed_steps TEXT[] DEFAULT '{}';
```

Mark each step complete via PostHog event + DB update.

### Step 5.6 — Landing Page

`app/(marketing)/page.tsx` — public homepage:

```
HERO SECTION:
  Background: radial teal glow from top center + noise texture
  Headline: "Shared memory for AI-powered teams" (Syne 800, large)
  Subhead: "Stop repeating context to every AI. ContextMesh remembers your codebase, decisions, and architecture — queryable in seconds."
  CTA buttons: [Start Free] [See How It Works →]
  
  Hero visual: animated terminal/chat showing a query being answered with sources

SOCIAL PROOF:
  "Trusted by developers at..." (can be fake for launch — or use your own)

HOW IT WORKS (3 steps):
  1. Connect your tools (GitHub, Slack icons)
  2. Context syncs automatically
  3. Ask anything, get grounded answers

FEATURES SECTION (alternating layout, not card grid):
  - Semantic search over all your context
  - AI answers with source citations
  - Multiplayer — whole team shares the same context
  - Works with any AI agent via API

PRICING PREVIEW:
  Link to /pricing

FOOTER:
  Logo | Links: Pricing, Docs, Privacy, Terms | Copyright
```

### Step 5.7 — Pricing Page

`app/(marketing)/pricing/page.tsx`:
```
Three-column pricing table:
  Free | Pro ($19/mo) | Team ($49/mo)

Feature comparison table below plans.

FAQ section (5-6 questions).

CTA at bottom: "Start for free. Upgrade when you're ready."
```

---

## Phase 5 Completion Criteria

- [ ] Dashboard shows real metrics (not placeholder numbers)
- [ ] Activity chart shows last 14 days of context additions
- [ ] Top sources chart shows correct breakdown
- [ ] Activity feed shows real items
- [ ] Team invite email sends successfully
- [ ] Invite link works (can join workspace via link)
- [ ] Invited user appears in members list
- [ ] Role selector works (admin can change member roles)
- [ ] Remove member works (with confirmation)
- [ ] Profile settings save (name, avatar)
- [ ] Workspace name updates
- [ ] Notification preferences save
- [ ] Delete workspace works (cascades correctly, user logged out)
- [ ] Onboarding checklist shows for new users
- [ ] Onboarding steps mark complete correctly
- [ ] Onboarding can be dismissed after 3+ steps
- [ ] Landing page loads and looks on-brand
- [ ] Landing page hero CTA links to signup
- [ ] Pricing page shows three plans correctly
- [ ] Pricing page [Start Free] → signup, [Get Pro] → signup (Stripe comes Phase 6)
- [ ] All legal links in footer work (Privacy, Terms)
- [ ] Mobile responsive across all new pages
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## Git Commit

```bash
git add .
git commit -m "feat: phase-5 complete — dashboard polish, team, settings, landing page"
git push origin main
```

---

## ✅ PHASE 5 COMPLETE — TRIGGER QA

**Run Phase 5 QA from `testing/QA_PROTOCOL.md` → Section: "Phase 5 QA".**

A senior human software tester must verify every item before Phase 6 begins.
