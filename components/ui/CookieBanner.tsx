'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setTimeout(() => setShow(true), 1500);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
    // PostHog will be initialized via AnalyticsProvider on next navigation
    window.dispatchEvent(new Event('cookie-consent-accepted'));
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed', bottom: '16px', left: '16px', right: '16px',
        zIndex: 9999, maxWidth: '560px', margin: '0 auto',
        padding: '16px 20px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--bg-border)',
        borderRadius: '12px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        animation: 'slideUp 0.3s ease',
      }}
    >
      <Cookie size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
      <p style={{ flex: 1, fontSize: '13px', color: 'var(--text-secondary)', minWidth: '200px', lineHeight: 1.5 }}>
        We use cookies for auth and anonymous analytics.{' '}
        <Link href="/cookies" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          Learn more
        </Link>
      </p>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{ padding: '6px 14px', borderRadius: '7px', border: '1px solid var(--bg-border)', background: 'transparent', color: 'var(--text-tertiary)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Decline
        </button>
        <button
          onClick={accept}
          style={{ padding: '6px 14px', borderRadius: '7px', border: 'none', background: 'var(--accent)', color: '#0A0A0F', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
