# 🏛️ ContextMesh — System Architecture

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USERS / CLIENTS                          │
│          Browsers │ AI Agents │ CLI tools (future)              │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                          │
│                   (CDN + Edge Middleware)                       │
│  • Route protection (middleware.ts)                             │
│  • Static asset serving                                         │
│  • Preview deployments per branch                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                  NEXT.JS APPLICATION                            │
│                                                                 │
│  ┌──────────────────┐        ┌──────────────────────────────┐  │
│  │  React App       │        │  API Routes (Serverless)     │  │
│  │  (App Router)    │        │                              │  │
│  │                  │        │  /api/context/ingest         │  │
│  │  Marketing pages │        │  /api/context/query          │  │
│  │  Auth pages      │        │  /api/projects               │  │
│  │  Dashboard       │        │  /api/integrations/*         │  │
│  │  Query UI        │        │  /api/stripe/*               │  │
│  │  Settings        │        │  /api/team/*                 │  │
│  └──────────────────┘        └──────────────────────────────┘  │
└──────────────────┬────────────────────────┬─────────────────────┘
                   │                        │
     ┌─────────────▼──────────┐   ┌─────────▼──────────────────┐
     │      SUPABASE           │   │    EXTERNAL SERVICES        │
     │                        │   │                            │
     │  PostgreSQL             │   │  Anthropic Claude API      │
     │  pgvector               │   │  GitHub API + Webhooks     │
     │  Supabase Auth          │   │  Slack API + Events        │
     │  Supabase Storage       │   │  Jira API                  │
     │  Supabase Realtime      │   │  Stripe API + Webhooks     │
     │  Row Level Security     │   │  Resend (Email)            │
     │  Edge Functions         │   │  PostHog (Analytics)       │
     └────────────────────────┘   │  Sentry (Errors)           │
                                   └────────────────────────────┘
```

---

## Data Flow: Context Ingestion

```
External Source (GitHub/Slack/Jira)
           │
           │ Webhook POST
           ▼
/api/integrations/{provider}/webhook
           │
           ├─ Verify webhook signature
           ├─ Parse payload
           ├─ Extract meaningful content
           │
           ▼
lib/context/ingest.ts
           │
           ├─ Generate text embedding (Transformers.js)
           │   input: title + content
           │   output: 384-dim vector
           │
           ▼
Supabase: context_items table
           │
           ├─ Store: title, content, source, type, metadata
           ├─ Store: embedding (pgvector)
           ├─ Store: project_id, indexed_at
           │
           ▼
Available for semantic search
```

---

## Data Flow: AI Query

```
User types question in Query UI
           │
           ▼
POST /api/context/query
{ project_id, question }
           │
           ├─ Verify auth
           ├─ Check query limit (plan-based)
           │
           ▼
lib/embeddings/generate.ts
           │
           ├─ Generate query embedding
           │   (same model as ingestion — critical for similarity)
           │
           ▼
Supabase RPC: search_context()
           │
           ├─ pgvector cosine similarity search
           ├─ Filter by project_id
           ├─ Return top 8 most similar items
           │
           ▼
Anthropic Claude API (claude-sonnet-4)
           │
           ├─ System: project context assistant instructions
           ├─ User: [context items] + [question]
           ├─ Stream response
           │
           ▼
SSE Stream → Client
           │
           ├─ Sources sent first (immediate)
           ├─ Answer tokens stream progressively
           ├─ 'done' event closes stream
           │
           ▼
Save to queries table
(question, answer, context_used, tokens_used)
```

---

## Multi-Tenancy Model

```
auth.users (Supabase managed)
     │
     │ 1:N (via memberships)
     ▼
workspaces
  id, name, slug, plan
     │
     │ 1:N
     ▼
projects
  id, workspace_id, name, description
     │
     │ 1:N
     ▼
context_items
  id, project_id, source, type, title, content, embedding
     
     
Row Level Security ensures:
  User A cannot see User B's workspace data
  Even if they bypass the UI, DB enforces isolation
  Service role key (server only) can bypass RLS when needed
```

---

## Embedding Strategy

```
Model: Xenova/all-MiniLM-L6-v2 (via Transformers.js)
Dimensions: 384
Runs: In-process (no external API call = free)
Similarity metric: Cosine similarity (pgvector <=> operator)

Why not OpenAI embeddings:
  - Cost: OpenAI charges per token
  - Latency: Extra network round-trip
  - Our use case: 384 dims is sufficient for project context retrieval

Index type: IVFFlat (approximate nearest neighbor)
  - Faster than exact search at scale
  - Acceptable accuracy loss (< 5%)
  - Lists: 100 (good for up to 1M vectors)
```

---

## Security Architecture

```
Layer 1: Vercel Edge
  - HTTPS enforced (auto SSL)
  - DDoS protection (Vercel)
  - Rate limiting at edge

Layer 2: Next.js Middleware
  - Session verification on every protected route
  - Redirects unauthenticated users
  - Runs before page renders (no flash of content)

Layer 3: API Routes
  - Session verified on every API call
  - Zod validation on all inputs
  - Webhook signature verification

Layer 4: Supabase RLS
  - Database-level tenant isolation
  - No SQL injection possible (parameterized queries via Supabase client)
  - Even if Layer 3 is bypassed, Layer 4 holds

Secrets management:
  - All secrets in Vercel environment variables
  - Never in code, never in git
  - Service role key only used server-side
  - OAuth tokens encrypted before DB storage
```

---

## Scalability Notes (For Future Reference)

```
Current bottlenecks at scale:
1. Embedding generation: Transformers.js runs in-process
   Solution: Move to dedicated embedding service or batch processing

2. pgvector search: Gets slower with millions of vectors
   Solution: Increase IVFFlat lists, or migrate to dedicated vector DB

3. Webhook processing: Synchronous in API routes
   Solution: Add Supabase Edge Function queue for async processing

4. Claude API cost: Unbounded on Team plan
   Solution: Add caching layer for repeated similar questions

When to scale:
  < 1000 users:    Current architecture handles fine
  1000-10K users:  Add Redis caching, background jobs
  10K+ users:      Dedicated embedding service, async queues
```

---

## Environment Architecture

```
Local Development:
  http://localhost:3000
  Supabase local emulator OR Supabase dev project
  Stripe test mode
  PostHog test project

Preview (per PR):
  https://contextmesh-git-[branch].vercel.app
  Same Supabase dev project
  Stripe test mode

Production:
  https://contextmesh.vercel.app (or custom domain)
  Supabase production project
  Stripe live mode
  Production PostHog
  Sentry production environment
```
