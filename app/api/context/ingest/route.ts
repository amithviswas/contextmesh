import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/embeddings/generate';
import { z } from 'zod';

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

  const body = await request.json().catch(() => ({}));
  const parsed = IngestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { project_id, source, type, title, content, metadata } = parsed.data;

  // Verify project belongs to user's workspace
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
  }

  // Generate embedding (384-dim)
  const embedding = await generateEmbedding(`${title}\n\n${content}`);

  const { data: item, error } = await supabase
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
    console.error('Ingest error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: item }, { status: 201 });
}
