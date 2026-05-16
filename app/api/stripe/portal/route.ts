import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getService(): any {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST() {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const service = getService();

  const { data: membership } = await service
    .from('memberships').select('workspace_id').eq('user_id', user.id).maybeSingle();

  const { data: workspace } = await service
    .from('workspaces').select('stripe_customer_id').eq('id', membership?.workspace_id).maybeSingle();

  if (!workspace?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found. Please upgrade first.' }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: workspace.stripe_customer_id,
    return_url: `${appUrl}/settings/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
