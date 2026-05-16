'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ExternalLink, AlertTriangle } from 'lucide-react';
import { PLAN_NAMES, PLAN_PRICES } from '@/lib/plans';

interface Workspace {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'team';
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_subscription_status?: string | null;
  plan_period_end?: string | null;
}

interface Usage {
  projects: number;
  contextItems: number;
  queriesThisMonth: number;
  members: number;
}

const PLAN_LIMITS = {
  free:  { projects: 1,   contextItems: 500,   queriesThisMonth: 100,  members: 1 },
  pro:   { projects: 5,   contextItems: 10000, queriesThisMonth: 2000, members: 5 },
  team:  { projects: -1,  contextItems: -1,    queriesThisMonth: -1,   members: -1 },
};

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : Math.min((used / limit) * 100, 100);
  const warn = !unlimited && pct >= 80;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '11px', color: warn ? '#FBBF24' : 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          {used} / {unlimited ? '∞' : limit}
        </span>
      </div>
      {!unlimited && (
        <div style={{ height: '5px', borderRadius: '3px', background: 'var(--bg-border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: warn ? '#FBBF24' : 'var(--accent)', borderRadius: '3px', transition: 'width 0.4s' }} />
        </div>
      )}
    </div>
  );
}

interface Props { workspace: Workspace; myRole: string; usage: Usage }

export default function BillingClient({ workspace, myRole, usage }: Props) {
  const [checkoutLoading, setCheckoutLoading] = useState<'pro' | 'team' | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const plan = workspace.plan;
  const limits = PLAN_LIMITS[plan];
  const isPaid = plan !== 'free';
  const isOwnerAdmin = ['owner', 'admin'].includes(myRole);
  const paymentFailed = workspace.stripe_subscription_status === 'past_due';

  async function startCheckout(selectedPlan: 'pro' | 'team') {
    setCheckoutLoading(selectedPlan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (data.checkout_url) window.location.href = data.checkout_url;
      else { alert(data.error ?? 'Could not start checkout'); setCheckoutLoading(null); }
    } catch { alert('Checkout failed.'); setCheckoutLoading(null); }
  }

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else { alert(data.error ?? 'Could not open billing portal'); setPortalLoading(false); }
    } catch { alert('Portal failed.'); setPortalLoading(false); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>

      {/* Payment failed banner */}
      {paymentFailed && (
        <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <AlertTriangle size={15} style={{ color: '#FBBF24', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#FBBF24', marginBottom: '3px' }}>Payment Failed</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Your last payment didn&apos;t go through. Update your payment method to keep your plan.</p>
            <button onClick={openPortal} style={{ marginTop: '8px', fontSize: '12px', color: '#FBBF24', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
              Update payment method →
            </button>
          </div>
        </div>
      )}

      {/* Current plan card */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Plan</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {PLAN_NAMES[plan]}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>{PLAN_PRICES[plan]}</span>
            </div>
          </div>
          <span style={{
            padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)',
            background: isPaid ? 'rgba(0,212,180,0.1)' : 'var(--bg-elevated)',
            color: isPaid ? 'var(--accent)' : 'var(--text-tertiary)',
            border: `1px solid ${isPaid ? 'var(--accent-border)' : 'var(--bg-border)'}`,
            textTransform: 'uppercase',
          }}>
            {isPaid ? (workspace.stripe_subscription_status ?? 'active') : 'Free'}
          </span>
        </div>

        {/* Usage bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <UsageBar label="Projects" used={usage.projects} limit={limits.projects} />
          <UsageBar label="Context Items" used={usage.contextItems} limit={limits.contextItems} />
          <UsageBar label="AI Queries (this month)" used={usage.queriesThisMonth} limit={limits.queriesThisMonth} />
          <UsageBar label="Team Members" used={usage.members} limit={limits.members} />
        </div>

        {/* Period end */}
        {isPaid && workspace.plan_period_end && (
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
            Next billing date: {new Date(workspace.plan_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}

        {/* CTA */}
        {isOwnerAdmin && (
          isPaid ? (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--bg-border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: '13px', opacity: portalLoading ? 0.6 : 1 }}
            >
              <ExternalLink size={13} />
              {portalLoading ? 'Opening…' : 'Manage Billing'}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => startCheckout('pro')}
                disabled={!!checkoutLoading}
                className="btn btn-primary"
                style={{ fontSize: '13px', opacity: checkoutLoading ? 0.6 : 1 }}
              >
                {checkoutLoading === 'pro' ? 'Loading…' : 'Upgrade to Pro — $19/mo'}
              </button>
              <button
                onClick={() => startCheckout('team')}
                disabled={!!checkoutLoading}
                className="btn"
                style={{ fontSize: '13px', border: '1px solid var(--bg-border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', opacity: checkoutLoading ? 0.6 : 1 }}
              >
                {checkoutLoading === 'team' ? 'Loading…' : 'Team — $49/mo'}
              </button>
            </div>
          )
        )}
      </div>

      {/* Plan comparison (free plan only) */}
      {!isPaid && (
        <div className="card" style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '14px' }}>
            What you get with Pro
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              'Up to 5 projects (vs 1)',
              '2,000 AI queries / month (vs 100)',
              '10,000 context items (vs 500)',
              '5 team members (vs 1)',
              'GitHub + Slack + Jira integrations',
              'Priority email support',
            ].map((f) => (
              <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Check size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{f}</span>
              </div>
            ))}
          </div>
          <Link href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '16px', fontSize: '12px', color: 'var(--accent)', textDecoration: 'none' }}>
            See full comparison <ExternalLink size={11} />
          </Link>
        </div>
      )}
    </div>
  );
}
