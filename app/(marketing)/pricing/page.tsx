import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing — ContextMesh',
  description: 'Start free. Upgrade when your team grows. No credit card required.',
};

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for solo developers exploring ContextMesh.',
    cta: 'Start Free',
    ctaHref: '/login',
    featured: false,
    features: [
      '1 workspace member',
      '3 projects',
      '500 context items',
      '100 AI queries / month',
      'GitHub integration',
      'Manual context uploads',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    desc: 'For growing teams that need more context and collaboration.',
    cta: 'Get Pro',
    ctaHref: '/login',
    featured: true,
    features: [
      'Up to 5 workspace members',
      'Unlimited projects',
      '10,000 context items',
      '2,000 AI queries / month',
      'GitHub + Slack integrations',
      'Priority support',
      'Usage analytics',
      'Invite via email',
    ],
  },
  {
    name: 'Team',
    price: '$49',
    period: '/month',
    desc: 'For larger teams with advanced collaboration needs.',
    cta: 'Get Team',
    ctaHref: '/login',
    featured: false,
    features: [
      'Unlimited workspace members',
      'Unlimited projects',
      'Unlimited context items',
      'Unlimited AI queries',
      'All integrations (GitHub, Slack, Jira, Linear)',
      'Admin roles & permissions',
      'Priority + dedicated support',
      'SSO (coming soon)',
      'Audit logs',
    ],
  },
];

const FAQ = [
  { q: 'Is ContextMesh really free?', a: 'Yes. The Free plan is free forever with no credit card required. You only pay if you need more members, items, or queries.' },
  { q: 'What AI model powers the queries?', a: 'ContextMesh uses Llama 3.3 70B via Groq — a state-of-the-art open model, fast and accurate.' },
  { q: 'Can I switch plans anytime?', a: 'Yes. Upgrade or downgrade at any time. If you downgrade, your data is preserved and you retain access until the end of your billing period.' },
  { q: 'What counts as a context item?', a: 'Each GitHub commit, PR, Slack message, Jira ticket, or manual upload counts as one context item.' },
  { q: 'Is my data secure?', a: 'Yes. All data is encrypted at rest and in transit. We use Supabase (PostgreSQL) with row-level security — your workspace data is isolated.' },
  { q: 'Do you offer discounts for startups or OSS projects?', a: 'Yes! Email us at hello@contextmesh.app and we\'ll work something out.' },
];

export default function PricingPage() {
  return (
    <div>
      {/* Header */}
      <section style={{ padding: '100px 24px 60px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Pricing</p>
        <h1 style={{ fontSize: '52px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '16px' }}>
          Start free. Upgrade when ready.
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
          No credit card required. Cancel anytime.
        </p>
      </section>

      {/* Plans */}
      <section style={{ padding: '0 24px 80px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'start' }}>
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="card"
              style={{
                padding: '28px',
                position: 'relative',
                border: plan.featured ? '1px solid var(--accent-border)' : '1px solid var(--bg-border)',
                background: plan.featured ? 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(0,212,180,0.04) 100%)' : undefined,
              }}
            >
              {plan.featured && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--accent)', color: '#000', fontSize: '11px', fontWeight: 700,
                  padding: '3px 12px', borderRadius: '12px', whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
                }}>
                  MOST POPULAR
                </div>
              )}

              <p style={{ fontSize: '13px', fontWeight: 700, color: plan.featured ? 'var(--accent)' : 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
                {plan.name}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
                <span style={{ fontSize: '44px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{plan.price}</span>
                <span style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>{plan.desc}</p>

              <Link
                href={plan.ctaHref}
                className={plan.featured ? 'btn btn-primary' : 'btn'}
                style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none', width: '100%',
                  marginBottom: '24px', padding: '10px',
                  border: plan.featured ? undefined : '1px solid var(--bg-border)',
                  background: plan.featured ? undefined : 'transparent',
                  color: plan.featured ? undefined : 'var(--text-secondary)',
                  borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                }}
              >
                {plan.cta}
              </Link>

              <div style={{ borderTop: '1px solid var(--bg-border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Check size={13} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '60px 24px 100px', borderTop: '1px solid var(--bg-border)', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '40px', textAlign: 'center' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {FAQ.map(({ q, a }, i) => (
              <details key={i} style={{ borderTop: i === 0 ? '1px solid var(--bg-border)' : 'none', borderBottom: '1px solid var(--bg-border)', padding: '0' }}>
                <summary style={{ padding: '18px 4px', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none', fontFamily: 'var(--font-display)' }}>
                  {q}
                </summary>
                <p style={{ padding: '0 4px 18px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '34px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '12px' }}>
          Start for free. Upgrade when you&apos;re ready.
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '28px' }}>
          Join developers who use ContextMesh to stop losing context.
        </p>
        <Link href="/login" className="btn btn-primary" style={{ fontSize: '15px', padding: '13px 32px', textDecoration: 'none' }}>
          Get Started Free
        </Link>
      </section>
    </div>
  );
}
