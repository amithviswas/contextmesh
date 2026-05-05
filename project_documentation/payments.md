# 💳 ContextMesh — Payments (Stripe)

> **IMPORTANT:** Do NOT implement Stripe until Phase 6. Use feature flags to gate Pro features until then. This document is for reference only until you reach Phase 6.

---

## Plans

| Feature | Free | Pro ($19/mo) | Team ($49/mo) |
|---------|------|-------------|----------------|
| Projects | 1 | 5 | Unlimited |
| Integrations | GitHub only | GitHub + Slack + Jira | All + Linear |
| AI Queries/month | 100 | 2,000 | Unlimited |
| Team members | 1 | 5 | Unlimited |
| Context history | 7 days | 90 days | Unlimited |
| Support | Community | Email | Priority |

---

## Stripe Setup (Phase 6)

### 1. Create Stripe Account
- Go to https://stripe.com → create account
- Stay in **Test Mode** until launch
- Switch to Live Mode only when ready to charge real users

### 2. Create Products
In Stripe Dashboard → Products → Add Product:

```
Product 1: ContextMesh Pro
  Price: $19.00 USD / month (recurring)
  → Copy Price ID → STRIPE_PRO_PRICE_ID

Product 2: ContextMesh Team
  Price: $49.00 USD / month (recurring)
  → Copy Price ID → STRIPE_TEAM_PRICE_ID
```

### 3. Environment Variables
```env
STRIPE_SECRET_KEY=sk_test_...          # sk_live_... in production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...
```

### 4. Install Stripe
```bash
npm install stripe @stripe/stripe-js
```

---

## Implementation

### Checkout Flow
```typescript
// app/api/stripe/checkout/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { plan } = await request.json();
  const session = await getSession(); // your auth session

  const priceId = plan === 'pro'
    ? process.env.STRIPE_PRO_PRICE_ID
    : process.env.STRIPE_TEAM_PRICE_ID;

  // Get or create Stripe customer
  let customerId = await getStripeCustomerId(session.user.id);
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: { supabase_user_id: session.user.id }
    });
    customerId = customer.id;
    await saveStripeCustomerId(session.user.id, customerId);
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { workspace_id: session.user.workspace_id }
    }
  });

  return Response.json({ checkout_url: checkoutSession.url });
}
```

### Webhook Handler
```typescript
// app/api/stripe/webhook/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const sub = event.data.object as Stripe.Subscription;
      await updateWorkspacePlan(sub.metadata.workspace_id, getPlan(sub));
      break;

    case 'customer.subscription.deleted':
      const canceledSub = event.data.object as Stripe.Subscription;
      await updateWorkspacePlan(canceledSub.metadata.workspace_id, 'free');
      break;

    case 'invoice.payment_failed':
      // Send email warning
      await sendPaymentFailedEmail(event.data.object as Stripe.Invoice);
      break;
  }

  return Response.json({ received: true });
}
```

### Customer Portal (Self-Serve Manage Subscription)
```typescript
// app/api/stripe/portal/route.ts
export async function POST() {
  const customerId = await getStripeCustomerId(session.user.id);

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  return Response.json({ url: portalSession.url });
}
```

---

## Feature Gating

Before Stripe is set up, gate Pro features with a simple check:

```typescript
// lib/plans.ts
export function canQuery(workspace: Workspace, queriesThisMonth: number): boolean {
  const limits = { free: 100, pro: 2000, team: Infinity };
  return queriesThisMonth < limits[workspace.plan];
}

export function canConnectIntegration(workspace: Workspace, provider: string): boolean {
  if (workspace.plan === 'free' && provider !== 'github') return false;
  return true;
}

export function canAddProject(workspace: Workspace, projectCount: number): boolean {
  const limits = { free: 1, pro: 5, team: Infinity };
  return projectCount < limits[workspace.plan];
}
```

---

## Testing Stripe (Test Mode)

Use these test card numbers:
```
Success:         4242 4242 4242 4242
Decline:         4000 0000 0000 0002
Insufficient:    4000 0000 0000 9995
Requires Auth:   4000 0025 0000 3155
```

Test the full flow:
1. Upgrade to Pro → success card → check workspace.plan updated
2. Cancel subscription → check plan reverts to free after period end
3. Failed payment → check email is sent
4. Customer portal → check upgrade/downgrade works

---

## Payment Checklist (Phase 6)

- [ ] Stripe account created
- [ ] Products and prices created in test mode
- [ ] All env vars set
- [ ] Checkout flow works end-to-end
- [ ] Webhook handler deployed and receiving events
- [ ] Customer portal working
- [ ] Plan updates reflected in app immediately
- [ ] Failed payment email sending
- [ ] Test all 4 test cards
- [ ] Switch to live mode before launch
- [ ] Add Stripe privacy info to Privacy Policy
