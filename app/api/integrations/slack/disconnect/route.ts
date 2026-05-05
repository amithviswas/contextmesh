import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: membership } = await sb
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) return NextResponse.json({ error: 'No workspace' }, { status: 404 });

  await sb
    .from('integrations')
    .update({ status: 'disconnected', access_token_encrypted: null })
    .eq('workspace_id', membership.workspace_id)
    .eq('provider', 'slack');

  return NextResponse.json({ data: { disconnected: true } });
}
