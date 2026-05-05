import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  // Get workspace
  const { data: membership } = await sb
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ data: [] });
  }

  const { data: integrations, error } = await sb
    .from('integrations')
    .select('id, provider, status, config, items_synced, last_synced_at, error_message, created_at')
    .eq('workspace_id', membership.workspace_id)
    .order('created_at');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: integrations ?? [] });
}
