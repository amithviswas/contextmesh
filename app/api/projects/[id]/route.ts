import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getService(): any {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── GET /api/projects/[id] ────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const service = getService();

  // Resolve caller's workspace (CRIT-02 fix — scope project to user's workspace)
  const { data: membership } = await service
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const { data: project, error } = await service
    .from('projects')
    .select('*, context_items(count)')
    .eq('id', id)
    .eq('workspace_id', membership.workspace_id)   // ownership enforced
    .maybeSingle();

  if (error || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const p = project as Record<string, unknown>;
  return NextResponse.json({
    data: {
      ...p,
      context_item_count: (p['context_items'] as { count: number }[] | null)?.[0]?.count ?? 0,
      context_items: undefined,
    },
  });
}


// ── DELETE /api/projects/[id] ─────────────────────────
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership via RLS — Supabase will block if user doesn't belong to workspace
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { id } });
}
