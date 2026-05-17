import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { ensureWorkspace } from '@/lib/auth/onboarding';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getService(): any {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/debug/workspace
 * Diagnostic endpoint — checks and fixes workspace for current user.
 * Returns current user ID, membership status, and workspace ID.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const service = getService();

  // Check existing membership
  const { data: beforeMembership } = await service
    .from('memberships')
    .select('workspace_id, role')
    .eq('user_id', user.id)
    .maybeSingle();

  let workspaceId: string | null = beforeMembership?.workspace_id ?? null;
  let action = 'none';

  if (!workspaceId) {
    // Force-create workspace
    try {
      workspaceId = await ensureWorkspace(user.id, user.email ?? `user-${user.id}`);
      action = 'created';
    } catch (err) {
      return NextResponse.json({
        user_id: user.id,
        email: user.email,
        workspace_id: null,
        action: 'error',
        error: String(err),
      });
    }
  }

  // Re-fetch membership to confirm
  const { data: afterMembership } = await service
    .from('memberships')
    .select('workspace_id, role')
    .eq('user_id', user.id)
    .maybeSingle();

  return NextResponse.json({
    user_id: user.id,
    email: user.email,
    workspace_id: workspaceId,
    role: afterMembership?.role ?? 'unknown',
    action,
    membership_visible: !!afterMembership,
  });
}
