import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getService(): any {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80, 'Name must be 80 chars or less'),
  description: z.string().max(500).optional().nullable(),
});

// ── GET /api/projects — list projects for current workspace ──
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const service = getService();

  // Use service client to bypass RLS — memberships may be created by server-side ensureWorkspace
  const { data: membership } = await service
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ data: [] });
  }

  const { data: projects, error } = await service
    .from('projects')
    .select('*, context_items(count)')
    .eq('workspace_id', membership.workspace_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[projects/list]', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }

  // Flatten count
  const shaped = (projects ?? []).map((p: Record<string, unknown>) => ({
    ...p,
    context_item_count: (p['context_items'] as { count: number }[] | null)?.[0]?.count ?? 0,
    context_items: undefined,
  }));

  return NextResponse.json({ data: shaped });
}

// ── POST /api/projects — create project ──────────────────
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Resolve workspace — use service client to bypass RLS (memberships may be server-side created)
  const service = getService();
  const { data: membership } = await service
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
  }

  // Free plan: max 1 project
  const { count } = await service
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', membership.workspace_id);

  // Check workspace plan
  const { data: workspace } = await service
    .from('workspaces')
    .select('plan')
    .eq('id', membership.workspace_id)
    .single();

  if (workspace?.plan === 'free' && (count ?? 0) >= 1) {
    return NextResponse.json(
      { error: 'Free plan is limited to 1 project. Upgrade to Pro for unlimited projects.' },
      { status: 403 }
    );
  }

  const { data: project, error } = await service
    .from('projects')
    .insert({
      workspace_id: membership.workspace_id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('[projects/create]', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }

  return NextResponse.json({ data: project }, { status: 201 });
}
