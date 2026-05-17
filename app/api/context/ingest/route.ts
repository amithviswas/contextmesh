import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/lib/embeddings/generate';
import { z } from 'zod';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getService(): any {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const IngestSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  source: z.enum(['manual', 'github', 'slack', 'jira', 'linear']).default('manual'),
  type: z.enum(['decision', 'architecture', 'blocker', 'meeting_note', 'note']),
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(10000),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // HIGH-05: Rate limit — 60 ingest requests per minute per user
  const rl = rateLimit(`ingest:${user.id}`, 60, 60_000);
  if (!rl.allowed) return rateLimitResponse(rl.resetMs);

  const body = await request.json().catch(() => ({}));
  const parsed = IngestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { project_id, source, type, title, content, metadata } = parsed.data;

  // Verify project belongs to user's workspace (service client bypasses RLS)
  const service = getService();

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
    .select('id')
    .eq('id', project_id)
    .eq('workspace_id', membership.workspace_id)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
  }

  // Generate embedding (384-dim)
  const embedding = await generateEmbedding(`${title}\n\n${content}`);

  const { data: item, error } = await service
    .from('context_items')
    .insert({
      project_id,
      source,
      type,
      title,
      content,
      metadata,
      embedding: `[${embedding.join(',')}]`,
      indexed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[context/ingest]', error);
    return NextResponse.json({ error: 'Failed to save context item' }, { status: 500 });
  }

  return NextResponse.json({ data: item }, { status: 201 });
}
