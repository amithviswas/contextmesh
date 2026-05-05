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

const PLAN_MEMBER_LIMITS: Record<string, number> = {
  free: 1,
  pro: 5,
  team: Infinity,
};

// ── POST /api/team/invite — create an invite ────────────────────────────────
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { email, role = 'member' } = await request.json();
  if (!email?.trim()) return NextResponse.json({ error: 'email is required' }, { status: 400 });

  const service = getService();

  // Get workspace + plan
  const { data: membership } = await service
    .from('memberships')
    .select('workspace_id, role, workspaces(plan)')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
  if (!['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Only owners and admins can invite' }, { status: 403 });
  }

  const workspaceId: string = membership.workspace_id;
  const plan: string = membership.workspaces?.plan ?? 'free';
  const limit = PLAN_MEMBER_LIMITS[plan] ?? 1;

  // Check current member count
  const { count: memberCount } = await service
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId);

  if ((memberCount ?? 0) >= limit) {
    return NextResponse.json({
      error: 'MEMBER_LIMIT_REACHED',
      used: memberCount,
      limit,
      upgrade_url: '/pricing',
    }, { status: 429 });
  }

  // Check for existing pending invite
  const { data: existing } = await service
    .from('invites')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('email', email.toLowerCase().trim())
    .is('accepted_at', null)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'An invite for this email already exists' }, { status: 409 });
  }

  // Create invite record
  const { data: invite, error: inviteError } = await service
    .from('invites')
    .insert({
      workspace_id: workspaceId,
      email: email.toLowerCase().trim(),
      role,
      invited_by: user.id,
    })
    .select()
    .single();

  if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 500 });

  // Send invite email (gracefully optional)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const inviteUrl = `${appUrl}/invite/${invite.token}`;

  await sendInviteEmail(email, inviteUrl, workspaceId, service).catch((e) => {
    console.log('[invite] Email send failed (non-fatal):', e?.message);
    console.log('[invite] Invite URL:', inviteUrl);
  });

  return NextResponse.json({ data: { ...invite, invite_url: inviteUrl } });
}

// ── GET /api/team/invite — list pending invites ──────────────────────────────
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

  const { data, error } = await service
    .from('invites')
    .select('id, email, role, token, expires_at, accepted_at, created_at')
    .eq('workspace_id', membership.workspace_id)
    .is('accepted_at', null)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

// ── Delete /api/team/invite?id=xxx — revoke invite ──────────────────────────
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const inviteId = searchParams.get('id');
  if (!inviteId) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const service = getService();
  const { error } = await service.from('invites').delete().eq('id', inviteId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}

// ── Email helper ─────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendInviteEmail(email: string, inviteUrl: string, workspaceId: string, service: any) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not set');

  const { data: workspace } = await service
    .from('workspaces')
    .select('name')
    .eq('id', workspaceId)
    .maybeSingle();

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'ContextMesh <noreply@contextmesh.app>',
    to: email,
    subject: `You've been invited to ${workspace?.name ?? 'a workspace'} on ContextMesh`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px">
        <h2 style="margin-bottom:8px">You're invited!</h2>
        <p>You've been invited to join <strong>${workspace?.name ?? 'a workspace'}</strong> on ContextMesh — the shared memory layer for AI-powered teams.</p>
        <a href="${inviteUrl}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#00D4B4;color:#000;border-radius:8px;text-decoration:none;font-weight:600">
          Accept Invite
        </a>
        <p style="margin-top:24px;color:#888;font-size:12px">This invite expires in 7 days. If you weren't expecting this, you can ignore this email.</p>
      </div>
    `,
  });
}
