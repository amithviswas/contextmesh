'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Zap } from 'lucide-react';

interface Props {
  reason: string;
  feature: string;
  cta?: string;
  currentPlan?: string;
}

export default function UpgradePrompt({ reason, feature: _feature, cta, currentPlan = 'free' }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert(data.error ?? 'Could not start checkout');
        setLoading(false);
      }
    } catch {
      alert('Checkout failed. Please try again.');
      setLoading(false);
    }
  }

  if (currentPlan !== 'free') return null;

  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, rgba(110,64,201,0.08) 0%, rgba(0,212,180,0.06) 100%)',
      border: '1px solid rgba(110,64,201,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    }}>
      <Zap size={15} style={{ color: '#A78BFA', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '2px' }}>
          {reason}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {cta ?? 'Upgrade to Pro for more capacity.'}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          style={{
            padding: '6px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer',
            background: '#6e40c9', color: '#fff', fontSize: '12px', fontWeight: 600,
            opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          {loading ? 'Loading…' : 'Upgrade to Pro'}
        </button>
        <Link
          href="/pricing"
          style={{ padding: '6px 10px', borderRadius: '7px', border: '1px solid var(--bg-border)', color: 'var(--text-secondary)', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
        >
          Plans <ArrowRight size={10} />
        </Link>
      </div>
    </div>
  );
}
