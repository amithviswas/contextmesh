import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getService(): any {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── GET /api/team/members — list members ─────────────────────────────────────
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const service = getService();

  const { data: membership } = await service
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) return NextResponse.json({ data: [] });

  // Get all members with their email from auth.users via service role
  const { data: members, error } = await service
    .from('memberships')
    .select('user_id, role, display_name, created_at')
    .eq('workspace_id', membership.workspace_id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[team/members GET]', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }

  // Enrich with emails using service role
  const enriched = await Promise.all(
    (members ?? []).map(async (m: { user_id: string; role: string; display_name: string | null; created_at: string }) => {
      const { data: authUser } = await service.auth.admin.getUserById(m.user_id);
      return {
        user_id: m.user_id,
        email: authUser?.user?.email ?? '(unknown)',
        display_name: m.display_name ?? authUser?.user?.user_metadata?.full_name ?? null,
        role: m.role,
        joined_at: m.created_at,
      };
    })
  );

  return NextResponse.json({ data: enriched });
}

// ── PATCH /api/team/members — update role ────────────────────────────────────
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { user_id, role } = await request.json();
  if (!user_id || !role) return NextResponse.json({ error: 'user_id and role required' }, { status: 400 });

  const service = getService();

  // Verify requester is owner/admin
  const { data: myMembership } = await service
    .from('memberships')
    .select('workspace_id, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!['owner', 'admin'].includes(myMembership?.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  // Cannot change owner role
  if (role === 'owner') return NextResponse.json({ error: 'Cannot assign owner role' }, { status: 400 });

  const { error } = await service
    .from('memberships')
    .update({ role })
    .eq('workspace_id', myMembership.workspace_id)
    .eq('user_id', user_id);

  if (error) {
    console.error('[team/members PATCH]', error);
    return NextResponse.json({ error: 'Failed to update member role' }, { status: 500 });
  }
  return NextResponse.json({ updated: true });
}

// ── DELETE /api/team/members?user_id=xxx — remove member ──────────────────────
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get('user_id');
  if (!targetUserId) return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  if (targetUserId === user.id) return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });

  const service = getService();

  const { data: myMembership } = await service
    .from('memberships')
    .select('workspace_id, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!['owner', 'admin'].includes(myMembership?.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  // Cannot remove owner
  const { data: target } = await service
    .from('memberships')
    .select('role')
    .eq('workspace_id', myMembership.workspace_id)
    .eq('user_id', targetUserId)
    .maybeSingle();

  if (target?.role === 'owner') return NextResponse.json({ error: 'Cannot remove workspace owner' }, { status: 400 });

  const { error } = await service
    .from('memberships')
    .delete()
    .eq('workspace_id', myMembership.workspace_id)
    .eq('user_id', targetUserId);

  if (error) {
    console.error('[team/members DELETE]', error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
  return NextResponse.json({ removed: true });
}
