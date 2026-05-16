import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy — ContextMesh',
  description: 'How ContextMesh uses cookies and how to manage them.',
};

export default function CookiesPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px' }}>
      <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Legal</p>
      <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.025em' }}>Cookie Policy</h1>
      <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '48px', fontFamily: 'var(--font-mono)' }}>Last updated: May 16, 2025</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '10px' }}>What Are Cookies</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>Cookies are small text files stored on your device by your browser. We use them to keep you signed in, remember your preferences, and understand how the product is used.</p>
        </div>

        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '12px' }}>Cookies We Use</h2>
          <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--bg-border)' }}>
            {[
              { name: 'supabase-auth-token', purpose: 'Keeps you signed in to your account.', type: 'Essential', canOptOut: false },
              { name: 'sb-*', purpose: 'Supabase session and refresh tokens for authentication.', type: 'Essential', canOptOut: false },
              { name: 'stripe_*', purpose: 'Stripe payment processing — required for paid plan customers.', type: 'Essential', canOptOut: false },
              { name: 'ph_*', purpose: 'PostHog product analytics — anonymous usage data to improve the product.', type: 'Analytics', canOptOut: true },
              { name: 'cookie-consent', purpose: 'Remembers your cookie consent preference.', type: 'Functional', canOptOut: false },
            ].map((cookie, i, arr) => (
              <div key={cookie.name} style={{ padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--bg-border)' : 'none', display: 'grid', gridTemplateColumns: '1fr 2fr auto auto', gap: '12px', alignItems: 'center' }}>
                <code style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{cookie.name}</code>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{cookie.purpose}</p>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: cookie.type === 'Essential' ? 'rgba(0,212,180,0.08)' : 'var(--bg-elevated)', color: cookie.type === 'Essential' ? 'var(--accent)' : 'var(--text-tertiary)', border: '1px solid var(--bg-border)', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>{cookie.type}</span>
                <span style={{ fontSize: '11px', color: cookie.canOptOut ? '#FBBF24' : 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{cookie.canOptOut ? 'Optional' : 'Required'}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '10px' }}>Managing Cookies</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '12px' }}>You can decline analytics cookies from the banner that appears on your first visit. You can also clear cookies from your browser settings at any time. Note that disabling essential cookies will sign you out and break authentication.</p>
        </div>

        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '10px' }}>Contact</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>For cookie-related questions: <a href="mailto:privacy@contextmesh.app" style={{ color: 'var(--accent)', textDecoration: 'none' }}>privacy@contextmesh.app</a></p>
        </div>
      </div>

      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--bg-border)', display: 'flex', gap: '24px' }}>
        <Link href="/privacy" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>Privacy Policy →</Link>
        <Link href="/terms" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>Terms of Service →</Link>
      </div>
    </div>
  );
}
