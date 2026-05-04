import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ── GET /api/context/[id] ─────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: item, error } = await supabase
    .from('context_items')
    .select('*, projects(name)')
    .eq('id', id)
    .single();

  if (error || !item) {
    return NextResponse.json({ error: 'Context item not found' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const it = item as any;
  return NextResponse.json({
    data: {
      ...it,
      project_name: it.projects?.name,
      projects: undefined,
      embedding: undefined,
    },
  });
}

// ── DELETE /api/context/[id] ──────────────────────────
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('context_items')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { id } });
}
