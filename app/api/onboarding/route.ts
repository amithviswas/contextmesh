import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { step } = await request.json();
  if (!step) return NextResponse.json({ error: 'step is required' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  // Append step to onboarding_completed_steps array if not already present
  const { data: membership } = await sb
    .from('memberships')
    .select('onboarding_completed_steps')
    .eq('user_id', user.id)
    .maybeSingle();

  const current: string[] = membership?.onboarding_completed_steps ?? [];
  if (current.includes(step)) return NextResponse.json({ updated: false, steps: current });

  const updated = [...current, step];

  const { error } = await sb
    .from('memberships')
    .update({ onboarding_completed_steps: updated })
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ updated: true, steps: updated });
}
