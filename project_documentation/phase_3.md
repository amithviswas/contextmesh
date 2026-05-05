# 🔌 Phase 3 — GitHub & Slack Integrations

**Duration:** Week 5–6  
**Goal:** Auto-ingest context from GitHub commits/PRs and Slack messages

---

## What You'll Build

By end of Phase 3:
- ✅ GitHub OAuth — connect user's repos
- ✅ GitHub webhook — auto-ingest commits + PRs as context
- ✅ Slack OAuth — connect workspace channels
- ✅ Slack webhook — auto-ingest filtered messages as context
- ✅ Integrations management page (connect/disconnect)
- ✅ Integration status indicators (active, error, last synced)
- ✅ Context items from GitHub/Slack appear in project context list

---

## Step-by-Step Instructions

### Step 3.1 — GitHub OAuth Setup

Follow `docs/integrations.md` → Section 1 exactly.

**Connect flow:**
`app/api/integrations/github/connect/route.ts`:
```typescript
// Redirect to GitHub OAuth with state = workspace_id
const state = Buffer.from(JSON.stringify({ workspace_id })).toString('base64');
const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
  `client_id=${process.env.GITHUB_CLIENT_ID}` +
  `&scope=repo,admin:repo_hook` +
  `&state=${state}`;

return Response.redirect(githubAuthUrl);
```

`app/api/integrations/github/callback/route.ts`:
```typescript
// 1. Verify state param
// 2. Exchange code for access token
// 3. Encrypt token and store in integrations table
// 4. Register webhooks on selected repos
// 5. Redirect to /integrations?connected=github
```

### Step 3.2 — GitHub Webhook Handler

`app/api/integrations/github/webhook/route.ts`:
```typescript
export async function POST(request: Request) {
  // 1. Verify X-Hub-Signature-256 header (see docs/integrations.md)
  // 2. Get X-GitHub-Event header
  // 3. Parse payload
  // 4. Route to handler based on event type

  const event = request.headers.get('X-GitHub-Event');
  const body = await request.text();

  if (!verifyGitHubWebhook(body, sig, secret)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);

  switch (event) {
    case 'push':
      await handlePushEvent(payload);
      break;
    case 'pull_request':
      await handlePullRequestEvent(payload);
      break;
    case 'pull_request_review':
      await handlePRReviewEvent(payload);
      break;
  }

  return Response.json({ received: true });
}

async function handlePushEvent(payload: any) {
  for (const commit of payload.commits) {
    await ingestContextItem({
      source: 'github',
      type: 'commit',
      title: commit.message.split('\n')[0],   // first line only
      content: [
        commit.message,
        `Author: ${commit.author.name}`,
        `Files changed: ${[...commit.added, ...commit.modified, ...commit.removed].join(', ')}`,
      ].join('\n'),
      metadata: {
        sha: commit.id,
        author: commit.author.name,
        timestamp: commit.timestamp,
        repo: payload.repository.full_name,
      }
    });
  }
}

async function handlePullRequestEvent(payload: any) {
  const pr = payload.pull_request;
  if (!['opened', 'closed', 'merged'].includes(payload.action)) return;

  await ingestContextItem({
    source: 'github',
    type: 'pr',
    title: `PR #${pr.number}: ${pr.title}`,
    content: pr.body || 'No description provided.',
    metadata: {
      number: pr.number,
      state: pr.state,
      merged: pr.merged,
      author: pr.user.login,
      repo: payload.repository.full_name,
    }
  });
}
```

### Step 3.3 — Slack OAuth Setup

Follow `docs/integrations.md` → Section 2 exactly.

**Connect flow:**
`app/api/integrations/slack/connect/route.ts`:
```typescript
const state = Buffer.from(JSON.stringify({ workspace_id })).toString('base64');
const slackAuthUrl = `https://slack.com/oauth/v2/authorize?` +
  `client_id=${process.env.SLACK_CLIENT_ID}` +
  `&scope=channels:history,channels:read,chat:write` +
  `&state=${state}`;

return Response.redirect(slackAuthUrl);
```

`app/api/integrations/slack/callback/route.ts`:
```typescript
// 1. Exchange code for bot token
// 2. Store encrypted token
// 3. List available channels → let user select which to monitor
// 4. Redirect to /integrations?connected=slack
```

### Step 3.4 — Slack Webhook Handler

`app/api/integrations/slack/webhook/route.ts`:
```typescript
export async function POST(request: Request) {
  const body = await request.text();
  const payload = JSON.parse(body);

  // Handle Slack's URL verification challenge
  if (payload.type === 'url_verification') {
    return Response.json({ challenge: payload.challenge });
  }

  // Verify Slack signature
  if (!verifySlackSignature(body, request.headers)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = payload.event;

  if (event?.type === 'message' && !event.bot_id) {
    // Apply message filtering (see docs/integrations.md)
    if (isContextWorthy(event)) {
      await ingestContextItem({
        source: 'slack',
        type: 'message',
        title: `Slack: ${event.text.substring(0, 80)}`,
        content: event.text,
        metadata: {
          channel: event.channel,
          user: event.user,
          timestamp: event.ts,
          thread_ts: event.thread_ts,
        }
      });
    }
  }

  return Response.json({ ok: true });
}
```

### Step 3.5 — Integrations Page

`app/(dashboard)/integrations/page.tsx`:
```
Page title: "Integrations"
Subtitle: "Connect your tools to automatically sync context"

Integration cards (one per provider):
  ┌─────────────────────────────────┐
  │ [GitHub icon]  GitHub           │
  │ Sync commits and pull requests  │
  │                                 │
  │ Status: ● Connected             │
  │ Last synced: 2 hours ago        │
  │ Items synced: 47                │
  │                                 │
  │ [Disconnect] [Settings]         │
  └─────────────────────────────────┘

  ┌─────────────────────────────────┐
  │ [Slack icon]  Slack             │
  │ Sync important team decisions   │
  │                                 │
  │ Status: ○ Not connected         │
  │                                 │
  │ [Connect Slack]                 │
  └─────────────────────────────────┘

  ┌─────────────────────────────────┐
  │ [Jira icon]  Jira               │
  │ Sync issues and sprint data     │
  │                                 │
  │ Status: 🔒 Pro plan required    │
  │                                 │
  │ [Upgrade to Pro]                │
  └─────────────────────────────────┘
```

`components/integrations/IntegrationCard.tsx`:
- Provider name + icon + description
- Status indicator (connected/disconnected/error)
- Last synced time
- Items synced count
- Connect/disconnect buttons
- Plan gate (blur + lock icon for unavailable integrations)

### Step 3.6 — Shared Ingestion Helper

```typescript
// lib/context/ingest.ts
export async function ingestContextItem({
  project_id,
  source,
  type,
  title,
  content,
  metadata,
}: IngestPayload) {
  const supabase = createServerClient();
  const embedding = await generateEmbedding(`${title}\n\n${content}`);

  const { data, error } = await supabase.from('context_items').insert({
    project_id,
    source,
    type,
    title,
    content,
    metadata,
    embedding,
    indexed_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Ingest error:', error);
    throw error;
  }

  return data;
}
```

**Note:** Webhooks need to know which `project_id` to ingest into. Store repo→project mapping when user connects integration:
```sql
-- Add to integrations table
config: {
  "github_repos": [
    { "repo_full_name": "user/repo", "project_id": "uuid" }
  ]
}
```

---

## Phase 3 Completion Criteria

- [ ] GitHub OAuth connect button works
- [ ] After GitHub connect, integration shows "Connected" status
- [ ] Push a real commit to test repo → context item appears in ContextMesh
- [ ] Open/merge a PR on test repo → context item appears in ContextMesh
- [ ] GitHub integration disconnect works
- [ ] Slack OAuth connect button works
- [ ] After Slack connect, integration shows "Connected" status
- [ ] Post a "decided:" message in connected Slack channel → context item appears
- [ ] Slack integration disconnect works
- [ ] Jira card shows "Pro plan required" with upgrade CTA
- [ ] Integration page shows status, last synced time, items synced count
- [ ] Webhook signature verification works (reject tampered payloads)
- [ ] Rate limiting on webhook endpoints
- [ ] Context items from GitHub have correct source badge in project view
- [ ] Context items from Slack have correct source badge
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## Git Commit

```bash
git add .
git commit -m "feat: phase-3 complete — github and slack integrations"
git push origin main
```

---

## ✅ PHASE 3 COMPLETE — TRIGGER QA

**Run Phase 3 QA from `testing/QA_PROTOCOL.md` → Section: "Phase 3 QA".**

A senior human software tester must verify every item before Phase 4 begins.
