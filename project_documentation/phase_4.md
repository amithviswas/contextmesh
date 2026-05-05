# 🤖 Phase 4 — AI Query Interface

**Duration:** Week 7–8  
**Goal:** Natural language queries over project context, powered by Claude API + pgvector

---

## What You'll Build

By end of Phase 4:
- ✅ AI-powered query interface (ask questions about your project)
- ✅ Answers grounded in real context (not hallucinated)
- ✅ Sources shown with each answer (which context items were used)
- ✅ Query history per project
- ✅ Token/query usage tracking per workspace
- ✅ Free plan query limit enforced with upgrade prompt
- ✅ Streaming responses (answer appears word-by-word)

---

## Step-by-Step Instructions

### Step 4.1 — Claude API Setup

```bash
npm install @anthropic-ai/sdk
```

```typescript
// lib/anthropic/client.ts
import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

### Step 4.2 — Query API (with Streaming)

`app/api/context/query/route.ts`:
```typescript
import { anthropic } from '@/lib/anthropic/client';
import { generateEmbedding } from '@/lib/embeddings/generate';

export async function POST(request: Request) {
  // 1. Auth check
  const session = await getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { project_id, question } = await request.json();

  // 2. Check query limit
  const { used, limit } = await getQueryUsage(session.user.workspace_id);
  if (used >= limit) {
    return Response.json({
      error: 'QUERY_LIMIT_REACHED',
      used,
      limit,
      upgrade_url: '/pricing',
    }, { status: 429 });
  }

  // 3. Semantic search — find relevant context
  const queryEmbedding = await generateEmbedding(question);
  const { data: contextItems } = await supabase.rpc('search_context', {
    query_embedding: queryEmbedding,
    project_id_filter: project_id,
    match_count: 8,
  });

  if (!contextItems?.length) {
    return Response.json({
      answer: "I don't have any context about this project yet. Add context manually or connect GitHub/Slack integrations.",
      sources: [],
    });
  }

  // 4. Build context string
  const contextText = contextItems
    .map((item: any, i: number) =>
      `[Source ${i + 1}: ${item.source} — ${item.type}]\n${item.title}\n${item.content}`
    )
    .join('\n\n---\n\n');

  // 5. Stream response from Claude
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are a project context assistant for a software development team. Answer questions based ONLY on the provided context. If the answer isn't in the context, say "I don't have information about that in the current context."

Be specific and reference actual details from the context. Keep answers concise and actionable.

PROJECT CONTEXT:
${contextText}

QUESTION: ${question}

Answer:`
    }]
  });

  // 6. Track query in DB
  const queryRecord = await supabase.from('queries').insert({
    project_id,
    user_id: session.user.id,
    question,
    context_used: contextItems.map((i: any) => i.id),
  }).select().single();

  // 7. Return as SSE stream
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      // Send sources immediately
      controller.enqueue(encoder.encode(
        `data: ${JSON.stringify({ type: 'sources', sources: contextItems })}\n\n`
      ));

      // Stream answer tokens
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'token', token: chunk.delta.text })}\n\n`
          ));
        }
      }

      // Update query with final answer
      const finalMessage = await stream.finalMessage();
      const answer = finalMessage.content[0].type === 'text' ? finalMessage.content[0].text : '';
      await supabase.from('queries')
        .update({ answer, tokens_used: finalMessage.usage.output_tokens })
        .eq('id', queryRecord.data.id);

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
      controller.close();
    }
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### Step 4.3 — Query Usage Tracking

```typescript
// lib/context/usage.ts
const PLAN_LIMITS = { free: 100, pro: 2000, team: Infinity };

export async function getQueryUsage(workspace_id: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('queries')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspace_id)
    .gte('created_at', startOfMonth.toISOString());

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('plan')
    .eq('id', workspace_id)
    .single();

  return {
    used: count ?? 0,
    limit: PLAN_LIMITS[workspace?.plan ?? 'free'],
    plan: workspace?.plan ?? 'free',
  };
}
```

### Step 4.4 — Query UI

`app/(dashboard)/query/page.tsx`:
```
Layout: Two-panel on desktop, stacked on mobile

LEFT PANEL — Query Input (40% width):
  Project selector dropdown
  Query input (multiline textarea)
  [Ask ContextMesh] button
  
  Usage meter:
    "47 / 100 queries this month"
    Progress bar (teal fill)
    "Upgrade for 2,000 queries" link

  Recent queries (last 5):
    Each row: question text (truncated), time ago
    Click → loads that query's answer

RIGHT PANEL — Answer (60% width):
  Empty state: Mesh pattern with "Ask anything about your project"
  
  When answer arrives:
    Question displayed (Syne font)
    Answer (streaming, appears token by token)
    
    Sources section (below answer):
      "Based on X sources:"
      Each source card:
        Source badge (GitHub/Slack/Manual)
        Title
        Snippet (50 chars)
        Similarity score (shown as dots or bar)
```

`components/query/QueryInput.tsx`:
```typescript
'use client';
// Controlled textarea
// Submit on Ctrl+Enter or button click
// Disable button while loading
// Show loading spinner while waiting for first token
```

`components/query/AnswerStream.tsx`:
```typescript
'use client';
// Reads SSE stream from /api/context/query
// Appends tokens to displayed text as they arrive
// Shows skeleton while waiting
// Renders markdown (use react-markdown)
// Animates in sources cards after answer completes
```

`components/query/SourceCard.tsx`:
```typescript
// Source badge + icon
// Title
// Content snippet
// Similarity bar (visual)
// Hover: full content tooltip or expand
```

### Step 4.5 — Query History

`app/(dashboard)/projects/[id]/history/page.tsx`:
```
List of all queries for this project
Each row:
  Question
  Answer preview (50 chars)
  Date/time
  Source count
  [View] → expand full answer + sources

Empty state: "No queries yet — ask your first question"
```

---

## Phase 4 Completion Criteria

- [ ] Query interface loads and project selector works
- [ ] Typing a question and submitting sends request
- [ ] Answer streams in token by token (not all at once)
- [ ] Sources appear below the answer
- [ ] Sources are relevant to the question (semantic search working)
- [ ] Query is saved to DB (check Supabase queries table)
- [ ] Usage counter increments after each query
- [ ] Usage meter shows correct count
- [ ] Free plan limit (100) enforced — shows upgrade prompt at limit
- [ ] Upgrade prompt links to pricing page
- [ ] Recent queries list shows last 5 queries
- [ ] Clicking recent query loads answer
- [ ] If no context exists: graceful "no context" message (not an error)
- [ ] Query history page shows all queries for project
- [ ] Markdown in answers renders correctly (bold, code blocks, lists)
- [ ] Mobile layout works (stacked panels)
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## Git Commit

```bash
git add .
git commit -m "feat: phase-4 complete — ai query interface with streaming"
git push origin main
```

---

## ✅ PHASE 4 COMPLETE — TRIGGER QA

**Run Phase 4 QA from `testing/QA_PROTOCOL.md` → Section: "Phase 4 QA".**

A senior human software tester must verify every item before Phase 5 begins.
