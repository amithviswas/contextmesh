# 🧠 Phase 2 — Core Context Engine

**Duration:** Week 3–4  
**Goal:** Projects CRUD, manual context ingestion, vector embeddings, semantic search

---

## What You'll Build

By end of Phase 2:
- ✅ Create / view / delete projects
- ✅ Manually add context items (decisions, notes, architecture)
- ✅ Context items stored with vector embeddings (pgvector)
- ✅ Semantic similarity search over context
- ✅ Basic context list view per project
- ✅ Context item detail view

---

## Step-by-Step Instructions

### Step 2.1 — Projects Feature

**API Route: `app/api/projects/route.ts`**
```typescript
// GET — list all projects for current workspace
// POST — create new project
// Verify auth on every request
// Use RLS — Supabase automatically scopes to user's workspace
```

**API Route: `app/api/projects/[id]/route.ts`**
```typescript
// GET — get single project
// DELETE — delete project (owner/admin only)
```

**Pages:**

`app/(dashboard)/projects/page.tsx`
- List of projects as cards
- Each card: project name, description, context item count, created date
- [+ New Project] button → opens modal
- Empty state if no projects: "Create your first project"

`components/projects/CreateProjectModal.tsx`
- Name field (required)
- Description field (optional)
- Submit → POST /api/projects → close modal → refresh list
- Use React Hook Form + Zod for validation

### Step 2.2 — Embedding Setup

Install Transformers.js for free local embeddings:
```bash
npm install @xenova/transformers
```

```typescript
// lib/embeddings/generate.ts
import { pipeline } from '@xenova/transformers';

let embedder: any = null;

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}
```

**Note:** Xenova/all-MiniLM-L6-v2 generates 384-dimensional vectors. Update your DB schema:
```sql
-- Change vector dimension from 1536 to 384 for Transformers.js
ALTER TABLE context_items ALTER COLUMN embedding TYPE VECTOR(384);
```

### Step 2.3 — Context Ingestion API

`app/api/context/ingest/route.ts`:
```typescript
export async function POST(request: Request) {
  // 1. Verify auth
  // 2. Parse body: { project_id, source, type, title, content }
  // 3. Validate with Zod schema
  // 4. Generate embedding from title + content
  // 5. Insert into context_items with embedding
  // 6. Return created item

  const embedding = await generateEmbedding(`${title}\n\n${content}`);

  const { data } = await supabase.from('context_items').insert({
    project_id,
    source,
    type,
    title,
    content,
    metadata: {},
    embedding,
    indexed_at: new Date().toISOString(),
  }).select().single();

  return Response.json(data);
}
```

### Step 2.4 — Semantic Search

`app/api/context/search/route.ts`:
```typescript
// POST { project_id, query, limit? }
// 1. Generate embedding for query
// 2. Run pgvector similarity search
// 3. Return top N most similar context items

const queryEmbedding = await generateEmbedding(query);

const { data } = await supabase.rpc('search_context', {
  query_embedding: queryEmbedding,
  project_id_filter: project_id,
  match_count: limit ?? 10,
});
```

Create Supabase SQL function:
```sql
CREATE OR REPLACE FUNCTION search_context(
  query_embedding VECTOR(384),
  project_id_filter UUID,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  source TEXT,
  type TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    id, title, content, source, type,
    1 - (embedding <=> query_embedding) AS similarity
  FROM context_items
  WHERE project_id = project_id_filter
    AND embedding IS NOT NULL
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

### Step 2.5 — Context UI

`app/(dashboard)/projects/[id]/page.tsx` — Project detail:
```
Header: Project name + description + [Add Context] button

Context List:
  - Filter by: All | GitHub | Slack | Manual
  - Each item card:
      Source badge (color-coded)
      Type badge
      Title (Syne font)
      Content preview (2 lines, truncated)
      Timestamp
      [View] button

Empty state: "No context yet. Add manually or connect an integration."
```

`components/context/AddContextModal.tsx`:
- Type selector: Decision | Architecture Note | Blocker | Meeting Note
- Title field
- Content textarea (markdown supported)
- Submit → POST /api/context/ingest

`app/(dashboard)/projects/[id]/context/[contextId]/page.tsx`:
- Full content view
- Source + type + timestamp
- Metadata display
- [Delete] button (with confirm dialog)

### Step 2.6 — Dashboard Stats (Update from Phase 1)

Update `app/(dashboard)/dashboard/page.tsx`:
```
Stats row (real data now):
  - Total context items (across all projects)
  - Total projects
  - Last context added (relative time)

Recent Activity:
  - Last 5 context items added (any project)
  - Each row: source icon, title, project name, time ago
```

---

## Types

```typescript
// types/index.ts
export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface ContextItem {
  id: string;
  project_id: string;
  source: 'github' | 'slack' | 'jira' | 'linear' | 'manual';
  type: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  indexed_at?: string;
}
```

---

## Phase 2 Completion Criteria

- [ ] Can create a new project
- [ ] Project appears in projects list
- [ ] Can delete a project (with confirmation)
- [ ] Can manually add context item to a project
- [ ] Context item appears in project's context list
- [ ] Context item has embedding stored in DB (check Supabase)
- [ ] Can view full context item detail
- [ ] Can delete context item
- [ ] Source filter works on context list
- [ ] Dashboard stats show real numbers
- [ ] Dashboard recent activity shows real items
- [ ] Plan limit enforced: Free plan cannot create more than 1 project
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## Git Commit

```bash
git add .
git commit -m "feat: phase-2 complete — projects, context ingestion, embeddings"
git push origin main
```

---

## ✅ PHASE 2 COMPLETE — TRIGGER QA

**Run Phase 2 QA from `testing/QA_PROTOCOL.md` → Section: "Phase 2 QA".**

A senior human software tester must verify every item before Phase 3 begins.
