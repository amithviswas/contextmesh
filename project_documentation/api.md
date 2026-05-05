# 🔗 ContextMesh — API Reference

> All endpoints are Next.js API Routes (serverless). Base URL: `https://contextmesh.vercel.app/api`

---

## Authentication

All `/api` routes (except webhooks and health) require a valid Supabase session. The session is passed via the `Authorization` header or via httpOnly cookie automatically.

```typescript
// Standard auth check in every API route
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // proceed...
}
```

---

## Endpoints

### Health
```
GET /api/health
Response: { status: 'ok', timestamp: string }
Auth: None
```

---

### Context

#### Ingest Context (Manual)
```
POST /api/context/ingest
Auth: Required
Body:
{
  project_id: string,
  source: 'manual',
  type: 'decision' | 'note' | 'architecture',
  title: string,
  content: string
}
Response:
{
  id: string,
  created_at: string
}
```

#### Query Context (AI)
```
POST /api/context/query
Auth: Required
Body:
{
  project_id: string,
  question: string
}
Response:
{
  answer: string,
  sources: ContextItem[],        // which items were used
  tokens_used: number,
  query_id: string
}
Error (limit reached):
{
  error: 'QUERY_LIMIT_REACHED',
  limit: number,
  used: number,
  upgrade_url: '/pricing'
}
```

#### Get Context Items
```
GET /api/context/items?project_id=xxx&source=github&limit=20&offset=0
Auth: Required
Response:
{
  items: ContextItem[],
  total: number
}
```

---

### Projects

#### Create Project
```
POST /api/projects
Auth: Required
Body: { name: string, description?: string }
Response: Project
```

#### Get Projects
```
GET /api/projects
Auth: Required
Response: Project[]
```

#### Delete Project
```
DELETE /api/projects/:id
Auth: Required (owner/admin only)
Response: { success: true }
```

---

### Integrations

#### Connect GitHub
```
GET /api/integrations/github/connect
Auth: Required
→ Redirects to GitHub OAuth
```

#### GitHub OAuth Callback
```
GET /api/integrations/github/callback?code=xxx&state=xxx
Auth: Required (via state param)
→ Exchanges code for token, stores integration, redirects to /integrations
```

#### GitHub Webhook (Receives events from GitHub)
```
POST /api/integrations/github/webhook
Auth: None (verified via signature)
Headers: X-Hub-Signature-256, X-GitHub-Event
Body: GitHub webhook payload
Response: { received: true }
```

#### Connect Slack
```
GET /api/integrations/slack/connect
Auth: Required
→ Redirects to Slack OAuth
```

#### Slack Webhook
```
POST /api/integrations/slack/webhook
Auth: None (verified via signature)
Headers: X-Slack-Signature
Body: Slack event payload
Response: { ok: true }
```

#### Get Integrations Status
```
GET /api/integrations
Auth: Required
Response:
[
  {
    provider: 'github',
    status: 'active' | 'error' | 'disconnected',
    connected_at: string,
    last_sync: string,
    items_synced: number
  }
]
```

#### Disconnect Integration
```
DELETE /api/integrations/:provider
Auth: Required (owner/admin only)
Response: { success: true }
```

---

### Stripe (Phase 6)

#### Create Checkout Session
```
POST /api/stripe/checkout
Auth: Required
Body: { plan: 'pro' | 'team' }
Response: { checkout_url: string }
```

#### Stripe Webhook
```
POST /api/stripe/webhook
Auth: None (verified via Stripe signature)
Headers: Stripe-Signature
Body: Stripe event payload
```

#### Get Subscription Status
```
GET /api/stripe/subscription
Auth: Required
Response:
{
  plan: 'free' | 'pro' | 'team',
  status: 'active' | 'canceled' | 'past_due',
  current_period_end: string,
  cancel_at_period_end: boolean
}
```

#### Cancel Subscription
```
POST /api/stripe/cancel
Auth: Required
Response: { canceled: true, ends_at: string }
```

---

## Error Format

All errors follow this format:
```json
{
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "details": {}
}
```

Common error codes:
```
UNAUTHORIZED        - No valid session
FORBIDDEN           - Session valid but insufficient permissions
NOT_FOUND           - Resource doesn't exist
VALIDATION_ERROR    - Request body invalid
QUERY_LIMIT_REACHED - Monthly query limit hit (upgrade prompt)
INTEGRATION_ERROR   - Integration API call failed
RATE_LIMITED        - Too many requests
INTERNAL_ERROR      - Unexpected server error
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/context/query` | 10 req/min per user |
| `/api/context/ingest` | 100 req/min per workspace |
| `/api/integrations/*/webhook` | 200 req/min per IP |
| All other routes | 60 req/min per user |

Rate limit headers returned on all responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1699999999
```
