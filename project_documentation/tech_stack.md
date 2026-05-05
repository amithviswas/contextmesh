# ⚙️ ContextMesh — Tech Stack

> Complete technology decisions with justification. Every tool here is either free-tier or open source until revenue.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│                  CLIENT                      │
│         Next.js 14 (App Router)              │
│         React 18 + TypeScript                │
│         Tailwind CSS + Custom CSS Vars       │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────┐
│              API LAYER                       │
│         Next.js API Routes                   │
│         (serverless functions on Vercel)     │
└──────┬──────────────────────┬───────────────┘
       │                      │
┌──────▼──────┐     ┌─────────▼──────────────┐
│  Supabase   │     │     External APIs       │
│  - Postgres │     │  - GitHub API           │
│  - pgvector │     │  - Slack API            │
│  - Auth     │     │  - Jira API             │
│  - Realtime │     │  - Linear API           │
│  - Storage  │     │  - Anthropic Claude API │
└─────────────┘     └────────────────────────┘
```

---

## 📦 Frontend

| Tool | Version | Why | Free? |
|------|---------|-----|-------|
| **Next.js** | 14 (App Router) | SSR, API routes, file-based routing, Vercel-native | ✅ |
| **React** | 18 | Component model, hooks, concurrent features | ✅ |
| **TypeScript** | 5.x | Type safety, better DX, catches bugs early | ✅ |
| **Tailwind CSS** | 3.4 | Utility-first, fast iteration | ✅ |
| **Framer Motion** | 11 | Smooth animations, gesture support | ✅ |
| **Zustand** | 4.x | Lightweight global state (no Redux overhead) | ✅ |
| **React Query (TanStack)** | 5.x | Server state, caching, background refetch | ✅ |
| **Lucide React** | Latest | Icon library, clean and consistent | ✅ |
| **React Hook Form** | 7.x | Form handling, validation | ✅ |
| **Zod** | 3.x | Schema validation (shared frontend/backend) | ✅ |

---

## 🗄️ Backend & Database

| Tool | Why | Free Tier |
|------|-----|-----------|
| **Supabase** | Postgres + Auth + Storage + Realtime + pgvector in one | 500MB DB, 2 projects free |
| **pgvector** | Vector embeddings stored in Postgres — no separate vector DB needed | Included in Supabase |
| **Next.js API Routes** | Serverless backend — no separate Express server needed | Free on Vercel |
| **Supabase Edge Functions** | For webhook handlers (GitHub, Slack) that need server-side logic | 500K invocations/month free |

---

## 🤖 AI & Embeddings

| Tool | Purpose | Free? |
|------|---------|-------|
| **Anthropic Claude API** (claude-sonnet-4) | Context query answering, summarization | Pay-per-use (~$0.003/1K tokens) |
| **Supabase pgvector** | Store embeddings for semantic search | Free (included) |
| **Transformers.js** | Generate embeddings client-side for small texts (free, no API cost) | ✅ Free |

**Embedding Strategy:**
- Small text (< 512 tokens): Transformers.js locally → free
- Large documents / PR diffs: Claude API → minimal cost
- Store all embeddings in pgvector for similarity search

---

## 🔐 Authentication

| Tool | Purpose | Free? |
|------|---------|-------|
| **Supabase Auth** | Email/password + OAuth (Google, GitHub) | ✅ 50,000 MAU free |
| **Supabase RLS** | Row-level security — workspace data isolation | ✅ Included |

**Auth Flow:**
1. Sign up with email or GitHub OAuth
2. Email verification (Supabase sends it)
3. Workspace created on first login
4. JWT stored in httpOnly cookie (Supabase handles this)
5. RLS ensures users only see their workspace data

---

## 💳 Payments

| Tool | Purpose | Free? |
|------|---------|-------|
| **Stripe** | Subscriptions, invoicing, webhooks | Free until revenue (2.9% + 30¢ per transaction after) |
| **Stripe Customer Portal** | Self-serve upgrade/downgrade/cancel | Free |

**Plans:**
```
Free:     1 project, 1 integration, 100 queries/month
Pro:      $19/month — 5 projects, all integrations, 2000 queries/month
Team:     $49/month — unlimited projects, priority support, SSO
```

**Note:** Do NOT implement Stripe until Phase 6. Use feature flags to gate Pro features until then.

---

## 📊 Analytics & Monitoring

| Tool | Purpose | Free? |
|------|---------|-------|
| **PostHog** | User event tracking, feature flags, session replay | 1M events/month free |
| **Vercel Analytics** | Page views, web vitals | Free on hobby plan |
| **Sentry** | Error tracking, performance monitoring | 5K errors/month free |

---

## 📣 Email

| Tool | Purpose | Free? |
|------|---------|-------|
| **Resend** | Transactional emails (welcome, verify, notifications) | 3,000 emails/month free |
| **React Email** | Email templates as React components | ✅ Open source |

---

## 🚀 Deployment & Infrastructure

| Tool | Purpose | Free? |
|------|---------|-------|
| **Vercel** | Host Next.js frontend + API routes | Hobby plan free |
| **Supabase** | Managed Postgres + all backend services | Free tier |
| **GitHub** | Source control, CI/CD via Vercel integration | ✅ Free |

**Deployment Flow:**
```
Push to main → GitHub → Vercel auto-deploys → runs build checks → live
Push to feature/* → Vercel preview URL generated automatically
```

---

## 🔧 Developer Tooling

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Husky** | Pre-commit hooks |
| **lint-staged** | Run linters on staged files only |
| **Playwright** | E2E testing |
| **Vitest** | Unit testing |

---

## 📁 Project Structure

```
contextmesh/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages group
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── verify/page.tsx
│   ├── (dashboard)/              # Protected dashboard
│   │   ├── layout.tsx            # Sidebar layout
│   │   ├── dashboard/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── integrations/page.tsx
│   │   ├── query/page.tsx        # AI query interface
│   │   └── settings/page.tsx
│   ├── (marketing)/              # Public pages
│   │   ├── page.tsx              # Landing page
│   │   ├── pricing/page.tsx
│   │   └── docs/page.tsx
│   └── api/                      # API routes
│       ├── auth/[...supabase]/
│       ├── context/
│       │   ├── ingest/route.ts   # Ingest context from integrations
│       │   └── query/route.ts    # Query context with AI
│       ├── integrations/
│       │   ├── github/
│       │   │   ├── webhook/route.ts
│       │   │   └── connect/route.ts
│       │   ├── slack/
│       │   │   ├── webhook/route.ts
│       │   │   └── connect/route.ts
│       │   └── jira/
│       │       └── connect/route.ts
│       ├── stripe/
│       │   └── webhook/route.ts
│       └── health/route.ts
├── components/
│   ├── ui/                       # Base components
│   ├── dashboard/                # Dashboard-specific
│   ├── integrations/             # Integration cards/flows
│   ├── query/                    # AI query interface
│   └── marketing/                # Landing page sections
├── lib/
│   ├── supabase/                 # Client + server clients
│   ├── anthropic/                # Claude API wrapper
│   ├── embeddings/               # Embedding generation
│   ├── integrations/             # GitHub, Slack, Jira clients
│   └── stripe/                   # Stripe client + helpers
├── types/                        # Shared TypeScript types
├── styles/                       # Global CSS + CSS variables
└── supabase/
    └── migrations/               # DB schema migrations
```

---

## 🗃️ Database Schema

```sql
-- Workspaces (multi-tenant isolation)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',        -- free | pro | team
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users → Workspaces (many-to-many via memberships)
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',      -- owner | admin | member
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, workspace_id)
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Context Items (the core data)
CREATE TABLE context_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  source TEXT NOT NULL,            -- github | slack | jira | linear | manual
  type TEXT NOT NULL,              -- commit | pr | message | issue | decision
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding VECTOR(1536),          -- pgvector embedding
  created_at TIMESTAMPTZ DEFAULT NOW(),
  indexed_at TIMESTAMPTZ
);

-- Integrations
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,          -- github | slack | jira | linear
  config JSONB DEFAULT '{}',       -- encrypted tokens, org IDs, etc.
  status TEXT DEFAULT 'active',    -- active | paused | error
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Queries (for analytics and history)
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES auth.users(id),
  question TEXT NOT NULL,
  answer TEXT,
  context_used JSONB,              -- which context items were used
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Similarity search index
CREATE INDEX ON context_items USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Row Level Security
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users see only their workspace data)
CREATE POLICY "workspace_member_access" ON projects
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM memberships WHERE user_id = auth.uid()
    )
  );
```

---

*This stack is 100% free until you start earning. Scale Supabase and Vercel plans as revenue grows.*
