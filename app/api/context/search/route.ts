import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/embeddings/generate';
import { z } from 'zod';

const SearchSchema = z.object({
  project_id: z.string().uuid(),
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(20).default(10),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = SearchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { project_id, query, limit } = parsed.data;

  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // Run pgvector similarity search via RPC
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('search_context', {
    query_embedding: `[${queryEmbedding.join(',')}]`,
    project_id_filter: project_id,
    match_count: limit,
  });

  if (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}
