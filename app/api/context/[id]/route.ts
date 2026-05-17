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

  const service = getService();

  // Resolve caller's workspace
  const { data: membership } = await service
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: 'Context item not found' }, { status: 404 });
  }

  // Fetch item only if it belongs to a project in the caller's workspace (IDOR fix)
  const { data: item, error } = await service
    .from('context_items')
    .select('*, projects!inner(name, workspace_id)')
    .eq('id', id)
    .eq('projects.workspace_id', membership.workspace_id)
    .maybeSingle();

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

  const service = getService();

  // Resolve caller's workspace
  const { data: membership } = await service
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: 'Context item not found' }, { status: 404 });
  }

  // Verify item belongs to caller's workspace before deleting (IDOR fix)
  const { data: item } = await service
    .from('context_items')
    .select('id, projects!inner(workspace_id)')
    .eq('id', id)
    .eq('projects.workspace_id', membership.workspace_id)
    .maybeSingle();

  if (!item) {
    return NextResponse.json({ error: 'Context item not found' }, { status: 404 });
  }

  const { error } = await service
    .from('context_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[context/delete]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ data: { id } });
}
