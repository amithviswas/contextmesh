import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[stripe] STRIPE_SECRET_KEY not set — payments disabled');
}

export const stripe = process.env.STRIPE_SECRET_KEY
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any })
  : null;

export const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID ?? '',
  team: process.env.STRIPE_TEAM_PRICE_ID ?? '',
};

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRO_PRICE_ID);
}
