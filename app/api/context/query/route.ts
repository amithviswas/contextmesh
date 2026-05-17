import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/lib/embeddings/generate';
import { groq, GROQ_MODEL, isAIConfigured } from '@/lib/anthropic/client';
import { getQueryUsage } from '@/lib/context/usage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getService(): any {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  // ── 1. Auth ────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── 2. Parse body ──────────────────────────────────────────────────────────
  const { project_id, question } = await request.json();
  if (!project_id || !question?.trim()) {
    return NextResponse.json({ error: 'project_id and question are required' }, { status: 400 });
  }

  const service = getService();

  // ── 3. Resolve workspace and verify membership (HIGH-03 fix) ─────────────────
  const { data: membership } = await service
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: 'No workspace found' }, { status: 403 });
  }

  const { data: project } = await service
    .from('projects')
    .select('workspace_id')
    .eq('id', project_id)
    .eq('workspace_id', membership.workspace_id)   // must belong to user's workspace
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  const workspaceId: string = project.workspace_id;

  // ── 4. Check AI config ────────────────────────────────────────────────────
  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: 'AI_NOT_CONFIGURED', message: 'Add GROQ_API_KEY to .env.local — get a free key at console.groq.com' },
      { status: 503 }
    );
  }

  // ── 5. Enforce query limit ─────────────────────────────────────────────────
  const usage = await getQueryUsage(workspaceId);
  if (usage.used >= usage.limit) {
    return NextResponse.json(
      { error: 'QUERY_LIMIT_REACHED', used: usage.used, limit: usage.limit, upgrade_url: '/pricing' },
      { status: 429 }
    );
  }

  // ── 6. Semantic search ─────────────────────────────────────────────────────
  const queryEmbedding = await generateEmbedding(question);

  const { data: contextItems } = await service.rpc('search_context', {
    query_embedding: `[${queryEmbedding.join(',')}]`,
    project_id_filter: project_id,
    match_count: 8,
  });

  // ── 7. No context case ─────────────────────────────────────────────────────
  if (!contextItems?.length) {
    return NextResponse.json({
      answer: "I don't have any context about this project yet. Add context manually or connect GitHub/Slack integrations.",
      sources: [],
      tokens_used: 0,
    });
  }

  // ── 8. Build context string ────────────────────────────────────────────────
  const contextText = (contextItems as Array<{ source: string; type: string; title: string; content: string }>)
    .map((item, i) =>
      `[Source ${i + 1}: ${item.source} — ${item.type}]\n${item.title}\n${item.content}`
    )
    .join('\n\n---\n\n');

  // ── 9. Insert query record ─────────────────────────────────────────────────
  const { data: queryRecord } = await service
    .from('queries')
    .insert({
      project_id,
      workspace_id: workspaceId,
      user_id: user.id,
      question: question.trim(),
      context_used: contextItems.map((i: { id: string }) => i.id),
    })
    .select('id')
    .single();

  const queryId: string = queryRecord?.id;

  // ── 10. Stream Groq (Llama) response ──────────────────────────────────────
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      try {
        // Send sources immediately
        send({ type: 'sources', sources: contextItems });

        // Stream Groq tokens
        const groqStream = await groq!.chat.completions.create({
          model: GROQ_MODEL,
          max_tokens: 1024,
          stream: true,
          messages: [
            {
              role: 'system',
              content: 'You are a project context assistant for a software development team. Answer questions based ONLY on the provided context. If the answer isn\'t in the context, say "I don\'t have information about that in the current context." Be specific, concise, and use markdown formatting where appropriate.',
            },
            {
              role: 'user',
              content: `PROJECT CONTEXT:\n${contextText}\n\nQUESTION: ${question.trim()}\n\nAnswer:`,
            },
          ],
        });

        let fullAnswer = '';
        let totalTokens = 0;

        for await (const chunk of groqStream) {
          const token = chunk.choices[0]?.delta?.content ?? '';
          if (token) {
            fullAnswer += token;
            send({ type: 'token', token });
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const chunkUsage = (chunk as any).usage;
          if (chunkUsage) {
            totalTokens = chunkUsage.total_tokens ?? 0;
          }
        }

        // Update query record
        if (queryId) {
          await service
            .from('queries')
            .update({ answer: fullAnswer, tokens_used: totalTokens })
            .eq('id', queryId);
        }

        send({ type: 'done', query_id: queryId, tokens_used: totalTokens });
      } catch (err: unknown) {
        console.error('Groq streaming error:', err);
        const msg = err instanceof Error ? err.message : 'AI response failed. Please try again.';
        send({ type: 'error', message: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
