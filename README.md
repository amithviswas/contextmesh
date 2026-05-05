# ContextMesh

**🚧 Work in Progress 🚧**

ContextMesh is currently under active development.

## Overview
ContextMesh is a platform that provides a shared memory layer for development teams. It features a core context engine with local text-to-vector embeddings and semantic similarity search via pgvector. 

## Features (Current & Upcoming)
- **Projects Management**: Organize context items by team or codebase.
- **Local Embeddings**: Generates 384-dimensional vector embeddings locally using Transformers.js (`all-MiniLM-L6-v2`) without external API costs.
- **Semantic Search**: Powered by PostgreSQL and pgvector for accurate context retrieval.
- **Integrations**: Auto-sync from GitHub, Slack, Jira, Linear (Upcoming).
- **AI Query**: Natural language Q&A over your context items (Upcoming).

## Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend / Database**: Supabase (Auth, PostgreSQL, pgvector)
- **ML / AI**: Transformers.js (Local embeddings)

## Development Status

### ✅ Phase 1: UI/UX Overhaul & Auth Foundation (Completed)
- **Modern Authentication**: GitHub OAuth integration with Supabase.
- **Workspace Security**: Database RLS (Row Level Security) enforcing multi-tenant isolation via a `memberships` table.
- **Premium UI Design**: Migrated to Tailwind v4, standardizing on a dark aesthetic with customized typography (Inter, Syne, DM Mono) using Next.js fonts.
- **Dashboard Shell**: Responsive sidebar and main layout, replacing arbitrary responsive properties with stable CSS classes.

### ✅ Phase 2: Core Context Engine (Completed)
- **Projects CRUD**: Create, read, and delete projects (with a Free plan enforcement limit).
- **Local Embedding Pipeline**: Instant background vectorization using a local Transformers.js instance.
- **Context Ingestion API**: Input rich markdown content representing architecture decisions, blockers, meeting notes, etc.
- **pgvector Integration**: Database schema optimized for 384-dimensional vectors with cosine similarity RPC functions (`search_context`).
- **Real-time Dashboards**: Interactive client-side pages showing project metrics, context ingestion counts, and recent activity feeds.

<br/>

---
### 🚧 Under Development 🚧
---

### ⏳ Phase 3: AI Query Interface 
- Natural language querying against the context memory.
- LLM response generation backed by semantic context item retrieval.

### ⏳ Phase 4: Third-party Integrations
- Automatic context ingestion from GitHub, Slack, Jira, and Linear APIs.

### ⏳ Phase 5: Team Analytics & Usage Billing
- Stripe integration for pro tier upgrades.
- Reporting on context utilization and knowledge gaps.

### ⏳ Phase 6 & 7: Polish, Launch, & Post-Launch
- Chrome Extensions and final product launch steps.
- Security hardening and production scale optimization.

## License
This project is licensed under the [Apache License 2.0](LICENSE).

---
*Note: Detailed documentation for the project planning, API, and architecture can be found in the `/project_documentation` directory.*
