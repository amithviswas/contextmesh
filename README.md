<div align="center">

<img src="public/logo.svg" alt="ContextMesh Logo" width="64" height="64" />

# ContextMesh

**The shared memory layer for engineering teams.**

Store decisions, architecture notes, blockers, and meeting context — then query it all in natural language with AI.

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://contextmesh-murex.vercel.app/)

[**Live Demo →**](https://contextmesh-murex.vercel.app/) · [Report Bug](https://github.com/amithviswas/contextmesh/issues) · [Request Feature](https://github.com/amithviswas/contextmesh/issues)

</div>

---

## What Is ContextMesh?

Engineering teams lose critical knowledge constantly — in Slack threads, scattered Notion docs, forgotten Jira comments. ContextMesh captures that knowledge and makes it instantly searchable through natural language AI queries.

Think of it as **long-term memory for your team's codebase**.

- A new engineer joins → they ask *"Why did we choose PostgreSQL?"* → ContextMesh answers from your actual documented decisions.
- A bug appears → ask *"What decisions were made about authentication?"* → get grounded answers, not hallucinations.
- Context flows in automatically from GitHub commits, Slack conversations, and more.

---

## Features

### ✅ Core Platform
| Feature | Description |
|---------|-------------|
| **Projects** | Organize context by team or codebase. Free plan includes 1 project. |
| **Context Items** | Capture decisions, architecture notes, blockers, meeting notes, and general notes in structured form. |
| **AI Query** | Ask natural language questions answered from your actual context — powered by Groq (Llama 3.3 70B). |
| **Semantic Search** | Vector similarity search via pgvector for accurate, relevant context retrieval. |
| **Team Workspaces** | Multi-tenant workspaces with RLS-enforced data isolation. |
| **Team Invites** | Invite teammates via email with role-based access (Owner / Member). |

### ✅ Integrations
| Integration | Status |
|------------|--------|
| **GitHub** | Connect repos — auto-ingest commits and PRs as context items. |
| **Slack** | Capture decisions and blockers from team conversations. |
| **Jira** | Sync issues, epics, and sprint data *(Pro plan)* |
| **Linear** | Sync issues and project cycles *(Pro plan)* |

### ✅ Security & Reliability
- **Row Level Security (RLS)** — every database query is scoped to the authenticated user's workspace
- **Rate Limiting** — sliding-window rate limits on AI queries (30/min) and context ingestion (60/min)
- **Input Sanitization** — prompt injection protection on all AI endpoints
- **Webhook Verification** — HMAC signature validation on GitHub and Slack webhooks
- **Security Headers** — CSP, X-Frame-Options, X-Content-Type-Options via `next.config.ts`
- **IDOR Protection** — all ID-based endpoints verify workspace membership before access

### ✅ Billing & Plans
| | Free | Pro | Team |
|-|------|-----|------|
| Price | $0 | $19/mo | $49/mo |
| Projects | 1 | 5 | Unlimited |
| Context Items | 500 | 10,000 | Unlimited |
| AI Queries/mo | 100 | 2,000 | Unlimited |
| Team Members | 1 | 5 | Unlimited |
| Integrations | GitHub | + Slack, Jira | + Linear |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components) |
| **Language** | TypeScript 5 |
| **UI** | React 19, Tailwind CSS v4, Framer Motion, Lucide React |
| **Auth** | Supabase Auth (Email + GitHub OAuth) |
| **Database** | Supabase PostgreSQL + pgvector |
| **AI** | [Groq](https://groq.com/) — Llama 3.3 70B (free tier) |
| **Embeddings** | Deterministic hash embeddings (no cold start, no API cost) |
| **Payments** | Stripe (Test mode) |
| **Email** | Resend (SMTP + transactional) |
| **Analytics** | PostHog + Vercel Analytics + Speed Insights |
| **Error Tracking** | Sentry |
| **State** | Zustand + TanStack Query |
| **Deployment** | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com/) project (free tier works)
- A [Groq](https://console.groq.com/) API key (free)

### 1. Clone & Install
```bash
git clone https://github.com/amithviswas/contextmesh.git
cd contextmesh/contextmesh
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# ── Supabase ──────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # Never expose to client

# ── App ───────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── GitHub OAuth ──────────────────────────────────────────
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-secret

# ── AI (Groq — Free) ──────────────────────────────────────
GROQ_API_KEY=your-groq-api-key

# ── Payments (Stripe Test Mode) ───────────────────────────
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...

# ── Email (Resend) ────────────────────────────────────────
# Configure in Supabase Auth → SMTP settings, not here directly

# ── Integrations ──────────────────────────────────────────
GITHUB_INTEGRATION_CLIENT_ID=
GITHUB_INTEGRATION_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=your-webhook-secret
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_SIGNING_SECRET=

# ── Analytics (Optional) ──────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 3. Set Up Supabase

#### Run Migrations
Apply the database schema from the `/supabase/migrations` folder in your Supabase SQL Editor, in order.

#### Configure Auth
In your Supabase Dashboard:
1. **Authentication → Providers → GitHub** — add your GitHub OAuth app credentials
2. **Authentication → URL Configuration:**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/api/auth/callback`
3. **Authentication → Email (SMTP)** — configure Resend for transactional emails:
   - Host: `smtp.resend.com`, Port: `465`, Username: `resend`
   - Password: your Resend API key

#### Enable pgvector
In SQL Editor:
```sql
create extension if not exists vector;
```

### 4. Run Locally
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
contextmesh/
├── app/
│   ├── (auth)/              # Login, signup, forgot-password, reset-password
│   ├── (dashboard)/         # Protected pages: dashboard, projects, query, integrations, settings
│   ├── (marketing)/         # Public landing page
│   ├── api/
│   │   ├── auth/            # OAuth callback, session handling
│   │   ├── context/         # Context ingest, AI query, item CRUD
│   │   ├── integrations/    # GitHub & Slack webhook handlers + OAuth flows
│   │   ├── projects/        # Project CRUD
│   │   ├── settings/        # Profile & workspace settings
│   │   ├── stripe/          # Checkout, billing portal, webhooks
│   │   └── team/            # Member management, invite system
│   └── invite/              # Team invite acceptance page
├── components/              # Reusable UI components
├── hooks/                   # Custom React hooks
├── lib/
│   ├── auth/                # onboarding, workspace provisioning
│   ├── context/             # Context ingestion business logic
│   ├── embeddings/          # Embedding generation (hash + HuggingFace)
│   ├── integrations/        # GitHub & Slack client helpers
│   ├── stripe/              # Stripe helpers
│   ├── supabase/            # Supabase client (browser + server)
│   ├── plans.ts             # Plan limits & feature gates
│   └── rate-limit.ts        # Sliding-window in-memory rate limiter
├── supabase/
│   └── migrations/          # SQL migration files
├── types/                   # Shared TypeScript types
├── .env.example             # Environment variable template
└── next.config.ts           # Security headers & Next.js config
```

---

## API Reference

All endpoints require authentication via Supabase session cookie.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List workspace projects |
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects/[id]` | Get project details |
| `DELETE` | `/api/projects/[id]` | Delete a project |
| `POST` | `/api/context/ingest` | Add a context item to a project |
| `GET` | `/api/context/[id]` | Get a context item |
| `DELETE` | `/api/context/[id]` | Delete a context item |
| `POST` | `/api/context/query` | AI query over project context |
| `GET` | `/api/team` | List workspace members |
| `POST` | `/api/team/invite` | Send a team invite |
| `DELETE` | `/api/team/invite` | Revoke a team invite |
| `GET` | `/api/team/invite/[token]` | Accept an invite |
| `GET` | `/api/settings` | Get profile & workspace settings |
| `PATCH` | `/api/settings` | Update profile or workspace |
| `POST` | `/api/stripe/checkout` | Start Stripe checkout |
| `POST` | `/api/stripe/portal` | Open Stripe billing portal |
| `POST` | `/api/stripe/webhook` | Handle Stripe webhook events |
| `GET` | `/api/integrations` | List connected integrations |
| `GET` | `/api/integrations/github/callback` | GitHub OAuth callback |
| `POST` | `/api/integrations/github/webhook` | GitHub webhook handler |
| `POST` | `/api/integrations/slack/webhook` | Slack event webhook |

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com/new)
3. Set **Root Directory** to `contextmesh`
4. Add all environment variables from `.env.local`
5. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/amithviswas/contextmesh)

### Post-Deployment
- Update Supabase **Site URL** and **Redirect URLs** to your Vercel domain
- Update GitHub OAuth app callback URL to `https://your-domain.vercel.app/api/auth/callback`
- Update Stripe webhook endpoint to `https://your-domain.vercel.app/api/stripe/webhook`

---

## Security

Security was a core focus of this project. Key mitigations implemented:

| Vulnerability | Mitigation |
|--------------|------------|
| IDOR (Insecure Direct Object Reference) | All ID-based endpoints verify workspace membership |
| Unauthorized workspace access | Service-role lookups scoped to authenticated `user_id` |
| Prompt injection | Input sanitized before passing to LLM |
| Webhook spoofing | HMAC-SHA256 signature verification on GitHub & Slack |
| Rate abuse | Sliding-window rate limiting (30 req/min AI, 60 req/min ingest) |
| Data leakage | Raw DB errors replaced with generic messages |
| Clickjacking | `X-Frame-Options: DENY` header |
| MIME sniffing | `X-Content-Type-Options: nosniff` header |
| XSS | Content Security Policy header |

Found a vulnerability? Open a private [GitHub issue](https://github.com/amithviswas/contextmesh/issues) or contact the maintainer directly.

---

## Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Distributed under the **Apache License 2.0**. See [LICENSE](LICENSE) for more information.

---

## Acknowledgements

- [Supabase](https://supabase.com/) — Auth, database, RLS, pgvector
- [Groq](https://groq.com/) — Ultra-fast LLM inference (free tier)
- [Resend](https://resend.com/) — Transactional email
- [Vercel](https://vercel.com/) — Deployment & edge functions
- [Stripe](https://stripe.com/) — Payment processing
- [PostHog](https://posthog.com/) — Product analytics

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/amithviswas">Amith Viswas</a></p>
  <p><a href="https://contextmesh-murex.vercel.app/">contextmesh-murex.vercel.app</a></p>
</div>
