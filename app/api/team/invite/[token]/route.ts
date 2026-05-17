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

interface Props { params: Promise<{ token: string }> }

// ── POST /api/team/invite/[token] — accept invite ────────────────────────────
export async function POST(_request: NextRequest, { params }: Props) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const service = getService();

  // Look up invite
  const { data: invite, error: inviteError } = await service
    .from('invites')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .maybeSingle();

  if (inviteError || !invite) return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invite has expired' }, { status: 410 });
  }

  // CRIT-03: Bind invite to invitee email — prevent token theft attacks
  const { data: authUser } = await service.auth.admin.getUserById(user.id);
  const userEmail = authUser?.user?.email?.toLowerCase() ?? '';
  if (userEmail !== invite.email.toLowerCase()) {
    return NextResponse.json(
      { error: 'This invite was sent to a different email address' },
      { status: 403 }
    );
  }

  // Check not already a member
  const { data: existing } = await service
    .from('memberships')
    .select('id')
    .eq('workspace_id', invite.workspace_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'You are already a member of this workspace' }, { status: 409 });
  }

  // Add to memberships
  const { error: memberError } = await service
    .from('memberships')
    .insert({ workspace_id: invite.workspace_id, user_id: user.id, role: invite.role });

  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 });

  // Mark invite accepted
  await service
    .from('invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  return NextResponse.json({ accepted: true, workspace_id: invite.workspace_id });
}
