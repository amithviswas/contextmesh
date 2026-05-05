# 🧪 ContextMesh — QA Protocol

> **To the tester:** You are a senior human software QA engineer with 10+ years of experience. You test like a real user who is trying to break things, not like someone checking boxes. Every test must be performed manually in a real browser. No skipping. No "looks fine." If something feels off, it's a bug — log it and block the phase from closing until it's fixed.

---

## Testing Environment Setup

Before each phase QA:
```
Browser 1: Chrome (latest) — primary test browser
Browser 2: Firefox (latest) — secondary
Browser 3: Safari (if on Mac) or Edge
Mobile: Chrome on Android OR Safari on iPhone (use DevTools device simulation if no device)

Test accounts to create fresh each phase:
  Owner account:  qaowner@test.com
  Member account: qamember@test.com
  New user:       qanewuser@test.com

Clear cookies/localStorage before each full test run.
Use incognito window for fresh session tests.
```

---

## Phase 1 QA — Foundation & Auth

### 1.1 — Signup Flow

**Test: Email Signup**
```
1. Open app in incognito window
2. Navigate to /signup
3. Enter email: qatest+1@mailinator.com, password: Test@12345
4. Click Sign Up
EXPECT: "Check your email" message shown — NOT redirected to dashboard yet
5. Open Mailinator, find verification email
EXPECT: Email arrives within 60 seconds
6. Click verification link in email
EXPECT: Redirected to /dashboard
EXPECT: No error messages
EXPECT: User is logged in (avatar/email visible in sidebar)
```

**Test: Duplicate Email**
```
1. Try signing up with same email again
EXPECT: Error message "Email already in use" (not a blank error or crash)
```

**Test: Weak Password**
```
1. Try signing up with password: "123"
EXPECT: Validation error shown before form submits
```

**Test: Invalid Email**
```
1. Try signing up with "notanemail"
EXPECT: Validation error shown before form submits
```

**Test: GitHub OAuth Signup**
```
1. Open incognito window → /signup
2. Click "Continue with GitHub"
EXPECT: Redirected to GitHub's authorization page
3. Authorize the app
EXPECT: Redirected back to /dashboard (NOT /login)
EXPECT: User logged in, email from GitHub shown in sidebar
EXPECT: No double-redirect or flash of login page
```

---

### 1.2 — Login Flow

**Test: Correct Credentials**
```
1. Incognito → /login
2. Enter valid email + password
3. Click Login
EXPECT: Redirected to /dashboard within 2 seconds
EXPECT: No page flicker or flash of /login again
```

**Test: Wrong Password**
```
1. Enter correct email, wrong password
EXPECT: "Invalid credentials" error — NOT a blank page or crash
EXPECT: Form stays filled (email retained, password cleared)
```

**Test: Non-Existent Email**
```
1. Enter email that doesn't exist
EXPECT: Error message (do NOT reveal if email exists or not — security)
```

**Test: Already Logged In**
```
1. While logged in, navigate to /login
EXPECT: Immediately redirected to /dashboard (not shown login page)
```

---

### 1.3 — Route Protection

**Test: Protected Routes Without Auth**
```
1. Incognito window (no session)
2. Try navigating directly to: /dashboard, /projects, /query, /integrations, /settings
EXPECT: ALL redirect to /login — none show dashboard content
3. After redirect, check URL includes redirect param or just goes to /login
```

**Test: Auth Pages With Active Session**
```
1. While logged in
2. Navigate to /login, /signup
EXPECT: Both redirect to /dashboard
```

---

### 1.4 — Password Reset

**Test: Full Reset Flow**
```
1. /login → "Forgot password?"
2. Enter registered email
EXPECT: "Reset email sent" message
3. Check email — reset link arrives within 60 seconds
4. Click reset link
EXPECT: Redirected to /reset-password (not /login or /dashboard)
5. Enter new password: NewPass@9999
6. Submit
EXPECT: Success message + redirect to /login
7. Login with NEW password
EXPECT: Login succeeds
8. Try login with OLD password
EXPECT: Login fails
```

---

### 1.5 — Logout

**Test: Logout**
```
1. While logged in, click logout (sidebar bottom)
EXPECT: Session cleared
EXPECT: Redirected to /login or /
2. Click browser back button
EXPECT: NOT taken back to dashboard — still on /login
3. Refresh page
EXPECT: Still on /login
```

---

### 1.6 — Workspace Creation

**Test: Workspace Auto-Created**
```
1. After fresh signup/first login
2. Check Supabase dashboard → workspaces table
EXPECT: 1 workspace exists for the new user
3. Check memberships table
EXPECT: 1 membership with role='owner' for that user
```

---

### 1.7 — Design & Responsiveness

**Test: Brand Compliance**
```
1. On every auth page and dashboard:
EXPECT: Background is dark (#0A0A0F range) — not white or gray
EXPECT: Accent color is teal (#00D4B4) — not purple, not blue
EXPECT: Headings use Syne font (check in browser DevTools → Computed → font-family)
EXPECT: Body text uses Inter
EXPECT: No purple-to-pink gradients anywhere
EXPECT: No generic card-grid-only layouts
```

**Test: Mobile Responsiveness**
```
1. Set browser to 375px width (iPhone SE)
2. Navigate through all Phase 1 pages
EXPECT: No horizontal scroll
EXPECT: All buttons tappable (min 44px height)
EXPECT: Text readable (no overflow or cut-off)
EXPECT: Sidebar collapsed or replaced with mobile nav
```

**Test: Keyboard Navigation**
```
1. On signup/login forms
2. Tab through fields
EXPECT: Focus indicators visible on all inputs and buttons
3. Submit form with Enter key
EXPECT: Form submits correctly
```

---

### 1.8 — Performance

**Test: Page Load Speed**
```
1. Open Chrome DevTools → Network tab → disable cache
2. Load /login, /signup, /dashboard
EXPECT: First Contentful Paint < 2 seconds on each
EXPECT: No 500 or 404 errors in Network tab
EXPECT: No failed resource loads
```

---

### Phase 1 QA PASS criteria:
All tests above must PASS with zero blocking bugs before Phase 2 begins.
Log any UI/UX issues as non-blocking but fix before Phase 7.

---

## Phase 2 QA — Context Engine

### 2.1 — Projects

**Test: Create Project**
```
1. Login → /projects
2. Click "New Project"
EXPECT: Modal opens (not full page redirect)
3. Submit with empty name
EXPECT: Validation error shown
4. Enter name: "Test Project Alpha", description: "QA test project"
5. Submit
EXPECT: Modal closes
EXPECT: Project appears in list immediately (no full page reload needed)
EXPECT: Project card shows name, description, "0 context items"
```

**Test: Project Persistence**
```
1. After creating project, refresh page
EXPECT: Project still exists
2. Navigate away and back
EXPECT: Project still visible
```

**Test: Free Plan Limit**
```
1. Create 1 project (free plan limit)
2. Try creating a second project
EXPECT: Upgrade prompt shown — not a crash or blank modal
EXPECT: Prompt explains the limit clearly
EXPECT: [Upgrade] CTA visible
```

**Test: Delete Project**
```
1. Click delete on a project
EXPECT: Confirmation dialog — NOT immediate deletion
2. Cancel confirmation
EXPECT: Project NOT deleted
3. Confirm deletion
EXPECT: Project removed from list
EXPECT: All context items for that project also deleted (check Supabase)
```

---

### 2.2 — Manual Context Ingestion

**Test: Add Context Item**
```
1. Open a project
2. Click "Add Context"
EXPECT: Modal opens
3. Select type: "Decision"
4. Title: "Use pgvector for embeddings"
5. Content: "After evaluating Pinecone and Weaviate, decided on pgvector as it runs inside Supabase at no extra cost. Trade-off: slightly slower at scale but acceptable for our user count."
6. Submit
EXPECT: Item appears in context list
EXPECT: Source badge: "Manual"
EXPECT: Type badge: "Decision"
```

**Test: Embedding Generated**
```
1. After adding context item
2. Check Supabase → context_items table
EXPECT: embedding column is NOT null (it's a vector, not empty)
EXPECT: indexed_at column has a timestamp
```

**Test: Long Content**
```
1. Add context item with 2000+ character content
EXPECT: Saves successfully
EXPECT: List view shows truncated preview (not full content)
EXPECT: Detail view shows full content
```

**Test: Special Characters**
```
1. Add context with: title containing quotes, apostrophes, <script>tags</script>
EXPECT: Saves correctly
EXPECT: Displays correctly (no XSS — script tag should render as text, not execute)
```

---

### 2.3 — Context List & Filters

**Test: Source Filter**
```
1. Add items with different types: Decision, Architecture Note, Blocker
2. Click filter: "Decision"
EXPECT: Only Decision items shown
3. Click "All"
EXPECT: All items shown
```

**Test: Context Item Detail**
```
1. Click on a context item
EXPECT: Full content displayed
EXPECT: Metadata visible (source, type, timestamp)
2. Click delete
EXPECT: Confirmation required
3. Confirm
EXPECT: Item removed, redirected back to list
```

---

### 2.4 — Dashboard Stats

**Test: Stats Accuracy**
```
1. Note stats before adding items: X items, Y queries, Z integrations
2. Add 3 context items
3. Return to dashboard
EXPECT: Context items count = X + 3
EXPECT: Recent activity shows the 3 new items at top
```

---

### Phase 2 QA PASS criteria: All tests above pass.

---

## Phase 3 QA — Integrations

### 3.1 — GitHub Integration

**Test: Connect GitHub**
```
1. /integrations → GitHub card → "Connect GitHub"
EXPECT: Redirected to GitHub authorization page (github.com domain)
2. Authorize the app
EXPECT: Redirected back to /integrations (not /dashboard or /login)
EXPECT: GitHub card now shows "Connected" status with green indicator
EXPECT: "Last synced" and "Items synced" visible
```

**Test: Webhook — Push Event**
```
1. On a connected test repo, make a commit and push
EXPECT: Within 30 seconds, new context item appears in the project
EXPECT: Source: "github", Type: "commit"
EXPECT: Title is the first line of commit message
EXPECT: Content includes files changed
```

**Test: Webhook — Pull Request**
```
1. Open a PR on test repo
EXPECT: Context item created with type "pr"
2. Merge the PR
EXPECT: Second context item or update showing merged status
```

**Test: Webhook Security**
```
1. Send a POST to /api/integrations/github/webhook with wrong signature
EXPECT: 401 response
EXPECT: No context item created
```

**Test: Disconnect GitHub**
```
1. Disconnect GitHub integration
EXPECT: Card shows "Not connected"
EXPECT: Webhook stops working (push new commit — no new context item)
EXPECT: Old context items remain (not deleted)
```

---

### 3.2 — Slack Integration

**Test: Connect Slack**
```
1. /integrations → Slack card → "Connect Slack"
EXPECT: Redirected to Slack authorization (slack.com domain)
2. Authorize
EXPECT: Back at /integrations, Slack shows "Connected"
```

**Test: Message Filtering**
```
1. Post a generic message in connected channel: "Hey everyone"
EXPECT: No context item created (filtered out)
2. Post: "Decided: we'll use Redis for caching"
EXPECT: Context item created with source "slack"
3. Post: "blocker: API rate limits are causing failures"
EXPECT: Context item created
```

**Test: Plan Gate (Jira)**
```
1. On Free plan, view Jira integration card
EXPECT: "Pro plan required" shown
EXPECT: Lock icon visible
EXPECT: Connect button disabled or replaced with Upgrade CTA
EXPECT: Clicking it prompts upgrade, not an error
```

---

### Phase 3 QA PASS criteria: All tests above pass.

---

## Phase 4 QA — AI Query Interface

### 4.1 — Basic Query

**Test: Ask a Question**
```
1. /query → select a project with context items
2. Type: "What has been decided about the database?"
3. Submit (button or Ctrl+Enter)
EXPECT: Loading state visible immediately
EXPECT: Answer starts streaming in within 3 seconds (not all at once)
EXPECT: Answer references actual content from context items
EXPECT: Sources section appears below answer
EXPECT: Source cards show which items were used
```

**Test: Answer Quality**
```
1. Add context: "Decided to use Supabase PostgreSQL for all data storage."
2. Query: "What database are we using?"
EXPECT: Answer mentions Supabase/PostgreSQL specifically
EXPECT: Answer does NOT hallucinate (does not mention MongoDB, MySQL unless they're in context)
```

**Test: No Context**
```
1. Create a fresh project with zero context items
2. Query: "What is the current sprint status?"
EXPECT: Graceful "no context" message — not an error, not a hallucination
EXPECT: Suggestion to add context or connect integrations
```

**Test: Sources Relevance**
```
1. Query something specific
2. Check sources displayed below answer
EXPECT: Sources are actually relevant to the question
EXPECT: Similarity indicators (dots/bar) visible
```

---

### 4.2 — Usage & Limits

**Test: Usage Counter**
```
1. Check usage meter before querying: shows X/100
2. Make a query
3. Usage meter updates to X+1/100
EXPECT: Updates without page refresh
```

**Test: Query Limit**
```
(Simulate reaching limit by updating queries count in DB or lowering limit temporarily)
1. Make query when at limit
EXPECT: Error message shown (not a crash)
EXPECT: Upgrade CTA visible with link to /pricing
EXPECT: No partial answer shown
```

**Test: Query History**
```
1. Make 3 queries
2. Check "Recent queries" list
EXPECT: Last 3 queries shown
3. Click a recent query
EXPECT: Answer loads (from cache in DB, not re-queried)
```

---

### 4.3 — Streaming

**Test: Streaming Works**
```
1. Make a query, watch answer appear
EXPECT: Text appears incrementally (word by word or chunk by chunk)
EXPECT: NOT a long pause then all text at once
EXPECT: Cursor/loading indicator visible during streaming
2. The stream completes cleanly
EXPECT: No error at end
EXPECT: Sources appear after stream completes
```

**Test: Long Answer**
```
1. Ask a broad question with lots of context
EXPECT: Long answer streams correctly
EXPECT: Page doesn't freeze or crash
EXPECT: Scroll works during streaming
```

---

### 4.4 — Markdown Rendering

**Test: Markdown in Answers**
```
1. Check if Claude returns markdown (bold, lists, code blocks)
EXPECT: Bold text renders as bold (not **bold**)
EXPECT: Code blocks render with monospace font and dark background
EXPECT: Lists render as bullets or numbers (not "- item")
```

---

### Phase 4 QA PASS criteria: All tests above pass.

---

## Phase 5 QA — Dashboard, Team, Settings

### 5.1 — Dashboard Metrics

**Test: Stats Accuracy**
```
1. Note exact counts in Supabase
2. Compare to dashboard display
EXPECT: Exact match (not approximate)
3. Add items, refresh dashboard
EXPECT: Counts update correctly
```

**Test: Activity Chart**
```
1. View last-14-days chart
EXPECT: Today's additions visible
EXPECT: Chart doesn't show future dates
EXPECT: Empty days show 0 (bar present but at 0 height), not gaps
```

---

### 5.2 — Team Invites

**Test: Send Invite**
```
1. Settings → Team → Enter email of qamember@test.com → Send
EXPECT: "Invite sent" confirmation
EXPECT: Invite appears in "Pending invites" list
EXPECT: Email arrives at qamember@test.com within 60 seconds
```

**Test: Accept Invite**
```
1. Open invite email as qamember
2. Click invite link
EXPECT: If not logged in: prompted to login/signup
3. Login as qamember
EXPECT: Join workspace prompt shown
4. Click accept
EXPECT: Redirected to dashboard of that workspace
EXPECT: qamember now appears in team members list
```

**Test: Duplicate Invite**
```
1. Send another invite to same email
EXPECT: Error "User already invited" or "Already a member"
```

**Test: Expired Invite**
```
1. Manually set invite expires_at to past in Supabase
2. Click invite link
EXPECT: "Invite expired" message — not a crash
```

**Test: Remove Member**
```
1. As owner, click remove on a member
EXPECT: Confirmation dialog
2. Confirm
EXPECT: Member removed from list
EXPECT: That member loses access to workspace (test by logging in as them)
```

**Test: Free Plan Team Limit**
```
1. On free plan (1 member limit)
2. Try inviting a second member
EXPECT: Upgrade prompt shown
EXPECT: Invite NOT sent
```

---

### 5.3 — Settings

**Test: Profile Save**
```
1. Settings → Profile → Change display name to "QA Tester"
2. Save
3. Refresh page
EXPECT: Name still shows "QA Tester" (persisted)
EXPECT: Name visible in sidebar
```

**Test: Workspace Rename**
```
1. Settings → Workspace → Change name
2. Save → refresh
EXPECT: New name persisted and shown in sidebar workspace selector
```

**Test: Delete Workspace**
```
1. Create a test workspace with a project and context items
2. Settings → Danger Zone → Delete Workspace
3. Type workspace name to confirm
4. Confirm deletion
EXPECT: All data deleted (check Supabase — workspace, projects, context_items all gone)
EXPECT: User logged out or redirected to "no workspace" state
EXPECT: Cannot recover the workspace
```

---

### 5.4 — Landing Page

**Test: Landing Page**
```
1. Visit / while logged out
EXPECT: Landing page shown (not dashboard, not login)
EXPECT: Hero headline visible and readable
EXPECT: CTA buttons work (/signup)
EXPECT: Pricing link works
EXPECT: Footer links work (Privacy, Terms)
EXPECT: Page looks professional on mobile
```

**Test: Pricing Page**
```
1. Visit /pricing
EXPECT: Three plans shown: Free, Pro, Team
EXPECT: Prices clearly shown
EXPECT: Feature comparison readable
EXPECT: [Start Free] → /signup
EXPECT: [Get Pro] → /signup (Stripe not live yet in Phase 5)
```

---

### Phase 5 QA PASS criteria: All tests above pass.

---

## Phase 6 QA — Payments

### 6.1 — Checkout

**Test: Upgrade Flow**
```
1. Login as Free user
2. Click any upgrade CTA
EXPECT: Redirected to Stripe Checkout (stripe.com domain)
EXPECT: Plan name visible in Stripe
3. Enter test card: 4242 4242 4242 4242, exp 12/34, CVC 123
4. Complete payment
EXPECT: Redirected to /dashboard?upgraded=true
EXPECT: Success message shown in dashboard
EXPECT: Plan badge in UI updates to "Pro" immediately
EXPECT: In Supabase, workspace.plan = 'pro'
```

**Test: Payment Failure**
```
1. Try checkout with decline card: 4000 0000 0000 0002
EXPECT: Stripe shows payment failed
EXPECT: NOT redirected to /dashboard
EXPECT: workspace.plan remains 'free'
```

**Test: Auth Required Card**
```
1. Use card: 4000 0025 0000 3155
EXPECT: 3D Secure challenge shown
2. Complete challenge
EXPECT: Payment succeeds
```

---

### 6.2 — Customer Portal

**Test: Access Portal**
```
1. As Pro user → Settings → Billing → "Manage Billing"
EXPECT: Redirected to Stripe Customer Portal
EXPECT: Shows current subscription info
EXPECT: Can update payment method
EXPECT: Can cancel subscription
```

**Test: Cancel Subscription**
```
1. Cancel subscription via portal
EXPECT: Portal confirms cancellation
EXPECT: Returns to app
EXPECT: Plan still shows "Pro" (active until period end)
EXPECT: "Cancels on [date]" message visible
```

**Test: Plan Downgrade After Cancel**
```
1. After cancellation period ends (set date manually in Stripe test)
2. Stripe sends customer.subscription.deleted
EXPECT: workspace.plan updates to 'free'
EXPECT: User can no longer create more than 1 project
EXPECT: User can no longer access Pro features
```

---

### 6.3 — Plan Enforcement (Server-Side)

**Test: Projects Limit (Free)**
```
1. Free plan user has 1 project
2. Attempt to create second project via UI
EXPECT: Upgrade prompt
3. Attempt via direct API call (curl/Postman): POST /api/projects
EXPECT: 403 response with PROJECT_LIMIT_REACHED
EXPECT: Second project NOT created in DB
```

**Test: Integration Gate (Free)**
```
1. Free plan user
2. Attempt to connect Slack (API call)
EXPECT: 403 response
EXPECT: Integration NOT stored in DB
```

**Test: Query Limit (Free)**
```
1. Set queries this month to 100 in DB
2. Make another query
EXPECT: QUERY_LIMIT_REACHED error in UI
EXPECT: Upgrade prompt shown
3. Via API call
EXPECT: 429 response
```

---

### 6.4 — Billing Page

**Test: Free Plan View**
```
1. Settings → Billing as Free user
EXPECT: "Free Plan" shown
EXPECT: Usage summary visible (projects used, queries used)
EXPECT: Upgrade CTA visible
```

**Test: Pro Plan View**
```
1. Settings → Billing as Pro user
EXPECT: "Pro Plan" shown
EXPECT: Next billing date shown
EXPECT: "Manage Billing" button works
EXPECT: Invoice history visible (at least 1 invoice after test payment)
```

---

### Phase 6 QA PASS criteria: All tests above pass.

---

## Phase 7 QA — Full Production Test

> This is the final pre-launch test. All tests run against PRODUCTION environment (contextmesh.vercel.app), not localhost.

### 7.1 — Full End-to-End Flow (Happy Path)

```
Run this entire flow without stopping:

1. Visit https://contextmesh.vercel.app in fresh incognito window
EXPECT: Landing page loads in < 3 seconds
EXPECT: No console errors (F12 → Console)

2. Click [Start Free] → signup with real email
EXPECT: Verification email arrives within 60 seconds

3. Verify email → arrive at dashboard
EXPECT: Onboarding checklist visible
EXPECT: Dashboard loads with 0 stats

4. Create project: "My First Project"
EXPECT: Project created, navigate to it

5. Add manual context item: 
   Type: Decision
   Title: "Use TypeScript for type safety"
   Content: "Team decided to use TypeScript strictly with no-any rule"
EXPECT: Item saved, appears in list

6. Go to /query → select project → ask:
   "What was decided about TypeScript?"
EXPECT: Answer mentions TypeScript/type safety
EXPECT: Answer streams in
EXPECT: Source card shows the decision we added

7. Go to /integrations → connect GitHub
EXPECT: OAuth flow works in production
EXPECT: Redirected back correctly

8. Push a commit to test repo
EXPECT: Context item appears within 60 seconds

9. Settings → Team → Send invite to second email
EXPECT: Invite email arrives in production

10. Accept invite from second email
EXPECT: Second user joins workspace

11. Go to /pricing → click "Get Pro"
EXPECT: Stripe Checkout opens (not test mode — live mode)
EXPECT: Real card charged

12. Go to /settings/billing
EXPECT: Pro plan shown with correct billing info

13. Navigate all pages: /, /pricing, /privacy, /terms, /cookies
EXPECT: All load without errors
EXPECT: Footer links all work

14. Logout → clear cookies → confirm no session persists
```

---

### 7.2 — Legal & Compliance

```
- [ ] /privacy loads, content complete, last updated date present
- [ ] /terms loads, content complete
- [ ] /cookies loads, content complete
- [ ] Cookie consent banner appears on first visit (incognito)
- [ ] Declining cookies: PostHog does NOT fire (check Network tab — no posthog requests)
- [ ] Accepting cookies: PostHog fires correctly
- [ ] All legal pages linked in footer
- [ ] Privacy Policy linked on signup page
```

---

### 7.3 — SEO & Performance

```
Run: https://pagespeed.web.dev on https://contextmesh.vercel.app
EXPECT: Performance score ≥ 85 (mobile)
EXPECT: Performance score ≥ 90 (desktop)
EXPECT: No critical accessibility issues
EXPECT: SEO score ≥ 90

Check OG image: https://www.opengraph.xyz → enter URL
EXPECT: Preview image renders correctly
EXPECT: Title and description correct

Check sitemap: https://contextmesh.vercel.app/sitemap.xml
EXPECT: XML loads, all URLs listed

Check robots.txt: https://contextmesh.vercel.app/robots.txt
EXPECT: Loads, contains correct rules
```

---

### 7.4 — Security

```
- [ ] /dashboard not accessible without auth (test with curl, no cookies)
- [ ] API routes return 401 without auth header
- [ ] Webhook endpoints reject invalid signatures
- [ ] No sensitive data in page source (no API keys, no service role key)
- [ ] No error stack traces visible to users in production
- [ ] HTTPS everywhere (no HTTP resources)
- [ ] No mixed content warnings
```

---

### 7.5 — Cross-Browser

```
Test full happy path in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)
- [ ] Edge (latest)
- [ ] Mobile Chrome (375px)
- [ ] Mobile Safari (375px)
```

---

### 7.6 — Monitoring Verification

```
- [ ] Trigger a test error → appears in Sentry within 2 minutes
- [ ] Sign up a test account → PostHog shows 'signed_up' event
- [ ] Make a query → PostHog shows 'context_queried' event
- [ ] Vercel Analytics dashboard showing page views
- [ ] /api/health returns 200 with { status: 'ok' }
```

---

### Phase 7 QA PASS criteria:
Every single checkbox above must be checked. Any failing item is a launch blocker. Fix and re-test before going live.

---

## Bug Logging Template

When you find a bug, log it with this format:

```
BUG-[number]: [Short title]
Phase: [1-7]
Severity: BLOCKER | HIGH | MEDIUM | LOW
Steps to reproduce:
  1.
  2.
  3.
Expected: 
Actual: 
Screenshot/video: [attach]
Browser/device: 
```

**Severity definitions:**
- **BLOCKER:** Prevents core user flow. Must fix before phase closes.
- **HIGH:** Major feature broken. Fix before next phase.
- **MEDIUM:** Degraded experience but workaround exists. Fix before launch.
- **LOW:** Minor visual/UX issue. Fix if time allows.
