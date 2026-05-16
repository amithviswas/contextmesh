import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { stripe, PRICE_IDS, isStripeConfigured } from '@/lib/stripe/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getService(): any {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan } = await request.json();
  if (!['pro', 'team'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const service = getService();

  // Get workspace
  const { data: membership } = await service
    .from('memberships')
    .select('workspace_id, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!['owner', 'admin'].includes(membership?.role)) {
    return NextResponse.json({ error: 'Only owners and admins can upgrade' }, { status: 403 });
  }

  const { data: workspace } = await service
    .from('workspaces')
    .select('id, name, stripe_customer_id')
    .eq('id', membership.workspace_id)
    .maybeSingle();

  // Get or create Stripe customer
  let customerId: string = workspace?.stripe_customer_id ?? '';
  if (!customerId) {
    const { data: authUser } = await service.auth.admin.getUserById(user.id);
    const customer = await stripe.customers.create({
      email: authUser?.user?.email ?? user.email,
      name: workspace?.name,
      metadata: { supabase_user_id: user.id, workspace_id: workspace?.id },
    });
    customerId = customer.id;
    await service.from('workspaces').update({ stripe_customer_id: customerId }).eq('id', workspace?.id);
  }

  const priceId = PRICE_IDS[plan as 'pro' | 'team'];
  if (!priceId) return NextResponse.json({ error: 'Price ID not configured' }, { status: 503 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { workspace_id: workspace?.id },
    },
  });

  return NextResponse.json({ checkout_url: session.url });
}
