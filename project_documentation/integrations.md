# 🔌 ContextMesh — Integrations Guide

> Step-by-step setup for every external integration. All free to set up.

---

## 1. GitHub Integration

### What It Does
- Listens to new commits, pull requests, comments, and issue updates via webhook
- Extracts meaningful context: what changed, why, who reviewed, what was merged
- Stores as searchable context items with embeddings

### Setup Steps

#### A. Create GitHub OAuth App (for user auth + repo access)
1. Go to GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App
2. Fill in:
   ```
   Application name: ContextMesh
   Homepage URL: https://contextmesh.vercel.app
   Authorization callback URL: https://contextmesh.vercel.app/api/integrations/github/callback
   ```
3. Copy `Client ID` and `Client Secret` → add to `.env`:
   ```env
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

#### B. Webhook Setup (per repository)
When user connects a repo:
1. Use GitHub API to register webhook:
   ```
   POST /repos/{owner}/{repo}/hooks
   {
     "name": "web",
     "active": true,
     "events": ["push", "pull_request", "pull_request_review", "issues"],
     "config": {
       "url": "https://contextmesh.vercel.app/api/integrations/github/webhook",
       "content_type": "json",
       "secret": "GITHUB_WEBHOOK_SECRET"
     }
   }
   ```
2. Store webhook secret in Supabase integrations table (encrypted)

#### C. What to Extract from Each Event
```typescript
// push event → extract commits
{
  type: 'commit',
  title: commit.message (first line only),
  content: `${commit.message}\n\nFiles changed: ${commit.added.join(', ')}`,
  metadata: { sha, author, timestamp, files_changed }
}

// pull_request event → extract PR context
{
  type: 'pr',
  title: pr.title,
  content: pr.body,
  metadata: { number, state, author, reviewers, merged_at }
}
```

#### D. Environment Variables
```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=     # generate with: openssl rand -hex 32
```

---

## 2. Slack Integration

### What It Does
- Listens to messages in selected channels
- Extracts decisions, blockers, and important context from team conversations
- Uses AI to filter noise (not every message is context — only meaningful ones)

### Setup Steps

#### A. Create Slack App
1. Go to https://api.slack.com/apps → Create New App → From Scratch
2. Name: `ContextMesh`, choose your workspace
3. Go to **OAuth & Permissions** → Add Bot Token Scopes:
   ```
   channels:history
   channels:read
   chat:write
   commands
   incoming-webhook
   users:read
   ```
4. Go to **Event Subscriptions** → Enable → Request URL:
   ```
   https://contextmesh.vercel.app/api/integrations/slack/webhook
   ```
5. Subscribe to bot events:
   ```
   message.channels
   ```
6. Install app to workspace → copy `Bot User OAuth Token`

#### B. Environment Variables
```env
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
```

#### C. Message Filtering Logic
Not every Slack message is useful. Filter with this logic:
```typescript
function isContextWorthy(message: SlackMessage): boolean {
  const signals = [
    message.reactions?.some(r => ['white_check_mark', 'memo', 'brain'].includes(r.name)),
    message.text.includes('decided'),
    message.text.includes('agreed'),
    message.text.includes('blocker'),
    message.text.includes('architecture'),
    message.text.includes('TODO'),
    message.thread_ts && message.reply_count > 2, // active thread
  ];
  return signals.filter(Boolean).length >= 1;
}
```

---

## 3. Jira Integration

### What It Does
- Syncs issues, epics, and sprint data
- Tracks status changes (what moved to Done, what's blocked)
- Gives AI agents current sprint state

### Setup Steps

#### A. Jira OAuth 2.0 (Atlassian)
1. Go to https://developer.atlassian.com/console/myapps/
2. Create app → OAuth 2.0 (3LO)
3. Add scopes:
   ```
   read:jira-work
   read:jira-user
   offline_access
   ```
4. Callback URL: `https://contextmesh.vercel.app/api/integrations/jira/callback`

#### B. Environment Variables
```env
JIRA_CLIENT_ID=
JIRA_CLIENT_SECRET=
JIRA_REDIRECT_URI=https://contextmesh.vercel.app/api/integrations/jira/callback
```

#### C. Webhook Events to Listen For
```
jira:issue_created
jira:issue_updated
jira:issue_deleted
sprint_started
sprint_closed
```

---

## 4. Linear Integration (Optional, Phase 3+)

### What It Does
- Syncs Linear issues and project updates
- Captures cycle state (what's in progress, what's done)

### Setup Steps
1. Go to https://linear.app/settings/api → Create OAuth App
2. Scopes: `read`
3. Callback: `https://contextmesh.vercel.app/api/integrations/linear/callback`

```env
LINEAR_CLIENT_ID=
LINEAR_CLIENT_SECRET=
```

---

## 5. Anthropic Claude API

### What It Does
- Powers the AI query interface
- Answers natural language questions about project context
- Summarizes large chunks of ingested data

### Setup
1. Go to https://console.anthropic.com → Create API Key
2. Add to `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-your-key
```

### Usage Pattern
```typescript
// lib/anthropic/query.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function queryContext(question: string, contextItems: ContextItem[]) {
  const contextText = contextItems
    .map(item => `[${item.source} - ${item.type}] ${item.title}\n${item.content}`)
    .join('\n\n---\n\n');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a project context assistant. Based on the following project context, answer the question accurately and concisely. If the answer is not in the context, say so clearly.

CONTEXT:
${contextText}

QUESTION: ${question}

Answer:`
      }
    ]
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
```

### Cost Control
```typescript
// Track tokens per workspace
// Enforce limits based on plan:
// Free:  100 queries/month
// Pro:   2000 queries/month
// Team:  unlimited
```

---

## 6. Stripe (Phase 6 Only)

### Setup Steps
1. Create account at https://stripe.com
2. Get keys from Dashboard → Developers → API Keys:
```env
STRIPE_SECRET_KEY=sk_test_...          # Use test keys until launch
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

3. Create Products in Stripe Dashboard:
```
Product: ContextMesh Pro
  Price: $19/month (recurring)
  Price ID: save as STRIPE_PRO_PRICE_ID

Product: ContextMesh Team  
  Price: $49/month (recurring)
  Price ID: save as STRIPE_TEAM_PRICE_ID
```

4. Set webhook endpoint: `https://contextmesh.vercel.app/api/stripe/webhook`
5. Events to listen:
   ```
   customer.subscription.created
   customer.subscription.updated
   customer.subscription.deleted
   invoice.payment_succeeded
   invoice.payment_failed
   ```

---

## 7. Resend (Email)

### Setup
1. Sign up at https://resend.com (free: 3000 emails/month)
2. Add domain or use resend's sandbox
3. Get API key:
```env
RESEND_API_KEY=re_your_key
EMAIL_FROM=noreply@contextmesh.com
```

### Emails to Send
| Trigger | Template |
|---------|----------|
| Sign up | Welcome + verify email |
| Email verified | Getting started guide |
| New team member joined | Workspace invite notification |
| Query limit 80% | Upgrade nudge |
| Payment failed | Action required |
| Integration error | Fix your connection |

---

## 🔒 Security Rules for All Integrations

1. **Never store raw OAuth tokens in the database unencrypted**
   - Use Supabase Vault or encrypt with `pgcrypto` before storing
2. **Always verify webhook signatures** before processing
   - GitHub: compare `X-Hub-Signature-256` header
   - Slack: verify `X-Slack-Signature` header
3. **Rate limit all webhook endpoints** (max 100 req/min per IP)
4. **Log all integration errors** to Sentry

### Webhook Signature Verification (GitHub example):
```typescript
import crypto from 'crypto';

function verifyGitHubWebhook(body: string, signature: string, secret: string): boolean {
  const expectedSig = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')}`;
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  );
}
```

---

## 📋 Integration Checklist

- [ ] GitHub OAuth app created, credentials in `.env`
- [ ] GitHub webhook secret generated and stored
- [ ] Slack app created with correct scopes
- [ ] Slack event subscriptions configured
- [ ] Jira OAuth app created (skip if not needed for MVP)
- [ ] Anthropic API key added to `.env`
- [ ] Resend API key added, welcome email template created
- [ ] Stripe products created (Phase 6 only)
- [ ] All webhook endpoints protected with signature verification
- [ ] Rate limiting on all webhook routes
