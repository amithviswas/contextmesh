import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe/client';
import type Stripe from 'stripe';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getService(): any {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getPlanFromSubscription(sub: Stripe.Subscription): 'free' | 'pro' | 'team' {
  const priceId = sub.items.data[0]?.price?.id;
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro';
  if (priceId === process.env.STRIPE_TEAM_PRICE_ID) return 'team';
  return 'free';
}

async function updateWorkspacePlan(
  workspaceId: string,
  plan: 'free' | 'pro' | 'team',
  subscriptionId?: string,
  status?: string,
  periodEnd?: number
) {
  const service = getService();
  await service.from('workspaces').update({
    plan,
    stripe_subscription_id: subscriptionId ?? null,
    stripe_subscription_status: status ?? null,
    plan_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
  }).eq('id', workspaceId);
}

export async function POST(request: NextRequest) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('[stripe webhook] Invalid signature:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[stripe webhook] ${event.type}`);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const workspaceId = sub.metadata?.workspace_id;
        if (!workspaceId) break;
        const plan = getPlanFromSubscription(sub);
        await updateWorkspacePlan(
          workspaceId, plan,
          sub.id,
          sub.status,
          (sub as unknown as { current_period_end: number }).current_period_end
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const workspaceId = sub.metadata?.workspace_id;
        if (workspaceId) await updateWorkspacePlan(workspaceId, 'free', undefined, 'canceled');
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('[stripe webhook] Payment failed for customer:', invoice.customer);
        // Could send email here via Resend if configured
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('[stripe webhook] Payment succeeded for customer:', invoice.customer);
        break;
      }

      default:
        console.log(`[stripe webhook] Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error('[stripe webhook] Handler error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
